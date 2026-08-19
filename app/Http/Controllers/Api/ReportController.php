<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reports) {}

    public function sales(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        return response()->json($this->reports->sales($from, $to));
    }

    public function profitLoss(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        return response()->json($this->reports->profitLoss($from, $to));
    }

    public function topProducts(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();
        $limit = $request->integer('limit', 10);

        return response()->json($this->reports->topProducts($from, $to, $limit));
    }

    public function lowStock()
    {
        return response()->json($this->reports->lowStock());
    }

    public function unsoldProducts(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to = $request->to ?? now()->toDateString();

        return response()->json($this->reports->unsoldProducts($from, $to));
    }
}
