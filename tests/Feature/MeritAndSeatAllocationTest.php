<?php

namespace Tests\Feature;

use App\Models\AcademicRecord;
use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\MeritFormula;
use App\Models\MeritList;
use App\Models\MeritListItem;
use App\Models\Program;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use App\Models\User;
use App\Services\MeritCalculationService;
use App\Services\SeatAllocationService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class MeritAndSeatAllocationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_dynamic_merit_formula_computes_combined_gender_ranking()
    {
        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSMLT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        // Create Formula (10% Matric, 40% Inter, 50% Test)
        $formula = MeritFormula::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Test Merit Formula',
            'total_weight' => 100.00,
            'is_active' => true,
        ]);
        $formula->components()->createMany([
            ['component_type' => 'matric', 'component_name' => 'Matric', 'weight_percentage' => 10],
            ['component_type' => 'intermediate', 'component_name' => 'Inter', 'weight_percentage' => 40],
            ['component_type' => 'admission_test', 'component_name' => 'Test', 'weight_percentage' => 50],
        ]);

        // Candidate 1: Female (Matric: 90%, Inter: 90%)
        $u1 = User::create(['name' => 'Candidate Female', 'email' => 'f.candidate@bcmt.edu.pk', 'password' => bcrypt('Pass'), 'cnic' => '1110111111112']);
        $app1 = Application::create([
            'user_id' => $u1->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-880001',
            'normalized_cnic' => '1110111111112',
            'identity_hash' => sha1('f_candidate'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'unprocessed',
        ]);
        ApplicantProfile::create([
            'application_id' => $app1->id,
            'full_name' => 'Candidate Female',
            'father_name' => 'Father',
            'cnic' => '11101-1111111-2',
            'email' => 'f.candidate@bcmt.edu.pk',
            'dob' => '2005-01-01',
            'gender' => 'female',
            'mobile_number' => '03331111112',
            'whatsapp_number' => '03331111112',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);
        AcademicRecord::create([
            'application_id' => $app1->id,
            'level' => 'matric',
            'qualification_name' => 'Matric Science',
            'board_university' => 'BISE Bannu',
            'roll_number' => '1001',
            'passing_year' => 2022,
            'total_marks' => 1100,
            'obtained_marks' => 990,
            'percentage' => 90.00,
        ]);
        AcademicRecord::create([
            'application_id' => $app1->id,
            'level' => 'intermediate',
            'qualification_name' => 'FSc Pre-Medical',
            'board_university' => 'BISE Bannu',
            'roll_number' => '2001',
            'passing_year' => 2024,
            'total_marks' => 1100,
            'obtained_marks' => 990,
            'percentage' => 90.00,
        ]);

        // Candidate 2: Male (Matric: 80%, Inter: 80%)
        $u2 = User::create(['name' => 'Candidate Male', 'email' => 'm.candidate@bcmt.edu.pk', 'password' => bcrypt('Pass'), 'cnic' => '1110111111113']);
        $app2 = Application::create([
            'user_id' => $u2->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-880002',
            'normalized_cnic' => '1110111111113',
            'identity_hash' => sha1('m_candidate'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'unprocessed',
        ]);
        ApplicantProfile::create([
            'application_id' => $app2->id,
            'full_name' => 'Candidate Male',
            'father_name' => 'Father',
            'cnic' => '11101-1111111-3',
            'email' => 'm.candidate@bcmt.edu.pk',
            'dob' => '2005-02-01',
            'gender' => 'male',
            'mobile_number' => '03331111113',
            'whatsapp_number' => '03331111113',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);
        AcademicRecord::create([
            'application_id' => $app2->id,
            'level' => 'matric',
            'qualification_name' => 'Matric Science',
            'board_university' => 'BISE Bannu',
            'roll_number' => '1002',
            'passing_year' => 2022,
            'total_marks' => 1100,
            'obtained_marks' => 880,
            'percentage' => 80.00,
        ]);
        AcademicRecord::create([
            'application_id' => $app2->id,
            'level' => 'intermediate',
            'qualification_name' => 'FSc Pre-Medical',
            'board_university' => 'BISE Bannu',
            'roll_number' => '2002',
            'passing_year' => 2024,
            'total_marks' => 1100,
            'obtained_marks' => 880,
            'percentage' => 80.00,
        ]);

        // Compile Merit List
        $meritList = MeritCalculationService::compile($sp, $formula, 'Automated Test Merit List');

        $this->assertNotNull($meritList);
        $this->assertGreaterThanOrEqual(2, $meritList->items()->count());

        // Female candidate had higher academic percentage, so ranked higher
        $rank1 = $meritList->items()->where('rank', 1)->first();
        $this->assertEquals($app1->id, $rank1->application_id);

        // Publish and seal list
        MeritCalculationService::publish($meritList, 1);
        $meritList->refresh();
        $this->assertEquals('published_locked', $meritList->status);
        $this->assertNotEmpty($meritList->integrity_hash);
    }

    public function test_transactional_seat_allocation_and_waiting_list_promotion()
    {
        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'PATH')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        // Create Merit Formula & List for program
        $formula2 = MeritFormula::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Seat Allocation Formula',
            'total_weight' => 100.00,
            'is_active' => true,
        ]);

        $meritList = MeritList::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'merit_formula_id' => $formula2->id,
            'title' => 'Seat Allocation Merit List',
            'version' => 1,
            'status' => 'published_locked',
            'integrity_hash' => sha1('seat_alloc_list'),
        ]);

        // Candidate 1
        $u1 = User::create(['name' => 'Seat Student 1', 'email' => 'seat1@bcmt.edu.pk', 'password' => bcrypt('Pass'), 'cnic' => '1110122222221']);
        $app1 = Application::create([
            'user_id' => $u1->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-770001',
            'normalized_cnic' => '1110122222221',
            'identity_hash' => sha1('seat_1'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'selected',
        ]);
        ApplicantProfile::create([
            'application_id' => $app1->id,
            'full_name' => 'Seat Student 1',
            'father_name' => 'Father',
            'cnic' => '11101-2222222-1',
            'email' => 'seat1@bcmt.edu.pk',
            'dob' => '2005-01-01',
            'gender' => 'male',
            'mobile_number' => '03332222221',
            'whatsapp_number' => '03332222221',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);

        // Candidate 2 (Waiting List)
        $u2 = User::create(['name' => 'Waiting Student 2', 'email' => 'wait2@bcmt.edu.pk', 'password' => bcrypt('Pass'), 'cnic' => '1110122222222']);
        $app2 = Application::create([
            'user_id' => $u2->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-770002',
            'normalized_cnic' => '1110122222222',
            'identity_hash' => sha1('wait_2'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'waiting_list',
        ]);
        ApplicantProfile::create([
            'application_id' => $app2->id,
            'full_name' => 'Waiting Student 2',
            'father_name' => 'Father',
            'cnic' => '11101-2222222-2',
            'email' => 'wait2@bcmt.edu.pk',
            'dob' => '2005-01-01',
            'gender' => 'female',
            'mobile_number' => '03332222222',
            'whatsapp_number' => '03332222222',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);

        // Create MeritListItem for candidate 2 so promoteNextWaitingCandidate finds them
        MeritListItem::create([
            'merit_list_id' => $meritList->id,
            'application_id' => $app2->id,
            'rank' => 2,
            'aggregate_percentage' => 78.50,
            'status' => 'waiting_list',
        ]);

        // Reserve seat for candidate 1
        $alloc1 = SeatAllocationService::reserveSeat($app1, 1);
        $this->assertEquals('reserved', $alloc1->status);
        $this->assertEquals(1, $alloc1->seat_number);

        // Confirm seat 1
        SeatAllocationService::confirmSeat($alloc1, 1);
        $alloc1->refresh();
        $this->assertEquals('confirmed', $alloc1->status);

        // Candidate 1 releases or cancels seat
        $promoted = SeatAllocationService::releaseSeat($alloc1, 'Candidate opted for another college');
        $this->assertEquals('released', $alloc1->fresh()->status);

        // Waiting candidate was automatically promoted and offered the released seat
        $this->assertNotNull($promoted);
        $this->assertEquals($app2->id, $promoted->application_id);
        $this->assertEquals('reserved', $promoted->status);
        $this->assertEquals(1, $promoted->seat_number); // Reuses the lowest available seat number without gap!
    }

    public function test_hod_can_reset_formula_to_zero()
    {
        $admin = User::find(1);
        $sp = SessionProgram::first();

        MeritFormula::create([
            'admission_session_id' => $sp->admission_session_id,
            'session_program_id' => $sp->id,
            'title' => 'Formula to Reset',
            'total_weight' => 100.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post('/hod/merit/formula/reset', [
            'session_program_id' => $sp->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertFalse(MeritFormula::where('session_program_id', $sp->id)->where('is_active', true)->exists());
    }

    public function test_hod_can_delete_merit_list()
    {
        $admin = User::find(1);
        $sp = SessionProgram::first();
        $formula = MeritFormula::create([
            'admission_session_id' => $sp->admission_session_id,
            'session_program_id' => $sp->id,
            'title' => 'Formula for Deletion',
            'total_weight' => 100.00,
            'is_active' => true,
        ]);

        $ml = MeritList::create([
            'admission_session_id' => $sp->admission_session_id,
            'session_program_id' => $sp->id,
            'merit_formula_id' => $formula->id,
            'title' => 'List to Delete',
            'version' => 99,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($admin)->delete("/hod/merit/{$ml->id}");
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('merit_lists', ['id' => $ml->id]);
    }

    public function test_admin_can_delete_seat_allocation_record()
    {
        $admin = User::find(1);
        $sp = SessionProgram::first();
        $app = Application::first();
        if (!$app) {
            $user = User::factory()->create();
            $app = Application::create([
                'admission_session_id' => $sp->admission_session_id,
                'session_program_id' => $sp->id,
                'user_id' => $user->id,
                'application_number' => 'BCMT-TEST-001',
                'normalized_cnic' => '1110112345671',
                'status' => 'completed',
                'verification_status' => 'verified',
                'exam_eligibility_status' => 'eligible',
            ]);
        }

        $alloc = SeatAllocation::create([
            'admission_session_id' => $sp->admission_session_id,
            'session_program_id' => $sp->id,
            'application_id' => $app->id,
            'seat_number' => 99,
            'status' => 'released',
            'allocated_by_user_id' => $admin->id,
            'released_at' => now(),
            'release_reason' => 'Test release',
        ]);

        $response = $this->actingAs($admin)->delete("/admin/seat-allocation/{$alloc->id}");
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('seat_allocations', ['id' => $alloc->id]);
    }

    public function test_public_can_view_published_merit_lists()
    {
        $response = $this->get('/merit-lists');
        $response->assertStatus(200);
    }
}
