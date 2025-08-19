<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_providers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->string('email_provider')->nullable();
            $table->string('sms_provider')->nullable();
            $table->longText('provider_settings')->nullable();
            $table->timestamps();
            $table->unique('session_id');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_providers');
    }
}; 