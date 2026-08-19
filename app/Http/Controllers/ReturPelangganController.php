<?php

namespace App\Http\Controllers;

use App\Models\CustomerReturn;
use App\Models\Order;
use App\Services\CustomerReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReturPelangganController extends Controller
{
    public function __construct(protected CustomerReturnService $returns) {}

    public function index(Request $request)
    {
        $returns = CustomerReturn::query()
            ->with('order', 'product', 'user')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('ReturPelanggan/Index', [
            'returns' => $returns,
            'orders' => Order::where('status', 'paid')
                ->with('items.product')
                ->latest()
                ->limit(50)
                ->get(['id', 'order_no', 'created_at']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_item_id' => ['required', 'exists:order_items,id'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'action' => ['required', 'in:restock,waste'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->returns->create($data, $request->user());

        return redirect()->route('retur-pelanggan.index')->with('success', 'Retur pelanggan berhasil dicatat.');
    }
}
