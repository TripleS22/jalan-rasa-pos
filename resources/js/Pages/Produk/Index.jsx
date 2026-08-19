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

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function ProdukIndex({ products, categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            category_id: '',
            sourcing_type: 'made',
            shelf_life_days: '',
            name: '',
            sku: '',
            unit: 'pcs',
            price: '',
            cost_price: '',
            image: '',
            is_active: true,
        });

    function applySearch(e) {
        e.preventDefault();

        router.get(
            route('produk.index'),
            { search },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        reset();
        clearErrors();
        setModalOpen(true);
    }

    function openEdit(product) {
        setEditing(product);
        setData({
            category_id: product.category_id ?? '',
            sourcing_type: product.sourcing_type,
            shelf_life_days: product.shelf_life_days ?? '',
            name: product.name,
            sku: product.sku ?? '',
            unit: product.unit,
            price: product.price,
            cost_price: product.cost_price,
            image: product.image ?? '',
            is_active: product.is_active,
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
            put(route('produk.update', editing.id), options);
        } else {
            post(route('produk.store'), options);
        }
    }

    function destroy(product) {
        if (!confirm(`Hapus produk "${product.name}"?`)) {
            return;
        }

        router.delete(route('produk.destroy', product.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Produk
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Tambah Produk
                    </button>
                </div>
            }
        >
            <Head title="Produk" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={applySearch} className="mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari produk..."
                            className="w-full max-w-sm rounded-full border-neutral-300 text-sm shadow-sm sm:w-64"
                        />
                    </form>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Harga
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        HPP
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Stok
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {products.data.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-400">
                                                        {initials(
                                                            product.name,
                                                        )}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        {product.sku ?? '-'}
                                                        {' · '}
                                                        {product.sourcing_type ===
                                                        'made'
                                                            ? 'Produksi Sendiri'
                                                            : 'Beli Jadi'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {product.category?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-neutral-900">
                                            {formatRupiah(product.price)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-500">
                                            {formatRupiah(
                                                product.cost_price,
                                            )}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right text-sm font-medium ${
                                                Number(
                                                    product.available_stock,
                                                ) > 0
                                                    ? 'text-neutral-900'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {product.available_stock ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    product.is_active
                                                        ? 'bg-neutral-900 text-white'
                                                        : 'bg-neutral-100 text-neutral-500'
                                                }`}
                                            >
                                                {product.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <button
                                                onClick={() =>
                                                    openEdit(product)
                                                }
                                                className="mr-3 text-neutral-600 hover:text-neutral-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    destroy(product)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {products.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada produk.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.links && products.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {products.links.map((link, index) => (
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
                        {editing ? 'Edit Produk' : 'Tambah Produk'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Nama Produk
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
                                Tipe Produk
                            </label>
                            <select
                                value={data.sourcing_type}
                                onChange={(e) =>
                                    setData('sourcing_type', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="made">Produksi Sendiri</option>
                                <option value="resell">Beli Jadi</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Masa Simpan (hari)
                            </label>
                            <NumberInput
                                value={data.shelf_life_days}
                                onChange={(value) =>
                                    setData('shelf_life_days', value)
                                }
                                placeholder="Opsional"
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            <p className="mt-1 text-xs text-neutral-400">
                                Dipakai buat auto-isi tanggal expired saat
                                produksi/pembelian.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                SKU
                            </label>
                            <input
                                type="text"
                                value={data.sku}
                                onChange={(e) =>
                                    setData('sku', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.sku && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.sku}
                                </p>
                            )}
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
                                placeholder="pcs, porsi, gelas"
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Harga Jual
                            </label>
                            <NumberInput
                                prefix="Rp"
                                value={data.price}
                                onChange={(value) =>
                                    setData('price', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.price}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                HPP (Modal)
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

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-neutral-600">
                                URL Gambar
                            </label>
                            <input
                                type="text"
                                value={data.image}
                                onChange={(e) =>
                                    setData('image', e.target.value)
                                }
                                placeholder="https://..."
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.image}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="rounded border-neutral-300"
                            />
                            <label
                                htmlFor="is_active"
                                className="text-sm text-neutral-600"
                            >
                                Aktif dijual
                            </label>
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
