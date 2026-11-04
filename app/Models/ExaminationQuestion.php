<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExaminationQuestion extends Model
{
    protected $fillable = [
        'examination_id',
        'question_id',
        'sort_order',
        'snapshot_payload',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'snapshot_payload' => 'array',
        ];
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
