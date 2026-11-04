<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultAdjustment extends Model
{
    protected $fillable = [
        'examination_result_id',
        'adjusted_by_user_id',
        'hod_approved_by_user_id',
        'previous_marks',
        'new_marks',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'previous_marks' => 'decimal:2',
            'new_marks' => 'decimal:2',
        ];
    }

    public function result(): BelongsTo
    {
        return $this->belongsTo(ExaminationResult::class, 'examination_result_id');
    }

    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by_user_id');
    }

    public function hodApprovedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hod_approved_by_user_id');
    }
}
