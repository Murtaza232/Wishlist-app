<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id'); // shop id
            $table->string('title')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_winners')->nullable();
            $table->decimal('voucher_amount', 10, 2)->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['session_id']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};


