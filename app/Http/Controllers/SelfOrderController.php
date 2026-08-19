<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Table;
use App\Models\TableOrder;
use App\Services\TableOrderService;
use App\Support\MenuStock;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Public, guest-facing page a customer lands on after scanning a table's QR
 * code. No auth: the table's `code` is the access key.
 */
class SelfOrderController extends Controller
{
    public function __construct(protected TableOrderService $tableOrders) {}

    public function show(Request $request, string $code)
    {
        $table = $this->findTable($code);

        if (! $table) {
            return Inertia::render('SelfOrder/Show', ['table' => null]);
        }

        $products = Product::query()
            ->with('category')
            ->withSum(['batches as available_stock' => fn ($q) => $q->where('outlet_id', $table->outlet_id)->active()], 'qty_remaining')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Riwayat pesanan meja ini hari ini — bukan cuma pesanan yang baru
        // saja dikirim, biar semua orang di meja itu lihat tab bersama.
        $orders = TableOrder::query()
            ->where('table_id', $table->id)
            ->whereDate('created_at', today())
            ->with('items.product')
            ->latest()
            ->get();

        return Inertia::render('SelfOrder/Show', [
            'table' => $table->only(['id', 'table_no', 'capacity', 'code']),
            'outlet' => $table->outlet->only(['id', 'name']),
            'products' => MenuStock::sortByAvailability($products),
            'orders' => $orders,
            'highlightOrderId' => $request->integer('order') ?: null,
        ]);
    }

    /**
     * Full order history for this table today — split out from show() so
     * the ordering page doesn't grow endlessly once a table has racked up
     * several rounds of orders.
     */
    public function history(string $code)
    {
        $table = $this->findTable($code);

        if (! $table) {
            abort(404);
        }

        $orders = TableOrder::query()
            ->where('table_id', $table->id)
            ->whereDate('created_at', today())
            ->with('items.product')
            ->latest()
            ->get();

        return Inertia::render('SelfOrder/History', [
            'table' => $table->only(['id', 'table_no', 'capacity', 'code']),
            'outlet' => $table->outlet->only(['id', 'name']),
            'orders' => $orders,
        ]);
    }

    public function store(Request $request, string $code)
    {
        $table = $this->findTable($code);

        if (! $table) {
            abort(404);
        }

        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'payment_method' => ['required', 'in:cash,qris,debit'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $tableOrder = $this->tableOrders->createFromTable($table, $data);

        return redirect()
            ->route('self-order.show', ['code' => $code, 'order' => $tableOrder->id])
            ->with('success', 'Pesanan terkirim! Menunggu konfirmasi dari kasir.');
    }

    /**
     * Printable invoice for a customer's own self-order (opened in a new
     * tab from the order-confirmation card).
     */
    public function invoice(string $code, TableOrder $tableOrder)
    {
        $table = $this->findTable($code);

        if (! $table || $tableOrder->table_id !== $table->id) {
            abort(404);
        }

        $tableOrder->load('items.product', 'table.outlet');

        return view('table-orders.invoice', ['tableOrder' => $tableOrder]);
    }

    protected function findTable(string $code): ?Table
    {
        return Table::query()->where('code', $code)->where('is_active', true)->with('outlet')->first();
    }
}
