<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frequently_wishlisted_alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->boolean('active_status')->default(false);
            $table->unsignedInteger('threshold')->default(5); // min wishes per product to be considered trending
            $table->timestamp('last_run_at')->nullable();
            $table->timestamps();
            $table->index('session_id');
        });

        Schema::create('frequently_wishlisted_alert_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('customer_id'); // shopify_customer_id from customers table
            $table->unsignedBigInteger('product_id');  // shopify_product_id
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'customer_id']);
            $table->index(['session_id', 'product_id']);
            $table->unique(['session_id', 'customer_id', 'product_id'], 'uq_fw_alert_once');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frequently_wishlisted_alert_logs');
        Schema::dropIfExists('frequently_wishlisted_alerts');
    }
};


