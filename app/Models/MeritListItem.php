<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MeritListItem extends Model
{
    protected $fillable = [
        'merit_list_id',
        'application_id',
        'rank',
        'matric_percentage',
        'inter_percentage',
        'test_percentage',
        'aggregate_percentage',
        'status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'rank' => 'integer',
            'matric_percentage' => 'decimal:2',
            'inter_percentage' => 'decimal:2',
            'test_percentage' => 'decimal:2',
            'aggregate_percentage' => 'decimal:2',
        ];
    }

    public function meritList(): BelongsTo
    {
        return $this->belongsTo(MeritList::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function seatAllocation(): HasOne
    {
        return $this->hasOne(SeatAllocation::class);
    }
}
