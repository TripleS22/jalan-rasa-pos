<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WasteReportService;
use App\Services\WasteService;
use Illuminate\Http\Request;

class WasteController extends Controller
{
    public function __construct(
        protected WasteService $waste,
        protected WasteReportService $report,
    ) {}

    public function index(Request $request)
    {
        return response()->json($this->report->consolidatedLog($request->from, $request->to));
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

        $waste = $this->waste->create($data, $request->user());

        return response()->json($waste, 201);
    }
}
