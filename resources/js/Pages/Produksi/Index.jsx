import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function ProduksiIndex({ productions, products }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        qty: '',
        produced_at: new Date().toISOString().slice(0, 10),
        expired_at: '',
        notes: '',
    });

    function openCreate() {
        reset();
        setModalOpen(true);
    }

    function onSelectProduct(id) {
        const product = products.find((p) => p.id === Number(id));

        let expiredAt = '';

        if (product?.shelf_life_days) {
            const date = new Date(data.produced_at);
            date.setDate(date.getDate() + product.shelf_life_days);
            expiredAt = date.toISOString().slice(0, 10);
        }

        setData((prev) => ({
            ...prev,
            product_id: id,
            expired_at: expiredAt,
        }));
    }

    function submit(e) {
        e.preventDefault();

        post(route('produksi.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Produksi
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Catat Produksi
                    </button>
                </div>
            }
        >
            <Head title="Produksi" />

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
                                        Tanggal Produksi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Expired
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Dicatat oleh
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status QC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {productions.data.map((production) => (
                                    <tr key={production.id}>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {formatDate(
                                                production.produced_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {production.product?.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {production.qty}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {production.expired_at
                                                ? formatDate(
                                                      production.expired_at,
                                                  )
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {production.user?.name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    production.qc_check
                                                        ? 'bg-neutral-900 text-white'
                                                        : 'bg-neutral-100 text-neutral-500'
                                                }`}
                                            >
                                                {production.qc_check
                                                    ? 'Selesai'
                                                    : 'Menunggu QC'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {productions.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada produksi tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {productions.links && productions.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {productions.links.map((link, index) => (
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
                        Catat Produksi
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Produk
                        </label>
                        <select
                            value={data.product_id}
                            onChange={(e) =>
                                onSelectProduct(e.target.value)
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
                        {products.length === 0 && (
                            <p className="mt-1 text-xs text-neutral-400">
                                Belum ada produk bertipe "Produksi Sendiri"
                                dengan resep.
                            </p>
                        )}
                        {errors.product_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.product_id}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Qty Diproduksi
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
                                Tanggal Produksi
                            </label>
                            <input
                                type="date"
                                value={data.produced_at}
                                onChange={(e) =>
                                    setData('produced_at', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Tanggal Expired
                        </label>
                        <input
                            type="date"
                            value={data.expired_at}
                            onChange={(e) =>
                                setData('expired_at', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        <p className="mt-1 text-xs text-neutral-400">
                            Otomatis terisi dari masa simpan produk, bisa
                            diubah manual.
                        </p>
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
