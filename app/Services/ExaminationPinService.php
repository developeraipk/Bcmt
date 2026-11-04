<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationPin;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class ExaminationPinService
{
    /**
     * Generate or rotate a test-wise common PIN
     */
    public static function generatePin(Examination $examination, ?int $userId = null, ?string $reason = null, ?string $customPin = null): string
    {
        // 6-digit numeric PIN (or custom pin if specified)
        $rawPin = !empty($customPin) ? trim($customPin) : sprintf("%06d", random_int(100000, 999999));
        $pinHash = ExaminationPin::hashPin($rawPin);

        // Deactivate existing active PIN for new attempts without disrupting in-progress attempts
        $examination->pins()->where('is_active', true)->update([
            'is_active' => false,
            'revoked_at' => now(),
            'change_reason' => $reason ?? 'Rotated by Administrator',
        ]);

        ExaminationPin::create([
            'examination_id' => $examination->id,
            'pin_hash' => $pinHash,
            'display_pin' => $rawPin,
            'is_active' => true,
            'generated_by_user_id' => $userId,
            'activated_at' => now(),
            'change_reason' => $reason ?? 'New Examination PIN Generated',
        ]);

        AuditLog::log('examination_pin_generated', 'Examination', $examination->id, null, [
            'reason' => $reason,
            'generated_by' => $userId,
            'pin' => $rawPin,
        ]);

        return $rawPin;
    }

    /**
     * Validate candidate entered PIN against the active Common PIN with rate limiting
     */
    public static function verifyPin(Examination $examination, string $enteredPin, int $userId): bool
    {
        $rateLimitKey = "exam_pin_attempts_{$examination->id}_{$userId}";
        $attempts = (int) Cache::get($rateLimitKey, 0);

        if ($attempts >= 5) {
            throw ValidationException::withMessages([
                'pin' => 'Too many incorrect attempts. Please wait 15 minutes before trying again.',
            ]);
        }

        $activePin = $examination->activePin;
        if (!$activePin) {
            throw ValidationException::withMessages([
                'pin' => 'No active examination PIN is currently configured for this test.',
            ]);
        }

        $isValid = $activePin->verifyPin($enteredPin);

        if (!$isValid) {
            Cache::put($rateLimitKey, $attempts + 1, now()->addMinutes(15));
            throw ValidationException::withMessages([
                'pin' => 'The entered examination PIN is incorrect. Please verify with your campus invigilator.',
            ]);
        }

        // Clear attempts on success
        Cache::forget($rateLimitKey);
        return true;
    }
}
