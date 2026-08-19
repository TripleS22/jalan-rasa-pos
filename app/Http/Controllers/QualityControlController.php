<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\QcCheck;
use App\Models\User;
use App\Services\QcCheckService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QualityControlController extends Controller
{
    public function __construct(protected QcCheckService $qcChecks) {}

    public function index(Request $request)
    {
        $checks = QcCheck::query()
            ->with('production.product', 'pic')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $totals = QcCheck::selectRaw('SUM(qty_checked) as total_checked, SUM(qty_passed) as total_passed')->first();
        $passRate = $totals->total_checked > 0
            ? round($totals->total_passed / $totals->total_checked * 100, 2)
            : null;

        $pendingProductions = Production::query()
            ->whereDoesntHave('qcCheck')
            ->with('product')
            ->latest()
            ->get();

        return Inertia::render('QualityControl/Index', [
            'checks' => $checks,
            'kpi' => [
                'pass_rate' => $passRate,
                'total_checked' => (float) $totals->total_checked,
                'total_passed' => (float) $totals->total_passed,
            ],
            'pendingProductions' => $pendingProductions,
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'production_id' => ['required', 'exists:productions,id'],
            'qty_checked' => ['required', 'numeric', 'min:0.01'],
            'qty_passed' => ['required', 'numeric', 'min:0'],
            'qty_rejected' => ['required', 'numeric', 'min:0'],
            'reject_reason' => ['nullable', 'string', 'max:255'],
            'pic_user_id' => ['required', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->qcChecks->create($data, $request->user());

        return redirect()->route('quality-control.index')->with('success', 'Hasil QC berhasil dicatat.');
    }
}
