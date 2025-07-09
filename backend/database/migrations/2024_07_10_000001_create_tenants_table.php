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
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('subdomain')->unique();
            $table->string('logo_url')->nullable();
            $table->string('primary_color')->default('#f59e0b');
            $table->string('secondary_color')->default('#ea580c');
            $table->string('theme_mode')->default('dark');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('trial');
            $table->timestamp('trial_ends_at')->nullable();
            $table->uuid('subscription_id')->nullable();
            $table->string('subscription_status')->nullable();
            $table->string('subscription_plan')->nullable();
            $table->decimal('subscription_price', 10, 2)->nullable();
            $table->timestamp('next_payment_at')->nullable();
            $table->timestamp('last_payment_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};