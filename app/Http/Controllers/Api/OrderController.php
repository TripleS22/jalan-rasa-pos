<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(Request $request)
    {
        $orders = Order::query()
            ->with('customer', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->from, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->to, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->when($request->search, fn ($q, $search) => $q->where('order_no', 'like', "%{$search}%"))
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'order_type' => ['nullable', 'in:dine_in,takeaway'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'table_no' => ['nullable', 'string', 'max:50'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $data['outlet_id'] ??= $request->user()->outlet_id ?? Outlet::first()?->id;

        $order = $this->orderService->create($data, $request->user());

        return response()->json($order->load('items.product', 'customer'), 201);
    }

    public function show(Order $order)
    {
        return response()->json($order->load('items.product', 'customer', 'user'));
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,paid,cancelled'],
        ]);

        $order->update($data);

        OrderStatusUpdated::dispatch($order);

        return response()->json($order);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json(null, 204);
    }
}
