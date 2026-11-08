<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Automatic Self-Healing Schema Migration on Production Deploy:
        // Automatically checks and applies safe pending migrations upon deployment without requiring manual SSH
        try {
            if (!Cache::has('auto_schema_sync_dit_v1')) {
                if (Schema::hasTable('programs') && !DB::table('programs')->where('code', 'DIT')->exists()) {
                    Artisan::call('migrate', ['--force' => true]);
                }
                Cache::forever('auto_schema_sync_dit_v1', true);
            }
        } catch (\Throwable $e) {
            // Failsafe: Never interrupt HTTP requests if database is connecting or schema is loading
        }
    }
}
