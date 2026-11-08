<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class AutoSyncController extends Controller
{
    /**
     * Secure automated deployment endpoint.
     * Can be triggered via webhook, curl, GitHub Actions, or browser.
     * URL: https://yourdomain.com/system/auto-sync-db?token=bcmt_deploy_2026_x89a
     */
    public function sync(Request $request): JsonResponse
    {
        $expectedToken = env('DEPLOY_SECRET_KEY', 'bcmt_deploy_2026_x89a');
        $providedToken = $request->input('token') ?? $request->header('X-DEPLOY-TOKEN');

        if (!$providedToken || !hash_equals($expectedToken, (string) $providedToken)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Invalid or missing deployment authentication token.',
            ], 403);
        }

        try {
            // 1. Run migrations safely
            Artisan::call('migrate', ['--force' => true]);
            $migrationOutput = trim(Artisan::output());

            // 2. Clear optimized caches
            Artisan::call('optimize:clear');
            $cacheOutput = trim(Artisan::output());

            // 3. Mark self-healing flag
            Cache::forever('auto_schema_sync_dit_v1', true);

            return response()->json([
                'status' => 'success',
                'message' => 'Database migrations and optimization caches completed successfully.',
                'migration_output' => $migrationOutput ?: 'All migrations are already up to date.',
                'cache_output' => $cacheOutput,
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Migration failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
