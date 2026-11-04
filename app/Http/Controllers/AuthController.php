<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $login = trim($request->input('login'));
        $throttleKey = Str::transliterate(Str::lower($login) . '|' . $request->ip());

        // Login Rate Limiting (5 failed attempts per minute)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'login' => "Too many login attempts. Access is locked for security. Please try again in {$seconds} seconds.",
            ]);
        }

        $user = null;

        // Check if login is an Application Number (e.g. BCMT-2026-000001)
        if (str_starts_with(strtoupper($login), 'BCMT-')) {
            $application = Application::where('application_number', strtoupper($login))->first();
            if ($application) {
                $user = $application->user;
            }
        }

        // If not application number or not found, check email
        if (!$user) {
            $user = User::where('email', $login)->first();
        }

        // Also allow CNIC login
        if (!$user) {
            $normalizedCnic = preg_replace('/[^0-9]/', '', $login);
            if (strlen($normalizedCnic) === 13) {
                $user = User::where('cnic', $normalizedCnic)->first();
            }
        }

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'login' => 'The provided credentials do not match our institutional records.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'login' => 'This account has been deactivated. Please contact BCMT administration.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $user->update(['last_login_at' => now()]);

        AuditLog::log('user_login', 'User', $user->id);

        // Check if user must change password (Mandatory Correction 8)
        if ($user->must_change_password) {
            return redirect()->route('auth.password.change');
        }

        // Determine destination portal based on primary role
        if ($user->hasRole('super_admin') || $user->hasRole('management') || $user->hasRole('admission_officer')) {
            return redirect()->intended(route('admin.dashboard'));
        }

        if ($user->hasRole('hod') || $user->hasRole('exam_manager')) {
            return redirect()->intended(route('hod.dashboard'));
        }

        if ($user->hasRole('invigilator')) {
            return redirect()->intended(route('invigilator.dashboard'));
        }

        return redirect()->intended(route('student.dashboard'));
    }

    public function showForgotPassword(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
            'mobile_number' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $identifier = trim($validated['identifier']);
        $mobileInput = preg_replace('/[^0-9]/', '', $validated['mobile_number']);
        $user = null;

        // Try Application Number
        if (str_starts_with(strtoupper($identifier), 'BCMT-')) {
            $app = Application::where('application_number', strtoupper($identifier))
                ->with(['user', 'applicantProfile'])
                ->first();
            if ($app) {
                $profileMobile = preg_replace('/[^0-9]/', '', $app->applicantProfile?->mobile_number ?? '');
                $userPhone = preg_replace('/[^0-9]/', '', $app->user?->phone ?? '');
                if ($profileMobile === $mobileInput || $userPhone === $mobileInput || str_ends_with($profileMobile, $mobileInput) || str_ends_with($mobileInput, $profileMobile)) {
                    $user = $app->user;
                }
            }
        }

        // Try CNIC
        if (!$user) {
            $normCnic = preg_replace('/[^0-9]/', '', $identifier);
            if (strlen($normCnic) === 13) {
                $app = Application::where('normalized_cnic', $normCnic)
                    ->with(['user', 'applicantProfile'])
                    ->first();
                if ($app) {
                    $profileMobile = preg_replace('/[^0-9]/', '', $app->applicantProfile?->mobile_number ?? '');
                    $userPhone = preg_replace('/[^0-9]/', '', $app->user?->phone ?? '');
                    if ($profileMobile === $mobileInput || $userPhone === $mobileInput || str_ends_with($profileMobile, $mobileInput) || str_ends_with($mobileInput, $profileMobile)) {
                        $user = $app->user;
                    }
                }
                if (!$user) {
                    $u = User::where('cnic', $normCnic)->first();
                    if ($u) {
                        $uPhone = preg_replace('/[^0-9]/', '', $u->phone ?? '');
                        if ($uPhone === $mobileInput || str_ends_with($uPhone, $mobileInput) || str_ends_with($mobileInput, $uPhone)) {
                            $user = $u;
                        }
                    }
                }
            }
        }

        // Try Email
        if (!$user) {
            $u = User::where('email', $identifier)->first();
            if ($u) {
                $uPhone = preg_replace('/[^0-9]/', '', $u->phone ?? '');
                if ($uPhone === $mobileInput || str_ends_with($uPhone, $mobileInput) || str_ends_with($mobileInput, $uPhone)) {
                    $user = $u;
                }
            }
        }

        if (!$user) {
            throw ValidationException::withMessages([
                'identifier' => 'Could not verify student identity with the provided application/CNIC and registered mobile number.',
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        AuditLog::log('password_reset_self_service', 'User', $user->id);

        return redirect()->route('login')->with('success', 'Your password has been successfully reset! You can now log in with your new password.');
    }

    public function showChangePassword(): Response
    {
        return Inertia::render('Auth/ChangePassword');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->input('password')),
            'must_change_password' => false,
        ]);

        AuditLog::log('password_changed', 'User', $user->id);

        return redirect()->route('login')->with('success', 'Your password has been updated securely.');
    }

    public function logout(Request $request)
    {
        $userId = Auth::id();
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($userId) {
            AuditLog::log('user_logout', 'User', $userId);
        }

        return redirect()->route('home')->with('info', 'You have been logged out safely.');
    }
}
