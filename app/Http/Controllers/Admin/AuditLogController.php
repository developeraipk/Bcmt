<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $event = $request->query('event') ?? $request->query('action');

        $logs = AuditLog::with('user')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('ip_address', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            })
            ->when($event, fn ($q) => $q->where('action', $event))
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString();

        $distinctEvents = AuditLog::distinct()->pluck('action');

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'event' => $event,
            ],
            'distinctEvents' => $distinctEvents,
        ]);
    }

    public function clearAll(Request $request)
    {
        $user = $request->user();

        AuditLog::query()->delete();

        // Write single record acknowledging cleanup
        AuditLog::create([
            'user_id' => $user?->id,
            'action' => 'audit_trail_cleared',
            'entity_type' => 'System',
            'entity_id' => null,
            'old_values' => null,
            'new_values' => ['cleared_by' => $user?->name ?? 'Administrator'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'All system audit and security logs have been successfully cleared.');
    }

    public function destroy(int $id)
    {
        $log = AuditLog::findOrFail($id);
        $log->delete();

        return back()->with('success', 'Audit log record deleted successfully.');
    }

    public function revokeActor(Request $request, int $id)
    {
        $log = AuditLog::with('user')->findOrFail($id);

        if (!$log->user) {
            return back()->with('error', 'No user associated with this log record to revoke.');
        }

        $user = $log->user;

        // 1. Terminate active sessions in sessions table if database session driver is used
        if (\Illuminate\Support\Facades\Schema::hasTable('sessions')) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        // 2. Revoke exam access tokens if any
        if (\Illuminate\Support\Facades\Schema::hasTable('examination_access_tokens')) {
            DB::table('examination_access_tokens')
                ->where('user_id', $user->id)
                ->update(['is_consumed' => true]);
        }

        // 3. Mark in-progress exam attempts as void/interrupted if any
        if (\Illuminate\Support\Facades\Schema::hasTable('examination_attempts')) {
            DB::table('examination_attempts')
                ->where('user_id', $user->id)
                ->where('status', 'in_progress')
                ->update([
                    'status' => 'timed_out',
                    'end_time' => now(),
                ]);
        }

        AuditLog::log('actor_session_revoked', 'User', $user->id, null, [
            'revoked_by' => $request->user()->name,
            'target_user' => $user->email,
        ]);

        return back()->with('success', "Session and credentials for '{$user->name}' ({$user->email}) have been forcefully revoked.");
    }
}
