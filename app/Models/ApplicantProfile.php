<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantProfile extends Model
{
    protected $fillable = [
        'application_id',
        'full_name',
        'father_name',
        'dob',
        'gender',
        'cnic',
        'mobile_number',
        'whatsapp_number',
        'email',
        'nationality',
        'domicile_district',
        'permanent_address',
        'current_address',
    ];

    protected $appends = [
        'date_of_birth',
        'phone',
        'postal_address',
    ];

    protected function casts(): array
    {
        return [
            'dob' => 'date',
        ];
    }

    public function getDateOfBirthAttribute(): ?string
    {
        return $this->dob ? $this->dob->format('Y-m-d') : null;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->mobile_number ?: $this->whatsapp_number;
    }

    public function getPostalAddressAttribute(): ?string
    {
        return $this->current_address ?: $this->permanent_address;
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
