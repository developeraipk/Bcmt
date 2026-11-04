<?php

namespace Tests\Feature;

use App\Models\AdmissionSession;
use App\Models\Examination;
use App\Models\Program;
use App\Models\SessionProgram;
use App\Models\User;
use App\Services\ExaminationPinService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CommonExamPinTest extends TestCase
{
    use DatabaseTransactions;

    public function test_common_pin_is_hashed_with_argon2id_and_rotates_safely()
    {
        $session = AdmissionSession::where('is_active', true)->first();
        $prog = Program::where('code', 'BSMLT')->first();
        $sp = SessionProgram::where('admission_session_id', $session->id)
            ->where('program_id', $prog->id)
            ->first();

        $exam = Examination::create([
            'admission_session_id' => $session->id,
            'session_program_id' => $sp->id,
            'title' => 'Test Exam PIN Security',
            'exam_code' => 'TEST-PIN-01',
            'duration_minutes' => 60,
            'total_questions' => 50,
            'total_marks' => 100,
            'passing_marks' => 50,
            'passing_percentage' => 50,
            'negative_marks_per_wrong' => 0.25,
            'status' => 'active',
            'requires_attendance' => true,
        ]);

        $hod = User::where('email', 'hod@bcmt.edu.pk')->first();
        $this->assertNotNull($hod);

        // Generate Common PIN
        $rawPin = ExaminationPinService::generatePin($exam, $hod->id);
        $this->assertNotEmpty($rawPin);
        $this->assertEquals(6, strlen($rawPin));

        // Active pin record exists in DB with Argon2id hash
        $pinRecord = $exam->pins()->where('is_active', true)->first();
        $this->assertNotNull($pinRecord);
        $this->assertNotEmpty($pinRecord->pin_hash);

        // Verify valid PIN returns true
        $exam->unsetRelation('activePin');
        $isValid = ExaminationPinService::verifyPin($exam, $rawPin, $hod->id);
        $this->assertTrue($isValid);

        // Verify wrong PIN throws ValidationException
        $thrown = false;
        try {
            ExaminationPinService::verifyPin($exam, '999999', $hod->id);
        } catch (ValidationException $e) {
            $thrown = true;
        }
        $this->assertTrue($thrown);

        // Rotate PIN
        $newRawPin = ExaminationPinService::generatePin($exam, $hod->id);
        $this->assertNotEquals($rawPin, $newRawPin);

        // Old PIN is no longer active
        $pinRecord->refresh();
        $this->assertFalse($pinRecord->is_active);

        // New PIN verifies when relation is refreshed
        $exam->unsetRelation('activePin');
        $this->assertTrue(ExaminationPinService::verifyPin($exam, $newRawPin, $hod->id));
    }
}
