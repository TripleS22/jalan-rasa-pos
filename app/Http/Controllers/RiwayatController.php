<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RiwayatController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::query()
            ->with('items.product', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->from, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->to, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->when($request->search, fn ($q, $search) => $q->where('order_no', 'like', "%{$search}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Riwayat/Index', [
            'orders' => $orders,
            'filters' => $request->only('status', 'from', 'to', 'search'),
        ]);
    }
}
