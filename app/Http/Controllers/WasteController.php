<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use App\Services\WasteReportService;
use App\Services\WasteService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WasteController extends Controller
{
    public function __construct(
        protected WasteService $waste,
        protected WasteReportService $report,
    ) {}

    public function index(Request $request)
    {
        $log = $this->report->consolidatedLog($request->from, $request->to);

        return Inertia::render('Waste/Index', [
            'rows' => $log['rows'],
            'kpi' => $log['kpi'],
            'outlets' => Outlet::orderBy('name')->get(),
            'products' => Product::orderBy('name')->get(['id', 'name', 'unit']),
            'users' => User::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('from', 'to'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['required', 'exists:outlets,id'],
            'product_id' => ['required', 'exists:products,id'],
            'source_type' => ['required', 'in:production_waste,recall,expired,other'],
            'qty' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string'],
            'pic_user_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->waste->create($data, $request->user());

        return redirect()->route('waste.index')->with('success', 'Waste berhasil dicatat.');
    }
}
