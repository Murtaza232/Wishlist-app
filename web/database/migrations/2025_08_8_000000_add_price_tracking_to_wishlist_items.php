<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPriceTrackingToWishlistItems extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wishlist_items', function (Blueprint $table) {
            $table->decimal('added_price', 10, 2)->nullable()->after('product_id');
            $table->decimal('current_price', 10, 2)->nullable()->after('added_price');
            $table->timestamp('price_checked_at')->nullable()->after('current_price');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('wishlist_items', function (Blueprint $table) {
            $table->dropColumn(['added_price', 'current_price', 'price_checked_at']);
        });
    }
} 