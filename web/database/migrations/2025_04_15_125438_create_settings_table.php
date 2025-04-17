<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('shop_id')->nullable();
            $table->string('type')->nullable();
            $table->longText('magic_api_key')->nullable();
            $table->longText('deepface_api_key')->nullable();
            $table->longText('letsenhance_api_key')->nullable();
            $table->longText('smtp_host')->nullable();
            $table->longText('smtp_username')->nullable();
            $table->longText('smtp_password')->nullable();
            $table->longText('email_from')->nullable();
            $table->longText('from_name')->nullable();
            $table->longText('reply_to')->nullable();
            $table->longText('smtp_type')->nullable();
            $table->longText('smtp_port')->nullable();
            $table->longText('subject')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('settings');
    }
}
