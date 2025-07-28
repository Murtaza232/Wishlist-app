<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWishlistIdToWishlistItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::table('wishlist_items', function (Blueprint $table) {
        $table->unsignedBigInteger('wishlist_id')->nullable()->after('id');
    });
}

public function down()
{
    Schema::table('wishlist_items', function (Blueprint $table) {
        $table->dropColumn('wishlist_id');
    });
}
}
