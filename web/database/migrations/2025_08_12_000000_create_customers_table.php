<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id');
            $table->string('shopify_customer_id');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('country')->nullable();
            $table->string('zip')->nullable();
            $table->decimal('total_spent', 10, 2)->default(0.00);
            $table->integer('orders_count')->default(0);
            $table->string('status')->default('active');
            // $table->timestamp('last_order_date')->nullable();
            $table->timestamp('created_at_shopify')->nullable();
            $table->timestamps();
            
            $table->foreign('shop_id')->references('id')->on('sessions')->onDelete('cascade');
            $table->index(['shop_id', 'email']);
            $table->unique(['shop_id', 'shopify_customer_id']);
            $table->unique(['shop_id', 'email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customers');
    }
}; 