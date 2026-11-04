<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use App\Services\SeatAllocationService;
use App\Services\MeritCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SeatAllocationController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AdmissionSession::getActive();
        $sessionId = $request->query('session_id', $activeSession?->id);

        $sessionPrograms = SessionProgram::where('admission_session_id', $sessionId)
            ->with(['program', 'seatAllocations.application.applicantProfile'])
            ->get()
            ->map(fn ($sp) => [
                'id' => $sp->id,
                'program_name' => $sp->program->name,
                'program_code' => $sp->program->code,
                'category' => $sp->program->category,
                'total_seats' => $sp->total_seats,
                'reserved_count' => $sp->seatAllocations->where('status', 'reserved')->count(),
                'confirmed_count' => $sp->seatAllocations->where('status', 'confirmed')->count(),
                'available_seats' => $sp->availableSeats(),
                'ranked_candidates' => MeritCalculationService::getRankedCandidatesForSessionProgram($sp),
                'allocations' => $sp->seatAllocations->map(fn ($sa) => [
                    'id' => $sa->id,
                    'seat_number' => $sa->seat_number,
                    'status' => $sa->status,
                    'application_number' => $sa->application->application_number,
                    'student_name' => $sa->application->applicantProfile->full_name,
                    'gender' => $sa->application->applicantProfile->gender,
                    'reservation_expires_at' => $sa->reservation_expires_at?->format('Y-m-d H:i'),
                    'confirmed_at' => $sa->confirmed_at?->format('Y-m-d'),
                    'released_at' => $sa->released_at?->format('Y-m-d H:i'),
                    'release_reason' => $sa->release_reason,
                ]),
            ]);

        $sessions = AdmissionSession::orderByDesc('id')->get(['id', 'name', 'code']);

        $eligibleCandidates = Application::where('admission_session_id', $sessionId)
            ->whereIn('verification_status', ['verified'])
            ->whereDoesntHave('seatAllocation', fn ($q) => $q->whereIn('status', ['reserved', 'confirmed']))
            ->with(['applicantProfile', 'sessionProgram.program'])
            ->orderBy('id')
            ->get()
            ->map(fn ($app) => [
                'id' => $app->id,
                'application_number' => $app->application_number,
                'roll_number' => $app->roll_number,
                'student_name' => $app->applicantProfile?->full_name,
                'session_program_id' => $app->session_program_id,
                'program_name' => $app->sessionProgram?->program?->name,
            ]);

        return Inertia::render('Admin/SeatAllocation/Index', [
            'sessions' => $sessions,
            'selectedSessionId' => (int) $sessionId,
            'sessionPrograms' => $sessionPrograms,
            'eligibleCandidates' => $eligibleCandidates,
        ]);
    }

    public function reserveCandidate(Request $request)
    {
        $request->validate([
            'application_id' => ['required', 'exists:applications,id'],
        ]);

        $app = Application::findOrFail($request->input('application_id'));
        $user = $request->user();

        $allocation = SeatAllocationService::reserveSeat($app, $user->id);

        return back()->with('success', "Seat #{$allocation->seat_number} reserved for candidate {$app->applicantProfile?->full_name} ({$app->application_number}).");
    }

    public function reserve(Request $request, int $applicationId)
    {
        $app = Application::findOrFail($applicationId);
        $user = $request->user();

        $allocation = SeatAllocationService::reserveSeat($app, $user->id);

        return back()->with('success', "Seat #{$allocation->seat_number} reserved for candidate {$app->application_number}.");
    }

    public function confirm(Request $request, int $allocationId)
    {
        $allocation = SeatAllocation::findOrFail($allocationId);
        $user = $request->user();

        SeatAllocationService::confirmSeat($allocation, $user->id);

        return back()->with('success', "Seat #{$allocation->seat_number} confirmed for candidate {$allocation->application->application_number}.");
    }

    public function release(Request $request, int $allocationId)
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $allocation = SeatAllocation::findOrFail($allocationId);
        $promoted = SeatAllocationService::releaseSeat($allocation, $request->input('reason'));

        $msg = "Seat #{$allocation->seat_number} has been released.";
        if ($promoted) {
            $msg .= " Automatically extended an admission offer to next waiting candidate (#{$promoted->application->application_number}).";
        }

        return back()->with('success', $msg);
    }

    public function unrelease(Request $request, int $allocationId)
    {
        $allocation = SeatAllocation::with('application.applicantProfile')->findOrFail($allocationId);

        DB::transaction(function () use ($allocation) {
            $allocation->update([
                'status' => 'reserved',
                'reservation_expires_at' => now()->addDays(5),
                'released_at' => null,
                'release_reason' => null,
            ]);

            if ($allocation->application) {
                $allocation->application->update(['selection_status' => 'seat_offered']);
            }

            AuditLog::log(
                'seat_reinstated_unreleased',
                'SeatAllocation',
                $allocation->id,
                ['status' => 'released'],
                ['status' => 'reserved', 'reservation_expires_at' => now()->addDays(5)->toDateTimeString()]
            );
        });

        $candidateName = $allocation->application?->applicantProfile?->full_name ?? 'Candidate';

        return back()->with('success', "Seat #{$allocation->seat_number} reinstated for {$candidateName}. Reservation offer extended for 5 days.");
    }

    public function destroy(int $id)
    {
        $allocation = SeatAllocation::findOrFail($id);
        $application = $allocation->application;

        DB::transaction(function () use ($allocation, $application) {
            $allocation->delete();
            if ($application) {
                $hasOther = SeatAllocation::where('application_id', $application->id)->exists();
                if (!$hasOther && $application->selection_status !== 'rejected') {
                    $application->update(['selection_status' => 'unprocessed']);
                }
            }
        });

        return back()->with('success', 'Seat allocation record deleted.');
    }
}
