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
        Schema::create('language_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id');
            $table->string('language_name');
            $table->json('language_data');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_custom')->default(false);
            $table->timestamps();
            
            // Ensure unique combination of shop and language
            $table->unique(['shop_id', 'language_name']);
            
            // Add foreign key constraint
            $table->foreign('shop_id')->references('id')->on('sessions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('language_settings');
    }
}; 