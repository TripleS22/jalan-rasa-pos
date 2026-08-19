<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Production;
use App\Services\ProductionService;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function __construct(protected ProductionService $productions) {}

    public function index(Request $request)
    {
        $productions = Production::query()
            ->with('product', 'user')
            ->when($request->product_id, fn ($q, $productId) => $q->where('product_id', $productId))
            ->latest()
            ->paginate(20);

        return response()->json($productions);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'product_id' => ['required', 'exists:products,id'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'produced_at' => ['required', 'date'],
            'expired_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['outlet_id'] ??= $request->user()->outlet_id ?? Outlet::first()?->id;

        $production = $this->productions->create($data, $request->user());

        return response()->json($production->load('product'), 201);
    }
}
