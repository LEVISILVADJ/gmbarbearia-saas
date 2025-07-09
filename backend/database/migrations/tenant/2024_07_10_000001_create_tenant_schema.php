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
        // Barbers table
        Schema::create('barbers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('photo_url')->nullable();
            $table->json('specialties')->nullable();
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->integer('experience_years')->default(0);
            $table->boolean('is_active')->default(true);
            $table->uuid('user_id')->nullable();
            $table->timestamps();
        });

        // Services table
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('duration_minutes');
            $table->string('icon')->default('✂️');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Clients table
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->date('birth_date')->nullable();
            $table->date('last_visit_date')->nullable();
            $table->timestamps();
        });

        // Bookings table
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('client_id')->nullable();
            $table->uuid('barber_id')->nullable();
            $table->uuid('service_id')->nullable();
            $table->date('booking_date');
            $table->time('booking_time');
            $table->string('status')->default('agendado');
            $table->decimal('total_price', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('barber_id')->references('id')->on('barbers')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // Business settings table
        Schema::create('business_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('business_name')->default('GM Barbearia');
            $table->string('phone')->default('(11) 99999-9999');
            $table->string('email')->default('contato@gmbarbearia.com');
            $table->text('address')->default('Rua das Flores, 123 - Centro, São Paulo - SP');
            $table->text('description')->nullable();
            $table->text('footer_address')->nullable();
            $table->json('opening_hours')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('whatsapp_api_key')->nullable();
            $table->string('whatsapp_phone_number')->nullable();
            $table->boolean('whatsapp_enabled')->default(false);
            $table->string('primary_color')->default('#f59e0b');
            $table->string('secondary_color')->default('#ea580c');
            $table->string('theme_mode')->default('dark');
            $table->timestamps();
        });

        // Slideshow images table
        Schema::create('slideshow_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('image_url');
            $table->string('alt_text')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Gallery images table
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('image_url');
            $table->string('alt_text')->nullable();
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Birthday messages table
        Schema::create('birthday_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('message_template');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Retention messages table
        Schema::create('retention_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('message_template');
            $table->integer('days_inactive')->default(60);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retention_messages');
        Schema::dropIfExists('birthday_messages');
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('slideshow_images');
        Schema::dropIfExists('business_settings');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('services');
        Schema::dropIfExists('barbers');
    }
};