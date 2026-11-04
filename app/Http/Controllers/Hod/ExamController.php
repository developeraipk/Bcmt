<?php

namespace App\Http\Controllers\Hod;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationQuestion;
use App\Models\Program;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\SessionProgram;
use App\Services\ExaminationPinService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = AdmissionSession::orderByDesc('id')->get(['id', 'name', 'code', 'is_active']);
        $activeSession = AdmissionSession::getActive();

        $requestedSessionId = $request->query('session_id');

        if ($requestedSessionId === 'all') {
            $sessionId = null;
        } elseif ($requestedSessionId !== null && is_numeric($requestedSessionId)) {
            $sessionId = (int) $requestedSessionId;
        } else {
            // Default: if active session has examinations, show active session.
            // Otherwise, default to all so examinations are never hidden unexpectedly.
            if ($activeSession && Examination::where('admission_session_id', $activeSession->id)->exists()) {
                $sessionId = $activeSession->id;
            } else {
                $sessionId = null;
            }
        }

        $examinations = Examination::with([
            'sessionProgram.program',
            'admissionSession',
            'activePin',
        ])
            ->withCount(['attempts', 'examinationQuestions'])
            ->when($sessionId, fn ($q) => $q->where('admission_session_id', $sessionId))
            ->orderByDesc('id')
            ->get();

        $modalSessionId = $activeSession?->id ?? $sessionId ?? $sessions->first()?->id;
        $sessionPrograms = SessionProgram::where('admission_session_id', $modalSessionId)
            ->with('program')
            ->get();

        if ($sessionPrograms->isEmpty()) {
            $sessionPrograms = SessionProgram::with('program')->get();
        }

        $stats = [
            'total_tests' => Examination::count(),
            'active_tests' => Examination::where('status', 'active')->count(),
            'eligible_candidates' => \App\Models\Application::where(function ($q) {
                $q->where('exam_eligibility_status', 'eligible')
                  ->orWhereNotNull('roll_number');
            })->count(),
            'student_attempts' => ExaminationAttempt::count(),
        ];

        return Inertia::render('Hod/Exams/Index', [
            'examinations' => $examinations,
            'sessionPrograms' => $sessionPrograms,
            'sessions' => $sessions,
            'selectedSessionId' => $sessionId ? (string) $sessionId : 'all',
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'admission_session_id' => ['required', 'exists:admission_sessions,id'],
            'session_program_id' => ['required', 'exists:session_programs,id'],
            'title' => ['required', 'string', 'max:150'],
            'exam_code' => ['nullable', 'string', 'max:30', 'unique:examinations,exam_code'],
            'shift' => ['nullable', 'string', 'max:30'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:180'],
            'passing_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'negative_marks_per_wrong' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'randomize_questions' => ['boolean'],
            'randomize_options' => ['boolean'],
            'requires_attendance' => ['boolean'],
            'instructions' => ['nullable', 'string'],
        ]);

        $examCode = !empty($validated['exam_code'])
            ? strtoupper(trim($validated['exam_code']))
            : 'TEST-' . strtoupper(Str::random(6));

        $exam = DB::transaction(function () use ($validated, $examCode, $request) {
            $exam = Examination::create([
                'admission_session_id' => $validated['admission_session_id'],
                'session_program_id' => $validated['session_program_id'],
                'title' => $validated['title'],
                'exam_code' => $examCode,
                'shift' => $validated['shift'] ?? 'Morning',
                'duration_minutes' => $validated['duration_minutes'],
                'total_questions' => 0,
                'total_marks' => 0.00,
                'passing_marks' => 0.00,
                'passing_percentage' => $validated['passing_percentage'],
                'negative_marks_per_wrong' => $validated['negative_marks_per_wrong'] ?? 0.00,
                'randomize_questions' => $request->boolean('randomize_questions', true),
                'randomize_options' => $request->boolean('randomize_options', false),
                'requires_attendance' => $request->boolean('requires_attendance', true),
                'instructions' => $validated['instructions'] ?? 'Follow all invigilator instructions. No calculators or unauthorized electronic devices.',
                'status' => 'draft',
            ]);

            // Generate initial Common PIN
            ExaminationPinService::generatePin($exam, $request->user()?->id, 'Initial Test Creation');

            AuditLog::log('exam_created', 'Examination', $exam->id);

            return $exam;
        });

        return back()->with('success', "Entrance Test '{$exam->title}' created successfully.");
    }

    public function update(Request $request, int $id)
    {
        $exam = Examination::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'shift' => ['nullable', 'string', 'max:30'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:180'],
            'passing_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'negative_marks_per_wrong' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'status' => ['nullable', 'in:draft,scheduled,active,completed,closed'],
            'instructions' => ['nullable', 'string'],
        ]);

        $totalMarks = (float) ($exam->total_marks ?? 0.00);
        $passingPercentage = (float) $validated['passing_percentage'];
        $passingMarks = round($totalMarks * ($passingPercentage / 100), 2);

        $exam->update([
            'title' => $validated['title'],
            'shift' => $validated['shift'] ?? $exam->shift,
            'duration_minutes' => $validated['duration_minutes'],
            'passing_percentage' => $passingPercentage,
            'passing_marks' => $passingMarks,
            'negative_marks_per_wrong' => $validated['negative_marks_per_wrong'] ?? 0.00,
            'status' => $validated['status'] ?? $exam->status,
            'instructions' => $validated['instructions'] ?? $exam->instructions,
        ]);

        $this->syncExamMetrics($exam);

        AuditLog::log('exam_updated', 'Examination', $exam->id);

        return back()->with('success', "Entrance Test '{$exam->title}' updated successfully.");
    }

    public function destroy(int $id)
    {
        $exam = Examination::findOrFail($id);
        $title = $exam->title;

        // Clean up examination questions
        ExaminationQuestion::where('examination_id', $exam->id)->delete();
        $exam->delete();

        AuditLog::log('exam_deleted', 'Examination', $id);

        return back()->with('success', "Entrance Test '{$title}' deleted successfully.");
    }

    public function generatePin(Request $request, int $id)
    {
        $examination = Examination::findOrFail($id);
        $user = $request->user();
        $customPin = $request->input('custom_pin');

        $rawPin = ExaminationPinService::generatePin($examination, $user?->id, $request->input('reason', 'PIN Rotated by Administrator'), $customPin);

        return back()->with([
            'success' => "Exam Hall PIN updated successfully: [ {$rawPin} ]. Please announce this PIN to eligible candidates.",
            'generated_pin' => $rawPin,
        ]);
    }

    public function toggleStatus(Request $request, int $id)
    {
        $examination = Examination::findOrFail($id);
        $newStatus = $request->input('status');

        if (!$newStatus) {
            $newStatus = $examination->status === 'active' ? 'draft' : 'active';
        }

        $examination->update(['status' => $newStatus]);

        AuditLog::log('exam_status_toggled', 'Examination', $examination->id, null, [
            'status' => $newStatus,
        ]);

        return back()->with('success', "Test status changed to '" . strtoupper($newStatus) . "'.");
    }

    /**
     * Display MCQs management screen for this specific examination (matching Image 5)
     */
    public function questions(int $id): Response
    {
        $examination = Examination::with(['sessionProgram.program', 'admissionSession'])
            ->findOrFail($id);

        $examQuestions = ExaminationQuestion::where('examination_id', $examination->id)
            ->with(['question.options'])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Hod/Exams/Questions', [
            'examination' => $examination,
            'examQuestions' => $examQuestions,
        ]);
    }

    /**
     * Store new question directly for this examination (matching Image 5)
     */
    public function storeQuestion(Request $request, int $id)
    {
        $examination = Examination::findOrFail($id);

        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'option_a' => ['required', 'string'],
            'option_b' => ['required', 'string'],
            'option_c' => ['required', 'string'],
            'option_d' => ['required', 'string'],
            'correct_option' => ['required', 'in:A,B,C,D,option_a,option_b,option_c,option_d'],
            'marks' => ['required', 'numeric', 'min:0.5', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $examination, $request) {
            // Normalize correct option to uppercase letter
            $correctLetter = strtoupper(substr(str_replace('option_', '', strtolower($validated['correct_option'])), 0, 1));

            // Create base Question
            $programId = $examination->sessionProgram?->program_id;
            $question = Question::create([
                'program_id' => $programId,
                'subject' => $examination->sessionProgram?->program?->name ?? 'General',
                'topic' => $examination->title,
                'difficulty' => 'medium',
                'marks' => $validated['marks'],
                'question_text' => $validated['question_text'],
                'is_active' => $request->boolean('is_active', true),
                'created_by_user_id' => $request->user()?->id,
            ]);

            // Create 4 Options
            $optionsData = [
                'A' => $validated['option_a'],
                'B' => $validated['option_b'],
                'C' => $validated['option_c'],
                'D' => $validated['option_d'],
            ];

            $optionsPayload = [];
            foreach ($optionsData as $label => $text) {
                $opt = QuestionOption::create([
                    'question_id' => $question->id,
                    'option_label' => $label,
                    'option_text' => $text,
                    'is_correct' => ($label === $correctLetter),
                ]);
                $optionsPayload[$label] = $text;
            }

            // Link to Examination
            $nextOrder = (ExaminationQuestion::where('examination_id', $examination->id)->max('sort_order') ?? 0) + 1;
            ExaminationQuestion::create([
                'examination_id' => $examination->id,
                'question_id' => $question->id,
                'sort_order' => $nextOrder,
                'snapshot_payload' => [
                    'question' => $question->question_text,
                    'marks' => $question->marks,
                    'options' => $optionsPayload,
                ],
            ]);

            // Sync total questions and total marks on examination
            $this->syncExamMetrics($examination);

            AuditLog::log('question_created_for_exam', 'Examination', $examination->id, null, [
                'question_id' => $question->id,
            ]);
        });

        return back()->with('success', 'Question successfully added to this entrance test.');
    }

    /**
     * Update an existing question in this examination
     */
    public function updateQuestion(Request $request, int $id, int $questionId)
    {
        $examination = Examination::findOrFail($id);
        $question = Question::with('options')->findOrFail($questionId);

        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'option_a' => ['required', 'string'],
            'option_b' => ['required', 'string'],
            'option_c' => ['required', 'string'],
            'option_d' => ['required', 'string'],
            'correct_option' => ['required', 'in:A,B,C,D,option_a,option_b,option_c,option_d'],
            'marks' => ['required', 'numeric', 'min:0.5', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $examination, $question, $request) {
            $correctLetter = strtoupper(substr(str_replace('option_', '', strtolower($validated['correct_option'])), 0, 1));

            $question->update([
                'question_text' => $validated['question_text'],
                'marks' => $validated['marks'],
                'is_active' => $request->boolean('is_active', true),
            ]);

            $optionsData = [
                'A' => $validated['option_a'],
                'B' => $validated['option_b'],
                'C' => $validated['option_c'],
                'D' => $validated['option_d'],
            ];

            $optionsPayload = [];
            foreach ($optionsData as $label => $text) {
                QuestionOption::updateOrCreate(
                    ['question_id' => $question->id, 'option_label' => $label],
                    ['option_text' => $text, 'is_correct' => ($label === $correctLetter)]
                );
                $optionsPayload[$label] = $text;
            }

            // Update snapshot
            ExaminationQuestion::where('examination_id', $examination->id)
                ->where('question_id', $question->id)
                ->update([
                    'snapshot_payload' => [
                        'question' => $question->question_text,
                        'marks' => $question->marks,
                        'options' => $optionsPayload,
                    ],
                ]);

            $this->syncExamMetrics($examination);
        });

        return back()->with('success', 'Question updated successfully.');
    }

    /**
     * Delete question from this examination
     */
    public function deleteQuestion(int $id, int $questionId)
    {
        $examination = Examination::findOrFail($id);

        ExaminationQuestion::where('examination_id', $examination->id)
            ->where('question_id', $questionId)
            ->delete();

        // Also soft-delete question
        Question::where('id', $questionId)->delete();

        $this->syncExamMetrics($examination);

        return back()->with('success', 'Question removed from examination.');
    }

    private function syncExamMetrics(Examination $examination): void
    {
        $questions = ExaminationQuestion::where('examination_id', $examination->id)
            ->with('question')
            ->get();

        $count = $questions->count();
        $totalMarks = $questions->sum(fn ($eq) => (float) ($eq->question->marks ?? 1));
        $passingMarks = ($totalMarks * ($examination->passing_percentage / 100));

        $examination->update([
            'total_questions' => $count,
            'total_marks' => $totalMarks,
            'passing_marks' => $passingMarks,
        ]);
    }
}
