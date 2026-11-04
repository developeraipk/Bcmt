<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use App\Models\AdmissionSession;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $userData = null;

        if ($user) {
            $user->loadMissing('roles', 'permissions');
            $roles = $user->roles->pluck('name')->toArray();
            
            $activeApplication = null;
            if (in_array('student', $roles) || $user->hasRole('student')) {
                $activeApp = $user->applications()
                    ->with(['admissionSession', 'sessionProgram.program', 'documents'])
                    ->latest()
                    ->first();

                if ($activeApp) {
                    $photoDoc = $activeApp->documents->firstWhere('document_type', 'photo');
                    $activeApplication = [
                        'id' => $activeApp->id,
                        'application_number' => $activeApp->application_number,
                        'status' => $activeApp->status,
                        'verification_status' => $activeApp->verification_status,
                        'exam_eligibility_status' => $activeApp->exam_eligibility_status,
                        'selection_status' => $activeApp->selection_status,
                        'program_name' => $activeApp->sessionProgram?->program?->name,
                        'program_code' => $activeApp->sessionProgram?->program?->code,
                        'roll_number' => $activeApp->roll_number,
                        'photo_document_id' => $photoDoc?->id,
                        'photo_updated_at' => $photoDoc?->updated_at?->timestamp ?? time(),
                    ];
                }
            }

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'cnic' => $user->cnic,
                'phone' => $user->phone,
                'roles' => $roles,
                'permissions' => $user->getAllPermissions(),
                'active_application' => $activeApplication,
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'system' => [
                'college_name' => SystemSetting::get('college_name', 'Bannu College of Medical Technologies'),
                'college_short_name' => SystemSetting::get('college_short_name', 'BCMT'),
                'tagline' => SystemSetting::get('tagline', 'The Home of Quality Education'),
                'phone' => SystemSetting::get('official_phone', '0928-622699'),
                'mobile' => SystemSetting::get('official_mobile', '0334-0580180'),
                'email' => SystemSetting::get('official_email', 'bcmts1122@gmail.com'),
                'address' => SystemSetting::get('campus_address', 'Circular Road near Hira School, Sokari Gate, Bannu'),
                'whatsapp_community_enabled' => (bool) SystemSetting::get('whatsapp_community_enabled', true),
                'whatsapp_community_url' => SystemSetting::get('whatsapp_community_url', 'https://chat.whatsapp.com/invite/BCMT2026'),
                'whatsapp_support_enabled' => (bool) SystemSetting::get('whatsapp_support_enabled', true),
                'whatsapp_support_phone' => SystemSetting::get('whatsapp_support_phone', '923340580180'),
                'active_session' => fn () => AdmissionSession::where('is_active', true)->select('id', 'name', 'code', 'status')->first(),
            ],
        ];
    }
}
