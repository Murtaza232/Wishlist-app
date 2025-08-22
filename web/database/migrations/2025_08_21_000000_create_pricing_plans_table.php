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
        Schema::create('pricing_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Pro, Premium, Enterprise
            $table->string('slug')->unique(); // pro, premium, enterprise
            $table->text('description');
            $table->decimal('monthly_price', 10, 2)->nullable(); // NULL for custom pricing
            $table->decimal('annual_price', 10, 2)->nullable(); // NULL for custom pricing
            $table->string('currency', 3)->default('USD');
            $table->string('usage_limit');
            $table->json('features'); // Store features as JSON array
            $table->string('badge')->nullable(); // "Best Match", etc.
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_plans');
    }
};
