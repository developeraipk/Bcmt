<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAttendance;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class RollNumberSchedulingTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_assign_schedule_and_roll_numbers_in_bulk(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::firstOrCreate(
            ['code' => 'SCHED-2026'],
            [
                'name' => 'Scheduling Test Session 2026',
                'start_date' => now()->subDays(5),
                'closing_date' => now()->addDays(20),
                'status' => 'open',
                'is_active' => true,
            ]
        );

        $program = Program::first();
        if (!$program) {
            $program = Program::create([
                'name' => 'BS Medical Laboratory Technology',
                'code' => 'BSMLT',
                'category' => 'bs_degree',
                'duration_years' => 4,
                'qualification_required' => 'fsc_pre_medical',
                'affiliation' => 'KMU',
                'is_active' => true,
            ]);
        }

        $sp = SessionProgram::firstOrCreate(
            [
                'admission_session_id' => $session->id,
                'program_id' => $program->id,
            ],
            [
                'total_seats' => 50,
                'is_active' => true,
            ]
        );

        $applicantUser = User::create([
            'name' => 'Candidate One',
            'email' => 'cand1_' . uniqid() . '@example.com',
            'password' => bcrypt('secret'),
        ]);

        $app = Application::create([
            'user_id' => $applicantUser->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'APP-SCHED-' . uniqid(),
            'current_state' => 'verified',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'exam_attempt_status' => 'not_started',
            'selection_status' => 'unprocessed',
            'normalized_cnic' => '11101' . rand(10000000, 99999999),
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Candidate One',
            'email' => $applicantUser->email,
            'father_name' => 'Father One',
            'gender' => 'male',
            'cnic' => $app->normalized_cnic,
            'mobile_number' => '03340000001',
            'whatsapp_number' => '03340000001',
            'dob' => '2004-01-01',
            'domicile_district' => 'Bannu',
            'current_address' => 'Bannu City',
            'permanent_address' => 'Bannu City',
        ]);

        // Post to assign schedule
        $response = $this->actingAs($admin)->post('/admin/roll-numbers/assign-schedule', [
            'application_ids' => [$app->id],
            'test_date' => now()->addDays(3)->toDateString(),
            'test_shift' => 'morning',
            'test_time' => '09:00 AM',
            'center_name' => 'BCMT Examination Hall 1',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $app->refresh();
        $this->assertNotNull($app->roll_number);

        $this->assertDatabaseHas('examination_attendances', [
            'application_id' => $app->id,
            'room_number' => 'BCMT Examination Hall 1',
        ]);

        // Now test unassign
        $unassignResponse = $this->actingAs($admin)->post("/admin/roll-numbers/unassign-schedule/{$app->id}");
        $unassignResponse->assertRedirect();

        $this->assertDatabaseMissing('examination_attendances', [
            'application_id' => $app->id,
        ]);
    }
}
