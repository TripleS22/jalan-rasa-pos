<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('table_orders', function (Blueprint $table) {
            $table->string('order_no')->nullable()->unique()->after('id');
            $table->string('payment_method')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('table_orders', function (Blueprint $table) {
            $table->dropColumn(['order_no', 'payment_method']);
        });
    }
};
