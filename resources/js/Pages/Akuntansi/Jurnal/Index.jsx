import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value ?? 0);
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function JurnalIndex({ entries, filters }) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [expanded, setExpanded] = useState(null);

    function applyFilters(e) {
        e.preventDefault();

        router.get(
            route('jurnal.index'),
            { from, to },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Jurnal Umum
                </h2>
            }
        >
            <Head title="Jurnal Umum" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={applyFilters}
                        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
                    >
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
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                        >
                            Terapkan
                        </button>
                    </form>

                    <div className="space-y-3">
                        {entries.data.map((entry) => {
                            const isOpen = expanded === entry.id;
                            const total = entry.lines.reduce(
                                (sum, line) => sum + Number(line.debit),
                                0,
                            );

                            return (
                                <div
                                    key={entry.id}
                                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                                >
                                    <button
                                        onClick={() =>
                                            setExpanded(
                                                isOpen ? null : entry.id,
                                            )
                                        }
                                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-neutral-900">
                                                {entry.description}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {entry.entry_no} —{' '}
                                                {formatDate(
                                                    entry.entry_date,
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-neutral-900">
                                            {formatRupiah(total)}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <table className="min-w-full divide-y divide-neutral-100 border-t border-neutral-200">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        Akun
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        Debit
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        Kredit
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {entry.lines.map((line) => (
                                                    <tr key={line.id}>
                                                        <td className="px-4 py-2 text-sm text-neutral-700">
                                                            {line.account.code}{' '}
                                                            —{' '}
                                                            {
                                                                line.account
                                                                    .name
                                                            }
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-sm text-neutral-600">
                                                            {Number(
                                                                line.debit,
                                                            ) > 0
                                                                ? formatRupiah(
                                                                      line.debit,
                                                                  )
                                                                : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-sm text-neutral-600">
                                                            {Number(
                                                                line.credit,
                                                            ) > 0
                                                                ? formatRupiah(
                                                                      line.credit,
                                                                  )
                                                                : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            );
                        })}

                        {entries.data.length === 0 && (
                            <p className="py-8 text-center text-sm text-neutral-500">
                                Belum ada jurnal tercatat.
                            </p>
                        )}
                    </div>

                    {entries.links && entries.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {entries.links.map((link, index) => (
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
        </AuthenticatedLayout>
    );
}
