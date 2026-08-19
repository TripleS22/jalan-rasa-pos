<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('order_type', ['dine_in', 'takeaway'])->default('dine_in')->after('customer_id');
            $table->string('customer_name')->nullable()->after('order_type');
            $table->string('table_no')->nullable()->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_type', 'customer_name', 'table_no']);
        });
    }
};
