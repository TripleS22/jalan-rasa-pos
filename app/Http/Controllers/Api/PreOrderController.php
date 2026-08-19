<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\PreOrder;
use App\Services\PreOrderService;
use Illuminate\Http\Request;

class PreOrderController extends Controller
{
    public function __construct(protected PreOrderService $preOrders) {}

    public function index(Request $request)
    {
        $preOrders = PreOrder::query()
            ->with('customer', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($preOrders);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'pickup_date' => ['required', 'date'],
            'down_payment' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $data['outlet_id'] ??= $request->user()->outlet_id ?? Outlet::first()?->id;

        $preOrder = $this->preOrders->create($data, $request->user());

        return response()->json($preOrder->load('items.product', 'customer'), 201);
    }

    public function show(PreOrder $preOrder)
    {
        return response()->json($preOrder->load('items.product', 'customer', 'user'));
    }

    public function update(Request $request, PreOrder $preOrder)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,ready,completed,cancelled'],
        ]);

        $preOrder = $this->preOrders->updateStatus($preOrder, $data['status'], $request->user());

        return response()->json($preOrder);
    }

    public function destroy(PreOrder $preOrder)
    {
        $preOrder->delete();

        return response()->json(null, 204);
    }
}
