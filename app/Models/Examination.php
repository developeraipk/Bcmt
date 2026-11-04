<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Examination extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'admission_session_id',
        'session_program_id',
        'title',
        'exam_code',
        'shift',
        'duration_minutes',
        'total_questions',
        'total_marks',
        'passing_marks',
        'passing_percentage',
        'negative_marks_per_wrong',
        'randomize_questions',
        'randomize_options',
        'requires_attendance',
        'status',
        'scheduled_start',
        'scheduled_end',
        'instructions',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'total_questions' => 'integer',
            'total_marks' => 'decimal:2',
            'passing_marks' => 'decimal:2',
            'passing_percentage' => 'decimal:2',
            'negative_marks_per_wrong' => 'decimal:2',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'requires_attendance' => 'boolean',
            'scheduled_start' => 'datetime',
            'scheduled_end' => 'datetime',
        ];
    }

    public function admissionSession(): BelongsTo
    {
        return $this->belongsTo(AdmissionSession::class);
    }

    public function sessionProgram(): BelongsTo
    {
        return $this->belongsTo(SessionProgram::class);
    }

    public function pins(): HasMany
    {
        return $this->hasMany(ExaminationPin::class);
    }

    public function activePin(): HasOne
    {
        return $this->hasOne(ExaminationPin::class)->where('is_active', true)->latest();
    }

    public function accessTokens(): HasMany
    {
        return $this->hasMany(ExaminationAccessToken::class);
    }

    public function examinationQuestions(): HasMany
    {
        return $this->hasMany(ExaminationQuestion::class)->orderBy('sort_order');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(ExaminationAttendance::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExaminationAttempt::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(ExaminationResult::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function getPassingMarksAttribute($value): float
    {
        $percentage = (float) ($this->attributes['passing_percentage'] ?? 50.00);
        $totalMarks = (float) ($this->attributes['total_marks'] ?? 0.00);

        if ($totalMarks > 0 && $percentage > 0) {
            return round($totalMarks * ($percentage / 100), 2);
        }

        return (float) ($value ?? 0.00);
    }
}
