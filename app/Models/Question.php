<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'program_id',
        'subject',
        'topic',
        'difficulty',
        'marks',
        'question_text',
        'explanation',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'marks' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function correctOption(): ?QuestionOption
    {
        return $this->options()->where('is_correct', true)->first();
    }
}
