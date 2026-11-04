<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAccessToken;
use App\Models\ExaminationAttendance;
use App\Models\Program;
use App\Models\Question;
use App\Models\SessionProgram;
use App\Models\User;
use App\Services\ExaminationEngineService;
use App\Services\ExaminationPinService;
use App\Services\ExamGateService;
use App\Services\RollNumberService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ExamAttemptTimerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_attempt_timer_is_server_authoritative_and_payload_omits_answers()
    {
        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSMLT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $user = User::create([
            'name' => 'Timer Candidate',
            'email' => 'timer.cand@bcmt.edu.pk',
            'password' => bcrypt('Pass'),
            'cnic' => '1110199999993',
            'phone' => '03339999993',
        ]);
        $user->assignRole('student');

        $app = Application::create([
            'user_id' => $user->id,
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'application_number' => 'BCMT-2026-660001',
            'normalized_cnic' => '1110199999993',
            'identity_hash' => sha1('timer_test'),
            'status' => 'submitted',
            'verification_status' => 'verified',
            'exam_eligibility_status' => 'eligible',
            'selection_status' => 'unprocessed',
        ]);

        ApplicantProfile::create([
            'application_id' => $app->id,
            'full_name' => 'Timer Candidate',
            'father_name' => 'Father',
            'cnic' => '11101-9999999-3',
            'email' => 'timer.cand@bcmt.edu.pk',
            'dob' => '2005-01-01',
            'gender' => 'male',
            'mobile_number' => '03339999993',
            'whatsapp_number' => '03339999993',
            'domicile_district' => 'Bannu',
            'permanent_address' => 'Bannu',
            'current_address' => 'Bannu',
        ]);

        RollNumberService::assignRollNumber($app);

        // Exam with 1 question
        $exam = Examination::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Timer Accuracy Exam',
            'exam_code' => 'TIMER-EXAM-01',
            'duration_minutes' => 60,
            'total_questions' => 1,
            'total_marks' => 2,
            'passing_marks' => 1,
            'passing_percentage' => 50,
            'negative_marks_per_wrong' => 0.5,
            'status' => 'active',
            'requires_attendance' => false,
        ]);

        $q = Question::first();
        if ($q) {
            $exam->examinationQuestions()->create([
                'question_id' => $q->id,
                'sort_order' => 1,
                'marks' => 2.0,
            ]);
        }

        $rawPin = ExaminationPinService::generatePin($exam, 1);
        $tokenStr = ExamGateService::verifyGate($app, $exam, $rawPin, $user->id);
        $accessToken = ExaminationAccessToken::where('token', $tokenStr)->firstOrFail();

        // Start Attempt
        $request = request();
        $attempt = ExaminationEngineService::startAttempt($accessToken, $request);

        $this->assertNotNull($attempt);
        $this->assertEquals('in_progress', $attempt->status);
        $this->assertNotNull($attempt->server_deadline);

        // Deadline is approximately now + 60 minutes
        $diffMinutes = now()->diffInMinutes($attempt->server_deadline);
        $this->assertGreaterThanOrEqual(59, $diffMinutes);
        $this->assertLessThanOrEqual(60, $diffMinutes);

        // Verify Candidate Payload omits answer keys
        $payload = ExaminationEngineService::getCandidateQuestionPayload($attempt);
        $this->assertArrayHasKey('questions', $payload);
        $this->assertArrayHasKey('remaining_seconds', $payload);

        foreach ($payload['questions'] as $qItem) {
            foreach ($qItem['options'] as $opt) {
                // Ensure is_correct is NEVER leaked to client
                $this->assertArrayNotHasKey('is_correct', $opt);
            }
        }

        // Test Answer Saving
        if ($q && $q->options()->exists()) {
            $firstOpt = $q->options()->first();
            ExaminationEngineService::saveAnswer($attempt, $q->id, $firstOpt->id, 10, false);

            $this->assertDatabaseHas('attempt_answers', [
                'examination_attempt_id' => $attempt->id,
                'question_id' => $q->id,
                'selected_option_id' => $firstOpt->id,
            ]);
        }

        // Test Attempt Submission
        ExaminationEngineService::submitAttempt($attempt, 'Test submission');
        $attempt->refresh();
        $this->assertEquals('submitted', $attempt->status);
        $this->assertNotNull($attempt->end_time);
        $this->assertNotNull($attempt->result);
    }
}
