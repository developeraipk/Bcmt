<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| BCMT Automated Scheduled Tasks (Mandatory Corrections 5 & 9)
|--------------------------------------------------------------------------
*/

// Check and process expired seat reservations every 10 minutes
Schedule::command('bcmt:expire-reservations')->everyTenMinutes();

// Clean up stale examination access tokens hourly
Schedule::command('bcmt:clean-expired-tokens')->hourly();

// Automated daily database backup and integrity verification
Schedule::command('bcmt:backup-database --test-restore')->dailyAt('02:00');
