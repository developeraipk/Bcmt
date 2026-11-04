<?php

namespace App\Services;

use App\Models\Application;
use App\Models\AuditLog;
use App\Models\MeritListItem;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SeatAllocationService
{
    /**
     * Atomically offer and reserve a seat for a selected candidate
     * Concurrency-safe via pessimistic row locking (Mandatory Correction 4, 5 & 7)
     */
    public static function reserveSeat(Application $application, int $allocatedByUserId): SeatAllocation
    {
        return DB::transaction(function () use ($application, $allocatedByUserId) {
            $sessionProgram = SessionProgram::where('id', $application->session_program_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Check if student already has an active allocation
            $existing = SeatAllocation::where('application_id', $application->id)
                ->whereIn('status', ['offered', 'reserved', 'confirmed'])
                ->first();

            if ($existing) {
                return $existing;
            }

            // Find all seat numbers currently held by active allocations
            $takenSeats = SeatAllocation::where('session_program_id', $sessionProgram->id)
                ->whereIn('status', ['offered', 'reserved', 'confirmed'])
                ->pluck('seat_number')
                ->toArray();

            // Find the lowest available seat number (1 to total_seats) - prevents duplicates upon release!
            $availableSeatNumber = null;
            for ($i = 1; $i <= $sessionProgram->total_seats; $i++) {
                if (!in_array($i, $takenSeats)) {
                    $availableSeatNumber = $i;
                    break;
                }
            }

            if (!$availableSeatNumber) {
                throw ValidationException::withMessages([
                    'seats' => "All {$sessionProgram->total_seats} seats for {$sessionProgram->program->name} are currently occupied or reserved.",
                ]);
            }

            $validityDays = $sessionProgram->reservation_validity_days ?? 5;
            $expiresAt = now()->addDays($validityDays);

            $meritItem = MeritListItem::where('application_id', $application->id)->latest()->first();

            $allocation = SeatAllocation::create([
                'admission_session_id' => $sessionProgram->admission_session_id,
                'session_program_id' => $sessionProgram->id,
                'application_id' => $application->id,
                'merit_list_item_id' => $meritItem?->id,
                'seat_number' => $availableSeatNumber,
                'status' => 'reserved',
                'offer_extended_at' => now(),
                'reservation_expires_at' => $expiresAt,
                'allocated_by_user_id' => $allocatedByUserId,
            ]);

            // Update session_program seats_allocated count
            $sessionProgram->increment('seats_allocated');

            // Update application status
            $application->transitionState('selection', 'seat_offered', $allocatedByUserId, "Seat #{$availableSeatNumber} reserved. Valid until {$expiresAt->format('Y-m-d')}");

            AuditLog::log('seat_reserved', 'SeatAllocation', $allocation->id, null, [
                'seat_number' => $availableSeatNumber,
                'program' => $sessionProgram->program->name,
                'expires_at' => $expiresAt->toIso8601String(),
            ]);

            return $allocation;
        });
    }

    /**
     * Confirm a reserved seat upon document & fee verification
     */
    public static function confirmSeat(SeatAllocation $allocation, int $confirmedByUserId): void
    {
        DB::transaction(function () use ($allocation, $confirmedByUserId) {
            $allocation->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmed_by_user_id' => $confirmedByUserId,
            ]);

            $allocation->application->transitionState('selection', 'admission_confirmed', $confirmedByUserId, 'Seat confirmed after document and fee verification');

            AuditLog::log('seat_confirmed', 'SeatAllocation', $allocation->id, null, [
                'seat_number' => $allocation->seat_number,
                'confirmed_by' => $confirmedByUserId,
            ]);
        });
    }

    /**
     * Release expired or declined seat reservation and offer to the next waiting-list candidate
     */
    public static function releaseSeat(SeatAllocation $allocation, ?string $reason = null): ?SeatAllocation
    {
        return DB::transaction(function () use ($allocation, $reason) {
            $sessionProgram = SessionProgram::where('id', $allocation->session_program_id)
                ->lockForUpdate()
                ->firstOrFail();

            $allocation->update([
                'status' => 'released',
                'released_at' => now(),
                'release_reason' => $reason ?? 'Reservation expired or declined by candidate',
            ]);

            if ($sessionProgram->seats_allocated > 0) {
                $sessionProgram->decrement('seats_allocated');
            }

            $allocation->application->transitionState('selection', 'offer_lapsed', null, $reason ?? 'Reservation offer expired');

            AuditLog::log('seat_released', 'SeatAllocation', $allocation->id, null, [
                'seat_number' => $allocation->seat_number,
                'reason' => $reason,
            ]);

            // Automatically promote next waiting-list candidate with an admission offer! (Mandatory Correction 5)
            return self::promoteNextWaitingCandidate($sessionProgram, $allocation->allocated_by_user_id);
        });
    }

    /**
     * Promote the highest-ranked waiting-list candidate by extending an admission offer
     */
    public static function promoteNextWaitingCandidate(SessionProgram $sessionProgram, int $userId): ?SeatAllocation
    {
        $nextWaiting = MeritListItem::whereHas('meritList', fn ($q) => $q->where('session_program_id', $sessionProgram->id))
            ->where('status', 'waiting_list')
            ->whereDoesntHave('application.seatAllocation', fn ($q) => $q->whereIn('status', ['reserved', 'confirmed', 'offered']))
            ->orderBy('rank')
            ->first();

        if ($nextWaiting && $sessionProgram->availableSeats() > 0) {
            $nextWaiting->update(['status' => 'selected']);
            return self::reserveSeat($nextWaiting->application, $userId);
        }

        return null;
    }
}
