<?php

namespace Tests\Feature;

use App\Models\AcademicRecord;
use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\AttemptAnswer;
use App\Models\Examination;
use App\Models\ExaminationAttendance;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResult;
use App\Models\MeritList;
use App\Models\MeritListItem;
use App\Models\Program;
use App\Models\SeatAllocation;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ApplicationManagementAndCascadingDeleteTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_and_hod_can_create_new_application_manually()
    {
        $admin = User::where('email', 'admin@bcmt.edu.pk')->first();
        $session = AdmissionSession::getActive();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)->first();

        $response = $this->actingAs($admin)->post('/admin/applications', [
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Tariq Mehmood',
            'father_name' => 'Mehmood Jan',
            'dob' => '2004-06-15',
            'gender' => 'male',
            'cnic' => '11101-9988776-1',
            'mobile_number' => '03331122334',
            'whatsapp_number' => '03331122334',
            'email' => 'tariq.test@bcmt.edu.pk',
            'domicile_district' => 'Bannu',
            'current_address' => 'Sokari Gate, Bannu',
            'permanent_address' => 'Bannu, KP',
            'verification_status' => 'verified',
            'matric_board' => 'BISE Bannu',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 920,
            'inter_board' => 'BISE Bannu',
            'inter_total_marks' => 1100,
            'inter_obtained_marks' => 880,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $app = Application::where('normalized_cnic', '1110199887761')->first();
        $this->assertNotNull($app);
        $this->assertEquals('verified', $app->verification_status);
        $this->assertEquals('eligible', $app->exam_eligibility_status);
        $this->assertNotEmpty($app->roll_number);

        $profile = ApplicantProfile::where('application_id', $app->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('Tariq Mehmood', $profile->full_name);
        $this->assertEquals('Mehmood Jan', $profile->father_name);

        $matric = AcademicRecord::where('application_id', $app->id)->where('level', 'matric')->first();
        $this->assertNotNull($matric);
        $this->assertEquals(920, (int) $matric->obtained_marks);
    }

    public function test_admin_can_update_application_and_credentials_while_hod_is_forbidden()
    {
        $admin = User::where('email', 'admin@bcmt.edu.pk')->first();
        $hod = User::where('email', 'hod@bcmt.edu.pk')->first();
        $session = AdmissionSession::getActive();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)->first();

        $user = User::factory()->create(['name' => 'Original Name']);
        $user->assignRole('applicant');

        $app = Application::create([
            'application_number' => 'BCMT-2026-999901',
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'normalized_cnic' => '1110155555551',
            'status' => 'submitted',
            'verification_status' => 'pending',
            'exam_eligibility_status' => 'locked',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Original Name',
            'father_name' => 'Original Father',
            'dob' => '2004-01-01',
            'gender' => 'male',
            'cnic' => '11101-5555555-1',
            'mobile_number' => '03310000000',
            'whatsapp_number' => '03310000000',
            'domicile_district' => 'Bannu',
            'current_address' => 'Bannu, KP',
            'permanent_address' => 'Bannu, KP',
            'email' => $user->email,
        ]);

        $updateData = [
            'session_program_id' => $sessionProgram->id,
            'full_name' => 'Updated Candidate Name',
            'father_name' => 'Updated Father Name',
            'dob' => '2004-03-20',
            'gender' => 'male',
            'cnic' => '11101-5555555-1',
            'mobile_number' => '03319999999',
            'verification_status' => 'verified',
            'roll_number' => 'BCMT-2026-CUSTOM-001',
            'matric_board' => 'BISE Bannu',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 950,
            'inter_board' => 'BISE Bannu',
            'inter_total_marks' => 1100,
            'inter_obtained_marks' => 910,
        ];

        // HOD must NOT have access to Admin Portal (403 Forbidden)
        $hodResponse = $this->actingAs($hod)->post("/admin/applications/{$app->id}/update", $updateData);
        $hodResponse->assertForbidden();

        // Admin has full access
        $response = $this->actingAs($admin)->post("/admin/applications/{$app->id}/update", $updateData);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $app->refresh();
        $this->assertEquals('verified', $app->verification_status);
        $this->assertEquals('eligible', $app->exam_eligibility_status);
        $this->assertEquals('BCMT-2026-CUSTOM-001', $app->roll_number);

        $profile = $app->applicantProfile()->first();
        $this->assertEquals('Updated Candidate Name', $profile->full_name);
        $this->assertEquals('Updated Father Name', $profile->father_name);
        $this->assertEquals('03319999999', $profile->mobile_number);

        // Check user name sync
        $user->refresh();
        $this->assertEquals('Updated Candidate Name', $user->name);
    }

    public function test_admin_and_hod_can_delete_application_with_complete_cascading_purge()
    {
        $admin = User::where('email', 'admin@bcmt.edu.pk')->first();
        $session = AdmissionSession::getActive();
        $sessionProgram = SessionProgram::where('admission_session_id', $session->id)->first();

        $user = User::factory()->create(['name' => 'To Be Deleted']);
        $user->assignRole('applicant');

        $app = Application::create([
            'application_number' => 'BCMT-2026-999902',
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'roll_number' => 'BCMT-2026-DEL-0001',
            'normalized_cnic' => '1110177777771',
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
        ]);

        $appId = $app->id;

        ApplicantProfile::create([
            'application_id' => $appId,
            'full_name' => 'To Be Deleted',
            'father_name' => 'Father',
            'dob' => '2004-01-01',
            'gender' => 'male',
            'cnic' => '11101-7777777-1',
            'mobile_number' => '03317777777',
            'whatsapp_number' => '03317777777',
            'domicile_district' => 'Bannu',
            'current_address' => 'Bannu, KP',
            'permanent_address' => 'Bannu, KP',
            'email' => $user->email,
        ]);

        AcademicRecord::create([
            'application_id' => $appId,
            'level' => 'matric',
            'qualification_name' => 'Matric',
            'board_university' => 'BISE Bannu',
            'roll_number' => 'N/A',
            'passing_year' => 2024,
            'total_marks' => 1100,
            'obtained_marks' => 800,
            'percentage' => 72.72,
        ]);

        // Mock Exam Attempt & Result
        $exam = Examination::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'title' => 'Test Exam',
            'exam_code' => 'TX-999',
            'shift' => 'morning',
            'duration_minutes' => 60,
            'total_questions' => 10,
            'total_marks' => 10,
            'passing_marks' => 5,
            'passing_percentage' => 50,
            'status' => 'active',
        ]);

        $attendance = ExaminationAttendance::create([
            'examination_id' => $exam->id,
            'application_id' => $appId,
            'invigilator_user_id' => $admin->id,
            'roll_number' => $app->roll_number,
            'room_number' => 'Hall 1',
            'seat_number' => '12',
            'attendance_status' => 'present',
        ]);

        $attempt = ExaminationAttempt::create([
            'examination_id' => $exam->id,
            'application_id' => $appId,
            'user_id' => $user->id,
            'status' => 'submitted',
            'total_questions' => 10,
            'answered_questions' => 10,
            'started_at' => now()->subMinutes(30),
            'submitted_at' => now(),
        ]);

        $q = \App\Models\Question::first();
        if (!$q) {
            $q = \App\Models\Question::create([
                'program_id' => $sessionProgram->program_id,
                'subject' => 'Biology',
                'difficulty' => 'easy',
                'marks' => 1,
                'question_text' => 'Sample test question',
                'is_active' => true,
            ]);
        }

        AttemptAnswer::create([
            'examination_attempt_id' => $attempt->id,
            'question_id' => $q->id,
            'is_correct' => true,
            'marks_awarded' => 1,
        ]);

        ExaminationResult::create([
            'examination_attempt_id' => $attempt->id,
            'application_id' => $appId,
            'examination_id' => $exam->id,
            'total_questions' => 10,
            'correct_answers' => 8,
            'incorrect_answers' => 2,
            'unanswered' => 0,
            'total_marks' => 10,
            'obtained_marks' => 8,
            'percentage' => 80,
            'is_passed' => true,
            'status' => 'calculated',
        ]);

        // Mock Merit List Item
        $formula = \App\Models\MeritFormula::first();
        if (!$formula) {
            $formula = \App\Models\MeritFormula::create([
                'admission_session_id' => $session->id,
                'session_program_id' => $sessionProgram->id,
                'title' => 'Open Merit Formula',
                'total_weight' => 100,
                'is_active' => true,
            ]);
        }

        $meritList = MeritList::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'merit_formula_id' => $formula->id,
            'title' => 'First Merit List',
            'list_number' => 1,
            'status' => 'draft',
            'total_candidates' => 1,
        ]);

        MeritListItem::create([
            'merit_list_id' => $meritList->id,
            'application_id' => $appId,
            'rank' => 1,
            'ssc_percentage' => 75.0,
            'hssc_percentage' => 80.0,
            'test_percentage' => 80.0,
            'aggregate_percentage' => 78.5,
            'status' => 'selected',
        ]);

        // Mock Seat Allocation
        SeatAllocation::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'application_id' => $appId,
            'allocated_by_user_id' => $admin->id,
            'seat_number' => 1,
            'status' => 'reserved',
            'reservation_expires_at' => now()->addDays(5),
        ]);

        // Perform Deletion
        $response = $this->actingAs($admin)->delete("/admin/applications/{$appId}");
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Assert COMPLETE CASCADING PURGE
        $this->assertNull(Application::withTrashed()->find($appId));
        $this->assertNull(ApplicantProfile::where('application_id', $appId)->first());
        $this->assertNull(AcademicRecord::where('application_id', $appId)->first());
        $this->assertNull(ExaminationAttendance::where('application_id', $appId)->first());
        $this->assertNull(ExaminationAttempt::where('application_id', $appId)->first());
        $this->assertNull(AttemptAnswer::where('examination_attempt_id', $attempt->id)->first());
        $this->assertNull(ExaminationResult::where('application_id', $appId)->first());
        $this->assertNull(MeritListItem::where('application_id', $appId)->first());
        $this->assertNull(SeatAllocation::where('application_id', $appId)->first());
    }
}
