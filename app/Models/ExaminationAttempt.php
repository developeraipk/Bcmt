<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ExaminationAttempt extends Model
{
    protected $fillable = [
        'examination_id',
        'application_id',
        'user_id',
        'start_time',
        'server_deadline',
        'end_time',
        'status',
        'ip_address',
        'user_agent',
        'event_logs',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'server_deadline' => 'datetime',
            'end_time' => 'datetime',
            'event_logs' => 'array',
        ];
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function result(): HasOne
    {
        return $this->hasOne(ExaminationResult::class);
    }

    public function isExpired(): bool
    {
        if (!$this->server_deadline) {
            return false;
        }

        return now()->greaterThan($this->server_deadline);
    }

    public function remainingSeconds(): int
    {
        if ($this->status !== 'in_progress' || !$this->server_deadline) {
            return 0;
        }

        return max(0, (int) now()->diffInSeconds($this->server_deadline, false));
    }
}
