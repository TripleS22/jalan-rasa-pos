import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const STATUS_LABEL = {
    pending: 'Pending',
    ready: 'Siap Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const NEXT_STATUS = {
    pending: 'ready',
    ready: 'completed',
};

const NEXT_LABEL = {
    pending: 'Tandai Siap',
    ready: 'Tandai Diambil',
};

function StatusBadge({ status }) {
    const styles = {
        completed: 'bg-neutral-900 text-white',
        ready: 'bg-blue-100 text-blue-700',
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

export default function PreOrderPanel({
    preOrders,
    products,
    customers,
    filters,
}) {
    const [status, setStatus] = useState(filters.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [cart, setCart] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        pickup_date: '',
        down_payment: '',
        notes: '',
        items: [],
    });

    function applyFilters(newStatus) {
        setStatus(newStatus);
        router.get(
            route('kasir.index'),
            { preorder_status: newStatus || undefined },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        reset();
        setCart([]);
        setModalOpen(true);
    }

    function addToCart(product) {
        setCart((current) => {
            const existing = current.find((item) => item.id === product.id);

            if (existing) {
                return current.map((item) =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item,
                );
            }

            return [
                ...current,
                {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    qty: 1,
                },
            ];
        });
    }

    function updateQty(id, qty) {
        if (qty < 1) {
            setCart((current) => current.filter((item) => item.id !== id));
            return;
        }

        setCart((current) =>
            current.map((item) => (item.id === id ? { ...item, qty } : item)),
        );
    }

    const cartTotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        [cart],
    );

    function submit(e) {
        e.preventDefault();

        if (cart.length === 0) {
            return;
        }

        post(route('pre-order.store'), {
            data: {
                ...data,
                items: cart.map((item) => ({
                    product_id: item.id,
                    qty: item.qty,
                })),
            },
            onSuccess: () => {
                setModalOpen(false);
                setCart([]);
            },
            preserveScroll: true,
            preserveState: true,
        });
    }

    function advanceStatus(preOrder) {
        const next = NEXT_STATUS[preOrder.status];

        router.put(
            route('pre-order.update', preOrder.id),
            { status: next },
            { preserveScroll: true, preserveState: true },
        );
    }

    function cancel(preOrder) {
        if (!confirm(`Batalkan pre-order ${preOrder.order_no}?`)) {
            return;
        }

        router.put(
            route('pre-order.update', preOrder.id),
            { status: 'cancelled' },
            { preserveScroll: true, preserveState: true },
        );
    }

    function destroy(preOrder) {
        if (!confirm(`Hapus pre-order ${preOrder.order_no}?`)) {
            return;
        }

        router.delete(route('pre-order.destroy', preOrder.id), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pre-Order
                </h2>
                <button
                    onClick={openCreate}
                    className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                >
                    + Tambah Pre-Order
                </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {[
                    ['', 'Semua'],
                    ['pending', 'Pending'],
                    ['ready', 'Siap Diambil'],
                    ['completed', 'Selesai'],
                    ['cancelled', 'Dibatalkan'],
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
                                No. Order
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Ambil
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Pelanggan
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Item
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Total
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {preOrders.data.map((preOrder) => (
                            <tr key={preOrder.id}>
                                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                    {preOrder.order_no}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-500">
                                    {formatDate(preOrder.pickup_date)}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    {preOrder.customer?.name ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    {preOrder.items
                                        .map(
                                            (item) =>
                                                `${item.product?.name} ×${item.qty}`,
                                        )
                                        .join(', ')}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={preOrder.status} />
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                    {formatRupiah(preOrder.total)}
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    {NEXT_STATUS[preOrder.status] && (
                                        <button
                                            onClick={() =>
                                                advanceStatus(preOrder)
                                            }
                                            className="mr-3 text-neutral-600 hover:text-neutral-900"
                                        >
                                            {NEXT_LABEL[preOrder.status]}
                                        </button>
                                    )}
                                    {['pending', 'ready'].includes(
                                        preOrder.status,
                                    ) && (
                                        <button
                                            onClick={() => cancel(preOrder)}
                                            className="mr-3 text-neutral-500 hover:text-red-600"
                                        >
                                            Batalkan
                                        </button>
                                    )}
                                    <button
                                        onClick={() => destroy(preOrder)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {preOrders.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-8 text-center text-sm text-neutral-500"
                                >
                                    Belum ada pre-order.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {preOrders.links && preOrders.data.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {preOrders.links.map((link, index) => (
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

            <Modal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="2xl"
            >
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Tambah Pre-Order
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Pelanggan (opsional)
                            </label>
                            <select
                                value={data.customer_id}
                                onChange={(e) =>
                                    setData('customer_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Tanpa pelanggan</option>
                                {customers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                    >
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Tanggal Pengambilan
                            </label>
                            <input
                                type="date"
                                value={data.pickup_date}
                                onChange={(e) =>
                                    setData('pickup_date', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.pickup_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.pickup_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-2 text-sm text-neutral-600">
                        Pilih Produk
                    </div>
                    <div className="mb-4 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                        {products.map((product) => (
                            <button
                                type="button"
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="rounded-lg border border-neutral-200 p-2 text-left text-xs hover:border-neutral-400"
                            >
                                <div className="font-medium text-neutral-900">
                                    {product.name}
                                </div>
                                <div className="text-neutral-500">
                                    {formatRupiah(product.price)}
                                </div>
                            </button>
                        ))}
                    </div>

                    {cart.length > 0 && (
                        <div className="mb-4 space-y-2 rounded-lg border border-neutral-200 p-3">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-neutral-700">
                                        {item.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQty(
                                                    item.id,
                                                    item.qty - 1,
                                                )
                                            }
                                            className="h-6 w-6 rounded-full border border-neutral-300 text-neutral-600"
                                        >
                                            −
                                        </button>
                                        <span className="w-5 text-center">
                                            {item.qty}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQty(
                                                    item.id,
                                                    item.qty + 1,
                                                )
                                            }
                                            className="h-6 w-6 rounded-full border border-neutral-300 text-neutral-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-900">
                                <span>Total</span>
                                <span>{formatRupiah(cartTotal)}</span>
                            </div>
                        </div>
                    )}

                    {errors.items && (
                        <p className="mb-4 text-sm text-red-600">
                            {errors.items}
                        </p>
                    )}

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Uang Muka (DP)
                        </label>
                        <NumberInput
                            prefix="Rp"
                            value={data.down_payment}
                            onChange={(value) =>
                                setData('down_payment', value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
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
                            disabled={processing || cart.length === 0}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
