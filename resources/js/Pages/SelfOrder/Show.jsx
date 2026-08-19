import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import OrderCard from './OrderCard';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value || 0);
}

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Bayar di Kasir' },
    { value: 'qris', label: 'QRIS' },
    { value: 'debit', label: 'Kartu Debit' },
];

export default function SelfOrderShow({
    table,
    outlet,
    products,
    orders,
    highlightOrderId,
}) {
    const [cart, setCart] = useState({});
    const [cartOpen, setCartOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        notes: '',
        payment_method: 'cash',
        items: [],
    });

    // Poll for status updates while any order at this table is still
    // awaiting the cashier — everyone at the table shares this tab.
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

    const highlightedOrder = orders?.find(
        (order) => order.id === highlightOrderId,
    );

    const cartItems = useMemo(() => {
        if (!products) {
            return [];
        }

        return Object.entries(cart)
            .filter(([, qty]) => qty > 0)
            .map(([productId, qty]) => {
                const product = products.find(
                    (p) => p.id === Number(productId),
                );

                return { product, qty };
            })
            .filter((item) => item.product);
    }, [cart, products]);

    const cartTotal = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.qty,
        0,
    );
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

    function addToCart(productId, delta) {
        setCart((prev) => {
            const next = Math.max(0, (prev[productId] ?? 0) + delta);

            return { ...prev, [productId]: next };
        });
    }

    function submitOrder(e) {
        e.preventDefault();

        setData(
            'items',
            cartItems.map((item) => ({
                product_id: item.product.id,
                qty: item.qty,
            })),
        );

        post(route('self-order.store', table.code), {
            preserveScroll: true,
            onSuccess: () => {
                setCart({});
                setCartOpen(false);
                reset();
            },
        });
    }

    if (!table) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
                <Head title="Meja tidak ditemukan" />
                <div className="max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 text-center">
                    <h1 className="mb-2 text-lg font-semibold text-neutral-900">
                        Meja tidak ditemukan
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Kode QR ini tidak valid atau mejanya sudah tidak
                        aktif. Silakan panggil staf untuk bantuan.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-28">
            <Head title={`Pesan — Meja ${table.table_no}`} />

            <div className="mx-auto max-w-md px-4 pt-6">
                <div className="mb-6 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        {outlet.name}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
                        Meja {table.table_no}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Kapasitas {table.capacity} orang &middot; pilih menu
                        di bawah untuk pesan
                    </p>
                </div>

                {highlightedOrder && (
                    <div className="mb-4">
                        <OrderCard
                            order={highlightedOrder}
                            code={table.code}
                            highlighted
                        />
                    </div>
                )}

                {orders && orders.length > 0 && (
                    <Link
                        href={route('self-order.history', table.code)}
                        className="mb-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm hover:border-neutral-300"
                    >
                        <span className="font-medium text-neutral-900">
                            Riwayat Pesanan Meja Ini
                        </span>
                        <span className="text-neutral-400">
                            {orders.length} pesanan &rarr;
                        </span>
                    </Link>
                )}

                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    Menu
                </h2>

                <div className="space-y-3">
                    {products.map((product) => {
                        const qty = cart[product.id] ?? 0;
                        // SUM() over zero active batches comes back as
                        // null, not 0 — that still means no stock.
                        const outOfStock =
                            product.available_stock === null ||
                            Number(product.available_stock) <= 0;

                        return (
                            <div
                                key={product.id}
                                className={`flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 ${
                                    outOfStock ? 'opacity-50' : ''
                                }`}
                            >
                                {product.image && (
                                    <div className="relative shrink-0">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className={`h-16 w-16 rounded-xl object-cover ${
                                                outOfStock
                                                    ? 'grayscale'
                                                    : ''
                                            }`}
                                        />
                                        {outOfStock && (
                                            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-[10px] font-bold uppercase tracking-wide text-white">
                                                Habis
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-neutral-900">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {product.category?.name}
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                                        {formatRupiah(product.price)}
                                    </p>
                                    {outOfStock && (
                                        <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                            Stok Habis
                                        </span>
                                    )}
                                </div>

                                {!outOfStock &&
                                    (qty > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    addToCart(
                                                        product.id,
                                                        -1,
                                                    )
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                            >
                                                &minus;
                                            </button>
                                            <span className="w-4 text-center text-sm font-medium">
                                                {qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    addToCart(product.id, 1)
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                addToCart(product.id, 1)
                                            }
                                            className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-700"
                                        >
                                            Tambah
                                        </button>
                                    ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {cartCount > 0 && !cartOpen && (
                <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4">
                    <button
                        onClick={() => setCartOpen(true)}
                        className="mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                        <span>{cartCount} item di keranjang</span>
                        <span>{formatRupiah(cartTotal)}</span>
                    </button>
                </div>
            )}

            {cartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
                    <div className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-900">
                                Keranjang
                            </h3>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="text-sm text-neutral-500 hover:text-neutral-900"
                            >
                                Tutup
                            </button>
                        </div>

                        <form onSubmit={submitOrder}>
                            <ul className="mb-4 max-h-56 divide-y divide-neutral-100 overflow-y-auto text-sm">
                                {cartItems.map((item) => (
                                    <li
                                        key={item.product.id}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <div>
                                            <p className="font-medium text-neutral-900">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                {item.qty} &times;{' '}
                                                {formatRupiah(
                                                    item.product.price,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addToCart(
                                                        item.product.id,
                                                        -1,
                                                    )
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                            >
                                                &minus;
                                            </button>
                                            <span className="w-4 text-center">
                                                {item.qty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addToCart(
                                                        item.product.id,
                                                        1,
                                                    )
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mb-3">
                                <label className="mb-1 block text-xs text-neutral-500">
                                    Nama (opsional)
                                </label>
                                <input
                                    type="text"
                                    value={data.customer_name}
                                    onChange={(e) =>
                                        setData(
                                            'customer_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Nama Anda"
                                    className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-1 block text-xs text-neutral-500">
                                    Catatan (opsional)
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Contoh: less ice, pedas sedang"
                                    className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-1.5 block text-xs text-neutral-500">
                                    Metode Pembayaran
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAYMENT_METHODS.map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    'payment_method',
                                                    method.value,
                                                )
                                            }
                                            className={`rounded-full border px-2 py-2 text-xs font-medium ${
                                                data.payment_method ===
                                                method.value
                                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                                    : 'border-neutral-200 text-neutral-600'
                                            }`}
                                        >
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.payment_method && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.payment_method}
                                    </p>
                                )}
                            </div>

                            {errors.items && (
                                <p className="mb-3 text-sm text-red-600">
                                    {errors.items}
                                </p>
                            )}

                            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-neutral-900">
                                <span>Total</span>
                                <span>{formatRupiah(cartTotal)}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || cartItems.length === 0}
                                className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
                            >
                                Kirim Pesanan
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
