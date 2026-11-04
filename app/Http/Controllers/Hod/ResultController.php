<?php

namespace App\Http\Controllers\Hod;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\Program;
use App\Models\ResultAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    /**
     * Display filtered candidate entrance examination results
     */
    public function index(Request $request): Response
    {
        $examinationId = $request->query('examination_id');
        $programId = $request->query('program_id');
        $search = $request->query('search');
        $status = $request->query('status'); // submitted, started, expired, pass, fail, disqualified
        $gender = $request->query('gender'); // male, female

        $query = ExaminationResult::with([
            'application.applicantProfile',
            'examination.sessionProgram.program',
            'attempt.answers.question.options',
            'attempt.answers.selectedOption',
        ]);

        if ($examinationId) {
            $query->where('examination_id', $examinationId);
        }

        if ($programId) {
            $query->whereHas('examination.sessionProgram', function ($spQ) use ($programId) {
                $spQ->where('program_id', $programId);
            });
        }

        if ($gender) {
            $query->whereHas('application.applicantProfile', function ($profQ) use ($gender) {
                $profQ->where('gender', $gender);
            });
        }

        if ($status) {
            if ($status === 'submitted') {
                $query->whereHas('attempt', fn ($a) => $a->where('status', 'submitted'));
            } elseif ($status === 'started' || $status === 'in_progress') {
                $query->whereHas('attempt', fn ($a) => $a->where('status', 'in_progress')->where('server_deadline', '>', now()));
            } elseif ($status === 'expired' || $status === 'timed_out') {
                $query->where(function ($subQ) {
                    $subQ->whereHas('attempt', fn ($a) => $a->where('status', 'timed_out'))
                         ->orWhereHas('attempt', fn ($a) => $a->where('status', 'in_progress')->where('server_deadline', '<=', now()));
                });
            } elseif ($status === 'pass') {
                $query->where('is_passed', true);
            } elseif ($status === 'fail') {
                $query->where('is_passed', false);
            } elseif ($status === 'disqualified') {
                $query->where('status', 'disqualified');
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('application', function ($appQ) use ($search) {
                    $appQ->where('application_number', 'like', "%{$search}%")
                         ->orWhere('roll_number', 'like', "%{$search}%");
                })
                ->orWhereHas('application.applicantProfile', function ($profQ) use ($search) {
                    $profQ->where('full_name', 'like', "%{$search}%")
                          ->orWhere('father_name', 'like', "%{$search}%")
                          ->orWhere('cnic', 'like', "%{$search}%");
                });
            });
        }

        // Recent 20 students per page with full query string preservation
        $results = $query->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $examinations = Examination::with('sessionProgram.program')
            ->orderByDesc('id')
            ->get(['id', 'title', 'exam_code', 'session_program_id', 'total_marks']);

        $programs = Program::orderBy('name')->get(['id', 'name', 'code']);

        $stats = [
            'total_candidates' => ExaminationResult::count(),
            'passed' => ExaminationResult::where('is_passed', true)->count(),
            'failed' => ExaminationResult::where('is_passed', false)->count(),
            'average_score' => round((float) ExaminationResult::avg('obtained_marks'), 1),
        ];

        return Inertia::render('Hod/Results/Index', [
            'results' => $results,
            'examinations' => $examinations,
            'programs' => $programs,
            'filters' => [
                'examination_id' => $examinationId ? (int) $examinationId : '',
                'program_id' => $programId ? (int) $programId : '',
                'search' => $search ?? '',
                'status' => $status ?? '',
                'gender' => $gender ?? '',
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Download Results as CSV or Excel Spreadsheet
     */
    public function export(Request $request)
    {
        $format = strtolower((string) $request->query('format', 'csv'));
        $examinationId = $request->query('examination_id');
        $programId = $request->query('program_id');
        $search = $request->query('search');
        $status = $request->query('status');
        $gender = $request->query('gender');

        $query = ExaminationResult::with([
            'application.applicantProfile',
            'examination.sessionProgram.program',
            'attempt',
        ]);

        if ($examinationId) {
            $query->where('examination_id', $examinationId);
        }

        if ($programId) {
            $query->whereHas('examination.sessionProgram', function ($spQ) use ($programId) {
                $spQ->where('program_id', $programId);
            });
        }

        if ($gender) {
            $query->whereHas('application.applicantProfile', function ($profQ) use ($gender) {
                $profQ->where('gender', $gender);
            });
        }

        if ($status) {
            if ($status === 'submitted') {
                $query->whereHas('attempt', fn ($a) => $a->where('status', 'submitted'));
            } elseif ($status === 'started' || $status === 'in_progress') {
                $query->whereHas('attempt', fn ($a) => $a->where('status', 'in_progress')->where('server_deadline', '>', now()));
            } elseif ($status === 'expired' || $status === 'timed_out') {
                $query->where(function ($subQ) {
                    $subQ->whereHas('attempt', fn ($a) => $a->where('status', 'timed_out'))
                         ->orWhereHas('attempt', fn ($a) => $a->where('status', 'in_progress')->where('server_deadline', '<=', now()));
                });
            } elseif ($status === 'pass') {
                $query->where('is_passed', true);
            } elseif ($status === 'fail') {
                $query->where('is_passed', false);
            } elseif ($status === 'disqualified') {
                $query->where('status', 'disqualified');
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('application', function ($appQ) use ($search) {
                    $appQ->where('application_number', 'like', "%{$search}%")
                         ->orWhere('roll_number', 'like', "%{$search}%");
                })
                ->orWhereHas('application.applicantProfile', function ($profQ) use ($search) {
                    $profQ->where('full_name', 'like', "%{$search}%")
                          ->orWhere('father_name', 'like', "%{$search}%")
                          ->orWhere('cnic', 'like', "%{$search}%");
                });
            });
        }

        $records = $query->orderByDesc('id')->get();

        $prefix = 'BCMT_Results';
        if ($programId) {
            $prog = Program::find($programId);
            if ($prog) {
                $prefix = 'BCMT_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $prog->code);
            }
        }
        $filename = "{$prefix}_" . date('Y_m_d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($records) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM so Microsoft Excel renders symbols & Urdu characters perfectly
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Sr #',
                'Roll Number',
                'Application Number',
                'Candidate Full Name',
                'Father Name',
                'Gender',
                'CNIC / Form-B',
                'Mobile Contact',
                'Applied Program',
                'Entrance Test Code & Title',
                'Shift',
                'Attempt Status',
                'Total Questions',
                'Correct Answers',
                'Incorrect Answers',
                'Unanswered',
                'Total Marks',
                'Obtained Marks',
                'Percentage (%)',
                'Outcome',
                'Attempt Start Time',
                'Submission Time',
            ]);

            $sr = 1;
            foreach ($records as $r) {
                $profile = $r->application?->applicantProfile;
                $attempt = $r->attempt;
                $prog = $r->examination?->sessionProgram?->program;

                $attemptStatus = 'Submitted';
                if ($attempt) {
                    if ($attempt->status === 'in_progress') {
                        $attemptStatus = $attempt->isExpired() ? 'Expired (Timed Out)' : 'In Progress (Started)';
                    } elseif ($attempt->status === 'timed_out') {
                        $attemptStatus = 'Expired (Timed Out)';
                    } elseif ($attempt->status === 'disqualified') {
                        $attemptStatus = 'Disqualified';
                    }
                }

                $outcome = $r->is_passed ? 'PASSED' : 'FAILED';
                if ($r->status === 'disqualified') {
                    $outcome = 'DISQUALIFIED';
                }

                fputcsv($handle, [
                    $sr++,
                    $r->application?->roll_number ?? 'N/A',
                    $r->application?->application_number ?? 'N/A',
                    $profile?->full_name ?? 'N/A',
                    $profile?->father_name ?? 'N/A',
                    ucfirst((string) ($profile?->gender ?? 'N/A')),
                    $profile?->cnic ?? 'N/A',
                    $profile?->mobile ?? 'N/A',
                    $prog?->name ?? 'N/A',
                    ($r->examination?->exam_code ? "[{$r->examination->exam_code}] " : '') . ($r->examination?->title ?? 'N/A'),
                    $r->examination?->shift ?? 'Morning',
                    $attemptStatus,
                    $r->total_questions,
                    $r->correct_answers,
                    $r->incorrect_answers,
                    $r->unanswered,
                    number_format((float) $r->total_marks, 2),
                    number_format((float) $r->obtained_marks, 2),
                    number_format((float) $r->percentage, 2) . '%',
                    $outcome,
                    $attempt?->start_time ? $attempt->start_time->format('Y-m-d H:i') : 'N/A',
                    $attempt?->end_time ? $attempt->end_time->format('Y-m-d H:i') : ($r->created_at ? $r->created_at->format('Y-m-d H:i') : 'N/A'),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Official Printable Gazette / PDF View
     */
    public function printGazette(Request $request): Response
    {
        $examinationId = $request->query('examination_id');
        $programId = $request->query('program_id');
        $search = $request->query('search');
        $status = $request->query('status');
        $gender = $request->query('gender');

        $query = ExaminationResult::with([
            'application.applicantProfile',
            'examination.sessionProgram.program',
            'attempt',
        ]);

        if ($examinationId) {
            $query->where('examination_id', $examinationId);
        }

        if ($programId) {
            $query->whereHas('examination.sessionProgram', function ($spQ) use ($programId) {
                $spQ->where('program_id', $programId);
            });
        }

        if ($gender) {
            $query->whereHas('application.applicantProfile', function ($profQ) use ($gender) {
                $profQ->where('gender', $gender);
            });
        }

        if ($status) {
            if ($status === 'submitted') {
                $query->whereHas('attempt', fn ($a) => $a->where('status', 'submitted'));
            } elseif ($status === 'started' || $status === 'in_progress') {
                $query->whereHas('attempt', fn ($a) => $a->where('status', 'in_progress')->where('server_deadline', '>', now()));
            } elseif ($status === 'expired' || $status === 'timed_out') {
                $query->where(function ($subQ) {
                    $subQ->whereHas('attempt', fn ($a) => $a->where('status', 'timed_out'))
                         ->orWhereHas('attempt', fn ($a) => $a->where('status', 'in_progress')->where('server_deadline', '<=', now()));
                });
            } elseif ($status === 'pass') {
                $query->where('is_passed', true);
            } elseif ($status === 'fail') {
                $query->where('is_passed', false);
            } elseif ($status === 'disqualified') {
                $query->where('status', 'disqualified');
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('application', function ($appQ) use ($search) {
                    $appQ->where('application_number', 'like', "%{$search}%")
                         ->orWhere('roll_number', 'like', "%{$search}%");
                })
                ->orWhereHas('application.applicantProfile', function ($profQ) use ($search) {
                    $profQ->where('full_name', 'like', "%{$search}%")
                          ->orWhere('father_name', 'like', "%{$search}%")
                          ->orWhere('cnic', 'like', "%{$search}%");
                });
            });
        }

        $results = $query->orderByDesc('obtained_marks')->get();

        $selectedProgram = $programId ? Program::find($programId) : null;
        $selectedExamination = $examinationId ? Examination::find($examinationId) : null;

        return Inertia::render('Hod/Results/PrintGazette', [
            'results' => $results,
            'selectedProgram' => $selectedProgram,
            'selectedExamination' => $selectedExamination,
            'filterMetadata' => [
                'status' => $status,
                'gender' => $gender,
                'search' => $search,
            ],
            'generatedAt' => now()->format('d M Y, h:i A'),
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
