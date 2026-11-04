<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SessionProgram extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'admission_session_id',
        'program_id',
        'total_seats',
        'seats_allocated',
        'is_open',
        'test_required',
        'application_fee',
        'reservation_validity_days',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'total_seats' => 'integer',
            'seats_allocated' => 'integer',
            'is_open' => 'boolean',
            'test_required' => 'boolean',
            'application_fee' => 'decimal:2',
            'reservation_validity_days' => 'integer',
            'settings' => 'array',
        ];
    }

    public function admissionSession(): BelongsTo
    {
        return $this->belongsTo(AdmissionSession::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class);
    }

    public function meritFormulas(): HasMany
    {
        return $this->hasMany(MeritFormula::class);
    }

    public function seatAllocations(): HasMany
    {
        return $this->hasMany(SeatAllocation::class);
    }

    public function availableSeats(): int
    {
        $activeOccupied = $this->seatAllocations()
            ->whereIn('status', ['reserved', 'confirmed'])
            ->count();
        return max(0, $this->total_seats - $activeOccupied);
    }
}
