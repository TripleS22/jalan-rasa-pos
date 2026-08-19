<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('batch_no')->unique();
            $table->enum('source_type', ['production', 'purchase', 'return']);
            $table->unsignedBigInteger('source_id')->nullable();
            $table->decimal('qty_initial', 12, 2);
            $table->decimal('qty_remaining', 12, 2);
            $table->date('produced_at');
            $table->date('expired_at')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'expired_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_batches');
    }
};
