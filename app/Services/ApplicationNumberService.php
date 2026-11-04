<?php

namespace App\Services;

use App\Models\Application;
use Illuminate\Support\Facades\DB;

class ApplicationNumberService
{
    /**
     * Generate a concurrency-safe sequential application number: BCMT-YYYY-000001
     */
    public static function generate(int $year): string
    {
        return DB::transaction(function () use ($year) {
            // Lock latest application in the given year using lockForUpdate
            $prefix = "BCMT-{$year}-";
            
            $lastApp = Application::where('application_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $sequence = 1;
            if ($lastApp) {
                $lastSequence = (int) substr($lastApp->application_number, strlen($prefix));
                $sequence = $lastSequence + 1;
            }

            return sprintf("BCMT-%d-%06d", $year, $sequence);
        });
    }
}
