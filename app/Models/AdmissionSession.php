<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdmissionSession extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'start_date',
        'closing_date',
        'closing_time',
        'status',
        'is_active',
        'admission_instructions',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'closing_date' => 'date:Y-m-d',
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function sessionPrograms(): HasMany
    {
        return $this->hasMany(SessionProgram::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class);
    }

    public function meritLists(): HasMany
    {
        return $this->hasMany(MeritList::class);
    }

    public function getClosingDatetimeAttribute(): \Carbon\Carbon
    {
        $dateStr = $this->closing_date ? $this->closing_date->format('Y-m-d') : now()->toDateString();
        $timeStr = trim((string) ($this->closing_time ?: '23:59'));
        if (strlen($timeStr) === 5) {
            $timeStr .= ':59';
        }
        return \Carbon\Carbon::parse($dateStr . ' ' . $timeStr);
    }

    public function isExpired(): bool
    {
        return now()->gt($this->closing_datetime);
    }

    public function getTimeRemainingAttribute(): string
    {
        $now = now();
        $closing = $this->closing_datetime;

        if ($now->gt($closing)) {
            return 'Deadline expired';
        }

        $diffDays = $now->diffInDays($closing);
        $diffHours = $now->diffInHours($closing);
        $diffMinutes = $now->diffInMinutes($closing);

        if ($diffDays > 1) {
            return "{$diffDays} days remaining";
        } elseif ($diffDays === 1) {
            return "1 day remaining";
        } elseif ($diffHours > 1) {
            return "{$diffHours} hours remaining";
        } elseif ($diffMinutes > 0) {
            return "{$diffMinutes} minutes remaining";
        }

        return 'Closing shortly';
    }

    public function isOpen(): bool
    {
        if ($this->status !== 'open' || !$this->is_active) {
            return false;
        }

        $now = now();
        $start = \Carbon\Carbon::parse($this->start_date->format('Y-m-d') . ' 00:00:00');
        $closing = $this->closing_datetime;

        return $now->gte($start) && $now->lte($closing);
    }

    public static function getActive(): ?self
    {
        return self::where('is_active', true)->first();
    }

    protected static function booted(): void
    {
        static::deleting(function (AdmissionSession $session) {
            if (!$session->isForceDeleting() && !str_contains($session->code, '_d_')) {
                $prefix = substr($session->code, 0, 12);
                $session->code = $prefix . '_d_' . $session->id;
                $session->saveQuietly();
            }
        });
    }
}
