<?php

namespace App\Http\Controllers;

use App\Services\AccountingReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanKeuanganController extends Controller
{
    public function __construct(protected AccountingReportService $reports) {}

    public function index(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        return Inertia::render('Akuntansi/LaporanKeuangan/Index', [
            'filters' => ['from' => $from, 'to' => $to],
            'balanceSheet' => $this->reports->balanceSheet($to),
            'profitAndLoss' => $this->reports->profitAndLoss($from, $to),
            'cashFlow' => $this->reports->cashFlow($from, $to),
        ]);
    }
}
