<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPriceFieldsToProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->after('stock');
            $table->decimal('old_price', 10, 2)->nullable()->after('price');
            $table->decimal('compare_at_price', 10, 2)->nullable()->after('old_price');
            $table->timestamp('last_price_check')->nullable()->after('compare_at_price');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['price', 'old_price', 'compare_at_price', 'last_price_check']);
        });
    }
} 