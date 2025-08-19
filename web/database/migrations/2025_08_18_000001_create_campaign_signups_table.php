<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('campaign_signups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campaign_id');
            $table->unsignedBigInteger('session_id');
            $table->string('email')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('source')->nullable(); // widget/button id
            $table->timestamps();

            $table->index(['campaign_id']);
            $table->index(['session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_signups');
    }
};


