<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
    ];

    /**
     * Get the tenants that the user owns.
     */
    public function ownedTenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'owner_id');
    }

    /**
     * Get the tenant memberships for the user.
     */
    public function tenantUsers(): HasMany
    {
        return $this->hasMany(TenantUser::class);
    }

    /**
     * Check if the user is a system admin.
     */
    public function isSystemAdmin(): bool
    {
        return $this->is_admin || $this->email === config('app.admin_email');
    }

    /**
     * Check if the user is a tenant admin for the given tenant.
     */
    public function isTenantAdmin(Tenant $tenant): bool
    {
        return $this->tenantUsers()
            ->where('tenant_id', $tenant->id)
            ->where('role', 'admin')
            ->exists();
    }

    /**
     * Check if the user is a tenant owner for the given tenant.
     */
    public function isTenantOwner(Tenant $tenant): bool
    {
        return $tenant->owner_id === $this->id;
    }
}