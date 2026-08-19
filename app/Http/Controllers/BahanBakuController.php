<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BahanBakuController extends Controller
{
    public function index(Request $request)
    {
        $rawMaterials = RawMaterial::query()
            ->with('category')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->boolean('low_stock'), fn ($q) => $q->whereColumn('stock_qty', '<=', 'min_stock'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('BahanBaku/Index', [
            'rawMaterials' => $rawMaterials,
            'categories' => Category::where('type', 'raw_material')->orderBy('name')->get(),
            'filters' => $request->only('search', 'low_stock'),
        ]);
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

        RawMaterial::create($data);

        return redirect()->route('bahan-baku.index')->with('success', 'Bahan baku berhasil ditambahkan.');
    }

    public function update(Request $request, RawMaterial $bahanBaku)
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $bahanBaku->update($data);

        return redirect()->route('bahan-baku.index')->with('success', 'Bahan baku berhasil diperbarui.');
    }

    public function destroy(RawMaterial $bahanBaku)
    {
        $bahanBaku->delete();

        return redirect()->route('bahan-baku.index')->with('success', 'Bahan baku berhasil dihapus.');
    }
}
