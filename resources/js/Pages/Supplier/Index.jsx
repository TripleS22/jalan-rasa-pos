import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SupplierIndex({ suppliers, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            phone: '',
            email: '',
            address: '',
        });

    function applySearch(e) {
        e.preventDefault();

        router.get(
            route('supplier.index'),
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

    function openEdit(supplier) {
        setEditing(supplier);
        setData({
            name: supplier.name,
            phone: supplier.phone ?? '',
            email: supplier.email ?? '',
            address: supplier.address ?? '',
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
            put(route('supplier.update', editing.id), options);
        } else {
            post(route('supplier.store'), options);
        }
    }

    function destroy(supplier) {
        if (!confirm(`Hapus supplier "${supplier.name}"?`)) {
            return;
        }

        router.delete(route('supplier.destroy', supplier.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Supplier
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Tambah Supplier
                    </button>
                </div>
            }
        >
            <Head title="Supplier" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
                            placeholder="Cari supplier..."
                            className="w-full max-w-sm rounded-full border-neutral-300 text-sm shadow-sm sm:w-64"
                        />
                    </form>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Telepon
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Email
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {suppliers.data.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {supplier.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {supplier.phone ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {supplier.email ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <button
                                                onClick={() =>
                                                    openEdit(supplier)
                                                }
                                                className="mr-3 text-neutral-600 hover:text-neutral-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    destroy(supplier)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {suppliers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada supplier.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {suppliers.links && suppliers.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {suppliers.links.map((link, index) => (
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
                        {editing ? 'Edit Supplier' : 'Tambah Supplier'}
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Nama Supplier
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

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Telepon
                        </label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Alamat
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(e) =>
                                setData('address', e.target.value)
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
