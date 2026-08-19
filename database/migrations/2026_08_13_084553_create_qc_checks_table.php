<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qc_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_id')->constrained()->restrictOnDelete();
            $table->foreignId('outlet_id')->constrained()->restrictOnDelete();
            $table->decimal('qty_checked', 12, 2);
            $table->decimal('qty_passed', 12, 2);
            $table->decimal('qty_rejected', 12, 2);
            $table->string('reject_reason')->nullable();
            $table->foreignId('pic_user_id')->constrained('users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qc_checks');
    }
};
