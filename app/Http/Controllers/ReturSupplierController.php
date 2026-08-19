<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\SupplierReturn;
use App\Services\SupplierReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReturSupplierController extends Controller
{
    public function __construct(protected SupplierReturnService $returns) {}

    public function index(Request $request)
    {
        $returns = SupplierReturn::query()
            ->with('purchase.supplier', 'purchasable', 'user')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('ReturSupplier/Index', [
            'returns' => $returns,
            'purchases' => Purchase::where('status', 'received')
                ->with('items.purchasable', 'supplier')
                ->latest()
                ->limit(50)
                ->get(['id', 'invoice_no', 'supplier_id', 'created_at']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'purchase_item_id' => ['required', 'exists:purchase_items,id'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->returns->create($data, $request->user());

        return redirect()->route('retur-supplier.index')->with('success', 'Retur supplier berhasil dicatat.');
    }
}
