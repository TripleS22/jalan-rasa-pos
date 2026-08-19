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

function formatDateTime(value) {
    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const STATUS_LABEL = {
    paid: 'Lunas',
    pending: 'Pending',
    cancelled: 'Dibatalkan',
};

function StatusBadge({ status }) {
    const styles = {
        paid: 'bg-neutral-900 text-white',
        pending: 'bg-neutral-200 text-neutral-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
            {STATUS_LABEL[status] ?? status}
        </span>
    );
}

export default function RiwayatIndex({ orders, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function applyFilters(e) {
        e?.preventDefault();

        router.get(
            route('riwayat.index'),
            { search, status, from, to },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Riwayat Transaksi
                </h2>
            }
        >
            <Head title="Riwayat" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={applyFilters}
                        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                        <div className="flex-1 min-w-[180px]">
                            <label className="mb-1 block text-xs text-neutral-500">
                                Cari No. Order
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ORD-..."
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Semua</option>
                                <option value="paid">Lunas</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>

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

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        No. Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kasir
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {order.order_no}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(order.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {order.items
                                                .map(
                                                    (item) =>
                                                        `${item.product.name} ×${item.qty}`,
                                                )
                                                .join(', ')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {order.user?.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={order.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                            {formatRupiah(order.total)}
                                        </td>
                                    </tr>
                                ))}

                                {orders.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada transaksi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.links && orders.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {orders.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    className={`rounded-full px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 disabled:opacity-40'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
