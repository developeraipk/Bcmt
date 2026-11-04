<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExaminationResult extends Model
{
    protected $fillable = [
        'examination_attempt_id',
        'application_id',
        'examination_id',
        'total_questions',
        'correct_answers',
        'incorrect_answers',
        'unanswered',
        'total_marks',
        'obtained_marks',
        'percentage',
        'is_passed',
        'status',
        'published_at',
        'published_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'total_questions' => 'integer',
            'correct_answers' => 'integer',
            'incorrect_answers' => 'integer',
            'unanswered' => 'integer',
            'total_marks' => 'decimal:2',
            'obtained_marks' => 'decimal:2',
            'percentage' => 'decimal:2',
            'is_passed' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected $appends = [
        'score_final',
        'score_raw',
        'passing_percentage',
        'attempted_questions',
        'unattempted_questions',
        'negative_penalty',
        'wrong_answers',
        'result_status',
    ];

    public function getScoreFinalAttribute(): string
    {
        return number_format((float) $this->obtained_marks, 2);
    }

    public function getScoreRawAttribute(): string
    {
        return number_format((float) $this->obtained_marks, 2);
    }

    public function getPassingPercentageAttribute(): float
    {
        return (float) ($this->examination?->passing_percentage ?? 50.0);
    }

    public function getAttemptedQuestionsAttribute(): int
    {
        return (int) ($this->correct_answers + $this->incorrect_answers);
    }

    public function getUnattemptedQuestionsAttribute(): int
    {
        return (int) $this->unanswered;
    }

    public function getNegativePenaltyAttribute(): string
    {
        $rate = (float) ($this->examination?->negative_marks_per_wrong ?? 0.0);
        return number_format($this->incorrect_answers * $rate, 2);
    }

    public function getWrongAnswersAttribute(): int
    {
        return (int) $this->incorrect_answers;
    }

    public function getResultStatusAttribute(): string
    {
        if ($this->status === 'disqualified') {
            return 'disqualified';
        }
        return $this->is_passed ? 'pass' : 'fail';
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExaminationAttempt::class, 'examination_attempt_id');
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function publishedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by_user_id');
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(ResultAdjustment::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
