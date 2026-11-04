<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExaminationPin extends Model
{
    protected $fillable = [
        'examination_id',
        'pin_hash',
        'display_pin',
        'is_active',
        'generated_by_user_id',
        'activated_at',
        'revoked_at',
        'expires_at',
        'change_reason',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'activated_at' => 'datetime',
            'revoked_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    public static function hashPin(string $pin): string
    {
        $pepper = config('app.pin_pepper', env('APP_PIN_PEPPER', 'bcmt_default_pepper_key'));
        $peppered = hash_hmac('sha256', $pin, $pepper);

        // Memory-hard Argon2id (Mandatory Technical Revision 1)
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($peppered, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,
                'time_cost' => 4,
                'threads' => 1,
            ]);
        }

        return password_hash($peppered, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    public function verifyPin(string $inputPin): bool
    {
        $pepper = config('app.pin_pepper', env('APP_PIN_PEPPER', 'bcmt_default_pepper_key'));
        $peppered = hash_hmac('sha256', $inputPin, $pepper);

        return password_verify($peppered, $this->pin_hash);
    }
}
