<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prepaid_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('amount', 14, 2);
            $table->date('start_date');
            $table->unsignedInteger('months');
            $table->decimal('amortized_amount', 14, 2)->default(0);
            $table->date('last_amortized_at')->nullable();
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prepaid_expenses');
    }
};
