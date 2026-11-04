<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use DatabaseTransactions;

    public function test_student_dashboard_opens_successfully(): void
    {
        $app = Application::with('user')->first();
        if (!$app || !$app->user) {
            $user = User::factory()->create();
            $user->assignRole('student');
            $user->load('roles');
            $sp = \App\Models\SessionProgram::first();
            $app = Application::create([
                'admission_session_id' => $sp->admission_session_id,
                'session_program_id' => $sp->id,
                'user_id' => $user->id,
                'application_number' => 'BCMT-TEST-DASH',
                'normalized_cnic' => '1110112345671',
                'status' => 'completed',
                'verification_status' => 'verified',
                'exam_eligibility_status' => 'eligible',
            ]);
            \App\Models\ApplicantProfile::create([
                'application_id' => $app->id,
                'full_name' => 'Test Student',
                'father_name' => 'Father',
                'cnic' => '11101-1234567-1',
                'gender' => 'male',
                'dob' => '2004-01-01',
                'mobile_number' => '03001234567',
                'whatsapp_number' => '03001234567',
                'domicile_district' => 'Bannu',
                'current_address' => 'Bannu',
                'permanent_address' => 'Bannu',
                'email' => 'student@test.com',
            ]);
        } else {
            $user = $app->user;
        }

        $this->assertNotNull($user);

        $response = $this->actingAs($user)->get('/student/dashboard');
        $response->assertStatus(200);
    }
}
