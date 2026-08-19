<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Forecast;
use App\Models\Outlet;
use App\Services\ForecastService;
use Illuminate\Http\Request;

class ForecastController extends Controller
{
    public function __construct(protected ForecastService $forecasts) {}

    public function index(Request $request)
    {
        $forecasts = Forecast::query()
            ->with('category', 'pic', 'exceptionApprovedByUser')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest('forecast_date')
            ->paginate(20);

        return response()->json($forecasts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'pic_user_id' => ['required', 'exists:users,id'],
            'week_label' => ['required', 'string', 'max:100'],
            'forecast_date' => ['required', 'date'],
            'forecast_qty' => ['required', 'numeric', 'min:0'],
            'po_qty' => ['nullable', 'numeric', 'min:0'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'exception_reason' => ['nullable', 'string', 'max:255'],
            'exception_approved_by' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['outlet_id'] ??= $request->user()->outlet_id ?? Outlet::first()?->id;

        $forecast = $this->forecasts->create($data, $request->user());

        return response()->json($forecast->load('category', 'pic'), 201);
    }
}
