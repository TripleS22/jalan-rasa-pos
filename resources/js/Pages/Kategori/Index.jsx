import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const TYPE_LABEL = {
    product: 'Produk',
    raw_material: 'Bahan Baku',
};

export default function KategoriIndex({ categories }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            type: 'product',
        });

    function openCreate() {
        setEditing(null);
        reset();
        clearErrors();
        setModalOpen(true);
    }

    function openEdit(category) {
        setEditing(category);
        setData({ name: category.name, type: category.type });
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
            put(route('kategori.update', editing.id), options);
        } else {
            post(route('kategori.store'), options);
        }
    }

    function destroy(category) {
        if (
            !confirm(
                `Hapus kategori "${category.name}"? Produk/bahan baku terkait tidak akan terhapus.`,
            )
        ) {
            return;
        }

        router.delete(route('kategori.destroy', category.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Kategori
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Tambah Kategori
                    </button>
                </div>
            }
        >
            <Head title="Kategori" />

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
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tipe
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Jumlah Item
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {category.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                                                {TYPE_LABEL[category.type]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {category.type === 'product'
                                                ? category.products_count
                                                : category.raw_materials_count}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <button
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                                className="mr-3 text-neutral-600 hover:text-neutral-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    destroy(category)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {categories.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada kategori.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Nama Kategori
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Tipe
                        </label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="product">Produk</option>
                            <option value="raw_material">Bahan Baku</option>
                        </select>
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
