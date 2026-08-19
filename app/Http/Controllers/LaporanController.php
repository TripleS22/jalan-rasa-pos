<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function __construct(protected ReportService $reports) {}

    public function index(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        return Inertia::render('Laporan/Index', [
            'filters' => ['from' => $from, 'to' => $to],
            'sales' => $this->reports->sales($from, $to),
            'profitLoss' => $this->reports->profitLoss($from, $to),
            'topProducts' => $this->reports->topProducts($from, $to),
            'lowStock' => $this->reports->lowStock(),
            'unsoldProducts' => $this->reports->unsoldProducts($from, $to),
            'expiringSoonBatches' => $this->reports->expiringSoonBatches(),
        ]);
    }
}
