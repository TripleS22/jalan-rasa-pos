import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

function formatDateTime(value) {
    return new Date(value).toLocaleString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const STATUS_LABEL = {
    pending: 'Pending',
    confirmed: 'Terkonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const NEXT_STATUS = {
    pending: 'confirmed',
    confirmed: 'completed',
};

const NEXT_LABEL = {
    pending: 'Konfirmasi',
    confirmed: 'Tandai Selesai',
};

function StatusBadge({ status }) {
    const styles = {
        completed: 'bg-neutral-900 text-white',
        confirmed: 'bg-blue-100 text-blue-700',
        pending: 'bg-neutral-200 text-neutral-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
            {STATUS_LABEL[status] ?? status}
        </span>
    );
}

export default function ReservasiPanel({ reservations, filters }) {
    const [status, setStatus] = useState(filters.reservasi_status ?? '');
    const [date, setDate] = useState(filters.reservasi_date ?? '');
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        phone: '',
        table_no: '',
        guest_count: 2,
        reservation_at: '',
        notes: '',
    });

    function applyFilters(newStatus, newDate) {
        setStatus(newStatus);
        setDate(newDate);
        router.get(
            route('kasir.index'),
            {
                reservasi_status: newStatus || undefined,
                reservasi_date: newDate || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        reset();
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        post(route('reservasi.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
            preserveState: true,
        });
    }

    function advanceStatus(reservation) {
        const next = NEXT_STATUS[reservation.status];

        router.put(
            route('reservasi.update', reservation.id),
            { status: next },
            { preserveScroll: true, preserveState: true },
        );
    }

    function cancel(reservation) {
        if (!confirm(`Batalkan reservasi ${reservation.customer_name}?`)) {
            return;
        }

        router.put(
            route('reservasi.update', reservation.id),
            { status: 'cancelled' },
            { preserveScroll: true, preserveState: true },
        );
    }

    function destroy(reservation) {
        if (!confirm(`Hapus reservasi ${reservation.customer_name}?`)) {
            return;
        }

        router.delete(route('reservasi.destroy', reservation.id), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reservasi
                </h2>
                <button
                    onClick={openCreate}
                    className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                >
                    + Tambah Reservasi
                </button>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['', 'Semua'],
                        ['pending', 'Pending'],
                        ['confirmed', 'Terkonfirmasi'],
                        ['completed', 'Selesai'],
                        ['cancelled', 'Dibatalkan'],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => applyFilters(value, date)}
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

                <input
                    type="date"
                    value={date}
                    onChange={(e) => applyFilters(status, e.target.value)}
                    className="rounded-lg border-neutral-300 text-sm shadow-sm"
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Waktu
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Nama
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Telepon
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Meja
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Tamu
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                Status
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {reservations.data.map((reservation) => (
                            <tr key={reservation.id}>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    {formatDateTime(
                                        reservation.reservation_at,
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                    {reservation.customer_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    {reservation.phone ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    {reservation.table_no ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                    {reservation.guest_count}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={reservation.status} />
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    {NEXT_STATUS[reservation.status] && (
                                        <button
                                            onClick={() =>
                                                advanceStatus(reservation)
                                            }
                                            className="mr-3 text-neutral-600 hover:text-neutral-900"
                                        >
                                            {NEXT_LABEL[reservation.status]}
                                        </button>
                                    )}
                                    {['pending', 'confirmed'].includes(
                                        reservation.status,
                                    ) && (
                                        <button
                                            onClick={() =>
                                                cancel(reservation)
                                            }
                                            className="mr-3 text-neutral-500 hover:text-red-600"
                                        >
                                            Batalkan
                                        </button>
                                    )}
                                    <button
                                        onClick={() => destroy(reservation)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {reservations.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-8 text-center text-sm text-neutral-500"
                                >
                                    Belum ada reservasi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {reservations.links && reservations.data.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {reservations.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            className={`rounded-full px-3 py-1 text-sm ${
                                link.active
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 disabled:opacity-40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Tambah Reservasi
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Nama Pemesan
                        </label>
                        <input
                            type="text"
                            value={data.customer_name}
                            onChange={(e) =>
                                setData('customer_name', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {errors.customer_name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                No. Meja
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
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Jumlah Tamu
                            </label>
                            <NumberInput
                                value={data.guest_count}
                                onChange={(value) =>
                                    setData('guest_count', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.guest_count && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.guest_count}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Waktu Reservasi
                            </label>
                            <input
                                type="datetime-local"
                                value={data.reservation_at}
                                onChange={(e) =>
                                    setData(
                                        'reservation_at',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.reservation_at && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.reservation_at}
                                </p>
                            )}
                        </div>
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
        </div>
    );
}
