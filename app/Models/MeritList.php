<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeritList extends Model
{
    protected $fillable = [
        'admission_session_id',
        'session_program_id',
        'merit_formula_id',
        'title',
        'version',
        'status',
        'published_at',
        'published_by_user_id',
        'approved_by_user_id',
        'integrity_hash',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'published_at' => 'datetime',
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

    public function meritFormula(): BelongsTo
    {
        return $this->belongsTo(MeritFormula::class);
    }

    public function publishedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by_user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MeritListItem::class)->orderBy('rank');
    }

    public function isLocked(): bool
    {
        return $this->status === 'published_locked';
    }
}
