<?php

namespace App\Http\Controllers\Hod;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\ResultAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function index(Request $request): Response
    {
        $examinationId = $request->query('examination_id');
        $search = $request->query('search');
        $status = $request->query('status'); // pass, fail, void

        $results = ExaminationResult::with([
            'application.applicantProfile',
            'examination.sessionProgram.program',
            'attempt.answers.question.options',
            'attempt.answers.selectedOption',
        ])
            ->when($examinationId, fn ($q) => $q->where('examination_id', $examinationId))
            ->when($status === 'pass', fn ($q) => $q->where('is_passed', true))
            ->when($status === 'fail', fn ($q) => $q->where('is_passed', false))
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('application', function ($appQ) use ($search) {
                        $appQ->where('application_number', 'like', "%{$search}%")
                             ->orWhere('roll_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('application.applicantProfile', function ($profQ) use ($search) {
                        $profQ->where('full_name', 'like', "%{$search}%")
                              ->orWhere('cnic', 'like', "%{$search}%");
                    });
                });
            })
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString();

        $examinations = Examination::with('sessionProgram.program')
            ->orderByDesc('id')
            ->get(['id', 'title', 'exam_code', 'session_program_id', 'total_marks']);

        $stats = [
            'total_candidates' => ExaminationResult::count(),
            'passed' => ExaminationResult::where('is_passed', true)->count(),
            'failed' => ExaminationResult::where('is_passed', false)->count(),
            'average_score' => round((float) ExaminationResult::avg('obtained_marks'), 1),
        ];

        return Inertia::render('Hod/Results/Index', [
            'results' => $results,
            'examinations' => $examinations,
            'filters' => [
                'examination_id' => $examinationId ? (int) $examinationId : '',
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
            'stats' => $stats,
        ]);
    }

    public function adjustScore(Request $request, int $id)
    {
        $result = ExaminationResult::findOrFail($id);

        $request->validate([
            'new_marks' => ['required', 'numeric', 'min:0', 'max:' . $result->total_marks],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $prevMarks = (float) $result->obtained_marks;
        $newMarks = (float) $request->input('new_marks');
        $totalMarks = (float) $result->total_marks > 0 ? (float) $result->total_marks : 100;
        $newPercentage = round(($newMarks / $totalMarks) * 100, 2);
        $passingMarks = (float) ($result->examination->passing_marks ?? ($totalMarks * 0.5));

        DB::transaction(function () use ($result, $prevMarks, $newMarks, $newPercentage, $passingMarks, $request) {
            $result->update([
                'obtained_marks' => $newMarks,
                'percentage' => $newPercentage,
                'is_passed' => ($newMarks >= $passingMarks),
            ]);

            ResultAdjustment::create([
                'examination_result_id' => $result->id,
                'adjusted_by_user_id' => $request->user()->id,
                'previous_marks' => $prevMarks,
                'new_marks' => $newMarks,
                'reason' => $request->input('reason'),
            ]);

            AuditLog::log('exam_result_adjusted', 'ExaminationResult', $result->id, null, [
                'prev_marks' => $prevMarks,
                'new_marks' => $newMarks,
                'reason' => $request->input('reason'),
            ]);
        });

        return back()->with('success', "Score adjusted from {$prevMarks} to {$newMarks} successfully.");
    }

    public function resetAttempt(Request $request, int $id)
    {
        $result = ExaminationResult::findOrFail($id);
        $attempt = $result->attempt;
        $application = $result->application;

        DB::transaction(function () use ($result, $attempt, $application, $request) {
            // Delete result adjustment history
            ResultAdjustment::where('examination_result_id', $result->id)->delete();
            $result->delete();

            if ($attempt) {
                // Delete answers
                $attempt->answers()->delete();
                $attempt->delete();
            }

            if ($application) {
                $application->update([
                    'exam_attempt_status' => 'not_started',
                    'result_status' => 'pending',
                    'selection_status' => 'unprocessed',
                ]);

                // Remove candidate from merit list rankings
                \App\Models\MeritListItem::where('application_id', $application->id)->delete();

                // Remove any pending/released seat allocation
                \App\Models\SeatAllocation::where('application_id', $application->id)
                    ->whereIn('status', ['reserved', 'released'])
                    ->delete();
            }

            AuditLog::log('exam_attempt_reset', 'ExaminationResult', $result->id, null, [
                'reset_by' => $request->user()->name,
                'candidate_application_id' => $result->application_id,
            ]);
        });

        return back()->with('success', 'Candidate examination attempt has been reset. Removed from merit ranking until re-tested.');
    }

    public function voidAttempt(Request $request, int $id)
    {
        $result = ExaminationResult::findOrFail($id);

        $result->update([
            'is_passed' => false,
            'obtained_marks' => 0.00,
            'percentage' => 0.00,
            'status' => 'disqualified',
        ]);

        if ($result->attempt) {
            $result->attempt->update(['status' => 'disqualified']);
        }

        if ($result->application) {
            \App\Models\MeritListItem::where('application_id', $result->application_id)->delete();
            \App\Models\SeatAllocation::where('application_id', $result->application_id)
                ->whereIn('status', ['reserved', 'released'])
                ->delete();
            $result->application->update(['selection_status' => 'unprocessed']);
        }

        AuditLog::log('exam_attempt_disqualified', 'ExaminationResult', $result->id, null, [
            'reason' => $request->input('reason', 'Exam Violation / Misconduct'),
        ]);

        return back()->with('success', 'Attempt marked as disqualified for examination violation. Candidate removed from merit selection.');
    }

    public function destroy(Request $request, int $id)
    {
        $result = ExaminationResult::findOrFail($id);
        $attempt = $result->attempt;
        $application = $result->application;

        DB::transaction(function () use ($result, $attempt, $application, $request) {
            // Delete result adjustments
            ResultAdjustment::where('examination_result_id', $result->id)->delete();
            $result->delete();

            if ($attempt) {
                $attempt->answers()->delete();
                $attempt->delete();
            }

            if ($application) {
                $application->update([
                    'exam_attempt_status' => 'not_started',
                    'result_status' => 'pending',
                    'selection_status' => 'unprocessed',
                ]);

                // Remove candidate from merit list items
                \App\Models\MeritListItem::where('application_id', $application->id)->delete();

                // Remove pending / released seat allocations
                \App\Models\SeatAllocation::where('application_id', $application->id)
                    ->whereIn('status', ['reserved', 'released'])
                    ->delete();
            }

            AuditLog::log('exam_result_deleted', 'ExaminationResult', $result->id, null, [
                'deleted_by' => $request->user()->name,
                'application_id' => $result->application_id,
            ]);
        });

        return back()->with('success', 'Candidate examination attempt & result deleted successfully. Candidate removed from merit ranking.');
    }
}
