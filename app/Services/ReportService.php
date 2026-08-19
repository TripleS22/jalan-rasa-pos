<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\RawMaterial;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function sales(string $from, string $to): array
    {
        $query = Order::where('status', 'paid')
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to);

        $summary = [
            'from' => $from,
            'to' => $to,
            'total_transactions' => (clone $query)->count(),
            'total_omzet' => (clone $query)->sum('total'),
            'total_discount' => (clone $query)->sum('discount'),
        ];

        $daily = (clone $query)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as transactions, SUM(total) as omzet')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return ['summary' => $summary, 'daily' => $daily];
    }

    public function profitLoss(string $from, string $to): array
    {
        $orderIds = Order::where('status', 'paid')
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->pluck('id');

        $omzet = Order::whereIn('id', $orderIds)->sum('total');

        $hpp = OrderItem::whereIn('order_id', $orderIds)
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->sum(DB::raw('order_items.qty * products.cost_price'));

        $expenses = Expense::whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->sum('amount');

        $grossProfit = $omzet - $hpp;
        $netProfit = $grossProfit - $expenses;

        return [
            'from' => $from,
            'to' => $to,
            'omzet' => $omzet,
            'hpp' => $hpp,
            'gross_profit' => $grossProfit,
            'expenses' => $expenses,
            'net_profit' => $netProfit,
        ];
    }

    public function topProducts(string $from, string $to, int $limit = 10)
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.status', 'paid')
            ->whereDate('orders.created_at', '>=', $from)
            ->whereDate('orders.created_at', '<=', $to)
            ->selectRaw('products.id, products.name, SUM(order_items.qty) as qty_sold, SUM(order_items.subtotal) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('qty_sold')
            ->limit($limit)
            ->get();
    }

    public function lowStock()
    {
        return RawMaterial::whereColumn('stock_qty', '<=', 'min_stock')
            ->orderBy('stock_qty')
            ->get();
    }

    /**
     * Produk aktif yang tidak terjual sama sekali pada rentang tanggal tertentu.
     */
    public function unsoldProducts(string $from, string $to)
    {
        $soldProductIds = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', 'paid')
            ->whereDate('orders.created_at', '>=', $from)
            ->whereDate('orders.created_at', '<=', $to)
            ->pluck('order_items.product_id');

        return Product::with('category')
            ->where('is_active', true)
            ->whereNotIn('id', $soldProductIds)
            ->orderBy('name')
            ->get();
    }

    public function expiringSoonBatches(int $days = 7)
    {
        return ProductBatch::with('product')
            ->expiringSoon($days)
            ->orderBy('expired_at')
            ->get();
    }
}
