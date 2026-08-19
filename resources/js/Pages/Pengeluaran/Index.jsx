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

export default function PengeluaranIndex({
    expenses,
    totalAmount,
    categories,
    filters,
}) {
    const { flash } = usePage().props;
    const [category, setCategory] = useState(filters.category ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            category: '',
            description: '',
            amount: '',
        });

    function applyFilters(e) {
        e?.preventDefault();

        router.get(
            route('pengeluaran.index'),
            { category, from, to },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        reset();
        clearErrors();
        setModalOpen(true);
    }

    function openEdit(expense) {
        setEditing(expense);
        setData({
            category: expense.category,
            description: expense.description ?? '',
            amount: expense.amount,
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
            put(route('pengeluaran.update', editing.id), options);
        } else {
            post(route('pengeluaran.store'), options);
        }
    }

    function destroy(expense) {
        if (!confirm(`Hapus pengeluaran "${expense.category}" sebesar ${formatRupiah(expense.amount)}?`)) {
            return;
        }

        router.delete(route('pengeluaran.destroy', expense.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Pengeluaran
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Catat Pengeluaran
                    </button>
                </div>
            }
        >
            <Head title="Pengeluaran" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
                        <div className="text-sm text-neutral-500">
                            Total Pengeluaran (sesuai filter)
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-neutral-900">
                            {formatRupiah(totalAmount)}
                        </div>
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Kategori
                            </label>
                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                                className="rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Semua</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Dari
                            </label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Sampai
                            </label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-full bg-neutral-100 px-5 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
                        >
                            Terapkan
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Keterangan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Dicatat oleh
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Jumlah
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {expenses.data.map((expense) => (
                                    <tr key={expense.id}>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(
                                                expense.created_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {expense.description ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {expense.user?.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                            {formatRupiah(expense.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <button
                                                onClick={() =>
                                                    openEdit(expense)
                                                }
                                                className="mr-3 text-neutral-600 hover:text-neutral-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    destroy(expense)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {expenses.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada pengeluaran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {expenses.links && expenses.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {expenses.links.map((link, index) => (
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
                        {editing
                            ? 'Edit Pengeluaran'
                            : 'Catat Pengeluaran'}
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Kategori
                        </label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={(e) =>
                                setData('category', e.target.value)
                            }
                            list="expense-categories"
                            placeholder="Listrik, Sewa, Gaji, dll"
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        <datalist id="expense-categories">
                            {categories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Jumlah
                        </label>
                        <NumberInput
                            prefix="Rp"
                            value={data.amount}
                            onChange={(value) => setData('amount', value)}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Keterangan
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
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
