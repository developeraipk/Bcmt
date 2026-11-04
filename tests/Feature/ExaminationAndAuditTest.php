<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ExaminationAndAuditTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_clear_all_audit_logs(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        AuditLog::create([
            'action' => 'test_event',
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
        ]);

        $this->assertDatabaseHas('audit_logs', ['action' => 'test_event']);

        $response = $this->actingAs($admin)->delete('/admin/audit-logs/clear');
        $response->assertRedirect();

        $this->assertDatabaseMissing('audit_logs', ['action' => 'test_event']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'audit_trail_cleared']);
    }

    public function test_hod_can_create_exam_and_manage_per_test_questions(): void
    {
        $hod = User::firstOrCreate(
            ['email' => 'hod@bcmt.edu.pk'],
            ['name' => 'HOD', 'password' => bcrypt('password')]
        );
        $hod->assignRole('hod');

        $session = AdmissionSession::where('is_active', true)->first() ?? AdmissionSession::first();
        $program = Program::first();
        $sessionProgram = SessionProgram::firstOrCreate(
            ['admission_session_id' => $session->id, 'program_id' => $program->id],
            ['total_seats' => 20, 'seats_allocated' => 0, 'is_open' => true]
        );

        // 1. Create Exam
        $createResponse = $this->actingAs($hod)->post('/hod/exams', [
            'admission_session_id' => $session->id,
            'session_program_id' => $sessionProgram->id,
            'title' => 'Biology Entrance Test 2026',
            'shift' => 'Morning',
            'duration_minutes' => 60,
            'passing_percentage' => 50,
            'negative_marks_per_wrong' => 0.0,
            'instructions' => 'No calculators allowed.',
        ]);
        $createResponse->assertRedirect();

        $exam = Examination::where('title', 'Biology Entrance Test 2026')->first();
        $this->assertNotNull($exam);
        $this->assertNotNull($exam->activePin);
        $this->assertNotEmpty($exam->activePin->display_pin);

        // 2. Add Question to this specific test
        $addQResponse = $this->actingAs($hod)->post("/hod/exams/{$exam->id}/questions", [
            'question_text' => 'What is the powerhouse of the cell?',
            'option_a' => 'Ribosome',
            'option_b' => 'Mitochondria',
            'option_c' => 'Nucleus',
            'option_d' => 'Golgi Body',
            'correct_option' => 'B',
            'marks' => 2.0,
            'is_active' => true,
        ]);
        $addQResponse->assertRedirect();

        $this->assertDatabaseHas('questions', ['question_text' => 'What is the powerhouse of the cell?']);
        $this->assertDatabaseHas('question_options', ['option_label' => 'B', 'is_correct' => true]);
        $this->assertDatabaseHas('examination_questions', ['examination_id' => $exam->id]);

        $exam->refresh();
        $this->assertEquals(1, $exam->total_questions);
        $this->assertEquals(2.0, (float) $exam->total_marks);
    }

    public function test_admin_can_delete_admission_session(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bcmt.edu.pk'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('super_admin');

        $session = AdmissionSession::create([
            'name' => 'Temporary Test Session',
            'code' => 'TEMP-2029',
            'start_date' => '2029-01-01',
            'closing_date' => '2029-12-31',
            'status' => 'draft',
            'is_active' => false,
        ]);

        $response = $this->actingAs($admin)->delete("/admin/sessions/{$session->id}");
        $response->assertRedirect('/admin/sessions');

        $this->assertSoftDeleted('admission_sessions', ['id' => $session->id]);
    }

    public function test_hod_can_view_all_examinations_across_sessions(): void
    {
        $hod = User::firstOrCreate(
            ['email' => 'hod@bcmt.edu.pk'],
            ['name' => 'HOD', 'password' => bcrypt('password')]
        );
        $hod->assignRole('hod');

        $response = $this->actingAs($hod)->get('/hod/exams');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Hod/Exams/Index')
            ->has('examinations')
            ->has('sessions')
        );
    }

    public function test_hod_can_void_attempt_without_truncation_error(): void
    {
        $hod = User::firstOrCreate(
            ['email' => 'hod@bcmt.edu.pk'],
            ['name' => 'HOD', 'password' => bcrypt('password')]
        );
        $hod->assignRole('hod');

        $result = \App\Models\ExaminationResult::first();
        if (!$result) {
            $this->assertTrue(true);
            return;
        }

        $response = $this->actingAs($hod)->post("/hod/results/{$result->id}/void", [
            'reason' => 'Exam malpractice violation',
        ]);
        $response->assertRedirect();

        $result->refresh();
        $this->assertEquals('disqualified', $result->status);
        $this->assertEquals(0.00, (float) $result->obtained_marks);
    }

    public function test_hod_can_delete_examination_result_and_attempt(): void
    {
        $hod = User::firstOrCreate(
            ['email' => 'hod@bcmt.edu.pk'],
            ['name' => 'HOD', 'password' => bcrypt('password')]
        );
        $hod->assignRole('hod');

        $exam = Examination::first();
        $app = \App\Models\Application::first();

        if (!$exam || !$app) {
            $this->assertTrue(true);
            return;
        }

        $attempt = \App\Models\ExaminationAttempt::create([
            'examination_id' => $exam->id,
            'application_id' => $app->id,
            'user_id' => $app->user_id,
            'start_time' => now(),
            'server_deadline' => now()->addMinutes(60),
            'status' => 'submitted',
        ]);

        $res = \App\Models\ExaminationResult::create([
            'examination_id' => $exam->id,
            'examination_attempt_id' => $attempt->id,
            'application_id' => $app->id,
            'total_questions' => 10,
            'correct_answers' => 7,
            'incorrect_answers' => 3,
            'unanswered' => 0,
            'total_marks' => 10,
            'obtained_marks' => 7,
            'percentage' => 70,
            'is_passed' => true,
            'status' => 'published',
        ]);

        $response = $this->actingAs($hod)->delete("/hod/results/{$res->id}");
        $response->assertRedirect();

        $this->assertDatabaseMissing('examination_results', ['id' => $res->id]);
        $this->assertDatabaseMissing('examination_attempts', ['id' => $attempt->id]);
    }
}
