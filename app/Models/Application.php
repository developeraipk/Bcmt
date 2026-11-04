<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'application_number',
        'user_id',
        'admission_session_id',
        'session_program_id',
        'roll_number',
        'normalized_cnic',
        'identity_hash',
        'potential_duplicate_detected',
        'duplicate_risk_notes',
        'status',
        'verification_status',
        'exam_eligibility_status',
        'exam_attempt_status',
        'result_status',
        'merit_status',
        'selection_status',
        'internal_remarks',
        'correction_notes',
        'submitted_at',
        'verified_at',
        'verified_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'potential_duplicate_detected' => 'boolean',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admissionSession(): BelongsTo
    {
        return $this->belongsTo(AdmissionSession::class);
    }

    public function sessionProgram(): BelongsTo
    {
        return $this->belongsTo(SessionProgram::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function applicantProfile(): HasOne
    {
        return $this->hasOne(ApplicantProfile::class);
    }

    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ApplicationStatusHistory::class);
    }

    public function examinationAttendance(): HasOne
    {
        return $this->hasOne(ExaminationAttendance::class);
    }

    public function examinationAttempt(): HasOne
    {
        return $this->hasOne(ExaminationAttempt::class);
    }

    public function meritListItem(): HasOne
    {
        return $this->hasOne(MeritListItem::class);
    }

    public function seatAllocation(): HasOne
    {
        return $this->hasOne(SeatAllocation::class);
    }

    public function transitionState(string $stage, string $toState, ?int $userId = null, ?string $reason = null): void
    {
        $fieldMap = [
            'lifecycle' => 'status',
            'verification' => 'verification_status',
            'eligibility' => 'exam_eligibility_status',
            'exam_attempt' => 'exam_attempt_status',
            'result' => 'result_status',
            'merit' => 'merit_status',
            'selection' => 'selection_status',
        ];

        $column = $fieldMap[$stage] ?? $stage;
        $fromState = (string) $this->{$column};

        $this->update([$column => $toState]);

        $this->statusHistories()->create([
            'user_id' => $userId,
            'workflow_stage' => $stage,
            'from_status' => $fromState,
            'to_status' => $toState,
            'reason' => $reason,
        ]);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('application_number', 'like', "%{$search}%")
                        ->orWhere('roll_number', 'like', "%{$search}%")
                        ->orWhere('normalized_cnic', 'like', "%{$search}%")
                        ->orWhereHas('applicantProfile', function ($p) use ($search) {
                            $p->where('full_name', 'like', "%{$search}%")
                              ->orWhere('father_name', 'like', "%{$search}%")
                              ->orWhere('mobile_number', 'like', "%{$search}%")
                              ->orWhere('cnic', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['session_id'] ?? null, fn ($q, $id) => $q->where('admission_session_id', $id))
            ->when($filters['program_id'] ?? null, function ($q, $id) {
                $q->whereHas('sessionProgram', fn ($sp) => $sp->where('program_id', $id));
            })
            ->when($filters['gender'] ?? null, function ($q, $gender) {
                $q->whereHas('applicantProfile', fn ($p) => $p->where('gender', $gender));
            })
            ->when($filters['verification_status'] ?? null, fn ($q, $s) => $q->where('verification_status', $s))
            ->when($filters['exam_eligibility_status'] ?? null, fn ($q, $s) => $q->where('exam_eligibility_status', $s))
            ->when($filters['selection_status'] ?? null, fn ($q, $s) => $q->where('selection_status', $s));
    }
}
