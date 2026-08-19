<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Forecast;
use App\Models\Outlet;
use App\Models\User;
use App\Services\ForecastService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForecastController extends Controller
{
    public function __construct(protected ForecastService $forecasts) {}

    public function index(Request $request)
    {
        $forecasts = Forecast::query()
            ->with('category', 'pic', 'exceptionApprovedByUser')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest('forecast_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $decided = Forecast::whereNotNull('status');
        $totalDecided = (clone $decided)->count();
        $onTime = (clone $decided)->where('status', 'on_time')->count();
        $exceptions = (clone $decided)->where('status', 'exception')->count();

        return Inertia::render('Forecast/Index', [
            'forecasts' => $forecasts,
            'kpi' => [
                'compliance_rate' => $totalDecided > 0 ? round($onTime / $totalDecided * 100, 1) : null,
                'total_exceptions' => $exceptions,
                'total_decided' => $totalDecided,
            ],
            'categories' => Category::where('type', 'product')->orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
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

        $data['outlet_id'] = $request->user()->outlet_id ?? Outlet::first()?->id;

        $this->forecasts->create($data, $request->user());

        return redirect()->route('forecast.index')->with('success', 'Forecast berhasil dicatat.');
    }
}
