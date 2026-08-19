<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->withSum(['batches as available_stock' => fn ($q) => $q->active()], 'qty_remaining')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Produk/Index', [
            'products' => $products,
            'categories' => Category::where('type', 'product')->orderBy('name')->get(),
            'filters' => $request->only('search'),
        ]);
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

        Product::create($data);

        return redirect()->route('produk.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $produk)
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'sourcing_type' => ['required', 'in:made,resell'],
            'shelf_life_days' => ['nullable', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'unique:products,sku,'.$produk->id],
            'unit' => ['required', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
        ]);

        $produk->update($data);

        return redirect()->route('produk.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $produk)
    {
        $produk->delete();

        return redirect()->route('produk.index')->with('success', 'Produk berhasil dihapus.');
    }
}
