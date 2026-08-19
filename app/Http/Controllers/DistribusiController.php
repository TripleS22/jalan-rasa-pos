<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Outlet;
use App\Models\Product;
use App\Services\DeliveryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DistribusiController extends Controller
{
    public function __construct(protected DeliveryService $deliveries) {}

    public function index(Request $request)
    {
        $deliveries = Delivery::query()
            ->with('items.product', 'fromOutlet', 'toOutlet', 'user', 'receivedByUser')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Distribusi/Index', [
            'deliveries' => $deliveries,
            'outlets' => Outlet::orderBy('name')->get(),
            'products' => Product::orderBy('name')->get(['id', 'name', 'unit']),
            'filters' => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'from_outlet_id' => ['required', 'exists:outlets,id', 'different:to_outlet_id'],
            'to_outlet_id' => ['required', 'exists:outlets,id'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
        ]);

        $this->deliveries->create($data, $request->user());

        return redirect()->route('distribusi.index')->with('success', 'Delivery order berhasil dibuat.');
    }

    public function receive(Request $request, Delivery $distribusi)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:delivery_items,id'],
            'items.*.qty_received' => ['required', 'numeric', 'min:0'],
            'items.*.condition_ok' => ['nullable', 'boolean'],
            'items.*.expired_ok' => ['nullable', 'boolean'],
        ]);

        $this->deliveries->receive($distribusi, $data['items'], $request->user());

        return redirect()->route('distribusi.index')->with('success', 'Delivery order berhasil diterima.');
    }
}
