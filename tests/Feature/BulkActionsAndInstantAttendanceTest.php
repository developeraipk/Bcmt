<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\Examination;
use App\Models\ExaminationAttendance;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class BulkActionsAndInstantAttendanceTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_approve_all_documents_in_one_click()
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::firstOrCreate(
            ['code' => 'TEST-BULK-2026'],
            [
                'name' => 'Test Session 2026',
                'start_date' => now()->subDays(5),
                'closing_date' => now()->addDays(20),
                'status' => 'open',
                'is_active' => true,
            ]
        );
        $program = Program::first() ?? Program::create([
            'name' => 'BS Radiology Technology',
            'code' => 'BSRAD',
            'degree_level' => 'BS (4 Years)',
            'minimum_qualification' => 'fsc_pre_medical',
            'total_seats' => 50,
            'is_active' => true,
        ]);
        $sp = SessionProgram::firstOrCreate(
            ['admission_session_id' => $session->id, 'program_id' => $program->id],
            ['total_seats' => 50]
        );

        $candUser = User::factory()->create(['name' => 'Test Cand']);
        $candUser->assignRole('applicant');

        $app = Application::create([
            'user_id' => $candUser->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-TEST-APP-001',
            'normalized_cnic' => '1110199999991',
            'verification_status' => 'pending',
            'exam_eligibility_status' => 'locked',
            'submitted_at' => now(),
        ]);

        $doc1 = ApplicationDocument::create([
            'application_id' => $app->id,
            'document_type' => 'photo',
            'file_path' => 'photos/test.jpg',
            'original_filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024,
            'file_hash' => hash('sha256', 'test1'),
            'verification_status' => 'pending',
        ]);

        $doc2 = ApplicationDocument::create([
            'application_id' => $app->id,
            'document_type' => 'cnic_front',
            'file_path' => 'cnic/test.jpg',
            'original_filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024,
            'file_hash' => hash('sha256', 'test2'),
            'verification_status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->post("/admin/applications/{$app->id}/approve-all-documents");
        $response->assertSessionHas('success');

        $this->assertEquals('approved', $doc1->fresh()->verification_status);
        $this->assertEquals('approved', $doc2->fresh()->verification_status);
    }

    public function test_invigilator_can_mark_all_present_in_room()
    {
        $invigilator = User::firstOrCreate(
            ['email' => 'invigilator@bcmt.edu.pk'],
            ['name' => 'Invigilator', 'password' => bcrypt('password')]
        );
        $invigilator->assignRole('invigilator');

        $session = AdmissionSession::firstOrCreate(
            ['code' => 'TEST-BULK-2026'],
            [
                'name' => 'Test Session 2026',
                'start_date' => now()->subDays(5),
                'closing_date' => now()->addDays(20),
                'status' => 'open',
                'is_active' => true,
            ]
        );
        $program = Program::first() ?? Program::create([
            'name' => 'BS Radiology Technology',
            'code' => 'BSRAD',
            'degree_level' => 'BS (4 Years)',
            'minimum_qualification' => 'fsc_pre_medical',
            'total_seats' => 50,
            'is_active' => true,
        ]);
        $sp = SessionProgram::firstOrCreate(
            ['admission_session_id' => $session->id, 'program_id' => $program->id],
            ['total_seats' => 50]
        );

        $exam = Examination::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Radiology Entrance Test Room A',
            'exam_code' => 'RAD-ROOM-' . uniqid(),
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:30:00',
            'duration_minutes' => 90,
            'total_marks' => 100,
            'passing_percentage' => 50,
            'status' => 'active',
        ]);

        $candUser1 = User::factory()->create();
        $candUser1->assignRole('applicant');
        $candUser2 = User::factory()->create();
        $candUser2->assignRole('applicant');

        $app1 = Application::create([
            'user_id' => $candUser1->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-TEST-APP-002',
            'normalized_cnic' => '1110199999992',
            'exam_eligibility_status' => 'eligible',
            'submitted_at' => now(),
        ]);

        $app2 = Application::create([
            'user_id' => $candUser2->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-TEST-APP-003',
            'normalized_cnic' => '1110199999993',
            'exam_eligibility_status' => 'eligible',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($invigilator)->post('/invigilator/attendance/mark-all-present', [
            'examination_id' => $exam->id,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('examination_attendances', [
            'examination_id' => $exam->id,
            'application_id' => $app1->id,
            'attendance_status' => 'present',
        ]);

        $this->assertDatabaseHas('examination_attendances', [
            'examination_id' => $exam->id,
            'application_id' => $app2->id,
            'attendance_status' => 'present',
        ]);
    }

    public function test_invigilator_can_quick_mark_candidate()
    {
        $invigilator = User::firstOrCreate(
            ['email' => 'invigilator@bcmt.edu.pk'],
            ['name' => 'Invigilator', 'password' => bcrypt('password')]
        );
        $invigilator->assignRole('invigilator');

        $session = AdmissionSession::firstOrCreate(
            ['code' => 'TEST-BULK-2026'],
            [
                'name' => 'Test Session 2026',
                'start_date' => now()->subDays(5),
                'closing_date' => now()->addDays(20),
                'status' => 'open',
                'is_active' => true,
            ]
        );
        $sp = SessionProgram::first();
        $exam = Examination::firstOrCreate(
            ['admission_session_id' => $session->id, 'session_program_id' => $sp->id],
            [
                'title' => 'Quick Mark Exam',
                'exam_code' => 'QM-EXAM-01',
                'exam_date' => now()->toDateString(),
                'start_time' => '09:00:00',
                'end_time' => '10:30:00',
                'duration_minutes' => 90,
                'total_marks' => 100,
                'passing_percentage' => 50,
                'status' => 'active',
            ]
        );

        $candUser = User::factory()->create();
        $candUser->assignRole('applicant');

        $app = Application::firstOrCreate(
            ['admission_session_id' => $session->id, 'session_program_id' => $sp->id],
            [
                'user_id' => $candUser->id,
                'application_number' => 'BCMT-TEST-APP-004',
                'normalized_cnic' => '1110199999994',
                'exam_eligibility_status' => 'eligible',
                'submitted_at' => now(),
            ]
        );

        $response = $this->actingAs($invigilator)->postJson('/invigilator/attendance/quick-mark', [
            'examination_id' => $exam->id,
            'application_id' => $app->id,
            'status' => 'present',
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true, 'status' => 'present']);
    }

    public function test_admin_can_bulk_approve_all_applications_documents_and_mark_eligible()
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::firstOrCreate(
            ['code' => 'TEST-BULK-2026'],
            [
                'name' => 'Test Session 2026',
                'start_date' => now()->subDays(5),
                'closing_date' => now()->addDays(20),
                'status' => 'open',
                'is_active' => true,
            ]
        );
        $sp = SessionProgram::first();

        $user1 = User::factory()->create();
        $user1->assignRole('applicant');
        $app1 = Application::create([
            'user_id' => $user1->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-BULK-001',
            'normalized_cnic' => '1110199999901',
            'verification_status' => 'pending',
            'exam_eligibility_status' => 'locked',
            'submitted_at' => now(),
        ]);
        $doc1 = ApplicationDocument::create([
            'application_id' => $app1->id,
            'document_type' => 'matric_dmc',
            'file_path' => 'dmc/test.jpg',
            'original_filename' => 'dmc.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024,
            'file_hash' => hash('sha256', 'bulk1'),
            'verification_status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->post('/admin/applications/bulk-approve-and-eligible', [
            'session_id' => $session->id,
        ]);

        $response->assertSessionHas('success');

        $this->assertEquals('approved', $doc1->fresh()->verification_status);
        $this->assertEquals('verified', $app1->fresh()->verification_status);
        $this->assertEquals('eligible', $app1->fresh()->exam_eligibility_status);
    }

    public function test_expired_exam_attempt_redirects_without_type_error()
    {
        $studentUser = User::factory()->create();
        $studentUser->assignRole('student');
        $studentUser->load('roles');

        $session = AdmissionSession::firstOrCreate(
            ['code' => 'TEST-BULK-2026'],
            [
                'name' => 'Test Session 2026',
                'start_date' => now()->subDays(5),
                'closing_date' => now()->addDays(20),
                'status' => 'open',
                'is_active' => true,
            ]
        );
        $sp = SessionProgram::first();
        $exam = Examination::first();

        $app = Application::create([
            'user_id' => $studentUser->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-BULK-EXP-01',
            'normalized_cnic' => '1110199999999',
            'exam_eligibility_status' => 'eligible',
            'submitted_at' => now(),
        ]);

        $attempt = \App\Models\ExaminationAttempt::create([
            'examination_id' => $exam->id,
            'application_id' => $app->id,
            'user_id' => $studentUser->id,
            'start_time' => now()->subHours(5),
            'server_deadline' => now()->subHours(3), // Expired!
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($studentUser)->get('/student/exam/active');
        $response->assertRedirect(route('student.exam.gate'));
        $response->assertSessionHas('warning');
    }
}
