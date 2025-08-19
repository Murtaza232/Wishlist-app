<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOnboardingFieldsToWishlistConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wishlist_configurations', function (Blueprint $table) {
            $table->boolean('onboarding_dismissed')->default(false)->after('wishlist_drawer_appearance');
            $table->json('onboarding_completed_steps')->nullable()->after('onboarding_dismissed');
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
            $table->dropColumn('onboarding_dismissed');
            $table->dropColumn('onboarding_completed_steps');
        });
    }
}


