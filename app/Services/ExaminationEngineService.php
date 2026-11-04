<?php

namespace App\Services;

use App\Models\AttemptAnswer;
use App\Models\Examination;
use App\Models\ExaminationAccessToken;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationQuestion;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExaminationEngineService
{
    /**
     * Start the examination attempt strictly when candidate clicks "Start Examination"
     */
    public static function startAttempt(ExaminationAccessToken $accessToken, Request $request): ExaminationAttempt
    {
        if (!$accessToken->isValid()) {
            throw ValidationException::withMessages(['token' => 'Your examination access grant has expired or was already used. Please re-enter the test PIN.']);
        }

        return DB::transaction(function () use ($accessToken, $request) {
            $examination = $accessToken->examination;
            $application = $accessToken->application;

            // Check if there is already an in-progress attempt to resume
            $existing = ExaminationAttempt::where('examination_id', $examination->id)
                ->where('application_id', $application->id)
                ->where('status', 'in_progress')
                ->first();

            if ($existing) {
                // Check if existing attempt expired
                if ($existing->isExpired()) {
                    self::submitAttempt($existing, 'Time Expired');
                    throw ValidationException::withMessages(['attempt' => 'Your examination duration has elapsed.']);
                }

                $accessToken->update(['is_consumed' => true, 'consumed_at' => now()]);
                return $existing;
            }

            // Create new attempt
            $startTime = now();
            $serverDeadline = (clone $startTime)->addMinutes($examination->duration_minutes);

            $attempt = ExaminationAttempt::create([
                'examination_id' => $examination->id,
                'application_id' => $application->id,
                'user_id' => $accessToken->user_id,
                'start_time' => $startTime,
                'server_deadline' => $serverDeadline,
                'status' => 'in_progress',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'event_logs' => [
                    ['event' => 'attempt_started', 'timestamp' => now()->toIso8601String(), 'ip' => $request->ip()],
                ],
            ]);

            // Load and snapshot questions for this examination
            $examQuestions = ExaminationQuestion::where('examination_id', $examination->id)
                ->with(['question.options'])
                ->get();

            // Always shuffle questions per candidate attempt so each candidate gets a unique randomized order
            $examQuestions = $examQuestions->shuffle();

            foreach ($examQuestions as $eq) {
                AttemptAnswer::create([
                    'examination_attempt_id' => $attempt->id,
                    'question_id' => $eq->question_id,
                    'selected_option_id' => null,
                    'is_correct' => false,
                    'marks_awarded' => 0.00,
                    'time_spent_seconds' => 0,
                    'is_flagged' => false,
                ]);
            }

            // Consume access token
            $accessToken->update(['is_consumed' => true, 'consumed_at' => now()]);

            // Update application state
            $application->transitionState('exam_attempt', 'in_progress', $accessToken->user_id, 'Started online examination');

            return $attempt;
        });
    }

    /**
     * Get candidate-facing questions with correct answers STRIPPED for security
     */
    public static function getCandidateQuestionPayload(ExaminationAttempt $attempt): array
    {
        $examination = $attempt->examination;

        $attemptAnswers = AttemptAnswer::where('examination_attempt_id', $attempt->id)
            ->with(['question.options'])
            ->orderBy('id', 'asc')
            ->get();

        $questions = [];
        $index = 1;

        foreach ($attemptAnswers as $ans) {
            $q = $ans->question;
            if (!$q) continue;

            // Options must ALWAYS stay in their fixed proper sequence: A, B, C, D
            $options = $q->options->sortBy('option_label')->values();

            $optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
            $sanitizedOptions = $options->map(function (QuestionOption $opt, int $idx) use ($optionLetters) {
                return [
                    'id' => $opt->id,
                    'label' => $optionLetters[$idx] ?? $opt->option_label,
                    'text' => $opt->option_text,
                    'option_text' => $opt->option_text,
                    // NEVER return is_correct!
                ];
            })->values();

            $questions[] = [
                'id' => $q->id,
                'index' => $index++, // strictly sequential Question 1, 2, 3...
                'subject' => $q->subject,
                'question_text' => $q->question_text,
                'marks' => (float) $q->marks,
                'options' => $sanitizedOptions,
                'selected_option_id' => $ans->selected_option_id,
                'is_flagged' => (bool) $ans->is_flagged,
            ];
        }

        return [
            'attempt_id' => $attempt->id,
            'exam_title' => $examination->title,
            'examination_title' => $examination->title,
            'duration_minutes' => $examination->duration_minutes,
            'server_deadline' => $attempt->server_deadline->toIso8601String(),
            'remaining_seconds' => $attempt->remainingSeconds(),
            'total_questions' => count($questions),
            'questions' => $questions,
        ];
    }

    /**
     * Auto-save candidate answer choice in real time
     */
    public static function saveAnswer(ExaminationAttempt $attempt, int $questionId, ?int $optionId, int $timeSpent = 0, bool $isFlagged = false): AttemptAnswer
    {
        // Enforce Server Deadline strictly
        if ($attempt->isExpired()) {
            self::submitAttempt($attempt, 'Time Expired during auto-save');
            throw ValidationException::withMessages(['timeout' => 'Examination time has expired. Submission processed.']);
        }

        if ($attempt->status !== 'in_progress') {
            throw ValidationException::withMessages(['attempt' => 'Examination is no longer active.']);
        }

        $answer = AttemptAnswer::where('examination_attempt_id', $attempt->id)
            ->where('question_id', $questionId)
            ->firstOrFail();

        $answer->update([
            'selected_option_id' => $optionId,
            'time_spent_seconds' => $timeSpent,
            'is_flagged' => $isFlagged,
        ]);

        return $answer;
    }

    /**
     * Final submission (manual or auto-submit on timeout)
     */
    public static function submitAttempt(ExaminationAttempt $attempt, ?string $reason = null): void
    {
        if (in_array($attempt->status, ['submitted', 'timed_out'])) {
            return; // Idempotent
        }

        $isTimeout = $attempt->isExpired() || str_contains(strtolower((string) $reason), 'expired');
        $finalStatus = $isTimeout ? 'timed_out' : 'submitted';

        DB::transaction(function () use ($attempt, $finalStatus, $reason) {
            $attempt->update([
                'status' => $finalStatus,
                'end_time' => now(),
            ]);

            // Calculate Result
            ResultCalculationService::calculate($attempt);

            // Update Application status
            $attempt->application->transitionState('exam_attempt', 'completed', $attempt->user_id, $reason ?? 'Examination submitted');
        });
    }
}
