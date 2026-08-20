<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MejaController extends Controller
{
    public function index(Request $request)
    {
        $tables = Table::query()
            ->with('outlet')
            ->when($request->outlet_id, fn ($q, $outletId) => $q->where('outlet_id', $outletId))
            ->when($request->search, fn ($q, $search) => $q->where('table_no', 'like', "%{$search}%"))
            ->orderBy('outlet_id')
            ->orderBy('table_no')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Meja/Index', [
            'tables' => $tables,
            'outlets' => Outlet::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('search', 'outlet_id'),
            'selfOrderBaseUrl' => rtrim(config('app.self_order_url'), '/'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['required', 'exists:outlets,id'],
            'table_no' => [
                'required', 'string', 'max:50',
                Rule::unique('tables')->where(fn ($q) => $q->where('outlet_id', $request->outlet_id)),
            ],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        $data['code'] = $this->generateUniqueCode();

        Table::create($data);

        return redirect()->route('meja.index')->with('success', 'Meja berhasil ditambahkan.');
    }

    public function update(Request $request, Table $meja)
    {
        $data = $request->validate([
            'outlet_id' => ['required', 'exists:outlets,id'],
            'table_no' => [
                'required', 'string', 'max:50',
                Rule::unique('tables')->where(fn ($q) => $q->where('outlet_id', $request->outlet_id))->ignore($meja->id),
            ],
            'capacity' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        $meja->update($data);

        return redirect()->route('meja.index')->with('success', 'Meja berhasil diperbarui.');
    }

    public function destroy(Table $meja)
    {
        $meja->delete();

        return redirect()->route('meja.index')->with('success', 'Meja berhasil dihapus.');
    }

    public function regenerateCode(Table $meja)
    {
        $meja->update(['code' => $this->generateUniqueCode()]);

        return redirect()->route('meja.index')->with('success', 'Kode QR meja berhasil diperbarui. QR lama tidak berlaku lagi.');
    }

    protected function generateUniqueCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (Table::where('code', $code)->exists());

        return $code;
    }
}
