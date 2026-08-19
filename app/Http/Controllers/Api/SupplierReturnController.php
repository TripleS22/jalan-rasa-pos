<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupplierReturn;
use App\Services\SupplierReturnService;
use Illuminate\Http\Request;

class SupplierReturnController extends Controller
{
    public function __construct(protected SupplierReturnService $returns) {}

    public function index(Request $request)
    {
        $returns = SupplierReturn::query()
            ->with('purchase.supplier', 'purchasable', 'user')
            ->latest()
            ->paginate(20);

        return response()->json($returns);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'purchase_item_id' => ['required', 'exists:purchase_items,id'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $supplierReturn = $this->returns->create($data, $request->user());

        return response()->json($supplierReturn->load('purchase', 'purchasable'), 201);
    }
}
