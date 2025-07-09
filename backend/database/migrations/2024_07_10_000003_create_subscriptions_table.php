<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('provider');
            $table->string('provider_subscription_id')->nullable();
            $table->string('status');
            $table->string('plan');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('BRL');
            $table->string('billing_cycle')->default('monthly');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('next_billing_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};