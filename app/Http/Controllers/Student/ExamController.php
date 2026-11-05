<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAccessToken;
use App\Models\ExaminationAttempt;
use App\Services\ExamGateService;
use App\Services\ExaminationEngineService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function showGate(Request $request): Response
    {
        $user = $request->user();
        $application = Application::where('user_id', $user->id)
            ->with(['sessionProgram.program', 'admissionSession', 'examinationAttendance', 'examinationAttempt.result'])
            ->latest()
            ->firstOrFail();

        $examination = Examination::where('session_program_id', $application->session_program_id)
            ->where('admission_session_id', $application->admission_session_id)
            ->latest()
            ->first();

        // Check if student has an existing active in-progress attempt
        $activeAttempt = ExaminationAttempt::where('application_id', $application->id)
            ->where('status', 'in_progress')
            ->first();

        return Inertia::render('Student/Exam/Gate', [
            'application' => $application,
            'examination' => $examination ? [
                'id' => $examination->id,
                'title' => $examination->title,
                'duration_minutes' => $examination->duration_minutes,
                'total_questions' => $examination->total_questions,
                'total_marks' => $examination->total_marks,
                'passing_percentage' => (float) ($examination->passing_percentage ?? ($examination->total_marks > 0 ? round($examination->passing_marks / $examination->total_marks * 100, 1) : 50.0)),
                'passing_marks' => (float) ($examination->passing_marks ?? ($examination->total_marks * ($examination->passing_percentage ?? 50.0) / 100)),
                'negative_marks_per_wrong' => (float) $examination->negative_marks_per_wrong,
                'status' => $examination->status,
                'requires_attendance' => $examination->requires_attendance,
                'instructions' => $examination->instructions,
            ] : null,
            'attendance' => $application->examinationAttendance ? [
                'status' => $application->examinationAttendance->attendance_status,
                'room_number' => $application->examinationAttendance->room_number,
                'seat_number' => $application->examinationAttendance->seat_number,
            ] : null,
            'hasActiveAttempt' => (bool) $activeAttempt,
        ]);
    }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'examination_id' => ['required', 'exists:examinations,id'],
            'pin' => ['required', 'string', 'min:4', 'max:10'],
        ]);

        $user = $request->user();
        $application = Application::where('user_id', $user->id)->latest()->firstOrFail();
        $examination = Examination::findOrFail($request->input('examination_id'));

        // Two-Phase Exam Gating: Validate conditions & Common PIN (Mandatory Correction 3 & 4)
        $token = ExamGateService::verifyGate($application, $examination, $request->input('pin'), $user->id);

        return redirect()->route('student.exam.waiting', ['token' => $token]);
    }

    public function waitingRoom(Request $request): Response|RedirectResponse
    {
        $tokenStr = $request->query('token');
        $accessToken = ExaminationAccessToken::where('token', $tokenStr)
            ->with(['examination', 'application.applicantProfile'])
            ->firstOrFail();

        if (!$accessToken->isValid()) {
            return redirect()->route('student.exam.gate')->with('error', 'Your access token has expired. Please re-enter the test PIN.');
        }

        return Inertia::render('Student/Exam/WaitingRoom', [
            'accessToken' => $tokenStr,
            'examination' => $accessToken->examination,
            'student' => [
                'name' => $accessToken->application->applicantProfile?->full_name ?? 'Candidate',
                'application_number' => $accessToken->application->application_number,
                'roll_number' => $accessToken->application->roll_number,
            ],
        ]);
    }

    public function startAttempt(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $accessToken = ExaminationAccessToken::where('token', $request->input('token'))->firstOrFail();

        // Starts Server-Authoritative Timer strictly upon candidate confirmation
        $attempt = ExaminationEngineService::startAttempt($accessToken, $request);

        return redirect()->route('student.exam.active');
    }

    public function activeTest(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $application = Application::where('user_id', $user->id)->latest()->firstOrFail();

        $attempt = ExaminationAttempt::where('application_id', $application->id)
            ->where('status', 'in_progress')
            ->latest()
            ->first();

        if (!$attempt) {
            return redirect()->route('student.exam.gate')->with('info', 'No active examination attempt in progress.');
        }

        if ($attempt->isExpired()) {
            ExaminationEngineService::submitAttempt($attempt, 'Time Expired upon opening exam interface');
            return redirect()->route('student.exam.gate')->with('warning', 'Your examination duration has concluded.');
        }

        $payload = ExaminationEngineService::getCandidateQuestionPayload($attempt);

        return Inertia::render('Student/Exam/ActiveTest', [
            'examPayload' => $payload,
            'student' => [
                'name' => $application->applicantProfile?->full_name ?? $user->name,
                'roll_number' => $application->roll_number,
                'application_number' => $application->application_number,
            ],
        ]);
    }

    public function saveAnswer(Request $request)
    {
        $request->validate([
            'question_id' => ['required', 'exists:questions,id'],
            'option_id' => ['nullable', 'exists:question_options,id'],
            'time_spent' => ['nullable', 'integer'],
            'is_flagged' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $application = Application::where('user_id', $user->id)->latest()->firstOrFail();

        $attempt = ExaminationAttempt::where('application_id', $application->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        ExaminationEngineService::saveAnswer(
            $attempt,
            (int) $request->input('question_id'),
            $request->input('option_id') ? (int) $request->input('option_id') : null,
            (int) ($request->input('time_spent') ?? 0),
            $request->boolean('is_flagged')
        );

        return response()->json([
            'status' => 'saved',
            'remaining_seconds' => $attempt->remainingSeconds(),
        ]);
    }

    public function submitTest(Request $request)
    {
        $user = $request->user();
        $application = Application::where('user_id', $user->id)->latest()->firstOrFail();

        $attempt = ExaminationAttempt::where('application_id', $application->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        ExaminationEngineService::submitAttempt($attempt, 'Manual candidate submission');

        return redirect()->route('student.result.show')->with('success', 'Your admission examination has been submitted successfully! Here is your test scorecard.');
    }

    public function showResult(Request $request): Response
    {
        $user = $request->user();
        $application = Application::where('user_id', $user->id)
            ->with(['applicantProfile', 'sessionProgram.program', 'examinationAttempt.result.examination'])
            ->latest()
            ->firstOrFail();

        $result = $application->examinationAttempt?->result;

        return Inertia::render('Student/Result/View', [
            'application' => $application,
            'result' => $result,
            'isPublished' => (bool) $result,
        ]);
    }
}
