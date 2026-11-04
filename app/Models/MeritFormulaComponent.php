<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeritFormulaComponent extends Model
{
    protected $fillable = [
        'merit_formula_id',
        'component_type',
        'component_name',
        'weight_percentage',
        'source_field',
        'min_score_required',
    ];

    protected function casts(): array
    {
        return [
            'weight_percentage' => 'decimal:2',
            'min_score_required' => 'decimal:2',
        ];
    }

    public function meritFormula(): BelongsTo
    {
        return $this->belongsTo(MeritFormula::class);
    }
}
