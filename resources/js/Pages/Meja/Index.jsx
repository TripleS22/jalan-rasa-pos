import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';

export default function MejaIndex({
    tables,
    outlets,
    filters,
    selfOrderBaseUrl,
}) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [outletFilter, setOutletFilter] = useState(filters.outlet_id ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [qrTable, setQrTable] = useState(null);
    const qrCanvasRef = useRef(null);

    function selfOrderUrlFor(table) {
        return `${selfOrderBaseUrl}/${table.code}`;
    }

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            outlet_id: outlets[0]?.id ?? '',
            table_no: '',
            capacity: 4,
        });

    function applyFilters(e) {
        e?.preventDefault();

        router.get(
            route('meja.index'),
            { search, outlet_id: outletFilter },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        reset();
        clearErrors();
        setModalOpen(true);
    }

    function openEdit(table) {
        setEditing(table);
        setData({
            outlet_id: table.outlet_id,
            table_no: table.table_no,
            capacity: table.capacity,
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
            put(route('meja.update', editing.id), options);
        } else {
            post(route('meja.store'), options);
        }
    }

    function destroy(table) {
        if (!confirm(`Hapus meja "${table.table_no}"?`)) {
            return;
        }

        router.delete(route('meja.destroy', table.id), {
            preserveScroll: true,
        });
    }

    function downloadQrAsPng(table) {
        const canvas = qrCanvasRef.current;

        if (!canvas) {
            return;
        }

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-meja-${table.table_no}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    function regenerateCode(table) {
        if (
            !confirm(
                `Buat ulang kode QR meja "${table.table_no}"? QR yang sudah dicetak sebelumnya tidak akan berlaku lagi.`,
            )
        ) {
            return;
        }

        router.post(
            route('meja.regenerate-code', table.id),
            {},
            { preserveScroll: true },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Meja & QR Self-Order
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Daftarkan meja per outlet, cetak QR-nya, dan
                            pelanggan bisa pesan langsung dari HP mereka.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Tambah Meja
                    </button>
                </div>
            }
        >
            <Head title="Meja" />

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
                            placeholder="Cari nomor meja..."
                            className="w-full max-w-sm rounded-full border-neutral-300 text-sm shadow-sm sm:w-64"
                        />
                        <select
                            value={outletFilter}
                            onChange={(e) => {
                                setOutletFilter(e.target.value);
                                router.get(
                                    route('meja.index'),
                                    {
                                        search,
                                        outlet_id: e.target.value,
                                    },
                                    { preserveState: true, replace: true },
                                );
                            }}
                            className="rounded-full border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="">Semua Outlet</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.id} value={outlet.id}>
                                    {outlet.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Outlet
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        No. Meja
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kapasitas
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kode QR
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {tables.data.map((table) => (
                                    <tr key={table.id}>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {table.outlet?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {table.table_no}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-neutral-600">
                                            {table.capacity} org
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                                                    {table.code}
                                                </code>
                                                <button
                                                    onClick={() =>
                                                        setQrTable(table)
                                                    }
                                                    className="text-neutral-600 underline hover:text-neutral-900"
                                                >
                                                    Lihat QR
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        regenerateCode(table)
                                                    }
                                                    className="text-neutral-400 underline hover:text-neutral-700"
                                                >
                                                    Buat Ulang
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    table.is_active
                                                        ? 'bg-neutral-900 text-white'
                                                        : 'bg-neutral-100 text-neutral-500'
                                                }`}
                                            >
                                                {table.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <button
                                                onClick={() =>
                                                    openEdit(table)
                                                }
                                                className="mr-3 text-neutral-600 hover:text-neutral-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    destroy(table)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {tables.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada meja.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {tables.links && tables.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {tables.links.map((link, index) => (
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
                        {editing ? 'Edit Meja' : 'Tambah Meja'}
                    </h3>

                    <div className="mb-4">
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

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Nomor Meja
                            </label>
                            <input
                                type="text"
                                value={data.table_no}
                                onChange={(e) =>
                                    setData('table_no', e.target.value)
                                }
                                placeholder="A1"
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.table_no && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.table_no}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Kapasitas (orang)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.capacity}
                                onChange={(e) =>
                                    setData('capacity', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.capacity && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.capacity}
                                </p>
                            )}
                        </div>
                    </div>

                    {!editing && (
                        <p className="mb-6 text-xs text-neutral-400">
                            Kode QR dibuat otomatis begitu meja disimpan.
                        </p>
                    )}

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

            <Modal show={!!qrTable} onClose={() => setQrTable(null)} maxWidth="sm">
                {qrTable && (
                    <div className="p-6 text-center">
                        <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                            Meja {qrTable.table_no}
                        </h3>
                        <p className="mb-4 text-sm text-neutral-500">
                            {qrTable.outlet?.name}
                        </p>
                        <QRCodeCanvas
                            ref={qrCanvasRef}
                            value={selfOrderUrlFor(qrTable)}
                            size={256}
                            marginSize={2}
                            className="mx-auto h-64 w-64"
                        />
                        <p className="mt-3 text-xs text-neutral-400">
                            Kode: {qrTable.code}
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => downloadQrAsPng(qrTable)}
                                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                            >
                                Unduh QR (PNG)
                            </button>
                            <button
                                type="button"
                                onClick={() => setQrTable(null)}
                                className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
