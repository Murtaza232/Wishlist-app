<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id'); // references sessions.id
            $table->unsignedBigInteger('plan_id'); // references pricing_plans.id
            $table->enum('billing_period', ['monthly', 'annual']);
            $table->string('status')->default('pending');
            $table->string('currency', 10)->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('shopify_charge_id')->nullable(); // monthly RAC id
            $table->string('shopify_subscription_id')->nullable(); // annual AppSubscription id (gid)
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index('shop_id');
            $table->index('plan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
