<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicRecord extends Model
{
    protected $fillable = [
        'application_id',
        'level',
        'qualification_name',
        'board_university',
        'roll_number',
        'passing_year',
        'total_marks',
        'obtained_marks',
        'percentage',
    ];

    protected $appends = [
        'degree_level',
        'board_name',
        'exam_roll_number',
        'marks_obtained',
    ];

    protected function casts(): array
    {
        return [
            'passing_year' => 'integer',
            'total_marks' => 'decimal:2',
            'obtained_marks' => 'decimal:2',
            'percentage' => 'decimal:2',
        ];
    }

    public function getDegreeLevelAttribute(): ?string
    {
        return $this->level ?: $this->qualification_name;
    }

    public function getBoardNameAttribute(): ?string
    {
        return $this->board_university;
    }

    public function getExamRollNumberAttribute(): ?string
    {
        return $this->roll_number;
    }

    public function getMarksObtainedAttribute(): ?float
    {
        return $this->obtained_marks !== null ? (float) $this->obtained_marks : null;
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
