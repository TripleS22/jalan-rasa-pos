import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PesananMejaPanel from './Panels/PesananMejaPanel';
import PosPanel from './Panels/PosPanel';
import PreOrderPanel from './Panels/PreOrderPanel';
import ReservasiPanel from './Panels/ReservasiPanel';

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const TABS = [
    { key: 'pos', label: 'Kasir' },
    { key: 'pesanan-meja', label: 'Pesanan Meja' },
    { key: 'reservasi', label: 'Reservasi' },
    { key: 'pre-order', label: 'Pre-Order' },
];

export default function KasirIndex({
    products,
    categories,
    outlet,
    tables,
    ordersToday,
    tableOrders,
    tableOrderFilters,
    reservations,
    reservasiFilters,
    preOrders,
    preOrderFilters,
    customers,
}) {
    const { auth, flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('pos');

    return (
        <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
            <Head title="Kasir" />

            <header className="border-b border-neutral-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold tracking-tight">
                            JALAN RASA
                            {outlet && (
                                <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                    {outlet.name}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-neutral-500">
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-600">
                            Total: {ordersToday} Order
                        </span>
                        <a
                            href={route('dashboard')}
                            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                        >
                            Dashboard
                        </a>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                            {initials(auth.user.name)}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                activeTab === tab.key
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {flash?.success && (
                <div className="mx-6 mt-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                    {flash.success}
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {activeTab === 'pos' && (
                    <PosPanel
                        products={products}
                        categories={categories}
                        tables={tables}
                    />
                )}

                {activeTab === 'pesanan-meja' && (
                    <main className="flex-1 overflow-y-auto p-6">
                        <PesananMejaPanel
                            tableOrders={tableOrders}
                            filters={tableOrderFilters}
                        />
                    </main>
                )}

                {activeTab === 'reservasi' && (
                    <main className="flex-1 overflow-y-auto p-6">
                        <ReservasiPanel
                            reservations={reservations}
                            filters={reservasiFilters}
                        />
                    </main>
                )}

                {activeTab === 'pre-order' && (
                    <main className="flex-1 overflow-y-auto p-6">
                        <PreOrderPanel
                            preOrders={preOrders}
                            products={products}
                            customers={customers}
                            filters={preOrderFilters}
                        />
                    </main>
                )}
            </div>
        </div>
    );
}
