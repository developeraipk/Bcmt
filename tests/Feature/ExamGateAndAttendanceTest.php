<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\Application;
use App\Models\ApplicantProfile;
use App\Models\Examination;
use App\Models\ExaminationAttendance;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\User;
use App\Services\ExaminationPinService;
use App\Services\ExamGateService;
use App\Services\RollNumberService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ExamGateAndAttendanceTest extends TestCase
{
    use DatabaseTransactions;

    public function test_mandatory_attendance_is_enforced_before_pin_verification()
    {
        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSECT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        // Create student user & application
        $user = User::create([
            'name' => 'Gate Candidate Test',
            'email' => 'gate.test@bcmt.edu.pk',
            'password' => bcrypt('Password123!'),
            'cnic' => '1110188888881',
            'phone' => '03339999991',
        ]);
        $user->assignRole('student');

        $app = Application::create([
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-999991',
            'normalized_cnic' => '1110188888881',
            'identity_hash' => sha1('gate_test'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'unprocessed',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Gate Candidate Test',
            'father_name' => 'Father Test',
            'cnic' => '11101-8888888-1',
            'email' => 'gate.test@bcmt.edu.pk',
            'dob' => '2005-01-01',
            'gender' => 'male',
            'mobile_number' => '03339999991',
            'whatsapp_number' => '03339999991',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);

        RollNumberService::assignRollNumber($app);

        // Create exam
        $exam = Examination::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Gate Verification Test',
            'exam_code' => 'GATE-EXAM-01',
            'duration_minutes' => 60,
            'total_questions' => 20,
            'total_marks' => 40,
            'passing_marks' => 20,
            'passing_percentage' => 50,
            'negative_marks_per_wrong' => 0.25,
            'status' => 'active',
            'requires_attendance' => true,
        ]);

        $rawPin = ExaminationPinService::generatePin($exam, 1);

        // Attempt PIN entry BEFORE invigilator attendance
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        ExamGateService::verifyGate($app, $exam, $rawPin, $user->id);
    }

    public function test_two_phase_token_is_granted_after_invigilator_attendance()
    {
        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSECT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $user = User::create([
            'name' => 'Attended Student',
            'email' => 'attended.student@bcmt.edu.pk',
            'password' => bcrypt('Password123!'),
            'cnic' => '1110177777771',
            'phone' => '03338888881',
        ]);
        $user->assignRole('student');

        $app = Application::create([
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-999992',
            'normalized_cnic' => '1110177777771',
            'identity_hash' => sha1('attended_test'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'unprocessed',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Attended Student',
            'father_name' => 'Father Test',
            'cnic' => '11101-7777777-1',
            'email' => 'attended.student@bcmt.edu.pk',
            'dob' => '2005-01-01',
            'gender' => 'male',
            'mobile_number' => '03338888881',
            'whatsapp_number' => '03338888881',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);

        RollNumberService::assignRollNumber($app);

        $exam = Examination::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Gate Token Test',
            'exam_code' => 'GATE-EXAM-02',
            'duration_minutes' => 60,
            'total_questions' => 20,
            'total_marks' => 40,
            'passing_marks' => 20,
            'passing_percentage' => 50,
            'negative_marks_per_wrong' => 0.25,
            'status' => 'active',
            'requires_attendance' => true,
        ]);

        $rawPin = ExaminationPinService::generatePin($exam, 1);

        // Mark attendance by Invigilator
        ExaminationAttendance::create([
            'examination_id' => $exam->id,
            'application_id' => $app->id,
            'invigilator_user_id' => 1,
            'room_number' => 'Hall 2',
            'seat_number' => 'A-12',
            'attendance_status' => 'present',
            'verified_at' => now(),
        ]);

        // Now PIN verification succeeds and returns short-lived access token
        $token = ExamGateService::verifyGate($app, $exam, $rawPin, $user->id);
        $this->assertNotEmpty($token);
        $this->assertEquals(48, strlen($token));
    }
}
