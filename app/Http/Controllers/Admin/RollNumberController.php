<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAttendance;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\SystemSetting;
use App\Services\RollNumberService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RollNumberController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $sessionId = $request->query('session_id', $activeSession?->id);
        $programId = $request->query('program_id');

        $baseQuery = Application::where('exam_eligibility_status', 'eligible')
            ->with(['applicantProfile', 'sessionProgram.program', 'admissionSession', 'examinationAttendance.examination', 'documents']);

        if ($sessionId) {
            $baseQuery->where('admission_session_id', $sessionId);
        }

        if ($programId) {
            $baseQuery->whereHas('sessionProgram', fn ($q) => $q->where('program_id', $programId));
        }

        // 1. Unscheduled Queue (Eligible candidates not yet assigned to an examination shift)
        $unscheduledQuery = (clone $baseQuery)->whereDoesntHave('examinationAttendance', fn ($q) => $q->whereNotNull('examination_id'));
        $unscheduledCandidates = $unscheduledQuery->orderBy('id', 'asc')->get()->map(function ($app) {
            $photo = $app->documents->firstWhere('document_type', 'photo');
            return [
                'id' => $app->id,
                'application_number' => $app->application_number,
                'roll_number' => $app->roll_number,
                'student_name' => $app->applicantProfile?->full_name ?? 'Candidate',
                'father_name' => $app->applicantProfile?->father_name ?? 'N/A',
                'photo_url' => $photo ? "/documents/{$photo->id}/stream?v=" . ($photo->updated_at?->timestamp ?? time()) : null,
                'gender' => $app->applicantProfile?->gender ?? 'male',
                'contact' => $app->applicantProfile?->mobile_number ?? $app->applicantProfile?->whatsapp_number ?? 'N/A',
                'cnic' => $app->applicantProfile?->cnic ?? 'N/A',
                'program_id' => $app->sessionProgram?->program_id,
                'program_name' => $app->sessionProgram?->program?->name ?? 'N/A',
                'program_code' => $app->sessionProgram?->program?->code ?? 'N/A',
                'admission_date' => $app->created_at?->format('d M, Y') ?? 'Recent',
            ];
        });

        // 2. Scheduled List (Candidates who have an Examination & Schedule assigned)
        $scheduledQuery = (clone $baseQuery)->whereHas('examinationAttendance', fn ($q) => $q->whereNotNull('examination_id'));
        $scheduledCandidates = $scheduledQuery->orderBy('roll_number', 'asc')->get()->map(function ($app) {
            $photo = $app->documents->firstWhere('document_type', 'photo');
            return [
                'id' => $app->id,
                'roll_number' => $app->roll_number ?? 'Pending',
                'application_number' => $app->application_number,
                'student_name' => $app->applicantProfile?->full_name ?? 'Candidate',
                'father_name' => $app->applicantProfile?->father_name ?? 'N/A',
                'photo_url' => $photo ? "/documents/{$photo->id}/stream?v=" . ($photo->updated_at?->timestamp ?? time()) : null,
                'gender' => $app->applicantProfile?->gender ?? 'male',
                'program_name' => $app->sessionProgram?->program?->name ?? 'N/A',
                'program_code' => $app->sessionProgram?->program?->code ?? 'N/A',
                'test_date' => $app->examinationAttendance?->examination?->scheduled_start?->format('d M Y') ?? 'Scheduled',
                'test_shift' => $app->examinationAttendance?->examination?->shift ? ucfirst($app->examinationAttendance->examination->shift) . ' Shift' : 'Morning Shift',
                'test_time' => $app->examinationAttendance?->examination?->scheduled_start?->format('h:i A') ?? '09:00 AM',
                'room_number' => $app->examinationAttendance?->room_number ?? 'Main Examination Hall A',
                'seat_number' => $app->examinationAttendance?->seat_number ?? '1',
                'attendance_status' => $app->examinationAttendance?->attendance_status ?? 'absent',
            ];
        });

        $candidates = (clone $baseQuery)->orderBy('roll_number')->paginate(20)->withQueryString();

        $sessions = AdmissionSession::orderByDesc('id')->get(['id', 'name', 'code']);
        $programs = Program::where('is_active', true)->get(['id', 'name', 'code']);
        $examinations = Examination::where('status', '!=', 'closed')->latest()->get(['id', 'title', 'shift', 'duration_minutes']);

        return Inertia::render('Admin/RollNumbers/Index', [
            'unscheduledCandidates' => $unscheduledCandidates,
            'scheduledCandidates' => $scheduledCandidates,
            'counts' => [
                'total_eligible' => (clone $baseQuery)->count(),
                'unscheduled' => $unscheduledCandidates->count(),
                'scheduled' => $scheduledCandidates->count(),
            ],
            'candidates' => $candidates,
            'sessions' => $sessions,
            'programs' => $programs,
            'examinations' => $examinations,
            'selectedSessionId' => (int) $sessionId,
            'selectedProgramId' => $programId ? (int) $programId : null,
        ]);
    }

    public function assignSchedule(Request $request)
    {
        $validated = $request->validate([
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['required', 'exists:applications,id'],
            'test_date' => ['required', 'date'],
            'test_shift' => ['required', 'string', 'in:morning,afternoon,evening'],
            'test_time' => ['nullable', 'string', 'max:50'],
            'center_name' => ['required', 'string', 'max:150'],
        ]);

        $applications = Application::whereIn('id', $validated['application_ids'])
            ->with('sessionProgram.program')
            ->get();

        $assignedCount = 0;

        DB::transaction(function () use ($applications, $validated, &$assignedCount, $request) {
            $grouped = $applications->groupBy('session_program_id');

            foreach ($grouped as $spId => $apps) {
                $sp = SessionProgram::find($spId);
                $shiftLabel = ucfirst($validated['test_shift']);
                $examTitle = "Entrance Examination - " . ($sp?->program?->name ?? 'Cohort') . " ({$shiftLabel} Shift)";

                $timeStr = $validated['test_time'] ? trim($validated['test_time']) : '09:00 AM';
                $startDateTime = Carbon::parse($validated['test_date'] . ' ' . $timeStr);

                // Find or create Examination for this cohort & shift
                $exam = Examination::firstOrCreate(
                    [
                        'admission_session_id' => $sp->admission_session_id,
                        'session_program_id' => $sp->id,
                        'shift' => $validated['test_shift'],
                    ],
                    [
                        'title' => $examTitle,
                        'exam_code' => strtoupper(($sp?->program?->code ?? 'EXAM') . '-' . substr($validated['test_shift'], 0, 1) . '-' . Carbon::parse($validated['test_date'])->format('dM')),
                        'duration_minutes' => 60,
                        'total_questions' => 50,
                        'total_marks' => 100.00,
                        'passing_marks' => 50.00,
                        'passing_percentage' => 50.00,
                        'requires_attendance' => true,
                        'status' => 'draft',
                        'scheduled_start' => $startDateTime,
                        'scheduled_end' => (clone $startDateTime)->addMinutes(90),
                        'instructions' => 'Report 30 minutes prior to test time with Admit Card and CNIC/B-Form.',
                    ]
                );

                $exam->update([
                    'scheduled_start' => $startDateTime,
                    'scheduled_end' => (clone $startDateTime)->addMinutes(90),
                ]);

                $highestSeat = ExaminationAttendance::where('examination_id', $exam->id)
                    ->where('room_number', $validated['center_name'])
                    ->count();

                $seatNum = $highestSeat + 1;

                foreach ($apps as $app) {
                    if (!$app->roll_number) {
                        RollNumberService::assignRollNumber($app);
                    }

                    ExaminationAttendance::updateOrCreate(
                        ['application_id' => $app->id],
                        [
                            'examination_id' => $exam->id,
                            'invigilator_user_id' => $request->user()?->id ?? 1,
                            'room_number' => $validated['center_name'],
                            'seat_number' => (string) $seatNum++,
                            'attendance_status' => 'absent',
                        ]
                    );

                    $assignedCount++;
                }
            }
        });

        return back()->with('success', "Assigned sequential roll numbers and examination schedule to {$assignedCount} candidates. Candidates moved to the Scheduled list.");
    }

    public function unassignSchedule(int $applicationId)
    {
        $attendance = ExaminationAttendance::where('application_id', $applicationId)->first();
        if ($attendance) {
            $attendance->delete();
        }

        return back()->with('success', 'Candidate moved back to the unassigned scheduling queue.');
    }

    public function assignSingle(int $applicationId)
    {
        $app = Application::findOrFail($applicationId);
        $roll = RollNumberService::assignRollNumber($app);

        return back()->with('success', "Assigned Roll Number {$roll} to {$app->application_number}.");
    }

    public function assignBulk(Request $request)
    {
        $request->validate([
            'session_id' => ['required', 'exists:admission_sessions,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
        ]);

        $query = Application::where('admission_session_id', $request->input('session_id'))
            ->where('exam_eligibility_status', 'eligible')
            ->whereNull('roll_number');

        if ($request->filled('program_id')) {
            $query->whereHas('sessionProgram', fn ($q) => $q->where('program_id', $request->input('program_id')));
        }

        $eligibleWithoutRoll = $query->get();
        $count = 0;

        foreach ($eligibleWithoutRoll as $app) {
            RollNumberService::assignRollNumber($app);
            $count++;
        }

        return back()->with('success', "Assigned sequential roll numbers to {$count} eligible candidates.");
    }

    public function viewSlip(int $id): Response
    {
        $application = Application::with([
            'applicantProfile',
            'admissionSession',
            'sessionProgram.program',
            'examinationAttendance.examination',
            'documents',
        ])->findOrFail($id);

        if (!$application->roll_number) {
            RollNumberService::assignRollNumber($application);
            $application->refresh();
        }

        $photoDoc = $application->documents->where('document_type', 'photo')->first();
        $photoUrl = $photoDoc ? route('documents.stream', $photoDoc->id) : null;

        $qrPayload = RollNumberService::getVerificationQrPayload($application);

        $attendance = $application->examinationAttendance;
        $assignedExam = $attendance?->examination;

        return Inertia::render('Student/RollNumberSlip', [
            'application' => $application,
            'isEligible' => true,
            'qrPayload' => $qrPayload,
            'photoUrl' => $photoUrl,
            'attendance' => $attendance,
            'assignedExam' => $assignedExam,
            'instructions' => SystemSetting::get('exam_instructions'),
        ]);
    }

    public function assignSeating(Request $request)
    {
        $validated = $request->validate([
            'application_id' => ['nullable', 'exists:applications,id'],
            'session_id' => ['nullable', 'exists:admission_sessions,id'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'room_number' => ['required', 'string', 'max:100'],
            'start_seat' => ['nullable', 'integer', 'min:1'],
            'examination_id' => ['nullable', 'exists:examinations,id'],
        ]);

        $roomNumber = trim($validated['room_number']);
        $startSeat = (int) ($validated['start_seat'] ?? 1);

        if (!empty($validated['application_id'])) {
            $applications = Application::where('id', $validated['application_id'])->get();
        } else {
            $query = Application::where('exam_eligibility_status', 'eligible');
            if (!empty($validated['session_id'])) {
                $query->where('admission_session_id', $validated['session_id']);
            }
            if (!empty($validated['program_id'])) {
                $query->whereHas('sessionProgram', fn ($q) => $q->where('program_id', $validated['program_id']));
            }
            $applications = $query->orderBy('roll_number')->get();
        }

        if ($applications->isEmpty()) {
            return back()->with('error', 'No eligible candidates found matching the criteria.');
        }

        $exam = !empty($validated['examination_id'])
            ? Examination::find($validated['examination_id'])
            : (Examination::where('status', '!=', 'closed')->latest()->first() ?? Examination::first());

        if (!$exam) {
            $firstApp = $applications->first();
            $exam = Examination::create([
                'admission_session_id' => $firstApp?->admission_session_id ?? \App\Models\AdmissionSession::first()?->id ?? 1,
                'program_id' => $firstApp?->sessionProgram?->program_id ?? \App\Models\Program::first()?->id ?? 1,
                'title' => 'Admission Entrance Test',
                'exam_code' => 'ENT-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'exam_date' => now()->toDateString(),
                'start_time' => '09:00:00',
                'end_time' => '11:00:00',
                'duration_minutes' => 60,
                'total_questions' => 50,
                'total_marks' => 100,
                'passing_percentage' => 40,
                'status' => 'scheduled',
                'created_by_user_id' => $request->user()?->id ?? 1,
            ]);
        }

        $seatCounter = $startSeat;
        $count = 0;

        foreach ($applications as $app) {
            $existing = ExaminationAttendance::where('application_id', $app->id)->first();
            ExaminationAttendance::updateOrCreate(
                ['application_id' => $app->id],
                [
                    'examination_id' => $exam->id,
                    'invigilator_user_id' => $request->user()?->id ?? 1,
                    'room_number' => $roomNumber,
                    'seat_number' => (string) $seatCounter++,
                    'attendance_status' => $existing?->attendance_status ?? 'absent',
                ]
            );
            $count++;
        }

        return back()->with('success', "Assigned Hall '{$roomNumber}' and Seats (#{$startSeat} - #" . ($seatCounter - 1) . ") to {$count} candidate(s) successfully.");
    }
}
