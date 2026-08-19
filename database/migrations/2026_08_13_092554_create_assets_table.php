<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('category', ['equipment', 'vehicle', 'furniture', 'building', 'other']);
            $table->date('purchase_date');
            $table->decimal('purchase_cost', 14, 2);
            $table->unsignedInteger('useful_life_months');
            $table->decimal('salvage_value', 14, 2)->default(0);
            $table->decimal('accumulated_depreciation', 14, 2)->default(0);
            $table->date('last_depreciated_at')->nullable();
            $table->enum('status', ['active', 'disposed'])->default('active');
            $table->date('disposed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
