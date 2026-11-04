<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\Program;
use App\Models\Role;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ResultFilteringAndExportTest extends TestCase
{
    use DatabaseTransactions;

    protected function getHodUser(): User
    {
        $role = Role::firstOrCreate(['name' => 'hod'], ['label' => 'Head of Department']);
        $user = User::factory()->create();
        $user->roles()->syncWithoutDetaching([$role->id]);
        return $user;
    }

    protected function getSuperAdminUser(): User
    {
        $role = Role::firstOrCreate(['name' => 'super_admin'], ['label' => 'Super Administrator']);
        $user = User::factory()->create();
        $user->roles()->syncWithoutDetaching([$role->id]);
        return $user;
    }

    public function test_results_page_loads_with_recent_20_pagination_and_filter_options()
    {
        $user = $this->getHodUser();

        $response = $this->actingAs($user)->get('/hod/results');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Hod/Results/Index')
            ->has('results.data')
            ->has('examinations')
            ->has('programs')
            ->has('filters')
            ->has('stats')
        );
    }

    public function test_admin_can_access_results_via_admin_route()
    {
        $admin = $this->getSuperAdminUser();

        $response = $this->actingAs($admin)->get('/admin/results');
        $response->assertStatus(200);
    }

    public function test_results_can_be_filtered_by_gender_and_status()
    {
        $user = $this->getHodUser();

        $session = AdmissionSession::first();
        $program = Program::first();
        $sp = SessionProgram::firstOrCreate([
            'admission_session_id' => $session->id,
            'program_id' => $program->id,
        ], ['total_seats' => 50, 'is_active' => true]);

        $exam = Examination::firstOrCreate([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Test Exam',
            'exam_code' => 'TE-001',
        ], [
            'duration_minutes' => 60,
            'total_questions' => 10,
            'total_marks' => 10.00,
            'passing_percentage' => 50.00,
            'is_active' => true,
        ]);

        $student = User::factory()->create();
        $app = Application::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'user_id' => $student->id,
            'application_number' => 'APP-TEST-999',
            'roll_number' => 'ROLL-TEST-999',
            'normalized_cnic' => '1110199999991',
            'status' => 'submitted',
            'verification_status' => 'verified',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Ayesha Khan',
            'father_name' => 'Tariq Khan',
            'gender' => 'female',
            'dob' => '2005-01-01',
            'cnic' => '1110199999991',
            'mobile_number' => '03349999999',
            'whatsapp_number' => '03349999999',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu City',
            'current_address' => 'Bannu City',
            'email' => 'ayesha@test.com',
        ]);

        $attempt = ExaminationAttempt::create([
            'examination_id' => $exam->id,
            'application_id' => $app->id,
            'user_id' => $student->id,
            'start_time' => now()->subMinutes(10),
            'server_deadline' => now()->addMinutes(50),
            'end_time' => now(),
            'status' => 'submitted',
        ]);

        ExaminationResult::create([
            'examination_attempt_id' => $attempt->id,
            'application_id' => $app->id,
            'examination_id' => $exam->id,
            'total_questions' => 10,
            'correct_answers' => 8,
            'incorrect_answers' => 2,
            'unanswered' => 0,
            'total_marks' => 10.00,
            'obtained_marks' => 8.00,
            'percentage' => 80.00,
            'is_passed' => true,
            'status' => 'calculated',
        ]);

        // Filter female
        $response = $this->actingAs($user)->get('/hod/results?gender=female&status=submitted');
        $response->assertStatus(200);

        // Filter male should not include Ayesha
        $responseMale = $this->actingAs($user)->get('/hod/results?gender=male&search=Ayesha');
        $responseMale->assertStatus(200);
        $responseMale->assertInertia(fn ($page) => $page
            ->where('results.total', 0)
        );
    }

    public function test_results_csv_export_returns_stream_with_proper_headers()
    {
        $user = $this->getHodUser();

        $response = $this->actingAs($user)->get('/hod/results/export?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertTrue(str_contains((string) $response->headers->get('Content-Disposition'), '.csv'));
    }

    public function test_results_print_gazette_renders_correct_view()
    {
        $user = $this->getHodUser();

        $response = $this->actingAs($user)->get('/hod/results/print');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Hod/Results/PrintGazette')
            ->has('results')
            ->has('generatedAt')
        );
    }
}
