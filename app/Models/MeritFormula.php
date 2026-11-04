<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeritFormula extends Model
{
    protected $fillable = [
        'admission_session_id',
        'session_program_id',
        'title',
        'version',
        'total_weight',
        'tie_breaker_rules',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'total_weight' => 'decimal:2',
            'tie_breaker_rules' => 'array',
            'is_active' => 'boolean',
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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function components(): HasMany
    {
        return $this->hasMany(MeritFormulaComponent::class);
    }

    public function meritLists(): HasMany
    {
        return $this->hasMany(MeritList::class);
    }

    public function validateTotalWeight(): bool
    {
        $sum = $this->components()->sum('weight_percentage');
        return abs((float) $sum - 100.00) < 0.01;
    }
}
