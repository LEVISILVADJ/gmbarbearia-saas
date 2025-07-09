<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'subscription_id',
        'provider',
        'provider_payment_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'payment_date',
        'metadata'
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'metadata' => 'json',
    ];

    /**
     * Get the tenant that owns the payment.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the subscription that the payment belongs to.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}