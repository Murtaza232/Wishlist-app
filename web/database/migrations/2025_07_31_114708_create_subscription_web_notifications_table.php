<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubscriptionWebNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subscription_web_notifications', function (Blueprint $table) {
            $table->id();
            $table->integer('session_id')->nullable();
            $table->bigInteger('notification_id')->nullable();
            $table->string('notification_type')->nullable();
            $table->string('email_type')->nullable();
            $table->text('title')->nullable();
            $table->text('description')->nullable();
            $table->text('allowSectionData')->nullable();
            $table->longText('data')->nullable();
            $table->text('logo')->nullable();
            $table->boolean('active_status')->default(0)->nullable();
            $table->integer('priority')->nullable();
            $table->timestamps();
            $table->index('session_id');
            $table->index('notification_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('subscription_web_notifications');
    }
}
