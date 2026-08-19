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
    }).format(value || 0);
}

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const CATEGORY_LABEL = {
    equipment: 'Peralatan',
    vehicle: 'Kendaraan',
    furniture: 'Furnitur',
    building: 'Bangunan',
    other: 'Lainnya',
};

function StatusBadge({ status, activeLabel, inactiveLabel }) {
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                status === 'active'
                    ? 'bg-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 text-white'
            }`}
        >
            {status === 'active' ? activeLabel : inactiveLabel}
        </span>
    );
}

export default function AsetIndex({ assets, prepaidExpenses, outlets }) {
    const { flash } = usePage().props;
    const [assetModalOpen, setAssetModalOpen] = useState(false);
    const [prepaidModalOpen, setPrepaidModalOpen] = useState(false);

    const {
        data: assetData,
        setData: setAssetData,
        post: postAsset,
        processing: assetProcessing,
        errors: assetErrors,
        reset: resetAsset,
    } = useForm({
        outlet_id: '',
        name: '',
        category: 'equipment',
        purchase_date: new Date().toISOString().slice(0, 10),
        purchase_cost: '',
        useful_life_months: '',
        salvage_value: '',
        notes: '',
    });

    const {
        data: prepaidData,
        setData: setPrepaidData,
        post: postPrepaid,
        processing: prepaidProcessing,
        errors: prepaidErrors,
        reset: resetPrepaid,
    } = useForm({
        outlet_id: '',
        name: '',
        amount: '',
        start_date: new Date().toISOString().slice(0, 10),
        months: '',
        notes: '',
    });

    function openAssetCreate() {
        resetAsset();
        setAssetModalOpen(true);
    }

    function submitAsset(e) {
        e.preventDefault();

        postAsset(route('aset.store'), {
            onSuccess: () => setAssetModalOpen(false),
            preserveScroll: true,
        });
    }

    function depreciateAsset(asset) {
        if (!confirm(`Jalankan penyusutan bulan ini untuk "${asset.name}"?`)) {
            return;
        }

        router.post(
            route('aset.depreciate', asset.id),
            {},
            { preserveScroll: true },
        );
    }

    function disposeAsset(asset) {
        if (
            !confirm(
                `Lepas aset "${asset.name}"? Sisa nilai buku akan dicatat sebagai kerugian.`,
            )
        ) {
            return;
        }

        router.post(
            route('aset.dispose', asset.id),
            {},
            { preserveScroll: true },
        );
    }

    function openPrepaidCreate() {
        resetPrepaid();
        setPrepaidModalOpen(true);
    }

    function submitPrepaid(e) {
        e.preventDefault();

        postPrepaid(route('aset.prepaid.store'), {
            onSuccess: () => setPrepaidModalOpen(false),
            preserveScroll: true,
        });
    }

    function amortizePrepaid(prepaid) {
        if (!confirm(`Jalankan amortisasi bulan ini untuk "${prepaid.name}"?`)) {
            return;
        }

        router.post(
            route('aset.prepaid.amortize', prepaid.id),
            {},
            { preserveScroll: true },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Aset & Biaya Dibayar Dimuka
                </h2>
            }
        >
            <Head title="Aset" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-900">
                            Aset Tetap
                        </h3>
                        <button
                            onClick={openAssetCreate}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                        >
                            + Catat Aset
                        </button>
                    </div>

                    <div className="mb-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Tgl Beli
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Harga Beli
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Akum. Penyusutan
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Nilai Buku
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {assets.map((asset) => (
                                    <tr key={asset.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {asset.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">
                                            {CATEGORY_LABEL[asset.category] ??
                                                asset.category}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDate(asset.purchase_date)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {formatRupiah(asset.purchase_cost)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {formatRupiah(
                                                asset.accumulated_depreciation,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                            {formatRupiah(asset.book_value)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge
                                                status={asset.status}
                                                activeLabel="Aktif"
                                                inactiveLabel="Dilepas"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {asset.status === 'active' && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            depreciateAsset(
                                                                asset,
                                                            )
                                                        }
                                                        className="mr-3 text-neutral-600 hover:text-neutral-900"
                                                    >
                                                        Susutkan
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            disposeAsset(asset)
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Lepas
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {assets.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada aset tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-900">
                            Biaya Dibayar Dimuka
                        </h3>
                        <button
                            onClick={openPrepaidCreate}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                        >
                            + Catat Prepaid
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Mulai
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Sudah Diamortisasi
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Sisa
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {prepaidExpenses.map((prepaid) => (
                                    <tr key={prepaid.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                            {prepaid.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-500">
                                            {formatDate(prepaid.start_date)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {formatRupiah(prepaid.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-neutral-600">
                                            {formatRupiah(
                                                prepaid.amortized_amount,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                            {formatRupiah(prepaid.remaining)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge
                                                status={prepaid.status}
                                                activeLabel="Aktif"
                                                inactiveLabel="Selesai"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {prepaid.status === 'active' && (
                                                <button
                                                    onClick={() =>
                                                        amortizePrepaid(
                                                            prepaid,
                                                        )
                                                    }
                                                    className="text-neutral-600 hover:text-neutral-900"
                                                >
                                                    Amortisasi
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {prepaidExpenses.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-neutral-500"
                                        >
                                            Belum ada biaya dibayar dimuka.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                show={assetModalOpen}
                onClose={() => setAssetModalOpen(false)}
                maxWidth="lg"
            >
                <form onSubmit={submitAsset} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Catat Aset Baru
                    </h3>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Outlet
                            </label>
                            <select
                                value={assetData.outlet_id}
                                onChange={(e) =>
                                    setAssetData('outlet_id', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Pilih outlet</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                            {assetErrors.outlet_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {assetErrors.outlet_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Kategori
                            </label>
                            <select
                                value={assetData.category}
                                onChange={(e) =>
                                    setAssetData('category', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                {Object.entries(CATEGORY_LABEL).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Nama Aset
                        </label>
                        <input
                            type="text"
                            value={assetData.name}
                            onChange={(e) =>
                                setAssetData('name', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {assetErrors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {assetErrors.name}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Tanggal Beli
                            </label>
                            <input
                                type="date"
                                value={assetData.purchase_date}
                                onChange={(e) =>
                                    setAssetData(
                                        'purchase_date',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Harga Beli
                            </label>
                            <NumberInput
                                prefix="Rp"
                                value={assetData.purchase_cost}
                                onChange={(value) =>
                                    setAssetData('purchase_cost', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {assetErrors.purchase_cost && (
                                <p className="mt-1 text-sm text-red-600">
                                    {assetErrors.purchase_cost}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Umur Ekonomis (bulan)
                            </label>
                            <NumberInput
                                value={assetData.useful_life_months}
                                onChange={(value) =>
                                    setAssetData(
                                        'useful_life_months',
                                        value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {assetErrors.useful_life_months && (
                                <p className="mt-1 text-sm text-red-600">
                                    {assetErrors.useful_life_months}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Nilai Residu
                            </label>
                            <NumberInput
                                prefix="Rp"
                                value={assetData.salvage_value}
                                onChange={(value) =>
                                    setAssetData('salvage_value', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Catatan
                        </label>
                        <textarea
                            value={assetData.notes}
                            onChange={(e) =>
                                setAssetData('notes', e.target.value)
                            }
                            rows={2}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setAssetModalOpen(false)}
                            className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={assetProcessing}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                show={prepaidModalOpen}
                onClose={() => setPrepaidModalOpen(false)}
                maxWidth="lg"
            >
                <form onSubmit={submitPrepaid} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        Catat Biaya Dibayar Dimuka
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Outlet
                        </label>
                        <select
                            value={prepaidData.outlet_id}
                            onChange={(e) =>
                                setPrepaidData('outlet_id', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="">Pilih outlet</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.id} value={outlet.id}>
                                    {outlet.name}
                                </option>
                            ))}
                        </select>
                        {prepaidErrors.outlet_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {prepaidErrors.outlet_id}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Nama
                        </label>
                        <input
                            type="text"
                            value={prepaidData.name}
                            onChange={(e) =>
                                setPrepaidData('name', e.target.value)
                            }
                            placeholder="Contoh: Sewa Ruko 1 Tahun"
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {prepaidErrors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {prepaidErrors.name}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={prepaidData.start_date}
                                onChange={(e) =>
                                    setPrepaidData(
                                        'start_date',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Total Bayar
                            </label>
                            <NumberInput
                                prefix="Rp"
                                value={prepaidData.amount}
                                onChange={(value) =>
                                    setPrepaidData('amount', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {prepaidErrors.amount && (
                                <p className="mt-1 text-sm text-red-600">
                                    {prepaidErrors.amount}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Jangka (bulan)
                            </label>
                            <NumberInput
                                value={prepaidData.months}
                                onChange={(value) =>
                                    setPrepaidData('months', value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            />
                            {prepaidErrors.months && (
                                <p className="mt-1 text-sm text-red-600">
                                    {prepaidErrors.months}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Catatan
                        </label>
                        <textarea
                            value={prepaidData.notes}
                            onChange={(e) =>
                                setPrepaidData('notes', e.target.value)
                            }
                            rows={2}
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setPrepaidModalOpen(false)}
                            className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={prepaidProcessing}
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
