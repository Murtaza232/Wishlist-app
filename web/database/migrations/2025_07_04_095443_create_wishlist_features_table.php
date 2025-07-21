<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWishlistFeaturesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wishlist_features', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id');
            $table->boolean('allow_multiple_items_wishlist')->nullable();
            $table->boolean('allow_to_share_wishlist')->nullable();
            $table->boolean('allow_to_smart_save')->nullable();
            $table->integer('smart_save_visit_count')->nullable();
            $table->enum('smart_save_notification_position', ['top_left', 'top_right', 'bottom_left', 'bottom_right'])->nullable();
            // Acknowledgements
            $table->boolean('sign_up_confirmation')->nullable();
            $table->boolean('sign_up_confirmation_email')->nullable();
            $table->boolean('sign_up_confirmation_sms')->nullable();
            $table->boolean('item_added')->nullable();
            $table->boolean('item_added_email')->nullable();
            $table->boolean('item_added_sms')->nullable();
            $table->boolean('wishlist_shared')->nullable();
            $table->boolean('wishlist_shared_email')->nullable();
            // Reminders
            $table->boolean('wishlist_reminder')->nullable();
            $table->boolean('wishlist_reminder_email')->nullable();
            $table->boolean('wishlist_reminder_sms')->nullable();
            $table->integer('wishlist_reminder_time')->nullable();
            $table->string('wishlist_reminder_unit')->nullable();
            $table->boolean('saved_for_later_reminder')->nullable();
            $table->boolean('saved_for_later_reminder_email')->nullable();
            $table->boolean('saved_for_later_reminder_sms')->nullable();
            $table->integer('saved_for_later_reminder_time')->nullable();
            $table->string('saved_for_later_reminder_unit')->nullable();
            // Alerts & Triggers
            $table->boolean('low_stock_alert')->nullable();
            $table->boolean('low_stock_alert_email')->nullable();
            $table->boolean('low_stock_alert_sms')->nullable();
            $table->integer('stock_alert_threshold_units')->nullable();
            $table->boolean('price_drop_alert')->nullable();
            $table->boolean('price_drop_alert_email')->nullable();
            $table->boolean('price_drop_alert_sms')->nullable();
            $table->integer('price_drop_alert_threshold_percent')->nullable();
            $table->boolean('back_in_stock_alert')->nullable();
            $table->boolean('back_in_stock_alert_email')->nullable();
            $table->boolean('back_in_stock_alert_sms')->nullable();
            $table->timestamps();
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
        Schema::dropIfExists('wishlist_features');
    }
}
