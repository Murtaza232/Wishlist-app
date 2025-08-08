<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddInputFieldsToSubscriptionWebNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('subscription_web_notifications', function (Blueprint $table) {
            // Wishlist Reminder fields
            $table->string('reminder_value')->default('0')->nullable();
            $table->string('reminder_time_unit')->default('hours')->nullable();
            
            // Saved for Later Reminder fields
            $table->string('saved_for_later_value')->default('0')->nullable();
            $table->string('saved_for_later_time_unit')->default('hours')->nullable();
            
            // Low Stock Alert fields
            $table->string('low_stock_value')->default('0')->nullable();
            
            // Price Drop Alert fields
            $table->string('price_drop_value')->default('0')->nullable();
        });

        // Migrate existing data from JSON field to new columns
        $this->migrateExistingData();
    }

    /**
     * Migrate existing data from JSON data field to new columns
     */
    private function migrateExistingData()
    {
        $notifications = \DB::table('subscription_web_notifications')->get();
        
        foreach ($notifications as $notification) {
            $updates = [];
            
            if ($notification->data) {
                try {
                    $data = json_decode($notification->data, true);
                    
                    if ($notification->title === "Wishlist Reminder") {
                        if (isset($data['reminder_value'])) {
                            $updates['reminder_value'] = $data['reminder_value'];
                        }
                        if (isset($data['reminder_time_unit'])) {
                            $updates['reminder_time_unit'] = $data['reminder_time_unit'];
                        }
                    } elseif ($notification->title === "Send reminders on Items Saved for Later") {
                        if (isset($data['saved_for_later_value'])) {
                            $updates['saved_for_later_value'] = $data['saved_for_later_value'];
                        }
                        if (isset($data['saved_for_later_time_unit'])) {
                            $updates['saved_for_later_time_unit'] = $data['saved_for_later_time_unit'];
                        }
                    } elseif ($notification->title === "Send low stock Alerts") {
                        if (isset($data['low_stock_value'])) {
                            $updates['low_stock_value'] = $data['low_stock_value'];
                        }
                    } elseif ($notification->title === "Send Price Drop alert") {
                        if (isset($data['price_drop_value'])) {
                            $updates['price_drop_value'] = $data['price_drop_value'];
                        }
                    }
                } catch (\Exception $e) {
                    // Skip if JSON parsing fails
                    continue;
                }
            }
            
            if (!empty($updates)) {
                \DB::table('subscription_web_notifications')
                    ->where('id', $notification->id)
                    ->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('subscription_web_notifications', function (Blueprint $table) {
            $table->dropColumn([
                'reminder_value',
                'reminder_time_unit',
                'saved_for_later_value',
                'saved_for_later_time_unit',
                'low_stock_value',
                'price_drop_value'
            ]);
        });
    }
}
