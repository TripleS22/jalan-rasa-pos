<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\PreOrder;
use App\Services\PreOrderService;
use Illuminate\Http\Request;

class PreOrderController extends Controller
{
    public function __construct(protected PreOrderService $preOrders) {}

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'pickup_date' => ['required', 'date'],
            'down_payment' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $data['outlet_id'] = $request->user()->outlet_id ?? Outlet::first()?->id;

        $this->preOrders->create($data, $request->user());

        return redirect()->route('kasir.index')->with('success', 'Pre-order berhasil dicatat.');
    }

    public function update(Request $request, PreOrder $preOrder)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,ready,completed,cancelled'],
        ]);

        $this->preOrders->updateStatus($preOrder, $data['status'], $request->user());

        return redirect()->route('kasir.index')->with('success', 'Status pre-order berhasil diperbarui.');
    }

    public function destroy(PreOrder $preOrder)
    {
        $preOrder->delete();

        return redirect()->route('kasir.index')->with('success', 'Pre-order berhasil dihapus.');
    }
}
