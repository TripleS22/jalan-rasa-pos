<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->withSum(['batches as available_stock' => fn ($q) => $q->active()], 'qty_remaining')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->category_id, fn ($q, $categoryId) => $q->where('category_id', $categoryId))
            ->where('is_active', true)
            ->orderBy('name')
            ->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'sourcing_type' => ['required', 'in:made,resell'],
            'shelf_life_days' => ['nullable', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'unique:products,sku'],
            'unit' => ['required', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category', 'recipes.rawMaterial', 'batches'));
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'sourcing_type' => ['sometimes', 'in:made,resell'],
            'shelf_life_days' => ['nullable', 'integer', 'min:1'],
            'name' => ['sometimes', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'unique:products,sku,'.$product->id],
            'unit' => ['sometimes', 'string', 'max:50'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        $product->update($data);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(null, 204);
    }
}
