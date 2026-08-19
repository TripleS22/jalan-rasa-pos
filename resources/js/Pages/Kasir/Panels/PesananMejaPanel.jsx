import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value || 0);
}

function formatTime(value) {
    return new Date(value).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

const TABS = [
    { value: 'pending', label: 'Menunggu' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'cancelled', label: 'Dibatalkan' },
    { value: 'all', label: 'Semua' },
];

const STATUS_COLOR = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABEL = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan',
};

const PAYMENT_METHOD_LABEL = {
    cash: 'Bayar di Kasir',
    qris: 'QRIS',
    debit: 'Kartu Debit',
};

export default function PesananMejaPanel({ tableOrders, filters }) {
    const { errors: pageErrors } = usePage().props;
    const [confirmTarget, setConfirmTarget] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        payment_method: 'cash',
    });

    // Auto-refresh the queue while watching pending self-orders so new
    // orders from customers' phones show up without a manual reload.
    useEffect(() => {
        if (filters.status !== 'pending') {
            return;
        }

        const interval = setInterval(() => {
            router.reload({ only: ['tableOrders'], showProgress: false });
        }, 5000);

        return () => clearInterval(interval);
    }, [filters.status]);

    function switchTab(status) {
        router.get(
            route('kasir.index'),
            { pm_status: status },
            { preserveState: true, replace: true },
        );
    }

    function openConfirm(tableOrder) {
        setConfirmTarget(tableOrder);
        setData('payment_method', tableOrder.payment_method ?? 'cash');
    }

    function submitConfirm(e) {
        e.preventDefault();

        post(route('pesanan-meja.confirm', confirmTarget.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setConfirmTarget(null),
        });
    }

    function cancelOrder(tableOrder) {
        if (
            !confirm(
                `Batalkan pesanan meja ${tableOrder.table.table_no} dari ${tableOrder.customer_name || 'pelanggan'}?`,
            )
        ) {
            return;
        }

        router.post(
            route('pesanan-meja.cancel', tableOrder.id),
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Pesanan Meja (QR)
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Pesanan yang masuk dari pelanggan yang scan QR meja
                        &mdash; konfirmasi untuk memprosesnya jadi transaksi.
                    </p>
                </div>
            </div>

            <div className="mb-6 flex gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => switchTab(tab.value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                            filters.status === tab.value
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {tableOrders.data.map((tableOrder) => (
                    <div
                        key={tableOrder.id}
                        className="rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-neutral-900">
                                        Meja {tableOrder.table.table_no}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[tableOrder.status]}`}
                                    >
                                        {STATUS_LABEL[tableOrder.status]}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-neutral-400">
                                    {formatTime(tableOrder.created_at)}
                                    {tableOrder.customer_name &&
                                        ` · ${tableOrder.customer_name}`}
                                    {tableOrder.payment_method &&
                                        ` · ${PAYMENT_METHOD_LABEL[tableOrder.payment_method] ?? tableOrder.payment_method}`}
                                </p>
                                {tableOrder.notes && (
                                    <p className="mt-1 text-xs italic text-neutral-500">
                                        &ldquo;{tableOrder.notes}&rdquo;
                                    </p>
                                )}
                            </div>

                            {tableOrder.status === 'pending' && (
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        onClick={() =>
                                            cancelOrder(tableOrder)
                                        }
                                        className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Batalkan
                                    </button>
                                    <button
                                        onClick={() =>
                                            openConfirm(tableOrder)
                                        }
                                        className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            )}

                            {tableOrder.order && (
                                <span className="shrink-0 text-xs text-neutral-400">
                                    {tableOrder.order.order_no}
                                </span>
                            )}
                        </div>

                        <ul className="divide-y divide-neutral-100 text-sm">
                            {tableOrder.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between py-1.5"
                                >
                                    <span className="text-neutral-700">
                                        {item.qty}&times; {item.product.name}
                                    </span>
                                    <span className="text-neutral-500">
                                        {formatRupiah(item.subtotal)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm font-semibold text-neutral-900">
                            <span>Total</span>
                            <span>{formatRupiah(tableOrder.total)}</span>
                        </div>
                    </div>
                ))}

                {tableOrders.data.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
                        Belum ada pesanan meja.
                    </div>
                )}
            </div>

            {tableOrders.links && tableOrders.data.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {tableOrders.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            className={`rounded-full px-3 py-1 text-sm ${
                                link.active
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 disabled:opacity-40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {confirmTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <form
                        onSubmit={submitConfirm}
                        className="w-full max-w-sm rounded-2xl bg-white p-6"
                    >
                        <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                            Konfirmasi Pesanan
                        </h3>
                        <p className="mb-4 text-sm text-neutral-500">
                            Meja {confirmTarget.table.table_no} &middot;{' '}
                            {formatRupiah(confirmTarget.total)}
                        </p>

                        <label className="mb-1 block text-sm text-neutral-600">
                            Metode Pembayaran
                        </label>
                        <select
                            value={data.payment_method}
                            onChange={(e) =>
                                setData('payment_method', e.target.value)
                            }
                            className="mb-2 w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="cash">Tunai</option>
                            <option value="qris">QRIS</option>
                            <option value="debit">Debit</option>
                        </select>
                        {pageErrors?.items && (
                            <p className="mb-2 text-sm text-red-600">
                                {pageErrors.items}
                            </p>
                        )}
                        {pageErrors?.status && (
                            <p className="mb-2 text-sm text-red-600">
                                {pageErrors.status}
                            </p>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmTarget(null)}
                                className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
