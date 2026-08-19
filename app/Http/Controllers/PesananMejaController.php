<?php

namespace App\Http\Controllers;

use App\Models\TableOrder;
use App\Services\TableOrderService;
use Illuminate\Http\Request;

class PesananMejaController extends Controller
{
    public function __construct(protected TableOrderService $tableOrders) {}

    public function confirm(Request $request, TableOrder $pesananMeja)
    {
        $data = $request->validate([
            'payment_method' => ['required', 'string', 'max:50'],
        ]);

        $this->tableOrders->confirm($pesananMeja, $data['payment_method'], $request->user());

        return redirect()->route('kasir.index')->with('success', 'Pesanan meja dikonfirmasi.');
    }

    public function cancel(TableOrder $pesananMeja)
    {
        $this->tableOrders->cancel($pesananMeja);

        return redirect()->route('kasir.index')->with('success', 'Pesanan meja dibatalkan.');
    }
}
