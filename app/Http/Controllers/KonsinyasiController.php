<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use App\Models\ConsignmentPartner;
use App\Models\Product;
use App\Services\ConsignmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KonsinyasiController extends Controller
{
    public function __construct(protected ConsignmentService $consignments) {}

    public function index(Request $request)
    {
        $consignments = Consignment::query()
            ->with('items.product', 'partner', 'user')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Konsinyasi/Index', [
            'consignments' => $consignments,
            'partners' => ConsignmentPartner::orderBy('name')->get(['id', 'name']),
            'products' => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'price']),
            'filters' => $request->only('status'),
        ]);
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

        $this->consignments->create($data, $request->user());

        return redirect()->route('konsinyasi.index')->with('success', 'Konsinyasi berhasil dicatat.');
    }

    public function update(Request $request, Consignment $konsinyasi)
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:consignment_items,id'],
            'items.*.qty_sold' => ['required', 'integer', 'min:0'],
            'items.*.qty_returned' => ['required', 'integer', 'min:0'],
        ]);

        $this->consignments->settle($konsinyasi, $data['items'], $request->user());

        return redirect()->route('konsinyasi.index')->with('success', 'Konsinyasi berhasil diselesaikan.');
    }

    public function destroy(Consignment $konsinyasi)
    {
        $konsinyasi->delete();

        return redirect()->route('konsinyasi.index')->with('success', 'Konsinyasi berhasil dihapus.');
    }
}
