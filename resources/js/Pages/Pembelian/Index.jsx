import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
    });
}

const STATUS_LABEL = {
    pending: 'Pending',
    received: 'Diterima',
    cancelled: 'Dibatalkan',
};

function StatusBadge({ status }) {
    const styles = {
        received: 'bg-neutral-900 text-white',
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

function emptyItem() {
    return {
        purchasable_type: 'raw_material',
        purchasable_id: '',
        qty: '',
        price: '',
        expired_at: '',
    };
}

export default function PembelianIndex({
    purchases,
    suppliers,
    rawMaterials,
    products,
    filters,
}) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '',
        status: 'received',
        items: [emptyItem()],
    });

    function applyFilters(newStatus) {
        setStatus(newStatus);
        router.get(
            route('pembelian.index'),
            { status: newStatus || undefined },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        reset();
        setModalOpen(true);
    }

    function itemOptions(type) {
        return type === 'raw_material' ? rawMaterials : products;
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

    function onSelectItem(index, type, id) {
        const options = itemOptions(type);
        const selected = options.find((o) => o.id === Number(id));

        updateItem(index, {
            purchasable_id: id,
            price: selected ? selected.cost_price : '',
        });
    }

    const total = data.items.reduce(
        (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
        0,
    );

    function submit(e) {
        e.preventDefault();

        post(route('pembelian.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    function markReceived(purchase) {
        if (!confirm(`Tandai pembelian ${purchase.invoice_no} sebagai diterima? Stok akan otomatis bertambah.`)) {
            return;
        }

        router.put(
            route('pembelian.update', purchase.id),
            { status: 'received' },
            { preserveScroll: true },
        );
    }

    function destroy(purchase) {
        if (!confirm(`Hapus pembelian ${purchase.invoice_no}?`)) {
            return;
        }

        router.delete(route('pembelian.destroy', purchase.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Pembelian
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Catat Pembelian
                    </button>
                </div>
            }
        >
            <Head title="Pembelian" />

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
                            ['pending', 'Pending'],
                            ['received', 'Diterima'],
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
                                        No. Invoice
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Supplier
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
                                {purchases.data.map((purchase) => (
                                    <tr key={purchase.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {purchase.invoice_no}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(
                                                purchase.created_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {purchase.supplier?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {purchase.items
                                                .map(
                                                    (item) =>
                                                        `${item.purchasable?.name} ×${item.qty}`,
                                                )
                                                .join(', ')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge
                                                status={purchase.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                            {formatRupiah(purchase.total)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {purchase.status ===
                                                'pending' && (
                                                <button
                                                    onClick={() =>
                                                        markReceived(
                                                            purchase,
                                                        )
                                                    }
                                                    className="mr-3 text-neutral-600 hover:text-neutral-900"
                                                >
                                                    Tandai Diterima
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    destroy(purchase)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {purchases.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada pembelian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {purchases.links && purchases.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {purchases.links.map((link, index) => (
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

            <Modal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="2xl"
            >
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Catat Pembelian
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Supplier
                            </label>
                            <select
                                value={data.supplier_id}
                                onChange={(e) =>
                                    setData('supplier_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih supplier</option>
                                {suppliers.map((supplier) => (
                                    <option
                                        key={supplier.id}
                                        value={supplier.id}
                                    >
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                            {errors.supplier_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.supplier_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="received">
                                    Diterima langsung (stok masuk sekarang)
                                </option>
                                <option value="pending">
                                    Pending (belum masuk stok)
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm text-neutral-600">
                            Item Pembelian
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
                                className="rounded-lg border border-neutral-200 p-3"
                            >
                                <div className="grid grid-cols-12 items-start gap-2">
                                    <select
                                        value={item.purchasable_type}
                                        onChange={(e) =>
                                            updateItem(index, {
                                                purchasable_type:
                                                    e.target.value,
                                                purchasable_id: '',
                                                price: '',
                                                expired_at: '',
                                            })
                                        }
                                        className="col-span-3 rounded-lg border-neutral-300 text-xs shadow-sm"
                                    >
                                        <option value="raw_material">
                                            Bahan Baku
                                        </option>
                                        <option value="product">
                                            Produk
                                        </option>
                                    </select>

                                    <select
                                        value={item.purchasable_id}
                                        onChange={(e) =>
                                            onSelectItem(
                                                index,
                                                item.purchasable_type,
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-4 rounded-lg border-neutral-300 text-xs shadow-sm"
                                    >
                                        <option value="">Pilih item</option>
                                        {itemOptions(
                                            item.purchasable_type,
                                        ).map((option) => (
                                            <option
                                                key={option.id}
                                                value={option.id}
                                            >
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="col-span-2">
                                        <NumberInput
                                            value={item.qty}
                                            onChange={(value) =>
                                                updateItem(index, {
                                                    qty: value,
                                                })
                                            }
                                            placeholder="Qty"
                                            className="w-full rounded-lg border-neutral-300 text-xs shadow-sm"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <NumberInput
                                            prefix="Rp"
                                            value={item.price}
                                            onChange={(value) =>
                                                updateItem(index, {
                                                    price: value,
                                                })
                                            }
                                            placeholder="Harga"
                                            className="w-full rounded-lg border-neutral-300 text-xs shadow-sm"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItemRow(index)}
                                        disabled={data.items.length === 1}
                                        className="col-span-1 flex h-8 items-center justify-center text-neutral-400 hover:text-red-600 disabled:opacity-30"
                                    >
                                        ×
                                    </button>
                                </div>

                                {item.purchasable_type === 'product' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <label className="text-xs text-neutral-500">
                                            Tanggal Expired
                                        </label>
                                        <input
                                            type="date"
                                            value={item.expired_at}
                                            onChange={(e) =>
                                                updateItem(index, {
                                                    expired_at:
                                                        e.target.value,
                                                })
                                            }
                                            className="rounded-lg border-neutral-300 text-xs shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.items && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.items}
                        </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
                        <span>Total</span>
                        <span>{formatRupiah(total)}</span>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
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
