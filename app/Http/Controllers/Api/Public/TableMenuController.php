<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Table;
use App\Models\TableOrder;
use App\Services\TableOrderService;
use App\Support\MenuStock;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Unauthenticated endpoints hit by a customer's phone after scanning a
 * table's QR code. No Sanctum token: the table's own `code` is the access
 * key, so it never exposes anything beyond that table's outlet menu.
 */
class TableMenuController extends Controller
{
    public function __construct(protected TableOrderService $tableOrders) {}

    public function show(string $code)
    {
        $table = $this->findTable($code);

        $products = Product::query()
            ->with('category')
            ->withSum(['batches as available_stock' => fn ($q) => $q->where('outlet_id', $table->outlet_id)->active()], 'qty_remaining')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'table' => $table->only(['id', 'table_no', 'capacity', 'code']),
            'outlet' => $table->outlet->only(['id', 'name']),
            'products' => MenuStock::sortByAvailability($products),
        ]);
    }

    public function store(Request $request, string $code)
    {
        $table = $this->findTable($code);

        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'payment_method' => ['required', 'in:cash,qris,debit'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $tableOrder = $this->tableOrders->createFromTable($table, $data);

        return response()->json($tableOrder->load('items.product'), 201);
    }

    public function showOrder(string $code, TableOrder $tableOrder)
    {
        $table = $this->findTable($code);

        if ($tableOrder->table_id !== $table->id) {
            abort(404);
        }

        return response()->json($tableOrder->load('items.product', 'order'));
    }

    protected function findTable(string $code): Table
    {
        $table = Table::query()->where('code', $code)->where('is_active', true)->first();

        if (! $table) {
            throw ValidationException::withMessages([
                'code' => ['Meja tidak ditemukan atau tidak aktif.'],
            ]);
        }

        return $table;
    }
}
