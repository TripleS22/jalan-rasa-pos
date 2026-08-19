import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatDateTime(value) {
    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
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

export default function QualityControlIndex({
    checks,
    kpi,
    pendingProductions,
    users,
}) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        production_id: '',
        qty_checked: '',
        qty_passed: '',
        qty_rejected: '',
        reject_reason: '',
        pic_user_id: '',
        notes: '',
    });

    const selectedProduction = pendingProductions.find(
        (p) => p.id === Number(data.production_id),
    );

    useEffect(() => {
        if (selectedProduction) {
            setData((prev) => ({
                ...prev,
                qty_checked: selectedProduction.qty,
                qty_passed: selectedProduction.qty,
                qty_rejected: 0,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.production_id]);

    function openCreate() {
        reset();
        setModalOpen(true);
    }

    function submit(e) {
        e.preventDefault();

        post(route('quality-control.store'), {
            onSuccess: () => setModalOpen(false),
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Quality Control Produksi
                    </h2>
                    <button
                        onClick={openCreate}
                        disabled={pendingProductions.length === 0}
                        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
                    >
                        + Catat Hasil QC
                    </button>
                </div>
            }
        >
            <Head title="Quality Control" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard
                            label="Tingkat Lolos QC Produksi"
                            value={
                                kpi.pass_rate !== null
                                    ? `${kpi.pass_rate}%`
                                    : '-'
                            }
                            sub={`${kpi.total_passed} / ${kpi.total_checked} pcs diperiksa`}
                        />
                        <KpiCard
                            label="Menunggu QC"
                            value={pendingProductions.length}
                            sub="Produksi belum diperiksa"
                        />
                        <KpiCard
                            label="Total Pemeriksaan"
                            value={checks.total}
                        />
                    </div>

                    {pendingProductions.length > 0 && (
                        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
                            <h3 className="mb-2 text-sm font-semibold text-neutral-900">
                                Menunggu QC
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {pendingProductions.map((production) => (
                                    <span
                                        key={production.id}
                                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                                    >
                                        {production.product?.name} ×
                                        {production.qty}
                                    </span>
                                ))}
                            </div>
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
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Diperiksa
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Lolos
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Reject
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Alasan Reject
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        PIC QC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {checks.data.map((check) => (
                                    <tr key={check.id}>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDateTime(
                                                check.created_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {
                                                check.production?.product
                                                    ?.name
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {check.qty_checked}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-900">
                                            {check.qty_passed}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right text-sm ${
                                                Number(
                                                    check.qty_rejected,
                                                ) > 0
                                                    ? 'font-medium text-red-600'
                                                    : 'text-neutral-600'
                                            }`}
                                        >
                                            {check.qty_rejected}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {check.reject_reason ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {check.pic?.name}
                                        </td>
                                    </tr>
                                ))}

                                {checks.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada pemeriksaan QC.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {checks.links && checks.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {checks.links.map((link, index) => (
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
                        Catat Hasil QC
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Produksi
                        </label>
                        <select
                            value={data.production_id}
                            onChange={(e) =>
                                setData('production_id', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="">Pilih produksi</option>
                            {pendingProductions.map((production) => (
                                <option
                                    key={production.id}
                                    value={production.id}
                                >
                                    {production.product?.name} ×
                                    {production.qty}
                                </option>
                            ))}
                        </select>
                        {errors.production_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.production_id}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Diperiksa
                            </label>
                            <NumberInput
                                value={data.qty_checked}
                                onChange={(value) =>
                                    setData('qty_checked', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.qty_checked && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.qty_checked}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Lolos QC
                            </label>
                            <NumberInput
                                value={data.qty_passed}
                                onChange={(value) =>
                                    setData('qty_passed', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.qty_passed && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.qty_passed}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Reject QC
                            </label>
                            <NumberInput
                                value={data.qty_rejected}
                                onChange={(value) =>
                                    setData('qty_rejected', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {Number(data.qty_rejected) > 0 && (
                        <div className="mb-4">
                            <label className="mb-1 block text-sm text-neutral-600">
                                Alasan Reject
                            </label>
                            <input
                                type="text"
                                value={data.reject_reason}
                                onChange={(e) =>
                                    setData(
                                        'reject_reason',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {errors.reject_reason && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.reject_reason}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            PIC QC
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
