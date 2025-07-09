<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'provider',
        'provider_subscription_id',
        'status',
        'plan',
        'amount',
        'currency',
        'billing_cycle',
        'trial_ends_at',
        'next_billing_at',
        'canceled_at',
        'payment_method',
        'metadata'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'next_billing_at' => 'datetime',
        'canceled_at' => 'datetime',
        'metadata' => 'json',
    ];

    /**
     * Get the tenant that owns the subscription.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if the subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' || $this->onTrial();
    }

    /**
     * Check if the subscription is on trial.
     */
    public function onTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if the subscription is canceled.
     */
    public function isCanceled(): bool
    {
        return $this->canceled_at !== null;
    }

    /**
     * Check if the subscription has ended.
     */
    public function hasEnded(): bool
    {
        return $this->status === 'canceled' || $this->status === 'expired';
    }
}