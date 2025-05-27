<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('balance', 10, 2)->default(0.00);
            $table->string('card_number', 20); // Max 20 characters for card number
            $table->tinyInteger('exp_month'); // 1-12
            $table->tinyInteger('exp_year'); // Last two digits of year, e.g., 25 for 2025
            $table->string('cvv', 4)->nullable(); // CVV can be 3 or 4 digits
            $table->string('card_holder', 50);
            $table->foreignId('card_type_id')->constrained('card_types')->onDelete('cascade');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};

