<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Production;
use App\Services\ProductionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProduksiController extends Controller
{
    public function __construct(protected ProductionService $productions) {}

    public function index(Request $request)
    {
        $productions = Production::query()
            ->with('product', 'user', 'qcCheck')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Produksi/Index', [
            'productions' => $productions,
            'products' => Product::where('sourcing_type', 'made')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'shelf_life_days']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'produced_at' => ['required', 'date'],
            'expired_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['outlet_id'] = $request->user()->outlet_id ?? Outlet::first()?->id;

        $this->productions->create($data, $request->user());

        return redirect()->route('produksi.index')->with('success', 'Produksi berhasil dicatat.');
    }
}
