<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Delivery;
use App\Models\Forecast;
use App\Models\Production;
use App\Models\QcCheck;
use App\Support\AccountCode;
use Carbon\Carbon;

class DashboardService
{
    public function __construct(
        protected ReportService $reports,
        protected AccountingReportService $accountingReports,
        protected WasteReportService $wasteReports,
    ) {}

    public function summary(): array
    {
        $today = Carbon::today()->toDateString();
        $monthStart = Carbon::today()->startOfMonth()->toDateString();
        $monthEnd = Carbon::today()->toDateString();

        return [
            'sales' => $this->salesSummary($today, $monthStart, $monthEnd),
            'finance' => $this->financeSummary($today, $monthStart, $monthEnd),
            'inventory' => $this->inventorySummary(),
            'production' => $this->productionSummary(),
            'supply_chain' => $this->supplyChainSummary(),
            'distribution' => $this->distributionSummary(),
            'waste' => $this->wasteSummary($monthStart, $monthEnd),
            'asset' => $this->assetSummary(),
        ];
    }

    protected function salesSummary(string $today, string $monthStart, string $monthEnd): array
    {
        $todaySales = $this->reports->sales($today, $today);
        $monthSales = $this->reports->sales($monthStart, $monthEnd);

        return [
            'omzet_today' => (float) $todaySales['summary']['total_omzet'],
            'transactions_today' => $todaySales['summary']['total_transactions'],
            'omzet_this_month' => (float) $monthSales['summary']['total_omzet'],
            'transactions_this_month' => $monthSales['summary']['total_transactions'],
        ];
    }

    protected function financeSummary(string $today, string $monthStart, string $monthEnd): array
    {
        $trialBalance = $this->accountingReports->trialBalance($today);
        $cashBalance = $trialBalance
            ->whereIn('code', [AccountCode::KAS, AccountCode::BANK])
            ->sum('balance');

        $profitAndLoss = $this->accountingReports->profitAndLoss($monthStart, $monthEnd);
        $balanceSheet = $this->accountingReports->balanceSheet($today);

        return [
            'cash_balance' => (float) $cashBalance,
            'net_profit_this_month' => (float) $profitAndLoss['net_profit'],
            'total_assets' => (float) $balanceSheet['total_assets'],
            'is_balanced' => abs($balanceSheet['total_assets'] - ($balanceSheet['total_liabilities'] + $balanceSheet['total_equity'])) < 0.01,
        ];
    }

    protected function inventorySummary(): array
    {
        return [
            'low_stock_count' => $this->reports->lowStock()->count(),
            'expiring_soon_count' => $this->reports->expiringSoonBatches()->count(),
        ];
    }

    protected function productionSummary(): array
    {
        $totals = QcCheck::selectRaw('SUM(qty_checked) as total_checked, SUM(qty_passed) as total_passed')->first();
        $passRate = $totals->total_checked > 0
            ? round($totals->total_passed / $totals->total_checked * 100, 1)
            : null;

        return [
            'qc_pass_rate' => $passRate,
            'pending_qc_count' => Production::whereDoesntHave('qcCheck')->count(),
        ];
    }

    protected function supplyChainSummary(): array
    {
        $decided = Forecast::whereNotNull('status');
        $totalDecided = (clone $decided)->count();
        $onTime = (clone $decided)->where('status', 'on_time')->count();

        return [
            'po_compliance_rate' => $totalDecided > 0 ? round($onTime / $totalDecided * 100, 1) : null,
            'total_exceptions' => (clone $decided)->where('status', 'exception')->count(),
        ];
    }

    protected function distributionSummary(): array
    {
        return [
            'pending_deliveries' => Delivery::where('status', 'sent')->count(),
        ];
    }

    protected function wasteSummary(string $monthStart, string $monthEnd): array
    {
        $log = $this->wasteReports->consolidatedLog($monthStart, $monthEnd);

        return [
            'total_loss_this_month' => (float) $log['kpi']['total_loss'],
            'total_qty_this_month' => (float) $log['kpi']['total_qty'],
        ];
    }

    protected function assetSummary(): array
    {
        $assets = Asset::where('status', 'active')->get();

        return [
            'active_asset_count' => $assets->count(),
            'total_book_value' => (float) $assets->sum(fn (Asset $asset) => (float) $asset->purchase_cost - (float) $asset->accumulated_depreciation),
        ];
    }
}
