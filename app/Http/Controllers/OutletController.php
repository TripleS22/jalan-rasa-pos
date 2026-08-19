<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OutletController extends Controller
{
    public function index(Request $request)
    {
        $outlets = Outlet::query()
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Outlet/Index', [
            'outlets' => $outlets,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:outlets,code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:kitchen,outlet'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        Outlet::create($data);

        return redirect()->route('outlet.index')->with('success', 'Outlet berhasil ditambahkan.');
    }

    public function update(Request $request, Outlet $outlet)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:outlets,code,'.$outlet->id],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:kitchen,outlet'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $outlet->update($data);

        return redirect()->route('outlet.index')->with('success', 'Outlet berhasil diperbarui.');
    }

    public function destroy(Outlet $outlet)
    {
        $outlet->delete();

        return redirect()->route('outlet.index')->with('success', 'Outlet berhasil dihapus.');
    }
}
