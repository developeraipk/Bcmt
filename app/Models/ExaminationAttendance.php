<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExaminationAttendance extends Model
{
    protected $fillable = [
        'examination_id',
        'application_id',
        'invigilator_user_id',
        'room_number',
        'seat_number',
        'attendance_status',
        'verified_at',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function invigilator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invigilator_user_id');
    }

    public function isPresent(): bool
    {
        return $this->attendance_status === 'present';
    }
}
