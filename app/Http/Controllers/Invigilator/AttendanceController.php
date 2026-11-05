<?php

namespace App\Http\Controllers\Invigilator;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $examinationId = $request->query('examination_id');

        $activeExams = Examination::where('status', 'active')
            ->with(['sessionProgram.program', 'activePin'])
            ->get();

        $selectedExam = null;
        if ($examinationId) {
            $selectedExam = Examination::with(['sessionProgram.program', 'activePin'])->find($examinationId);
        } elseif ($activeExams->isNotEmpty()) {
            $selectedExam = $activeExams->first();
        }

        $candidates = [];
        if ($selectedExam) {
            $candidates = Application::where('session_program_id', $selectedExam->session_program_id)
                ->where('admission_session_id', $selectedExam->admission_session_id)
                ->where('exam_eligibility_status', 'eligible')
                ->with(['applicantProfile', 'examinationAttendance'])
                ->orderBy('roll_number')
                ->get()
                ->map(fn ($app) => [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'roll_number' => $app->roll_number,
                    'student_name' => $app->applicantProfile->full_name,
                    'father_name' => $app->applicantProfile->father_name,
                    'cnic' => $app->applicantProfile->cnic,
                    'gender' => $app->applicantProfile->gender,
                    'attendance_status' => $app->examinationAttendance?->attendance_status ?? 'unmarked',
                    'room_number' => $app->examinationAttendance?->room_number,
                    'seat_number' => $app->examinationAttendance?->seat_number,
                    'verified_at' => $app->examinationAttendance?->verified_at?->format('h:i A'),
                ]);
        }

        return Inertia::render('Invigilator/Attendance/Index', [
            'activeExams' => $activeExams,
            'selectedExam' => $selectedExam,
            'candidates' => $candidates,
        ]);
    }

    public function markAttendance(Request $request)
    {
        $request->validate([
            'examination_id' => ['required', 'exists:examinations,id'],
            'application_id' => ['required', 'exists:applications,id'],
            'status' => ['required', 'in:present,absent,disqualified'],
            'room_number' => ['required', 'string', 'max:50'],
            'seat_number' => ['nullable', 'string', 'max:50'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        $attendance = ExaminationAttendance::updateOrCreate(
            [
                'examination_id' => $request->input('examination_id'),
                'application_id' => $request->input('application_id'),
            ],
            [
                'invigilator_user_id' => $user->id,
                'room_number' => $request->input('room_number'),
                'seat_number' => $request->input('seat_number'),
                'attendance_status' => $request->input('status'),
                'verified_at' => now(),
                'remarks' => $request->input('remarks'),
            ]
        );

        AuditLog::log('attendance_marked', 'ExaminationAttendance', $attendance->id, null, [
            'status' => $request->input('status'),
            'room' => $request->input('room_number'),
            'seat' => $request->input('seat_number'),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'status' => $request->input('status'),
                'verified_at' => $attendance->verified_at?->format('h:i A'),
                'room_number' => $attendance->room_number,
                'seat_number' => $attendance->seat_number,
            ]);
        }

        return back()->with('success', "Attendance marked as {$request->input('status')} for candidate.");
    }

    public function quickMark(Request $request)
    {
        $request->validate([
            'examination_id' => ['required', 'exists:examinations,id'],
            'application_id' => ['required', 'exists:applications,id'],
            'status' => ['required', 'in:present,absent,unmarked,disqualified'],
        ]);

        $user = $request->user();
        $status = $request->input('status');

        $attendance = ExaminationAttendance::updateOrCreate(
            [
                'examination_id' => $request->input('examination_id'),
                'application_id' => $request->input('application_id'),
            ],
            [
                'invigilator_user_id' => $user->id,
                'room_number' => $request->input('room_number', 'Examination Hall A'),
                'attendance_status' => $status,
                'verified_at' => in_array($status, ['present', 'absent', 'disqualified']) ? now() : null,
            ]
        );

        AuditLog::log('attendance_quick_marked', 'ExaminationAttendance', $attendance->id, null, [
            'status' => $status,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'status' => $status,
                'verified_at' => $attendance->verified_at?->format('h:i A'),
            ]);
        }

        return back()->with('success', "Attendance updated to {$status}.");
    }

    public function markAllPresent(Request $request)
    {
        $request->validate([
            'examination_id' => ['required', 'exists:examinations,id'],
        ]);

        $exam = Examination::with('sessionProgram.program')->findOrFail($request->input('examination_id'));
        $user = $request->user();

        $applications = Application::where('session_program_id', $exam->session_program_id)
            ->where('admission_session_id', $exam->admission_session_id)
            ->where('exam_eligibility_status', 'eligible')
            ->get();

        $count = 0;
        foreach ($applications as $app) {
            ExaminationAttendance::updateOrCreate(
                [
                    'examination_id' => $exam->id,
                    'application_id' => $app->id,
                ],
                [
                    'invigilator_user_id' => $user->id,
                    'room_number' => 'Main Examination Hall',
                    'attendance_status' => 'present',
                    'verified_at' => now(),
                ]
            );
            $count++;
        }

        AuditLog::log('all_candidates_marked_present', 'Examination', $exam->id, null, [
            'marked_count' => $count,
            'program' => $exam->sessionProgram?->program?->name,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'marked_count' => $count,
                'message' => "All {$count} candidates for {$exam->sessionProgram?->program?->name} marked present.",
            ]);
        }

        return back()->with('success', "All {$count} candidates for {$exam->sessionProgram?->program?->name} marked present successfully.");
    }
}
