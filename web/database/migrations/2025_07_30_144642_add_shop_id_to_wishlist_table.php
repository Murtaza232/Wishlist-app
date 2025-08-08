<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddShopIdToWishlistTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::table('wishlists', function (Blueprint $table) {
        $table->unsignedBigInteger('shop_id')->nullable();
       
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
{
    Schema::table('wishlists', function (Blueprint $table) {
       
        $table->dropColumn('shop_id');
    });
}
}
