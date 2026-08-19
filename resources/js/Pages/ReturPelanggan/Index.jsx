import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function formatDateTime(value) {
    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const ACTION_LABEL = {
    restock: 'Restock',
    waste: 'Waste',
};

export default function ReturPelangganIndex({ returns, orders }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [orderId, setOrderId] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        order_item_id: '',
        qty: '',
        reason: '',
        action: 'restock',
        notes: '',
    });

    const selectedOrder = useMemo(
        () => orders.find((o) => o.id === Number(orderId)),
        [orders, orderId],
    );

    function openCreate() {
        reset();
        setOrderId('');
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        post(route('retur-pelanggan.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Retur Pelanggan
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Catat Retur
                    </button>
                </div>
            }
        >
            <Head title="Retur Pelanggan" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        No. Order
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Alasan
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {returns.data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(
                                                item.created_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {item.order?.order_no}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {item.product?.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {item.qty}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {item.reason}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    item.action ===
                                                    'restock'
                                                        ? 'bg-neutral-900 text-white'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {ACTION_LABEL[item.action]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {returns.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada retur pelanggan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {returns.links && returns.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {returns.links.map((link, index) => (
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

            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Catat Retur Pelanggan
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Order
                        </label>
                        <select
                            value={orderId}
                            onChange={(e) => {
                                setOrderId(e.target.value);
                                setData('order_item_id', '');
                            }}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="">Pilih order</option>
                            {orders.map((order) => (
                                <option key={order.id} value={order.id}>
                                    {order.order_no} —{' '}
                                    {formatDateTime(order.created_at)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedOrder && (
                        <div className="mb-4">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Item yang Diretur
                            </label>
                            <select
                                value={data.order_item_id}
                                onChange={(e) =>
                                    setData(
                                        'order_item_id',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih item</option>
                                {selectedOrder.items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.product?.name} (terjual{' '}
                                        {item.qty})
                                    </option>
                                ))}
                            </select>
                            {errors.order_item_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.order_item_id}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Qty Retur
                            </label>
                            <NumberInput
                                value={data.qty}
                                onChange={(value) => setData('qty', value)}
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.qty && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.qty}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Aksi
                            </label>
                            <select
                                value={data.action}
                                onChange={(e) =>
                                    setData('action', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="restock">
                                    Restock (barang masih layak jual)
                                </option>
                                <option value="waste">
                                    Waste (barang dibuang)
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Alasan
                        </label>
                        <input
                            type="text"
                            value={data.reason}
                            onChange={(e) =>
                                setData('reason', e.target.value)
                            }
                            placeholder="Salah pesan, komplain kualitas, dll"
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.reason}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Catatan
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) =>
                                setData('notes', e.target.value)
                            }
                            rows={2}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
