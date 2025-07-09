<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'subdomain',
        'logo_url',
        'primary_color',
        'secondary_color',
        'theme_mode',
        'owner_id',
        'status',
        'trial_ends_at',
        'subscription_id',
        'subscription_status',
        'subscription_price',
        'next_payment_at',
        'last_payment_at',
        'settings',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'next_payment_at' => 'datetime',
        'last_payment_at' => 'datetime',
        'settings' => 'json',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(TenantUser::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getDatabaseName(): string
    {
        return config('tenancy.database.prefix') . $this->id;
    }

    public function isActive(): bool
    {
        if ($this->status === 'trial' && $this->trial_ends_at->isFuture()) {
            return true;
        }

        return in_array($this->subscription_status, ['active', 'trial']);
    }

    public function isInTrial(): bool
    {
        return $this->status === 'trial' && $this->trial_ends_at->isFuture();
    }

    public function hasExpiredTrial(): bool
    {
        return $this->status === 'trial' && $this->trial_ends_at->isPast();
    }

    public function getRemainingTrialDays(): int
    {
        if (!$this->isInTrial()) {
            return 0;
        }

        return now()->diffInDays($this->trial_ends_at);
    }
}