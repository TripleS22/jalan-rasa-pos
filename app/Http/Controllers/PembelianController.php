<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\RawMaterial;
use App\Models\Supplier;
use App\Services\PurchaseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PembelianController extends Controller
{
    public function __construct(protected PurchaseService $purchases) {}

    public function index(Request $request)
    {
        $purchases = Purchase::query()
            ->with('items.purchasable', 'supplier', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Pembelian/Index', [
            'purchases' => $purchases,
            'suppliers' => Supplier::orderBy('name')->get(),
            'rawMaterials' => RawMaterial::orderBy('name')->get(['id', 'name', 'unit', 'cost_price']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'unit', 'cost_price']),
            'filters' => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'status' => ['nullable', 'in:pending,received,cancelled'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchasable_type' => ['required', 'in:raw_material,product'],
            'items.*.purchasable_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.expired_at' => ['nullable', 'date'],
        ]);

        $data['outlet_id'] = $request->user()->outlet_id ?? Outlet::first()?->id;

        $this->purchases->create($data, $request->user());

        return redirect()->route('pembelian.index')->with('success', 'Pembelian berhasil dicatat.');
    }

    public function update(Request $request, Purchase $pembelian)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,received,cancelled'],
        ]);

        if ($data['status'] === 'received') {
            $this->purchases->markReceived($pembelian);
        } else {
            $pembelian->update($data);
        }

        return redirect()->route('pembelian.index')->with('success', 'Status pembelian berhasil diperbarui.');
    }

    public function destroy(Purchase $pembelian)
    {
        $pembelian->delete();

        return redirect()->route('pembelian.index')->with('success', 'Pembelian berhasil dihapus.');
    }
}
