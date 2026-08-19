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

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function BahanBakuIndex({ rawMaterials, categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [lowStockOnly, setLowStockOnly] = useState(!!filters.low_stock);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            category_id: '',
            name: '',
            unit: 'gram',
            stock_qty: '',
            min_stock: '',
            cost_price: '',
        });

    function applyFilters(e) {
        e?.preventDefault();

        router.get(
            route('bahan-baku.index'),
            { search, low_stock: lowStockOnly ? 1 : undefined },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        reset();
        clearErrors();
        setModalOpen(true);
    }

    function openEdit(item) {
        setEditing(item);
        setData({
            category_id: item.category_id ?? '',
            name: item.name,
            unit: item.unit,
            stock_qty: item.stock_qty,
            min_stock: item.min_stock,
            cost_price: item.cost_price,
        });
        clearErrors();
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        const options = {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        };

        if (editing) {
            put(route('bahan-baku.update', editing.id), options);
        } else {
            post(route('bahan-baku.store'), options);
        }
    }

    function destroy(item) {
        if (!confirm(`Hapus bahan baku "${item.name}"?`)) {
            return;
        }

        router.delete(route('bahan-baku.destroy', item.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Bahan Baku
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Tambah Bahan Baku
                    </button>
                </div>
            }
        >
            <Head title="Bahan Baku" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <form
                        onSubmit={applyFilters}
                        className="mb-6 flex flex-wrap items-center gap-3"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari bahan baku..."
                            className="w-full max-w-sm rounded-full border-neutral-300 text-sm shadow-sm sm:w-64"
                        />
                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                            <input
                                type="checkbox"
                                checked={lowStockOnly}
                                onChange={(e) => {
                                    setLowStockOnly(e.target.checked);
                                    router.get(
                                        route('bahan-baku.index'),
                                        {
                                            search,
                                            low_stock: e.target.checked
                                                ? 1
                                                : undefined,
                                        },
                                        { preserveState: true, replace: true },
                                    );
                                }}
                                className="rounded border-neutral-300"
                            />
                            Perlu restock saja
                        </label>
                        <button
                            type="submit"
                            className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-200"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Bahan Baku
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Stok
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Min. Stok
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Harga Satuan
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {rawMaterials.data.map((item) => {
                                    const low =
                                        Number(item.stock_qty) <=
                                        Number(item.min_stock);

                                    return (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                                                    {low && (
                                                        <span
                                                            className="h-2 w-2 rounded-full bg-red-500"
                                                            title="Perlu restock"
                                                        />
                                                    )}
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-600">
                                                {item.category?.name ?? '-'}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right text-sm font-medium ${
                                                    low
                                                        ? 'text-red-600'
                                                        : 'text-neutral-900'
                                                }`}
                                            >
                                                {formatNumber(
                                                    item.stock_qty,
                                                )}{' '}
                                                {item.unit}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-neutral-500">
                                                {formatNumber(
                                                    item.min_stock,
                                                )}{' '}
                                                {item.unit}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                                {formatRupiah(
                                                    item.cost_price,
                                                )}
                                                /{item.unit}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    className="mr-3 text-neutral-600 hover:text-neutral-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        destroy(item)
                                                    }
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {rawMaterials.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada bahan baku.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {rawMaterials.links && rawMaterials.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {rawMaterials.links.map((link, index) => (
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
                maxWidth="lg"
            >
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        {editing ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Nama Bahan Baku
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Kategori
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Tanpa kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Satuan
                            </label>
                            <input
                                type="text"
                                value={data.unit}
                                onChange={(e) =>
                                    setData('unit', e.target.value)
                                }
                                placeholder="gram, ml, pcs"
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Stok Awal
                                {editing && (
                                    <span className="ml-1 text-xs text-neutral-400">
                                        (ubah lewat Pembelian)
                                    </span>
                                )}
                            </label>
                            <NumberInput
                                value={data.stock_qty}
                                onChange={(value) =>
                                    setData('stock_qty', value)
                                }
                                disabled={!!editing}
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm disabled:bg-neutral-100 disabled:text-neutral-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Stok Minimum
                            </label>
                            <NumberInput
                                value={data.min_stock}
                                onChange={(value) =>
                                    setData('min_stock', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Harga per Satuan
                            </label>
                            <NumberInput
                                prefix="Rp"
                                value={data.cost_price}
                                onChange={(value) =>
                                    setData('cost_price', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
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
