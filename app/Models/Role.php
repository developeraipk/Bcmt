<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = ['name', 'display_name', 'description'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    public function givePermissionTo(string $permissionName): void
    {
        $permission = Permission::firstOrCreate(['name' => $permissionName], [
            'display_name' => ucwords(str_replace('_', ' ', $permissionName)),
        ]);
        if (!$this->permissions->contains($permission->id)) {
            $this->permissions()->attach($permission->id);
        }
    }
}
