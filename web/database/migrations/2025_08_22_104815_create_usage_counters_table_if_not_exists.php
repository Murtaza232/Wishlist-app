<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsageCountersTableIfNotExists extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('usage_counters')) {
            Schema::create('usage_counters', function (Blueprint $table) {
                $table->id();
                $table->string('shop'); // myshop.myshopify.com
                $table->string('scope')->default('month'); // 'month' | 'lifetime'
                $table->string('period_key')->nullable(); // e.g., '2025-08' for monthly; null for lifetime
                $table->unsignedBigInteger('count')->default(0);
                $table->string('plan_slug')->nullable(); // free, pro, premium
                $table->unsignedInteger('limit_snapshot')->nullable(); // store limit used for this counter
                $table->timestamps();
                $table->unique(['shop', 'scope', 'period_key']);
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('usage_counters');
    }
}
