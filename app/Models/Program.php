<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Program extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'category',
        'duration_years',
        'qualification_required',
        'affiliation',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duration_years' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function sessionPrograms(): HasMany
    {
        return $this->hasMany(SessionProgram::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
