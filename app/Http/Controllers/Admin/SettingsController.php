<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'college_name' => SystemSetting::get('college_name', 'Bannu College of Medical Technologies'),
            'college_short_name' => SystemSetting::get('college_short_name', 'BCMT'),
            'tagline' => SystemSetting::get('tagline', 'The Home of Quality Education'),
            'campus_address' => SystemSetting::get('campus_address'),
            'official_phone' => SystemSetting::get('official_phone'),
            'official_mobile' => SystemSetting::get('official_mobile'),
            'official_email' => SystemSetting::get('official_email'),
            'whatsapp_community_enabled' => (bool) SystemSetting::get('whatsapp_community_enabled', true),
            'whatsapp_community_url' => SystemSetting::get('whatsapp_community_url'),
            'whatsapp_support_enabled' => (bool) SystemSetting::get('whatsapp_support_enabled', true),
            'whatsapp_support_phone' => SystemSetting::get('whatsapp_support_phone'),
            'admission_open_status' => (bool) SystemSetting::get('admission_open_status', true),
            'admission_closed_notice' => SystemSetting::get('admission_closed_notice'),
            'exam_instructions' => SystemSetting::get('exam_instructions'),
        ];

        $staffUsers = User::with('roles')
            ->whereHas('roles', fn ($q) => $q->whereIn('name', [
                'super_admin', 'management', 'admission_officer', 'document_verifier', 'hod', 'exam_manager', 'invigilator'
            ]))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'is_active', 'last_login_at']);

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'staffUsers' => $staffUsers,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'college_name' => ['required', 'string', 'max:150'],
            'college_short_name' => ['required', 'string', 'max:20'],
            'tagline' => ['required', 'string', 'max:255'],
            'campus_address' => ['required', 'string', 'max:255'],
            'official_phone' => ['required', 'string', 'max:50'],
            'official_mobile' => ['required', 'string', 'max:50'],
            'official_email' => ['required', 'email', 'max:100'],
            'whatsapp_community_enabled' => ['boolean'],
            'whatsapp_community_url' => ['required', 'url', 'max:255'],
            'whatsapp_support_enabled' => ['boolean'],
            'whatsapp_support_phone' => ['required', 'string', 'max:25'],
            'admission_open_status' => ['boolean'],
            'admission_closed_notice' => ['nullable', 'string'],
            'exam_instructions' => ['nullable', 'string'],
        ]);

        foreach ($validated as $key => $value) {
            SystemSetting::set($key, is_bool($value) ? ($value ? '1' : '0') : $value);
        }

        AuditLog::log('settings_updated', 'SystemSetting');

        return back()->with('success', 'Institutional settings updated successfully.');
    }

    public function updateOwnPassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        AuditLog::log('admin_password_updated', 'User', $user->id);

        return back()->with('success', 'Your administrator password has been updated securely.');
    }

    public function updateUserPassword(Request $request, int $id)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $targetUser = User::findOrFail($id);
        $targetUser->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        AuditLog::log('user_password_changed_by_admin', 'User', $targetUser->id);

        return back()->with('success', "Password for user '{$targetUser->name}' ({$targetUser->email}) has been updated successfully.");
    }

    public function runMigration(Request $request)
    {
        abort_unless($request->user()->hasRole('super_admin'), 403);

        Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = trim(Artisan::output());

        Artisan::call('optimize:clear');

        Cache::forever('auto_schema_sync_dit_v1', true);

        AuditLog::log('database_migrated', 'Migration', null, [
            'output' => $migrateOutput,
        ]);

        return back()->with('success', 'Database synchronized successfully! ' . ($migrateOutput ?: 'All tables and programs are already up to date.'));
    }
}
