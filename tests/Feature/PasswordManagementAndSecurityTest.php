<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class PasswordManagementAndSecurityTest extends TestCase
{
    use DatabaseTransactions;

    public function test_student_can_change_own_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);
        $user->assignRole('student');
        $user->load('roles');

        $sp = SessionProgram::first();
        $app = Application::create([
            'admission_session_id' => $sp->admission_session_id,
            'session_program_id' => $sp->id,
            'user_id' => $user->id,
            'application_number' => 'BCMT-PASS-001',
            'normalized_cnic' => '1110199999991',
            'status' => 'completed',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Password Test Student',
            'father_name' => 'Father',
            'cnic' => '11101-9999999-1',
            'gender' => 'male',
            'dob' => '2004-01-01',
            'mobile_number' => '03001234567',
            'whatsapp_number' => '03001234567',
            'domicile_district' => 'Bannu',
            'current_address' => 'Bannu',
            'permanent_address' => 'Bannu',
            'email' => $user->email,
        ]);

        // Wrong current password
        $failResponse = $this->actingAs($user)->post('/student/password/update', [
            'current_password' => 'WrongPassword!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);
        $failResponse->assertSessionHasErrors('current_password');

        // Correct password change
        $successResponse = $this->actingAs($user)->post('/student/password/update', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);
        $successResponse->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
    }

    public function test_candidate_can_reset_password_via_forgot_password_flow()
    {
        $user = User::factory()->create([
            'email' => 'resetme@bcmt.edu.pk',
            'phone' => '03331112233',
            'password' => Hash::make('ForgottenPass123!'),
        ]);
        $user->assignRole('student');

        $sp = SessionProgram::first();
        $app = Application::create([
            'admission_session_id' => $sp->admission_session_id,
            'session_program_id' => $sp->id,
            'user_id' => $user->id,
            'application_number' => 'BCMT-RESET-777',
            'normalized_cnic' => '1110177777771',
            'status' => 'completed',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Reset Student',
            'father_name' => 'Father',
            'cnic' => '11101-7777777-1',
            'gender' => 'male',
            'dob' => '2004-01-01',
            'mobile_number' => '03331112233',
            'whatsapp_number' => '03331112233',
            'domicile_district' => 'Bannu',
            'current_address' => 'Bannu',
            'permanent_address' => 'Bannu',
            'email' => $user->email,
        ]);

        // Wrong phone
        $failRes = $this->post('/forgot-password', [
            'identifier' => 'BCMT-RESET-777',
            'mobile_number' => '03000000000',
            'password' => 'BrandNewPass123!',
            'password_confirmation' => 'BrandNewPass123!',
        ]);
        $failRes->assertSessionHasErrors('identifier');

        // Correct verification
        $res = $this->post('/forgot-password', [
            'identifier' => 'BCMT-RESET-777',
            'mobile_number' => '03331112233',
            'password' => 'BrandNewPass123!',
            'password_confirmation' => 'BrandNewPass123!',
        ]);
        $res->assertRedirect(route('login'));
        $res->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue(Hash::check('BrandNewPass123!', $user->password));
    }

    public function test_login_rate_limiting_protects_against_brute_force()
    {
        $testEmail = 'rate_limit_test_' . uniqid() . '@bcmt.edu.pk';
        User::factory()->create([
            'email' => $testEmail,
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        // 5 consecutive failed attempts
        for ($i = 0; $i < 5; $i++) {
            $response = $this->post('/login', [
                'login' => $testEmail,
                'password' => 'WrongPass!',
            ]);
            $response->assertSessionHasErrors('login');
        }

        // 6th attempt should be blocked by Rate Limiter
        $blockedResponse = $this->post('/login', [
            'login' => $testEmail,
            'password' => 'CorrectPassword123!',
        ]);
        $blockedResponse->assertSessionHasErrors('login');
        $errorMessage = session('errors')->first('login');
        $this->assertStringContainsString('Too many login attempts', $errorMessage);
    }

    public function test_admin_can_update_own_password_and_staff_user_password()
    {
        $admin = User::find(1);
        $this->assertNotNull($admin);
        $admin->update(['password' => Hash::make('AdminInitial123!')]);

        // 1. Admin updates own password
        $ownRes = $this->actingAs($admin)->post('/admin/password/update-own', [
            'current_password' => 'AdminInitial123!',
            'password' => 'AdminSecureNew123!',
            'password_confirmation' => 'AdminSecureNew123!',
        ]);
        $ownRes->assertSessionHas('success');

        $admin->refresh();
        $this->assertTrue(Hash::check('AdminSecureNew123!', $admin->password));

        // 2. Admin resets staff user password
        $staffUser = User::factory()->create([
            'email' => 'staff_member@bcmt.edu.pk',
            'password' => Hash::make('StaffOld123!'),
        ]);
        $staffUser->assignRole('invigilator');

        $userRes = $this->actingAs($admin)->post("/admin/users/{$staffUser->id}/password", [
            'password' => 'StaffFreshPassword999!',
            'password_confirmation' => 'StaffFreshPassword999!',
        ]);
        $userRes->assertSessionHas('success');

        $staffUser->refresh();
        $this->assertTrue(Hash::check('StaffFreshPassword999!', $staffUser->password));
    }

    public function test_merit_list_aliases_redirect_to_public_merit_lists()
    {
        $this->get('/merit-list')->assertRedirect('/merit-lists');
        $this->get('/meritlist')->assertRedirect('/merit-lists');
        $this->get('/merits')->assertRedirect('/merit-lists');
        $this->get('/merit')->assertRedirect('/merit-lists');
        $this->get('/merit-lists')->assertOk();
    }
}
