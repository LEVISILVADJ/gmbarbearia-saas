<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'role',
    ];

    /**
     * Get the tenant that the user belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the user that belongs to the tenant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}