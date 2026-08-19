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

export default function ReturSupplierIndex({ returns, purchases }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [purchaseId, setPurchaseId] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        purchase_item_id: '',
        qty: '',
        reason: '',
        notes: '',
    });

    const selectedPurchase = useMemo(
        () => purchases.find((p) => p.id === Number(purchaseId)),
        [purchases, purchaseId],
    );

    function openCreate() {
        reset();
        setPurchaseId('');
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        post(route('retur-supplier.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Retur Supplier
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
            <Head title="Retur Supplier" />

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
                                        No. Invoice
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Supplier
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Alasan
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
                                            {item.purchase?.invoice_no}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {item.purchase?.supplier?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {item.purchasable?.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {item.qty}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {item.reason}
                                        </td>
                                    </tr>
                                ))}

                                {returns.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada retur supplier.
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
                        Catat Retur Supplier
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Pembelian
                        </label>
                        <select
                            value={purchaseId}
                            onChange={(e) => {
                                setPurchaseId(e.target.value);
                                setData('purchase_item_id', '');
                            }}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="">Pilih pembelian</option>
                            {purchases.map((purchase) => (
                                <option key={purchase.id} value={purchase.id}>
                                    {purchase.invoice_no} —{' '}
                                    {purchase.supplier?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPurchase && (
                        <div className="mb-4">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Item yang Diretur
                            </label>
                            <select
                                value={data.purchase_item_id}
                                onChange={(e) =>
                                    setData(
                                        'purchase_item_id',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih item</option>
                                {selectedPurchase.items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.purchasable?.name} (diterima{' '}
                                        {item.qty})
                                    </option>
                                ))}
                            </select>
                            {errors.purchase_item_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.purchase_item_id}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mb-4">
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
                            placeholder="Barang rusak, tidak sesuai pesanan, dll"
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
