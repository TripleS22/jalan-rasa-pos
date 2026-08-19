<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerReturn;
use App\Services\CustomerReturnService;
use Illuminate\Http\Request;

class CustomerReturnController extends Controller
{
    public function __construct(protected CustomerReturnService $returns) {}

    public function index(Request $request)
    {
        $returns = CustomerReturn::query()
            ->with('order', 'product', 'user')
            ->latest()
            ->paginate(20);

        return response()->json($returns);
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

        $customerReturn = $this->returns->create($data, $request->user());

        return response()->json($customerReturn->load('order', 'product'), 201);
    }
}
