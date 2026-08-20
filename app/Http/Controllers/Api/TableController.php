<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $tables = Table::query()
            ->with('outlet')
            ->when($request->outlet_id, fn ($q, $outletId) => $q->where('outlet_id', $outletId))
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('table_no')
            ->paginate(20);

        return response()->json($tables);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'table_no' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        $data['outlet_id'] ??= $request->user()->outlet_id ?? Outlet::first()?->id;
        $data['code'] = $this->generateUniqueCode();

        $table = Table::create($data);

        return response()->json($table->load('outlet'), 201);
    }

    public function show(Table $table)
    {
        return response()->json($table->load('outlet'));
    }

    public function update(Request $request, Table $table)
    {
        $data = $request->validate([
            'table_no' => ['sometimes', 'string', 'max:50'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        $table->update($data);

        return response()->json($table);
    }

    public function destroy(Table $table)
    {
        $table->delete();

        return response()->json(null, 204);
    }

    /**
     * Regenerate the table's barcode/QR code, invalidating the old one.
     */
    public function regenerateCode(Table $table)
    {
        $table->update(['code' => $this->generateUniqueCode()]);

        return response()->json($table);
    }

    /**
     * The self-order URL this table's QR code should encode. Clients (web,
     * mobile) render the actual QR image themselves — no server-side image
     * generation, so no PHP QR library dependency.
     */
    public function qr(Table $table)
    {
        return response()->json([
            'url' => rtrim(config('app.self_order_url'), '/')."/{$table->code}",
        ]);
    }

    protected function generateUniqueCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (Table::where('code', $code)->exists());

        return $code;
    }
}
