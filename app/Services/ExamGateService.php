<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Examination;
use App\Models\ExaminationAccessToken;
use App\Models\ExaminationAttendance;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ExamGateService
{
    /**
     * Verify all admission gating conditions and common PIN, then issue a short-lived access token
     */
    public static function verifyGate(Application $application, Examination $examination, string $pin, int $userId): string
    {
        // 1. Verify Application Ownership
        if ($application->user_id !== $userId) {
            throw ValidationException::withMessages(['application' => 'Unauthorized access to this application record.']);
        }

        // 2. Verify Program Match
        if ($examination->session_program_id && $application->session_program_id !== $examination->session_program_id) {
            throw ValidationException::withMessages(['examination' => 'You are not assigned to this program examination.']);
        }

        // 3. Verify Test Eligibility
        if ($application->exam_eligibility_status !== 'eligible') {
            throw ValidationException::withMessages([
                'eligibility' => 'Your application has not been approved for admission test eligibility yet.',
            ]);
        }

        // 4. Verify Examination is currently Active
        if (!$examination->isActive()) {
            throw ValidationException::withMessages([
                'status' => 'This examination is not currently active. Waiting for campus administrator activation.',
            ]);
        }

        // 5. Verify Previous Completed Attempts
        $existingAttempt = $application->examinationAttempt;
        if ($existingAttempt && in_array($existingAttempt->status, ['submitted', 'timed_out'])) {
            throw ValidationException::withMessages([
                'attempt' => 'You have already completed this admission examination.',
            ]);
        }

        // 6. Verify Mandatory Campus Invigilator Attendance (Mandatory Correction 4)
        if ($examination->requires_attendance) {
            $attendance = ExaminationAttendance::where('examination_id', $examination->id)
                ->where('application_id', $application->id)
                ->first();

            if (!$attendance || !$attendance->isPresent()) {
                throw ValidationException::withMessages([
                    'attendance' => 'Campus Attendance Required: Please present your Roll Number Slip to the exam room invigilator to verify your physical attendance before entering the test PIN.',
                ]);
            }
        }

        // 7. Verify Common PIN using Argon2id + Secret Pepper
        ExaminationPinService::verifyPin($examination, $pin, $userId);

        // 8. Issue Short-Lived Access Token (15 minutes validity) - Exam Timer has NOT started yet!
        $token = Str::random(48);

        // Invalidate older unused tokens for this application & exam
        ExaminationAccessToken::where('examination_id', $examination->id)
            ->where('application_id', $application->id)
            ->where('is_consumed', false)
            ->delete();

        ExaminationAccessToken::create([
            'examination_id' => $examination->id,
            'application_id' => $application->id,
            'user_id' => $userId,
            'token' => $token,
            'expires_at' => now()->addMinutes(15),
            'is_consumed' => false,
        ]);

        return $token;
    }
}
