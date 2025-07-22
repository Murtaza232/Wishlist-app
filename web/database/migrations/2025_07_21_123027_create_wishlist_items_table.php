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
        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id'); // To know which store the item belongs to
            $table->unsignedBigInteger('customer_id'); // The Shopify Customer ID
            $table->unsignedBigInteger('product_id'); // The Shopify Product ID
            $table->timestamps();

            // Optional: prevent duplicate entries
            $table->unique(['shop_id', 'customer_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wishlist_items');
    }
};
