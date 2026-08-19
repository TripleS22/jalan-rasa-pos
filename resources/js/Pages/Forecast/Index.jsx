import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const STATUS_LABEL = {
    on_time: 'Tepat Waktu',
    exception: 'Eksepsi',
};

function StatusBadge({ status }) {
    if (!status) {
        return (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                Belum ada PO
            </span>
        );
    }

    const styles = {
        on_time: 'bg-neutral-900 text-white',
        exception: 'bg-red-100 text-red-700',
    };

    return (
        <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
        >
            {STATUS_LABEL[status]}
        </span>
    );
}

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

function emptyForm() {
    return {
        category_id: '',
        pic_user_id: '',
        week_label: '',
        forecast_date: new Date().toISOString().slice(0, 10),
        forecast_qty: '',
        po_qty: '',
        lead_time_days: '',
        exception_reason: '',
        exception_approved_by: '',
        notes: '',
    };
}

export default function ForecastIndex({
    forecasts,
    kpi,
    categories,
    users,
    filters,
}) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(filters.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm(
        emptyForm(),
    );

    const isMismatch = useMemo(() => {
        if (data.po_qty === '' || data.po_qty === null) {
            return false;
        }

        return Number(data.po_qty) !== Number(data.forecast_qty);
    }, [data.po_qty, data.forecast_qty]);

    function applyFilters(newStatus) {
        setStatus(newStatus);
        router.get(
            route('forecast.index'),
            { status: newStatus || undefined },
            { preserveState: true, replace: true },
        );
    }

    function openCreate() {
        reset();
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        post(route('forecast.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Forecast & PO Compliance
                    </h2>
                    <button
                        onClick={openCreate}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                        + Catat Forecast
                    </button>
                </div>
            }
        >
            <Head title="Forecast & PO" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard
                            label="Kepatuhan Lead Time PO"
                            value={
                                kpi.compliance_rate !== null
                                    ? `${kpi.compliance_rate}%`
                                    : '-'
                            }
                            sub={`${kpi.total_decided} PO sudah diputuskan`}
                        />
                        <KpiCard
                            label="Jumlah Eksepsi PO"
                            value={kpi.total_exceptions}
                            sub="Total kejadian PO berubah dari forecast"
                        />
                        <KpiCard
                            label="Forecast Tercatat"
                            value={forecasts.total}
                        />
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                        {[
                            ['', 'Semua'],
                            ['on_time', 'Tepat Waktu'],
                            ['exception', 'Eksepsi'],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => applyFilters(value)}
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

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Minggu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        PIC
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Forecast
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        PO
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Alasan Eksepsi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {forecasts.data.map((forecast) => (
                                    <tr key={forecast.id}>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDate(
                                                forecast.forecast_date,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {forecast.week_label}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {forecast.category?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {forecast.pic?.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {forecast.forecast_qty}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {forecast.po_qty ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge
                                                status={forecast.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {forecast.exception_reason ??
                                                '-'}
                                        </td>
                                    </tr>
                                ))}

                                {forecasts.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada forecast tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {forecasts.links && forecasts.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {forecasts.links.map((link, index) => (
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
                        Catat Forecast & PO
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Minggu Produksi
                            </label>
                            <input
                                type="text"
                                value={data.week_label}
                                onChange={(e) =>
                                    setData('week_label', e.target.value)
                                }
                                placeholder="Minggu 30"
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.week_label && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.week_label}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                value={data.forecast_date}
                                onChange={(e) =>
                                    setData(
                                        'forecast_date',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Kategori Produk
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih kategori</option>
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
                                PIC Forecast
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
                            {errors.pic_user_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.pic_user_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Forecast Qty (pcs)
                            </label>
                            <NumberInput
                                value={data.forecast_qty}
                                onChange={(value) =>
                                    setData('forecast_qty', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.forecast_qty && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.forecast_qty}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                PO Qty (pcs)
                            </label>
                            <NumberInput
                                value={data.po_qty}
                                onChange={(value) =>
                                    setData('po_qty', value)
                                }
                                placeholder="Kosongkan jika belum ada PO"
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Lead Time (hari)
                            </label>
                            <NumberInput
                                value={data.lead_time_days}
                                onChange={(value) =>
                                    setData('lead_time_days', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {isMismatch && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3">
                            <p className="mb-2 text-xs text-red-700">
                                PO Qty berbeda dari Forecast Qty — akan
                                tercatat sebagai Eksepsi.
                            </p>

                            <div className="mb-2">
                                <label className="mb-1 block text-sm text-neutral-600">
                                    Alasan Eksepsi
                                </label>
                                <input
                                    type="text"
                                    value={data.exception_reason}
                                    onChange={(e) =>
                                        setData(
                                            'exception_reason',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                />
                                {errors.exception_reason && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.exception_reason}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-neutral-600">
                                    Approval Eksepsi Oleh
                                </label>
                                <select
                                    value={data.exception_approved_by}
                                    onChange={(e) =>
                                        setData(
                                            'exception_approved_by',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                >
                                    <option value="">Pilih approver</option>
                                    {users.map((user) => (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

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
