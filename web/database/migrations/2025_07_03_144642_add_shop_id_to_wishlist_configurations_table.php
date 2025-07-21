<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddShopIdToWishlistConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::table('wishlist_configurations', function (Blueprint $table) {
        $table->unsignedBigInteger('shop_id')->after('id');
        $table->foreign('shop_id')->references('id')->on('sessions')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
{
    Schema::table('wishlist_configurations', function (Blueprint $table) {
        $table->dropForeign(['shop_id']);
        $table->dropColumn('shop_id');
    });
}
}
