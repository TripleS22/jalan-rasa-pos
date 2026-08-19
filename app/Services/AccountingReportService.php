<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalLine;
use App\Support\AccountCode;

class AccountingReportService
{
    /**
     * Saldo tiap akun sampai tanggal tertentu (Neraca Saldo).
     */
    public function trialBalance(string $asOf)
    {
        return Account::query()
            ->withSum(['lines as total_debit' => fn ($q) => $q->whereHas(
                'journalEntry',
                fn ($je) => $je->whereDate('entry_date', '<=', $asOf)
            )], 'debit')
            ->withSum(['lines as total_credit' => fn ($q) => $q->whereHas(
                'journalEntry',
                fn ($je) => $je->whereDate('entry_date', '<=', $asOf)
            )], 'credit')
            ->orderBy('code')
            ->get()
            ->map(function (Account $account) {
                $debit = (float) ($account->total_debit ?? 0);
                $credit = (float) ($account->total_credit ?? 0);
                $account->balance = in_array($account->type, ['asset', 'expense'])
                    ? $debit - $credit
                    : $credit - $debit;

                return $account;
            });
    }

    /**
     * Neraca — Ekuitas dihitung termasuk laba berjalan (Pendapatan - Beban sampai tanggal ini)
     * supaya Aset selalu sama dengan Kewajiban + Ekuitas tanpa perlu jurnal penutup manual.
     */
    public function balanceSheet(string $asOf): array
    {
        $accounts = $this->trialBalance($asOf);

        $assets = $accounts->where('type', 'asset')->values();
        $liabilities = $accounts->where('type', 'liability')->values();
        $equity = $accounts->where('type', 'equity')->values();
        $revenue = $accounts->where('type', 'revenue')->sum('balance');
        $expense = $accounts->where('type', 'expense')->sum('balance');
        $retainedEarnings = $revenue - $expense;

        return [
            'as_of' => $asOf,
            'assets' => $assets,
            'total_assets' => $assets->sum('balance'),
            'liabilities' => $liabilities,
            'total_liabilities' => $liabilities->sum('balance'),
            'equity' => $equity,
            'retained_earnings' => $retainedEarnings,
            'total_equity' => $equity->sum('balance') + $retainedEarnings,
        ];
    }

    /**
     * Laba Rugi dari ledger (journal_lines), independen dari ReportService::profitLoss()
     * yang menghitung langsung dari tabel Order/Expense — dipakai buat cross-check.
     */
    public function profitAndLoss(string $from, string $to): array
    {
        $accounts = Account::query()
            ->whereIn('type', ['revenue', 'expense'])
            ->withSum(['lines as total_debit' => fn ($q) => $q->whereHas(
                'journalEntry',
                fn ($je) => $je->whereDate('entry_date', '>=', $from)->whereDate('entry_date', '<=', $to)
            )], 'debit')
            ->withSum(['lines as total_credit' => fn ($q) => $q->whereHas(
                'journalEntry',
                fn ($je) => $je->whereDate('entry_date', '>=', $from)->whereDate('entry_date', '<=', $to)
            )], 'credit')
            ->orderBy('code')
            ->get()
            ->map(function (Account $account) {
                $debit = (float) ($account->total_debit ?? 0);
                $credit = (float) ($account->total_credit ?? 0);
                $account->balance = $account->type === 'revenue' ? $credit - $debit : $debit - $credit;

                return $account;
            });

        $revenueAccounts = $accounts->where('type', 'revenue')->values();
        $expenseAccounts = $accounts->where('type', 'expense')->values();
        $totalRevenue = $revenueAccounts->sum('balance');
        $totalExpense = $expenseAccounts->sum('balance');

        $hpp = $expenseAccounts->firstWhere('code', AccountCode::HPP)?->balance ?? 0;

        return [
            'from' => $from,
            'to' => $to,
            'revenue_accounts' => $revenueAccounts,
            'expense_accounts' => $expenseAccounts,
            'total_revenue' => $totalRevenue,
            'gross_profit' => $totalRevenue - $hpp,
            'total_expense' => $totalExpense,
            'net_profit' => $totalRevenue - $totalExpense,
        ];
    }

    /**
     * Arus Kas sederhana (metode langsung): mutasi akun Kas+Bank dikelompokkan per jenis transaksi.
     */
    public function cashFlow(string $from, string $to): array
    {
        $lines = JournalLine::query()
            ->whereHas('account', fn ($q) => $q->whereIn('code', [AccountCode::KAS, AccountCode::BANK]))
            ->whereHas('journalEntry', fn ($q) => $q->whereDate('entry_date', '>=', $from)->whereDate('entry_date', '<=', $to))
            ->with('journalEntry')
            ->get();

        $grouped = $lines->groupBy(fn (JournalLine $line) => class_basename($line->journalEntry->reference_type) ?: 'Lainnya')
            ->map(function ($group, $label) {
                return [
                    'label' => $label,
                    'in' => (float) $group->sum('debit'),
                    'out' => (float) $group->sum('credit'),
                    'net' => (float) $group->sum('debit') - (float) $group->sum('credit'),
                ];
            })
            ->values();

        return [
            'from' => $from,
            'to' => $to,
            'groups' => $grouped,
            'total_in' => $lines->sum('debit'),
            'total_out' => $lines->sum('credit'),
            'net_cash_flow' => $lines->sum('debit') - $lines->sum('credit'),
        ];
    }
}
