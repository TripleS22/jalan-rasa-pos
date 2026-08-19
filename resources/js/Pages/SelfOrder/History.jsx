import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import OrderCard from './OrderCard';

export default function SelfOrderHistory({ table, outlet, orders }) {
    // Keep pending orders live here too, in case someone leaves this page open.
    useEffect(() => {
        const hasPending = orders?.some((order) => order.status === 'pending');

        if (!hasPending) {
            return;
        }

        const interval = setInterval(() => {
            router.reload({ only: ['orders'], showProgress: false });
        }, 4000);

        return () => clearInterval(interval);
    }, [orders]);

    return (
        <div className="min-h-screen bg-neutral-50 pb-10">
            <Head title={`Riwayat Pesanan — Meja ${table.table_no}`} />

            <div className="mx-auto max-w-md px-4 pt-6">
                <Link
                    href={route('self-order.show', table.code)}
                    className="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-900"
                >
                    &larr; Kembali ke Menu
                </Link>

                <div className="mb-6 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        {outlet.name}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
                        Riwayat Pesanan
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Meja {table.table_no} &middot; hari ini
                    </p>
                </div>

                <div>
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            code={table.code}
                        />
                    ))}

                    {orders.length === 0 && (
                        <p className="py-10 text-center text-sm text-neutral-500">
                            Belum ada pesanan dari meja ini hari ini.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
