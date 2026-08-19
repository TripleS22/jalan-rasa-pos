<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\PreOrder;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\Table;
use App\Models\TableOrder;
use App\Services\OrderService;
use App\Support\MenuStock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    /**
     * Satu layar kasir dengan tab: POS, Pesanan Meja (QR), Reservasi, Pre-Order.
     * Semua data digabung di sini supaya pindah tab tidak perlu pindah halaman.
     */
    public function index(Request $request)
    {
        $outlet = $request->user()->outlet ?? Outlet::first();
        $outletId = $outlet?->id;

        $products = Product::with('category')
            ->withSum(['batches as available_stock' => fn ($q) => $q->active()->where('outlet_id', $outletId)], 'qty_remaining')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $categories = Category::query()
            ->where('type', 'product')
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(function (Category $category) use ($products) {
                $needsRestock = $products
                    ->where('category_id', $category->id)
                    ->contains(fn (Product $product) => (float) $product->available_stock <= 0);

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'products_count' => $category->products_count,
                    'needs_restock' => $needsRestock,
                ];
            });

        $tables = Table::query()
            ->where('outlet_id', $outletId)
            ->where('is_active', true)
            ->orderBy('table_no')
            ->get(['id', 'table_no', 'capacity']);

        $tableOrderStatus = $request->get('pm_status', 'pending');
        $tableOrders = TableOrder::query()
            ->with('table', 'items.product', 'order')
            ->where('outlet_id', $outletId)
            ->when($tableOrderStatus !== 'all', fn ($q) => $q->where('status', $tableOrderStatus))
            ->latest()
            ->paginate(20, ['*'], 'pm_page')
            ->withQueryString();

        $reservations = Reservation::query()
            ->with('customer')
            ->when($request->reservasi_status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->reservasi_date, fn ($q, $date) => $q->whereDate('reservation_at', $date))
            ->orderBy('reservation_at')
            ->paginate(15, ['*'], 'reservasi_page')
            ->withQueryString();

        $preOrderStatus = $request->get('preorder_status');
        $preOrders = PreOrder::query()
            ->with('items.product', 'customer', 'user')
            ->when($preOrderStatus, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15, ['*'], 'preorder_page')
            ->withQueryString();

        return Inertia::render('Kasir/Index', [
            'products' => MenuStock::sortByAvailability($products),
            'categories' => $categories,
            'outlet' => $outlet,
            'tables' => $tables,
            'ordersToday' => Order::whereDate('created_at', today())->where('status', 'paid')->when($outletId, fn ($q) => $q->where('outlet_id', $outletId))->count(),
            'tableOrders' => $tableOrders,
            'tableOrderFilters' => ['status' => $tableOrderStatus],
            'reservations' => $reservations,
            'reservasiFilters' => $request->only('reservasi_status', 'reservasi_date'),
            'preOrders' => $preOrders,
            'preOrderFilters' => ['status' => $preOrderStatus],
            'customers' => Customer::orderBy('name')->get(['id', 'name', 'phone']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'order_type' => ['nullable', 'in:dine_in,takeaway'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'table_no' => ['nullable', 'string', 'max:50'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $data['outlet_id'] = $request->user()->outlet_id ?? Outlet::first()?->id;

        $order = $this->orderService->create($data, $request->user());

        return redirect()->route('kasir.index')->with('success', "Transaksi {$order->order_no} berhasil.");
    }
}
