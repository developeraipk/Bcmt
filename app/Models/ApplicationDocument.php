<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ApplicationDocument extends Model
{
    protected $fillable = [
        'application_id',
        'document_type',
        'file_path',
        'original_filename',
        'file_size',
        'mime_type',
        'verification_status',
        'rejection_reason',
        'verified_by_user_id',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'verified_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function getDocumentName(): string
    {
        return match ($this->document_type) {
            'photo' => 'Student Passport Photograph',
            'cnic_front' => 'CNIC / B-Form Front',
            'cnic_back' => 'CNIC / B-Form Back',
            'father_cnic' => "Father's CNIC",
            'matric_dmc' => 'Matric DMC / Certificate',
            'inter_dmc' => 'Intermediate DMC / Certificate',
            'domicile' => 'Domicile Certificate',
            'fee_slip' => 'Application Fee Voucher',
            default => 'Supporting Document',
        };
    }
}
