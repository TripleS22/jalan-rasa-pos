<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('sourcing_type', ['made', 'resell'])->default('made')->after('category_id');
            $table->unsignedInteger('shelf_life_days')->nullable()->after('sourcing_type');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sourcing_type', 'shelf_life_days']);
        });
    }
};
