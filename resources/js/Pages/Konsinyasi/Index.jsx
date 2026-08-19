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

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const STATUS_LABEL = {
    open: 'Berjalan',
    settled: 'Selesai',
};

function StatusBadge({ status }) {
    const styles = {
        open: 'bg-blue-100 text-blue-700',
        settled: 'bg-neutral-900 text-white',
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
    return { product_id: '', qty_sent: '', price: '' };
}

export default function KonsinyasiIndex({
    consignments,
    partners,
    products,
    filters,
}) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [settleTarget, setSettleTarget] = useState(null);

    const createForm = useForm({
        consignment_partner_id: '',
        sent_date: new Date().toISOString().slice(0, 10),
        notes: '',
        items: [emptyItem()],
    });

    const settleForm = useForm({ items: [] });

    function applyFilters(newStatus) {
        setStatus(newStatus);
        router.get(
            route('konsinyasi.index'),
            { status: newStatus || undefined },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        createForm.reset();
        createForm.setData('items', [emptyItem()]);
        setCreateOpen(true);
    }

    function updateItem(index, changes) {
        createForm.setData(
            'items',
            createForm.data.items.map((item, i) =>
                i === index ? { ...item, ...changes } : item,
            ),
        );
    }

    function onSelectProduct(index, id) {
        const product = products.find((p) => p.id === Number(id));
        updateItem(index, {
            product_id: id,
            price: product ? product.price : '',
        });
    }

    function addItemRow() {
        createForm.setData('items', [...createForm.data.items, emptyItem()]);
    }

    function removeItemRow(index) {
        createForm.setData(
            'items',
            createForm.data.items.filter((_, i) => i !== index),
        );
    }

    function submitCreate(e) {
        e.preventDefault();

        createForm.post(route('konsinyasi.store'), {
            onSuccess: () => setCreateOpen(false),
            preserveScroll: true,
        });
    }

    function openSettle(consignment) {
        setSettleTarget(consignment);
        settleForm.setData(
            'items',
            consignment.items.map((item) => ({
                id: item.id,
                product_name: item.product.name,
                qty_sent: item.qty_sent,
                qty_sold: item.qty_sold || 0,
                qty_returned:
                    item.qty_returned ||
                    item.qty_sent - (item.qty_sold || 0),
            })),
        );
    }

    function updateSettleItem(index, changes) {
        settleForm.setData(
            'items',
            settleForm.data.items.map((item, i) =>
                i === index ? { ...item, ...changes } : item,
            ),
        );
    }

    function submitSettle(e) {
        e.preventDefault();

        settleForm.put(route('konsinyasi.update', settleTarget.id), {
            onSuccess: () => setSettleTarget(null),
            preserveScroll: true,
        });
    }

    function destroy(consignment) {
        if (!confirm(`Hapus konsinyasi ${consignment.code}?`)) {
            return;
        }

        router.delete(route('konsinyasi.destroy', consignment.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Konsinyasi
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Kirim Konsinyasi
                    </button>
                </div>
            }
        >
            <Head title="Konsinyasi" />

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
                            ['open', 'Berjalan'],
                            ['settled', 'Selesai'],
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
                                        Kode
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tanggal Kirim
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Mitra
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
                                {consignments.data.map((consignment) => (
                                    <tr key={consignment.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {consignment.code}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDate(
                                                consignment.sent_date,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {consignment.partner?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {consignment.items
                                                .map(
                                                    (item) =>
                                                        `${item.product?.name} (${item.qty_sent})`,
                                                )
                                                .join(', ')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge
                                                status={consignment.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {consignment.status ===
                                                'open' && (
                                                <button
                                                    onClick={() =>
                                                        openSettle(
                                                            consignment,
                                                        )
                                                    }
                                                    className="mr-3 text-neutral-600 hover:text-neutral-900"
                                                >
                                                    Settle
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    destroy(consignment)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {consignments.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada konsinyasi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {consignments.links && consignments.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {consignments.links.map((link, index) => (
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

            {/* Create modal */}
            <Modal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                maxWidth="2xl"
            >
                <form onSubmit={submitCreate} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Kirim Konsinyasi
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Mitra
                            </label>
                            <select
                                value={createForm.data.consignment_partner_id}
                                onChange={(e) =>
                                    createForm.setData(
                                        'consignment_partner_id',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih mitra</option>
                                {partners.map((partner) => (
                                    <option
                                        key={partner.id}
                                        value={partner.id}
                                    >
                                        {partner.name}
                                    </option>
                                ))}
                            </select>
                            {createForm.errors.consignment_partner_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        createForm.errors
                                            .consignment_partner_id
                                    }
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Tanggal Kirim
                            </label>
                            <input
                                type="date"
                                value={createForm.data.sent_date}
                                onChange={(e) =>
                                    createForm.setData(
                                        'sent_date',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm text-neutral-600">
                            Item Konsinyasi
                        </label>
                        <button
                            type="button"
                            onClick={addItemRow}
                            className="text-sm font-medium text-neutral-900 hover:underline"
                        >
                            + Tambah item
                        </button>
                    </div>

                    <div className="max-h-64 space-y-3 overflow-y-auto">
                        {createForm.data.items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 items-start gap-2 rounded-lg border border-neutral-200 p-3"
                            >
                                <select
                                    value={item.product_id}
                                    onChange={(e) =>
                                        onSelectProduct(
                                            index,
                                            e.target.value,
                                        )
                                    }
                                    className="col-span-6 rounded-lg border-neutral-300 text-xs shadow-sm"
                                >
                                    <option value="">Pilih produk</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="col-span-2">
                                    <NumberInput
                                        value={item.qty_sent}
                                        onChange={(value) =>
                                            updateItem(index, {
                                                qty_sent: value,
                                            })
                                        }
                                        placeholder="Qty"
                                        className="w-full rounded-lg border-neutral-300 text-xs shadow-sm"
                                    />
                                </div>

                                <div className="col-span-3">
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
                                    disabled={
                                        createForm.data.items.length === 1
                                    }
                                    className="col-span-1 flex h-8 items-center justify-center text-neutral-400 hover:text-red-600 disabled:opacity-30"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {createForm.errors.items && (
                        <p className="mt-2 text-sm text-red-600">
                            {createForm.errors.items}
                        </p>
                    )}

                    <div className="mb-6 mt-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Catatan
                        </label>
                        <textarea
                            value={createForm.data.notes}
                            onChange={(e) =>
                                createForm.setData('notes', e.target.value)
                            }
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
                            disabled={createForm.processing}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            Kirim
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Settle modal */}
            <Modal
                show={!!settleTarget}
                onClose={() => setSettleTarget(null)}
                maxWidth="lg"
            >
                {settleTarget && (
                    <form onSubmit={submitSettle} className="p-6">
                        <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                            Settle {settleTarget.code}
                        </h3>
                        <p className="mb-4 text-sm text-neutral-500">
                            Isi jumlah terjual & retur untuk setiap item.
                        </p>

                        <div className="space-y-3">
                            {settleForm.data.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-neutral-200 p-3"
                                >
                                    <div className="mb-2 flex items-center justify-between text-sm font-medium text-neutral-900">
                                        <span>{item.product_name}</span>
                                        <span className="text-neutral-500">
                                            Dikirim: {item.qty_sent}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs text-neutral-500">
                                                Terjual
                                            </label>
                                            <NumberInput
                                                value={item.qty_sold}
                                                onChange={(value) =>
                                                    updateSettleItem(index, {
                                                        qty_sold: value,
                                                    })
                                                }
                                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs text-neutral-500">
                                                Retur
                                            </label>
                                            <NumberInput
                                                value={item.qty_returned}
                                                onChange={(value) =>
                                                    updateSettleItem(index, {
                                                        qty_returned: value,
                                                    })
                                                }
                                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSettleTarget(null)}
                                className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={settleForm.processing}
                                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                            >
                                Selesaikan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
