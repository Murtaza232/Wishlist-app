<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterWishlistConfigurations extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wishlist_configurations', function (Blueprint $table) {
            $table->integer('button_size_product_page')->nullable();
            $table->integer('icon_thickness_product_page')->nullable();
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
            $table->dropColumn('button_size_product_page');
            $table->dropColumn('icon_thickness_product_page');
        });
    }
}
