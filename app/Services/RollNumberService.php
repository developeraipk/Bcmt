<?php

namespace App\Services;

use App\Models\Application;
use App\Models\SessionProgram;
use Illuminate\Support\Facades\DB;

class RollNumberService
{
    /**
     * Generate unique sequential roll number: BCMT-YYYY-PROG-0001
     */
    public static function assignRollNumber(Application $application): string
    {
        if ($application->roll_number) {
            return $application->roll_number;
        }

        return DB::transaction(function () use ($application) {
            $session = $application->admissionSession;
            $program = $application->sessionProgram->program;

            $year = substr($session->code, 0, 4);
            $cleanCode = preg_replace('/[^A-Za-z0-9]/', '', strtoupper($program->code));
            $prefix = "BCMT-{$year}-{$cleanCode}-";

            $lastAssigned = Application::where('admission_session_id', $session->id)
                ->where('roll_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('roll_number')
                ->first();

            $sequence = 1;
            if ($lastAssigned && $lastAssigned->roll_number) {
                $lastNum = (int) substr($lastAssigned->roll_number, strlen($prefix));
                $sequence = $lastNum + 1;
            }

            $rollNumber = sprintf("%s%04d", $prefix, $sequence);
            $application->update(['roll_number' => $rollNumber]);

            return $rollNumber;
        });
    }

    /**
     * Build QR code verification URL payload
     */
    public static function getVerificationQrPayload(Application $application): string
    {
        return route('public.verify.slip', [
            'roll' => $application->roll_number,
            'hash' => substr(sha1($application->id . $application->normalized_cnic . config('app.key')), 0, 16),
        ]);
    }
}
