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

    public function isOpen(): bool
    {
        return $this->status === 'open' && $this->is_active && now()->between($this->start_date, $this->closing_date->endOfDay());
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
