<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Purchase;
use App\Services\PurchaseService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(protected PurchaseService $purchases) {}

    public function index(Request $request)
    {
        $purchases = Purchase::query()
            ->with('supplier', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'status' => ['nullable', 'in:pending,received,cancelled'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchasable_type' => ['required', 'in:raw_material,product'],
            'items.*.purchasable_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.expired_at' => ['nullable', 'date'],
        ]);

        $data['outlet_id'] ??= $request->user()->outlet_id ?? Outlet::first()?->id;

        $purchase = $this->purchases->create($data, $request->user());

        return response()->json($purchase->load('items.purchasable', 'supplier'), 201);
    }

    public function show(Purchase $purchase)
    {
        return response()->json($purchase->load('items.purchasable', 'supplier', 'user'));
    }

    public function update(Request $request, Purchase $purchase)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,received,cancelled'],
        ]);

        if ($purchase->status !== 'received' && $data['status'] === 'received') {
            $purchase = $this->purchases->markReceived($purchase);

            return response()->json($purchase);
        }

        $purchase->update($data);

        return response()->json($purchase);
    }

    public function destroy(Purchase $purchase)
    {
        $purchase->delete();

        return response()->json(null, 204);
    }
}
