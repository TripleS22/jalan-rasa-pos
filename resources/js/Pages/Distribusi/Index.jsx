import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const STATUS_LABEL = {
    sent: 'Dikirim',
    received: 'Diterima',
};

function StatusBadge({ status }) {
    const styles = {
        sent: 'bg-neutral-200 text-neutral-700',
        received: 'bg-neutral-900 text-white',
    };

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
            {STATUS_LABEL[status] ?? status}
        </span>
    );
}

function emptyItem() {
    return {
        product_id: '',
        qty: '',
    };
}

export default function DistribusiIndex({ deliveries, outlets, products, filters }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [receiveDelivery, setReceiveDelivery] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        from_outlet_id: '',
        to_outlet_id: '',
        notes: '',
        items: [emptyItem()],
    });

    const {
        data: receiveData,
        setData: setReceiveData,
        post: postReceive,
        processing: receiveProcessing,
        errors: receiveErrors,
        reset: resetReceive,
    } = useForm({
        items: [],
    });

    function applyFilters(newStatus) {
        setStatus(newStatus);
        router.get(
            route('distribusi.index'),
            { status: newStatus || undefined },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        reset();
        setCreateOpen(true);
    }

    function updateItem(index, changes) {
        setData(
            'items',
            data.items.map((item, i) =>
                i === index ? { ...item, ...changes } : item,
            ),
        );
    }

    function addItemRow() {
        setData('items', [...data.items, emptyItem()]);
    }

    function removeItemRow(index) {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    }

    function submit(e) {
        e.preventDefault();

        post(route('distribusi.store'), {
            onSuccess: () => setCreateOpen(false),
            preserveScroll: true,
        });
    }

    function openReceive(delivery) {
        setReceiveDelivery(delivery);
        resetReceive();
        setReceiveData(
            'items',
            delivery.items.map((item) => ({
                id: item.id,
                product_name: item.product?.name,
                qty_sent: item.qty_sent,
                qty_received: item.qty_sent,
                condition_ok: true,
                expired_ok: true,
            })),
        );
    }

    function updateReceiveItem(index, changes) {
        setReceiveData(
            'items',
            receiveData.items.map((item, i) =>
                i === index ? { ...item, ...changes } : item,
            ),
        );
    }

    function submitReceive(e) {
        e.preventDefault();

        postReceive(route('distribusi.receive', receiveDelivery.id), {
            onSuccess: () => setReceiveDelivery(null),
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Distribusi Antar Outlet
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Buat DO
                    </button>
                </div>
            }
        >
            <Head title="Distribusi" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 flex flex-wrap gap-2">
                        {[
                            ['', 'Semua'],
                            ['sent', 'Dikirim'],
                            ['received', 'Diterima'],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => applyFilters(value)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                    status === value
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        No. DO
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tanggal Kirim
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Dari
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tujuan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {deliveries.data.map((delivery) => (
                                    <tr key={delivery.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {delivery.do_no}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(delivery.sent_at)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {delivery.from_outlet?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {delivery.to_outlet?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {delivery.items
                                                .map(
                                                    (item) =>
                                                        `${item.product?.name} ×${item.qty_sent}`,
                                                )
                                                .join(', ')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={delivery.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {delivery.status === 'sent' && (
                                                <button
                                                    onClick={() => openReceive(delivery)}
                                                    className="text-neutral-600 hover:text-neutral-900"
                                                >
                                                    Terima
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {deliveries.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada delivery order.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {deliveries.links && deliveries.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {deliveries.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
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

            <Modal show={createOpen} onClose={() => setCreateOpen(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Buat Delivery Order
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Dari Outlet
                            </label>
                            <select
                                value={data.from_outlet_id}
                                onChange={(e) =>
                                    setData('from_outlet_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih outlet asal</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                            {errors.from_outlet_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.from_outlet_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Outlet Tujuan
                            </label>
                            <select
                                value={data.to_outlet_id}
                                onChange={(e) =>
                                    setData('to_outlet_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih outlet tujuan</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                            {errors.to_outlet_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.to_outlet_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm text-neutral-600">
                            Item Dikirim
                        </label>
                        <button
                            type="button"
                            onClick={addItemRow}
                            className="text-sm font-medium text-neutral-900 hover:underline"
                        >
                            + Tambah item
                        </button>
                    </div>

                    <div className="max-h-72 space-y-3 overflow-y-auto">
                        {data.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3"
                            >
                                <select
                                    value={item.product_id}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            product_id: e.target.value,
                                        })
                                    }
                                    className="flex-1 rounded-lg border-neutral-300 text-xs shadow-sm"
                                >
                                    <option value="">Pilih produk</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="w-28">
                                    <NumberInput
                                        value={item.qty}
                                        onChange={(value) =>
                                            updateItem(index, { qty: value })
                                        }
                                        placeholder="Qty"
                                        className="w-full rounded-lg border-neutral-300 text-xs shadow-sm"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeItemRow(index)}
                                    disabled={data.items.length === 1}
                                    className="flex h-8 w-8 items-center justify-center text-neutral-400 hover:text-red-600 disabled:opacity-30"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {errors.items && (
                        <p className="mt-2 text-sm text-red-600">{errors.items}</p>
                    )}

                    <div className="mb-4 mt-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Catatan
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setCreateOpen(false)}
                            className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            Kirim DO
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                show={receiveDelivery !== null}
                onClose={() => setReceiveDelivery(null)}
                maxWidth="2xl"
            >
                {receiveDelivery && (
                    <form onSubmit={submitReceive} className="p-6">
                        <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                            Terima DO {receiveDelivery.do_no}
                        </h3>
                        <p className="mb-4 text-sm text-neutral-500">
                            Dari {receiveDelivery.from_outlet?.name} ke{' '}
                            {receiveDelivery.to_outlet?.name}
                        </p>

                        <div className="max-h-80 space-y-3 overflow-y-auto">
                            {receiveData.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-neutral-200 p-3"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-neutral-900">
                                            {item.product_name}
                                        </span>
                                        <span className="text-xs text-neutral-500">
                                            Dikirim: {item.qty_sent}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 items-center gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs text-neutral-500">
                                                Jumlah Diterima
                                            </label>
                                            <NumberInput
                                                value={item.qty_received}
                                                onChange={(value) =>
                                                    updateReceiveItem(index, {
                                                        qty_received: value,
                                                    })
                                                }
                                                className="w-full rounded-lg border-neutral-300 text-xs shadow-sm"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-xs text-neutral-600">
                                            <input
                                                type="checkbox"
                                                checked={item.condition_ok}
                                                onChange={(e) =>
                                                    updateReceiveItem(index, {
                                                        condition_ok:
                                                            e.target.checked,
                                                    })
                                                }
                                            />
                                            Kondisi OK
                                        </label>

                                        <label className="flex items-center gap-2 text-xs text-neutral-600">
                                            <input
                                                type="checkbox"
                                                checked={item.expired_ok}
                                                onChange={(e) =>
                                                    updateReceiveItem(index, {
                                                        expired_ok:
                                                            e.target.checked,
                                                    })
                                                }
                                            />
                                            Cek Expired OK
                                        </label>
                                    </div>

                                    {Number(item.qty_received) <
                                        Number(item.qty_sent) && (
                                        <p className="mt-2 text-xs text-red-600">
                                            Selisih{' '}
                                            {Number(item.qty_sent) -
                                                Number(item.qty_received)}{' '}
                                            akan dicatat sebagai kerugian
                                            (write-off).
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {receiveErrors.items && (
                            <p className="mt-2 text-sm text-red-600">
                                {receiveErrors.items}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReceiveDelivery(null)}
                                className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={receiveProcessing}
                                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                            >
                                Konfirmasi Terima
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
