<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Services\DeliveryService;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(protected DeliveryService $deliveries) {}

    public function index(Request $request)
    {
        $deliveries = Delivery::query()
            ->with('items.product', 'fromOutlet', 'toOutlet', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($deliveries);
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

        $delivery = $this->deliveries->create($data, $request->user());

        return response()->json($delivery->load('items.product', 'fromOutlet', 'toOutlet'), 201);
    }

    public function show(Delivery $delivery)
    {
        return response()->json($delivery->load('items.product', 'fromOutlet', 'toOutlet', 'user', 'receivedByUser'));
    }

    public function receive(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:delivery_items,id'],
            'items.*.qty_received' => ['required', 'numeric', 'min:0'],
            'items.*.condition_ok' => ['nullable', 'boolean'],
            'items.*.expired_ok' => ['nullable', 'boolean'],
        ]);

        $delivery = $this->deliveries->receive($delivery, $data['items'], $request->user());

        return response()->json($delivery->load('items.product', 'fromOutlet', 'toOutlet'));
    }
}
