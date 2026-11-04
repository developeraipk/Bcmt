<?php

namespace App\Console\Commands;

use App\Models\SeatAllocation;
use App\Services\SeatAllocationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireReservationsCommand extends Command
{
    protected $signature = 'bcmt:expire-reservations';
    protected $description = 'Release expired seat reservations and promote next waiting candidates';

    public function handle(): int
    {
        $this->info('Checking for expired seat reservations...');

        $expired = SeatAllocation::where('status', 'reserved')
            ->whereNotNull('reservation_expires_at')
            ->where('reservation_expires_at', '<=', now())
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No expired reservations found.');
            return self::SUCCESS;
        }

        $this->info("Found {$expired->count()} expired reservation(s). Processing release and promotions...");

        foreach ($expired as $allocation) {
            $this->line("Releasing seat #{$allocation->seat_number} for Application #{$allocation->application->application_number}...");
            
            $promoted = SeatAllocationService::releaseSeat(
                $allocation,
                'Seat reservation expired due to deadline lapse without confirmation fee/document verification.'
            );

            if ($promoted) {
                $this->info("Promoted waiting candidate: Application #{$promoted->application->application_number} to Seat #{$promoted->seat_number}");
            }
        }

        Log::info("BCMT Reservation Expiry: Processed {$expired->count()} expired seat reservations.");
        return self::SUCCESS;
    }
}

