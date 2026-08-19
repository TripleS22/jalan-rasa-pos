import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function KpiCard({ label, value, highlight }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm text-neutral-500">{label}</div>
            <div
                className={`mt-1 text-2xl font-semibold ${highlight ?? 'text-neutral-900'}`}
            >
                {value}
            </div>
        </div>
    );
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function LaporanIndex({
    filters,
    sales,
    profitLoss,
    topProducts,
    lowStock,
    unsoldProducts,
    expiringSoonBatches,
}) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const maxOmzet = Math.max(
        ...sales.daily.map((d) => Number(d.omzet)),
        1,
    );

    function applyFilters(e) {
        e.preventDefault();

        router.get(
            route('laporan.index'),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Laporan
                </h2>
            }
        >
            <Head title="Laporan" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

                    {/* KPI cards */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <KpiCard
                            label="Omzet"
                            value={formatRupiah(profitLoss.omzet)}
                        />
                        <KpiCard
                            label="Transaksi"
                            value={sales.summary.total_transactions}
                        />
                        <KpiCard
                            label="Laba Kotor"
                            value={formatRupiah(profitLoss.gross_profit)}
                        />
                        <KpiCard
                            label="Laba Bersih"
                            value={formatRupiah(profitLoss.net_profit)}
                            highlight={
                                profitLoss.net_profit < 0
                                    ? 'text-red-600'
                                    : 'text-neutral-900'
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Daily sales chart */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2">
                            <h3 className="mb-4 font-semibold text-neutral-900">
                                Omzet Harian
                            </h3>

                            {sales.daily.length === 0 && (
                                <p className="text-sm text-neutral-500">
                                    Belum ada data penjualan di rentang ini.
                                </p>
                            )}

                            <div className="space-y-2">
                                {sales.daily.map((day) => (
                                    <div
                                        key={day.date}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-24 shrink-0 text-xs text-neutral-500">
                                            {new Date(
                                                day.date,
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </span>
                                        <div className="h-6 flex-1 overflow-hidden rounded-full bg-neutral-100">
                                            <div
                                                className="h-full rounded-full bg-neutral-900"
                                                style={{
                                                    width: `${(Number(day.omzet) / maxOmzet) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="w-28 shrink-0 text-right text-xs font-medium text-neutral-700">
                                            {formatRupiah(day.omzet)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Low stock */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <h3 className="mb-4 font-semibold text-neutral-900">
                                Stok Perlu Restock
                            </h3>

                            {lowStock.length === 0 && (
                                <p className="text-sm text-neutral-500">
                                    Semua stok bahan baku aman.
                                </p>
                            )}

                            <div className="space-y-3">
                                {lowStock.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-neutral-700">
                                            {item.name}
                                        </span>
                                        <span className="font-medium text-red-600">
                                            {item.stock_qty} {item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expiring soon batches */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-3">
                            <h3 className="mb-1 font-semibold text-neutral-900">
                                Batch Mendekati Kedaluwarsa
                            </h3>
                            <p className="mb-4 text-sm text-neutral-500">
                                7 hari ke depan — segera dijual atau
                                dijadikan promo.
                            </p>

                            {expiringSoonBatches.length === 0 && (
                                <p className="text-sm text-neutral-500">
                                    Tidak ada batch yang mendekati
                                    kedaluwarsa.
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {expiringSoonBatches.map((batch) => (
                                    <div
                                        key={batch.id}
                                        className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                                    >
                                        <div>
                                            <div className="font-medium text-neutral-900">
                                                {batch.product?.name}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {batch.batch_no}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-red-600">
                                                {formatDate(
                                                    batch.expired_at,
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                sisa {batch.qty_remaining}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top products */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <div className="border-b border-neutral-200 p-5">
                            <h3 className="font-semibold text-neutral-900">
                                Produk Terlaris
                            </h3>
                        </div>

                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Terjual
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Pendapatan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {topProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {product.qty_sold}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                            {formatRupiah(product.revenue)}
                                        </td>
                                    </tr>
                                ))}

                                {topProducts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada penjualan di rentang
                                            ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Unsold products */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <div className="border-b border-neutral-200 p-5">
                            <h3 className="font-semibold text-neutral-900">
                                Produk Tidak Terjual
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                                Produk aktif yang tidak ada transaksi
                                penjualan pada rentang tanggal ini — kandidat
                                untuk promo atau evaluasi menu.
                            </p>
                        </div>

                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Harga Jual
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {unsoldProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {product.category?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {formatRupiah(product.price)}
                                        </td>
                                    </tr>
                                ))}

                                {unsoldProducts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Semua produk aktif terjual pada
                                            rentang ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
