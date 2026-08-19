<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class OutletController extends Controller
{
    public function index(Request $request)
    {
        $outlets = Outlet::query()
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20);

        return response()->json($outlets);
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

        $outlet = Outlet::create($data);

        return response()->json($outlet, 201);
    }

    public function show(Outlet $outlet)
    {
        return response()->json($outlet);
    }

    public function update(Request $request, Outlet $outlet)
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:20', 'unique:outlets,code,'.$outlet->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:kitchen,outlet'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $outlet->update($data);

        return response()->json($outlet);
    }

    public function destroy(Outlet $outlet)
    {
        $outlet->delete();

        return response()->json(null, 204);
    }
}
