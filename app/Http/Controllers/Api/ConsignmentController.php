<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consignment;
use App\Services\ConsignmentService;
use Illuminate\Http\Request;

class ConsignmentController extends Controller
{
    public function __construct(protected ConsignmentService $consignments) {}

    public function index(Request $request)
    {
        $consignments = Consignment::query()
            ->with('partner', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20);

        return response()->json($consignments);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'consignment_partner_id' => ['required', 'exists:consignment_partners,id'],
            'sent_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty_sent' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
        ]);

        $consignment = $this->consignments->create($data, $request->user());

        return response()->json($consignment->load('items.product', 'partner'), 201);
    }

    public function show(Consignment $consignment)
    {
        return response()->json($consignment->load('items.product', 'partner', 'user'));
    }

    public function update(Request $request, Consignment $consignment)
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:consignment_items,id'],
            'items.*.qty_sold' => ['required', 'integer', 'min:0'],
            'items.*.qty_returned' => ['required', 'integer', 'min:0'],
        ]);

        $consignment = $this->consignments->settle($consignment, $data['items'], $request->user());

        return response()->json($consignment);
    }

    public function destroy(Consignment $consignment)
    {
        $consignment->delete();

        return response()->json(null, 204);
    }
}
