<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterWishlistConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wishlist_configurations', function (Blueprint $table) {
            $table->string('floating_btn_primary_color')->nullable();
            $table->string('floating_btn_secondary_color')->nullable();
            $table->integer('floating_btn_corner_radius')->nullable();
            $table->string('text_color')->nullable();
            $table->enum('wishlist_drawer_appearance',['left','right'])->nullable();
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
            $table->dropColumn('floating_btn_primary_color');
            $table->dropColumn('floating_btn_secondary_color');
            $table->dropColumn('floating_btn_corner_radius');
            $table->dropColumn('text_color');
            $table->dropColumn('wishlist_drawer_appearance');
        });
    }
}
