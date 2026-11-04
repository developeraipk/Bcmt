<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'cnic',
        'phone',
        'avatar',
        'password',
        'is_active',
        'must_change_password',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $table = $this->belongsToMany(Role::class, 'role_user');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_user');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = (array) $roles;
        return $this->roles->pluck('name')->intersect($roles)->isNotEmpty();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        // Direct user permissions
        if ($this->permissions->pluck('name')->contains($permission)) {
            return true;
        }

        // Permissions inherited through roles
        return $this->roles->flatMap->permissions->pluck('name')->contains($permission);
    }

    public function getAllPermissions(): array
    {
        if ($this->hasRole('super_admin')) {
            return Permission::pluck('name')->toArray();
        }

        $direct = $this->permissions->pluck('name');
        $inherited = $this->roles->flatMap->permissions->pluck('name');

        return $direct->merge($inherited)->unique()->values()->toArray();
    }

    public function assignRole(string $roleName): void
    {
        $role = Role::firstOrCreate(['name' => $roleName], [
            'display_name' => ucwords(str_replace('_', ' ', $roleName)),
        ]);
        if (!$this->roles->contains($role->id)) {
            $this->roles()->attach($role->id);
        }
    }
}
