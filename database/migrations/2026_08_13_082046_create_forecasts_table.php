<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forecasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->restrictOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pic_user_id')->constrained('users')->restrictOnDelete();
            $table->string('week_label');
            $table->date('forecast_date');
            $table->decimal('forecast_qty', 12, 2);
            $table->decimal('po_qty', 12, 2)->nullable();
            $table->unsignedInteger('lead_time_days')->nullable();
            $table->enum('status', ['on_time', 'exception'])->nullable();
            $table->string('exception_reason')->nullable();
            $table->foreignId('exception_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('purchase_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forecasts');
    }
};
