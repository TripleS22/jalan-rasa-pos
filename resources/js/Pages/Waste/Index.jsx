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
    }).format(value || 0);
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

const SOURCE_TYPE_LABEL = {
    production_waste: 'Waste Produksi',
    recall: 'Recall',
    expired: 'Kedaluwarsa',
    other: 'Lainnya',
};

function KpiCard({ label, value, sub }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm text-neutral-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {value}
            </div>
            {sub && <div className="mt-1 text-xs text-neutral-400">{sub}</div>}
        </div>
    );
}

export default function WasteIndex({ rows, kpi, outlets, products, users }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        outlet_id: '',
        product_id: '',
        source_type: 'production_waste',
        qty: '',
        reason: '',
        pic_user_id: '',
        notes: '',
    });

    function openCreate() {
        reset();
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        post(route('waste.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    const bySource = Object.entries(kpi.by_source ?? {});

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Waste & Recall
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Catat Waste
                    </button>
                </div>
            }
        >
            <Head title="Waste & Recall" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard
                            label="Total Kerugian"
                            value={formatRupiah(kpi.total_loss)}
                            sub="Estimasi nilai barang hilang/rusak"
                        />
                        <KpiCard
                            label="Total Qty Terdampak"
                            value={kpi.total_qty}
                        />
                        <KpiCard
                            label="Sumber Terbanyak"
                            value={
                                bySource.length > 0
                                    ? bySource.sort(
                                          (a, b) => b[1].loss - a[1].loss,
                                      )[0][0]
                                    : '-'
                            }
                        />
                    </div>

                    {bySource.length > 0 && (
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {bySource.map(([label, val]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-neutral-200 bg-white p-3"
                                >
                                    <div className="text-xs text-neutral-500">
                                        {label}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-neutral-900">
                                        {formatRupiah(val.loss)}
                                    </div>
                                    <div className="text-xs text-neutral-400">
                                        {val.qty} unit
                                    </div>
                                </div>
                            ))}
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
                                        Sumber
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Outlet
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Estimasi Rugi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Alasan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        PIC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {rows.map((row, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(row.date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {row.source_label}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {row.product_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {row.outlet_name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {row.qty}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                                            {formatRupiah(row.estimated_loss)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {row.reason ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {row.pic_name ?? '-'}
                                        </td>
                                    </tr>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada catatan waste.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="lg"
            >
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Catat Waste / Recall
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Outlet
                            </label>
                            <select
                                value={data.outlet_id}
                                onChange={(e) =>
                                    setData('outlet_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih outlet</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                            {errors.outlet_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.outlet_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Produk
                            </label>
                            <select
                                value={data.product_id}
                                onChange={(e) =>
                                    setData('product_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih produk</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.product_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Jenis
                            </label>
                            <select
                                value={data.source_type}
                                onChange={(e) =>
                                    setData('source_type', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                {Object.entries(SOURCE_TYPE_LABEL).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Qty
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
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.reason}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            PIC
                        </label>
                        <select
                            value={data.pic_user_id}
                            onChange={(e) =>
                                setData('pic_user_id', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="">Pilih PIC</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
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
