<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_batches', function (Blueprint $table) {
            $table->foreignId('outlet_id')->after('product_id')->constrained()->restrictOnDelete();
            $table->index(['outlet_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('product_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
