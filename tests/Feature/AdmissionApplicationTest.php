<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\Program;
use App\Models\SessionProgram;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdmissionApplicationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_candidate_can_submit_admission_application()
    {
        Storage::fake('private');

        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSMLT')->first();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $payload = [
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Ahmad Khan Test',
            'father_name' => 'Tariq Khan',
            'cnic' => '11101-9988771-1',
            'dob' => '2005-04-15',
            'gender' => 'male',
            'mobile_number' => '03331122334',
            'whatsapp_number' => '03331122334',
            'email' => 'ahmad.khan.test@bcmt.edu.pk',
            'permanent_address' => 'Sokari Gate, Bannu',
            'current_address' => 'Sokari Gate, Bannu',
            'domicile_district' => 'Bannu',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'matric_board' => 'BISE Bannu',
            'matric_roll_number' => '889911',
            'matric_year' => 2022,
            'matric_total' => 1100,
            'matric_obtained' => 920,
            'inter_board' => 'BISE Bannu',
            'inter_roll_number' => '445566',
            'inter_year' => 2024,
            'inter_total' => 1100,
            'inter_obtained' => 880,
            'doc_photo' => UploadedFile::fake()->image('photo.jpg'),
            'doc_cnic_front' => UploadedFile::fake()->create('cnic_front.pdf', 100),
            'doc_matric_dmc' => UploadedFile::fake()->create('matric_dmc.pdf', 100),
            'doc_inter_dmc' => UploadedFile::fake()->create('inter_dmc.pdf', 100),
            'doc_domicile' => UploadedFile::fake()->create('domicile.pdf', 100),
        ];

        $response = $this->post('/apply', $payload);

        $response->assertRedirect();

        $this->assertDatabaseHas('applications', [
            'normalized_cnic' => '1110199887711',
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
        ]);

        $app = Application::where('normalized_cnic', '1110199887711')->first();
        $this->assertNotNull($app);
        $this->assertStringStartsWith('BCMT-', $app->application_number);
        $this->assertEquals('pending', $app->verification_status);
        $this->assertEquals('locked', $app->exam_eligibility_status);
    }

    public function test_single_application_per_session_constraint_is_strictly_enforced()
    {
        Storage::fake('private');

        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSECT')->first();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $payload = [
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Fatima Noor Test',
            'father_name' => 'Muhammad Noor',
            'cnic' => '11101-5544332-2',
            'dob' => '2006-02-10',
            'gender' => 'female',
            'mobile_number' => '03348877665',
            'whatsapp_number' => '03348877665',
            'email' => 'fatima.noor.test@bcmt.edu.pk',
            'permanent_address' => 'Circular Road, Bannu',
            'current_address' => 'Circular Road, Bannu',
            'domicile_district' => 'Bannu',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'matric_board' => 'BISE Bannu',
            'matric_roll_number' => '112233',
            'matric_year' => 2022,
            'matric_total' => 1100,
            'matric_obtained' => 980,
            'inter_board' => 'BISE Bannu',
            'inter_roll_number' => '223344',
            'inter_year' => 2024,
            'inter_total' => 1100,
            'inter_obtained' => 950,
            'doc_photo' => UploadedFile::fake()->image('photo.jpg'),
            'doc_cnic_front' => UploadedFile::fake()->create('cnic_front.pdf', 100),
            'doc_matric_dmc' => UploadedFile::fake()->create('matric_dmc.pdf', 100),
            'doc_inter_dmc' => UploadedFile::fake()->create('inter_dmc.pdf', 100),
            'doc_domicile' => UploadedFile::fake()->create('domicile.pdf', 100),
        ];

        // First submission succeeds
        $res1 = $this->post('/apply', $payload);
        $res1->assertRedirect();

        // Second submission with same CNIC in same session MUST be rejected
        $res2 = $this->post('/apply', $payload);
        $res2->assertSessionHasErrors(['cnic']);
    }

    public function test_duplicate_submission_with_same_email_different_cnic_is_gracefully_rejected()
    {
        Storage::fake('private');

        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSECT')->first();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $payload1 = [
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Usman Test',
            'father_name' => 'Wali Test',
            'cnic' => '11101-7766554-1',
            'dob' => '2005-08-14',
            'gender' => 'male',
            'mobile_number' => '03339900112',
            'whatsapp_number' => '03339900112',
            'email' => 'usman.test@bcmt.edu.pk',
            'permanent_address' => 'Bannu City',
            'current_address' => 'Bannu City',
            'domicile_district' => 'Bannu',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'matric_board' => 'BISE Bannu',
            'matric_roll_number' => '556677',
            'matric_year' => 2022,
            'matric_total' => 1100,
            'matric_obtained' => 900,
            'inter_board' => 'BISE Bannu',
            'inter_roll_number' => '778899',
            'inter_year' => 2024,
            'inter_total' => 1100,
            'inter_obtained' => 870,
            'doc_photo' => UploadedFile::fake()->image('photo.jpg'),
            'doc_cnic_front' => UploadedFile::fake()->create('cnic_front.pdf', 100),
            'doc_matric_dmc' => UploadedFile::fake()->create('matric_dmc.pdf', 100),
            'doc_inter_dmc' => UploadedFile::fake()->create('inter_dmc.pdf', 100),
            'doc_domicile' => UploadedFile::fake()->create('domicile.pdf', 100),
        ];

        $res1 = $this->post('/apply', $payload1);
        $res1->assertRedirect();

        // Second submission: same email, different CNIC
        $payload2 = $payload1;
        $payload2['cnic'] = '11101-7766554-9'; // different CNIC

        $res2 = $this->post('/apply', $payload2);
        // Must reject gracefully with 422 validation error, never 500 UniqueConstraintViolation
        $res2->assertSessionHasErrors();
        $this->assertNotEquals(500, $res2->status());
    }

    public function test_unverified_student_can_view_roll_number_slip_status_without_type_error()
    {
        Storage::fake('private');

        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSMLT')->first();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $payload = [
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Bilal Student Test',
            'father_name' => 'Kamran Test',
            'cnic' => '11101-4433221-1',
            'dob' => '2005-09-20',
            'gender' => 'male',
            'mobile_number' => '03341234567',
            'whatsapp_number' => '03341234567',
            'email' => 'bilal.student.test@bcmt.edu.pk',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
            'domicile_district' => 'Bannu',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'matric_board' => 'BISE Bannu',
            'matric_roll_number' => '998811',
            'matric_year' => 2022,
            'matric_total' => 1100,
            'matric_obtained' => 950,
            'inter_board' => 'BISE Bannu',
            'inter_roll_number' => '887711',
            'inter_year' => 2024,
            'inter_total' => 1100,
            'inter_obtained' => 910,
            'doc_photo' => UploadedFile::fake()->image('photo.jpg'),
            'doc_cnic_front' => UploadedFile::fake()->create('cnic_front.pdf', 100),
            'doc_matric_dmc' => UploadedFile::fake()->create('matric_dmc.pdf', 100),
            'doc_inter_dmc' => UploadedFile::fake()->create('inter_dmc.pdf', 100),
            'doc_domicile' => UploadedFile::fake()->create('domicile.pdf', 100),
        ];

        $res = $this->post('/apply', $payload);
        $res->assertRedirect();

        $user = \App\Models\User::where('email', 'bilal.student.test@bcmt.edu.pk')->first();
        $this->assertNotNull($user);

        // Access the roll number slip while eligibility is still locked
        $slipRes = $this->actingAs($user)->get('/student/roll-number-slip');
        $slipRes->assertOk();
        $slipRes->assertInertia(fn ($page) => $page
            ->component('Student/RollNumberSlip')
            ->where('isEligible', false)
        );

        // Now verify application and mark as eligible
        $application = \App\Models\Application::where('user_id', $user->id)->first();
        $application->update([
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'roll_number' => 'BCMT-2026-TEST-0099',
        ]);

        $verifiedSlipRes = $this->actingAs($user)->get('/student/roll-number-slip');
        $verifiedSlipRes->assertOk();
        $verifiedSlipRes->assertInertia(fn ($page) => $page
            ->component('Student/RollNumberSlip')
            ->where('isEligible', true)
            ->has('application.applicant_profile.full_name')
            ->has('photoUrl')
        );

        // Admin can view the candidate's slip
        $admin = \App\Models\User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $adminSlipRes = $this->actingAs($admin)->get("/admin/roll-numbers/{$application->id}/slip");
        $adminSlipRes->assertOk();
        $adminSlipRes->assertInertia(fn ($page) => $page
            ->component('Student/RollNumberSlip')
            ->where('isEligible', true)
        );

        // Admin can assign seating
        $seatingRes = $this->actingAs($admin)->post('/admin/roll-numbers/assign-seating', [
            'application_id' => $application->id,
            'room_number' => 'Hall 1',
            'start_seat' => 1,
        ]);
        $seatingRes->assertRedirect();
        $this->assertDatabaseHas('examination_attendances', [
            'application_id' => $application->id,
            'room_number' => 'Hall 1',
            'seat_number' => '1',
        ]);

        // Admin can export applications CSV
        $exportRes = $this->actingAs($admin)->get('/admin/applications/export');
        $exportRes->assertOk();
        $exportRes->assertHeader('content-type', 'text/csv; charset=UTF-8');

        // Admin can view print roster
        $rosterRes = $this->actingAs($admin)->get('/admin/applications/print-roster');
        $rosterRes->assertOk();
        $rosterRes->assertInertia(fn ($page) => $page->component('Admin/Applications/PrintRoster'));
    }
}
