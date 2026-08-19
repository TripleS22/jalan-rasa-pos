<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawMaterial;
use Illuminate\Http\Request;

class RawMaterialController extends Controller
{
    public function index(Request $request)
    {
        $rawMaterials = RawMaterial::query()
            ->with('category')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->boolean('low_stock'), fn ($q) => $q->whereColumn('stock_qty', '<=', 'min_stock'))
            ->orderBy('name')
            ->paginate(20);

        return response()->json($rawMaterials);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'stock_qty' => ['nullable', 'numeric', 'min:0'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $rawMaterial = RawMaterial::create($data);

        return response()->json($rawMaterial, 201);
    }

    public function show(RawMaterial $rawMaterial)
    {
        return response()->json($rawMaterial->load('category'));
    }

    public function update(Request $request, RawMaterial $rawMaterial)
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $rawMaterial->update($data);

        return response()->json($rawMaterial);
    }

    public function destroy(RawMaterial $rawMaterial)
    {
        $rawMaterial->delete();

        return response()->json(null, 204);
    }
}
