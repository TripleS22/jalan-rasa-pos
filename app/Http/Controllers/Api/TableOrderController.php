<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TableOrder;
use App\Services\TableOrderService;
use Illuminate\Http\Request;

class TableOrderController extends Controller
{
    public function __construct(protected TableOrderService $tableOrders) {}

    public function index(Request $request)
    {
        $tableOrders = TableOrder::query()
            ->with('table', 'items.product', 'order')
            ->when($request->outlet_id, fn ($q, $outletId) => $q->where('outlet_id', $outletId))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($tableOrders);
    }

    public function show(TableOrder $tableOrder)
    {
        return response()->json($tableOrder->load('table', 'items.product', 'order'));
    }

    public function confirm(Request $request, TableOrder $tableOrder)
    {
        $data = $request->validate([
            'payment_method' => ['required', 'string', 'max:50'],
        ]);

        $tableOrder = $this->tableOrders->confirm($tableOrder, $data['payment_method'], $request->user());

        return response()->json($tableOrder->load('table', 'items.product', 'order'));
    }

    public function cancel(TableOrder $tableOrder)
    {
        $tableOrder = $this->tableOrders->cancel($tableOrder);

        return response()->json($tableOrder);
    }
}
