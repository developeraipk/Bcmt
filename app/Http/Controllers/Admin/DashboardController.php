<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\Program;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $sessionId = $request->query('session_id', $activeSession?->id);

        $sessions = AdmissionSession::orderByDesc('id')->get();

        // Real MySQL Queries & Statistics (No Fake Numbers!)
        $appQuery = Application::query();
        if ($sessionId) {
            $appQuery->where('admission_session_id', $sessionId);
        }

        $totalApplications = (clone $appQuery)->count();
        $todayApplications = (clone $appQuery)->whereDate('created_at', today())->count();
        $pendingVerification = (clone $appQuery)->where('verification_status', 'pending')->count();
        $verifiedApplications = (clone $appQuery)->where('verification_status', 'verified')->count();
        $rejectedApplications = (clone $appQuery)->where('verification_status', 'rejected')->count();
        $eligibleForTest = (clone $appQuery)->where('exam_eligibility_status', 'eligible')->count();
        $testsCompleted = (clone $appQuery)->where('exam_attempt_status', 'completed')->count();
        $confirmedAdmissions = (clone $appQuery)->where('selection_status', 'admission_confirmed')->count();
        $selectedCandidates = (clone $appQuery)->whereIn('selection_status', ['selected', 'seat_offered'])->count();
        $waitingListCount = (clone $appQuery)->where('selection_status', 'waiting_list')->count();

        // Total and Remaining Seats across all programs for the session
        $totalSeats = 0;
        $seatsAllocated = 0;
        if ($sessionId) {
            $totalSeats = (int) SessionProgram::where('admission_session_id', $sessionId)->sum('total_seats');
            $seatsAllocated = (int) SeatAllocation::where('admission_session_id', $sessionId)
                ->whereIn('status', ['reserved', 'confirmed'])
                ->count();
        }
        $remainingSeats = max(0, $totalSeats - $seatsAllocated);

        // Program-wise Applications Analytics
        $programAnalytics = SessionProgram::where('admission_session_id', $sessionId)
            ->with(['program', 'applications'])
            ->get()
            ->map(fn ($sp) => [
                'program_id' => $sp->program_id,
                'program_name' => $sp->program->name,
                'program_code' => $sp->program->code,
                'total_seats' => $sp->total_seats,
                'occupied_seats' => $sp->seatAllocations()->whereIn('status', ['reserved', 'confirmed'])->count(),
                'application_count' => $sp->applications()->count(),
            ]);

        // Gender-wise Statistics (Combined Competition)
        $maleCount = (clone $appQuery)->whereHas('applicantProfile', fn ($q) => $q->where('gender', 'male'))->count();
        $femaleCount = (clone $appQuery)->whereHas('applicantProfile', fn ($q) => $q->where('gender', 'female'))->count();

        $activeSessionData = null;
        if ($activeSession) {
            $activeSessionData = [
                'id' => $activeSession->id,
                'name' => $activeSession->name,
                'code' => $activeSession->code,
                'status' => $activeSession->status,
                'is_open' => $activeSession->isOpen(),
                'is_expired' => $activeSession->isExpired(),
                'closing_datetime_formatted' => $activeSession->closing_datetime->format('d M, Y \a\t h:i A'),
                'time_remaining' => $activeSession->time_remaining,
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'sessions' => $sessions,
            'activeSession' => $activeSessionData,
            'selectedSessionId' => (int) $sessionId,
            'stats' => [
                'total_applications' => $totalApplications,
                'today_applications' => $todayApplications,
                'pending_verification' => $pendingVerification,
                'verified_applications' => $verifiedApplications,
                'rejected_applications' => $rejectedApplications,
                'eligible_for_test' => $eligibleForTest,
                'tests_completed' => $testsCompleted,
                'confirmed_admissions' => $confirmedAdmissions,
                'selected_candidates' => $selectedCandidates,
                'waiting_list_count' => $waitingListCount,
                'total_seats' => $totalSeats,
                'seats_allocated' => $seatsAllocated,
                'remaining_seats' => $remainingSeats,
            ],
            'programAnalytics' => $programAnalytics,
            'genderStats' => [
                'male' => $maleCount,
                'female' => $femaleCount,
            ],
        ]);
    }
}
