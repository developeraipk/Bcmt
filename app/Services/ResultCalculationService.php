<?php

namespace App\Services;

use App\Models\AttemptAnswer;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\QuestionOption;
use Illuminate\Support\Facades\DB;

class ResultCalculationService
{
    /**
     * Compute examination score, correct/incorrect count, and passing status
     */
    public static function calculate(ExaminationAttempt $attempt): ExaminationResult
    {
        return DB::transaction(function () use ($attempt) {
            $examination = $attempt->examination;
            $attemptAnswers = AttemptAnswer::where('examination_attempt_id', $attempt->id)->get();

            $totalQuestions = $attemptAnswers->count();
            $correctAnswers = 0;
            $incorrectAnswers = 0;
            $unanswered = 0;
            $totalMarks = (float) $examination->total_marks;
            $obtainedMarks = 0.00;

            $negativeMarkingPerWrong = (float) $examination->negative_marks_per_wrong;

            foreach ($attemptAnswers as $ans) {
                if (!$ans->selected_option_id) {
                    $unanswered++;
                    $ans->update([
                        'is_correct' => false,
                        'marks_awarded' => 0.00,
                    ]);
                    continue;
                }

                $option = QuestionOption::find($ans->selected_option_id);
                $isCorrect = $option && $option->is_correct;

                $qMarks = (float) $ans->question->marks;

                if ($isCorrect) {
                    $correctAnswers++;
                    $obtainedMarks += $qMarks;
                    $ans->update([
                        'is_correct' => true,
                        'marks_awarded' => $qMarks,
                    ]);
                } else {
                    $incorrectAnswers++;
                    $deduction = -$negativeMarkingPerWrong;
                    $obtainedMarks += $deduction;
                    $ans->update([
                        'is_correct' => false,
                        'marks_awarded' => $deduction,
                    ]);
                }
            }

            $obtainedMarks = max(0.00, $obtainedMarks);
            $percentage = $totalMarks > 0 ? round(($obtainedMarks / $totalMarks) * 100, 2) : 0.00;

            $passingMarks = (float) $examination->passing_marks;
            $passingPercentage = (float) $examination->passing_percentage;

            $isPassed = ($obtainedMarks >= $passingMarks) || ($percentage >= $passingPercentage);

            $result = ExaminationResult::updateOrCreate(
                ['examination_attempt_id' => $attempt->id],
                [
                    'application_id' => $attempt->application_id,
                    'examination_id' => $attempt->examination_id,
                    'total_questions' => $totalQuestions,
                    'correct_answers' => $correctAnswers,
                    'incorrect_answers' => $incorrectAnswers,
                    'unanswered' => $unanswered,
                    'total_marks' => $totalMarks,
                    'obtained_marks' => $obtainedMarks,
                    'percentage' => $percentage,
                    'is_passed' => $isPassed,
                    'status' => 'calculated', // Hidden until publication
                ]
            );

            $attempt->application->transitionState('result', 'calculated', null, 'Result calculated automatically');

            return $result;
        });
    }

    /**
     * Authorize and publish results to make them visible to students
     */
    public static function publishResults(int $examinationId, int $publishedByUserId): int
    {
        return DB::transaction(function () use ($examinationId, $publishedByUserId) {
            $updated = ExaminationResult::where('examination_id', $examinationId)
                ->where('status', '!=', 'published')
                ->update([
                    'status' => 'published',
                    'published_at' => now(),
                    'published_by_user_id' => $publishedByUserId,
                ]);

            // Update associated applications
            $applicationIds = ExaminationResult::where('examination_id', $examinationId)->pluck('application_id');
            foreach ($applicationIds as $appId) {
                \App\Models\Application::find($appId)?->transitionState('result', 'published', $publishedByUserId, 'Results published by HOD');
            }

            return $updated;
        });
    }
}
