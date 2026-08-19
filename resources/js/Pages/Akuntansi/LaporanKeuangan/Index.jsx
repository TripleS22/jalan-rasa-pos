import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value ?? 0);
}

const TABS = [
    ['neraca', 'Neraca'],
    ['laba-rugi', 'Laba Rugi'],
    ['arus-kas', 'Arus Kas'],
];

function Row({ label, value, bold, highlight }) {
    return (
        <div
            className={`flex items-center justify-between py-1.5 text-sm ${bold ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}
        >
            <span>{label}</span>
            <span className={highlight}>{formatRupiah(value)}</span>
        </div>
    );
}

export default function LaporanKeuanganIndex({
    filters,
    balanceSheet,
    profitAndLoss,
    cashFlow,
}) {
    const [tab, setTab] = useState('neraca');
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function applyFilters(e) {
        e.preventDefault();

        router.get(
            route('laporan-keuangan.index'),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Laporan Keuangan
                </h2>
            }
        >
            <Head title="Laporan Keuangan" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={applyFilters}
                        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Dari
                            </label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Sampai
                            </label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                        >
                            Terapkan
                        </button>
                    </form>

                    <div className="mb-6 flex gap-2">
                        {TABS.map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setTab(value)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                    tab === value
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === 'neraca' && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                                <h3 className="mb-3 font-semibold text-neutral-900">
                                    Aset
                                </h3>
                                {balanceSheet.assets.map((account) => (
                                    <Row
                                        key={account.id}
                                        label={account.name}
                                        value={account.balance}
                                    />
                                ))}
                                <div className="mt-2 border-t border-neutral-200 pt-2">
                                    <Row
                                        label="Total Aset"
                                        value={balanceSheet.total_assets}
                                        bold
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                                <h3 className="mb-3 font-semibold text-neutral-900">
                                    Kewajiban
                                </h3>
                                {balanceSheet.liabilities.length === 0 && (
                                    <p className="text-sm text-neutral-400">
                                        Belum ada kewajiban tercatat.
                                    </p>
                                )}
                                {balanceSheet.liabilities.map((account) => (
                                    <Row
                                        key={account.id}
                                        label={account.name}
                                        value={account.balance}
                                    />
                                ))}
                                <div className="mt-2 border-t border-neutral-200 pt-2">
                                    <Row
                                        label="Total Kewajiban"
                                        value={
                                            balanceSheet.total_liabilities
                                        }
                                        bold
                                    />
                                </div>

                                <h3 className="mb-3 mt-6 font-semibold text-neutral-900">
                                    Ekuitas
                                </h3>
                                {balanceSheet.equity.map((account) => (
                                    <Row
                                        key={account.id}
                                        label={account.name}
                                        value={account.balance}
                                    />
                                ))}
                                <Row
                                    label="Laba Ditahan (berjalan)"
                                    value={balanceSheet.retained_earnings}
                                />
                                <div className="mt-2 border-t border-neutral-200 pt-2">
                                    <Row
                                        label="Total Ekuitas"
                                        value={balanceSheet.total_equity}
                                        bold
                                    />
                                </div>

                                <div className="mt-4 border-t border-neutral-900 pt-2">
                                    <Row
                                        label="Total Kewajiban + Ekuitas"
                                        value={
                                            balanceSheet.total_liabilities +
                                            balanceSheet.total_equity
                                        }
                                        bold
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'laba-rugi' && (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <h3 className="mb-3 font-semibold text-neutral-900">
                                Pendapatan
                            </h3>
                            {profitAndLoss.revenue_accounts.map(
                                (account) => (
                                    <Row
                                        key={account.id}
                                        label={account.name}
                                        value={account.balance}
                                    />
                                ),
                            )}
                            <div className="mt-2 border-t border-neutral-200 pt-2">
                                <Row
                                    label="Total Pendapatan"
                                    value={profitAndLoss.total_revenue}
                                    bold
                                />
                            </div>

                            <h3 className="mb-3 mt-6 font-semibold text-neutral-900">
                                Beban
                            </h3>
                            {profitAndLoss.expense_accounts.map(
                                (account) => (
                                    <Row
                                        key={account.id}
                                        label={account.name}
                                        value={account.balance}
                                    />
                                ),
                            )}
                            <div className="mt-2 border-t border-neutral-200 pt-2">
                                <Row
                                    label="Total Beban"
                                    value={profitAndLoss.total_expense}
                                    bold
                                />
                            </div>

                            <div className="mt-4 border-t border-neutral-900 pt-2">
                                <Row
                                    label="Laba Kotor"
                                    value={profitAndLoss.gross_profit}
                                    bold
                                />
                                <Row
                                    label="Laba Bersih"
                                    value={profitAndLoss.net_profit}
                                    bold
                                    highlight={
                                        profitAndLoss.net_profit < 0
                                            ? 'text-red-600'
                                            : ''
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {tab === 'arus-kas' && (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <h3 className="mb-3 font-semibold text-neutral-900">
                                Mutasi Kas per Jenis Transaksi
                            </h3>

                            {cashFlow.groups.length === 0 && (
                                <p className="text-sm text-neutral-500">
                                    Belum ada mutasi kas di rentang ini.
                                </p>
                            )}

                            {cashFlow.groups.map((group) => (
                                <div
                                    key={group.label}
                                    className="flex items-center justify-between py-1.5 text-sm text-neutral-600"
                                >
                                    <span>{group.label}</span>
                                    <span
                                        className={
                                            group.net >= 0
                                                ? 'text-neutral-900'
                                                : 'text-red-600'
                                        }
                                    >
                                        {formatRupiah(group.net)}
                                    </span>
                                </div>
                            ))}

                            <div className="mt-4 space-y-1 border-t border-neutral-900 pt-2">
                                <Row
                                    label="Total Kas Masuk"
                                    value={cashFlow.total_in}
                                />
                                <Row
                                    label="Total Kas Keluar"
                                    value={cashFlow.total_out}
                                />
                                <Row
                                    label="Arus Kas Bersih"
                                    value={cashFlow.net_cash_flow}
                                    bold
                                    highlight={
                                        cashFlow.net_cash_flow < 0
                                            ? 'text-red-600'
                                            : ''
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
