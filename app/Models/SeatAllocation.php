<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeatAllocation extends Model
{
    protected $fillable = [
        'admission_session_id',
        'session_program_id',
        'application_id',
        'merit_list_item_id',
        'seat_number',
        'status',
        'offer_extended_at',
        'reservation_expires_at',
        'confirmed_at',
        'confirmed_by_user_id',
        'released_at',
        'release_reason',
        'allocated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'seat_number' => 'integer',
            'offer_extended_at' => 'datetime',
            'reservation_expires_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'released_at' => 'datetime',
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

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function meritListItem(): BelongsTo
    {
        return $this->belongsTo(MeritListItem::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by_user_id');
    }

    public function allocatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by_user_id');
    }

    public function isExpired(): bool
    {
        return $this->status === 'reserved' 
            && $this->reservation_expires_at 
            && now()->greaterThan($this->reservation_expires_at);
    }
}
