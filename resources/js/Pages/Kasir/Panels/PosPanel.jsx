import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function Thumb({ image, name, className }) {
    if (image) {
        return (
            <img
                src={image}
                alt={name}
                className={`object-cover ${className}`}
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center bg-neutral-100 font-semibold text-neutral-400 ${className}`}
        >
            {initials(name)}
        </div>
    );
}

export default function PosPanel({ products, categories, tables }) {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState(null);
    const [cart, setCart] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        order_type: 'dine_in',
        customer_name: '',
        table_no: '',
        payment_method: 'cash',
        discount: 0,
        items: [],
    });

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesCategory =
                !categoryId || product.category_id === categoryId;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, categoryId]);

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        [cart],
    );

    function cartQtyFor(productId) {
        return cart.find((item) => item.id === productId)?.qty ?? 0;
    }

    function addToCart(product) {
        const stock = Number(product.available_stock ?? 0);

        setCart((current) => {
            const existing = current.find((item) => item.id === product.id);
            const currentQty = existing?.qty ?? 0;

            if (currentQty + 1 > stock) {
                return current;
            }

            if (existing) {
                return current.map((item) =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item,
                );
            }

            return [
                ...current,
                {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image,
                    stock,
                    qty: 1,
                },
            ];
        });
    }

    function updateQty(id, qty) {
        if (qty < 1) {
            setCart((current) => current.filter((item) => item.id !== id));
            return;
        }

        setCart((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, qty: Math.min(qty, item.stock ?? qty) }
                    : item,
            ),
        );
    }

    function removeFromCart(id) {
        setCart((current) => current.filter((item) => item.id !== id));
    }

    function submitOrder(e) {
        e.preventDefault();

        if (cart.length === 0) {
            return;
        }

        post(route('kasir.store'), {
            data: {
                ...data,
                items: cart.map((item) => ({
                    product_id: item.id,
                    qty: item.qty,
                })),
            },
            onSuccess: () => {
                setCart([]);
                reset('customer_name', 'table_no');
            },
            preserveScroll: true,
        });
    }

    return (
        <>
            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-6">
                {/* Search */}
                <div className="mb-6 flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-3">
                    <svg
                        className="h-5 w-5 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border-none p-0 text-sm focus:ring-0"
                    />
                </div>

                {/* Category label navigation */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setCategoryId(null)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                            categoryId === null
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
                        }`}
                    >
                        Semua ({products.length})
                    </button>

                    {categories.map((category) => {
                        const active = categoryId === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => setCategoryId(category.id)}
                                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                    active
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
                                }`}
                            >
                                {category.needs_restock && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                )}
                                {category.name} ({category.products_count})
                            </button>
                        );
                    })}
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => {
                        const qty = cartQtyFor(product.id);
                        const stock = Number(product.available_stock ?? 0);
                        const soldOut = stock <= 0;
                        const maxedOut = qty >= stock;

                        return (
                            <button
                                key={product.id}
                                type="button"
                                disabled={soldOut || maxedOut}
                                onClick={() => addToCart(product)}
                                className={`relative rounded-2xl border border-neutral-200 bg-white p-4 text-left transition ${
                                    soldOut
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'hover:border-neutral-400 hover:shadow-md active:scale-[0.98]'
                                }`}
                            >
                                {qty > 0 && (
                                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                                        {qty}
                                    </span>
                                )}

                                <Thumb
                                    image={product.image}
                                    name={product.name}
                                    className="mb-3 h-24 w-full rounded-xl text-2xl"
                                />

                                <div className="mb-1 font-medium text-neutral-900">
                                    {product.name}
                                </div>

                                <div className="mb-1 text-xs text-neutral-400">
                                    {soldOut ? 'Stok habis' : `Stok: ${stock}`}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-500">
                                        {formatRupiah(product.price)}
                                    </span>

                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                                        +
                                    </span>
                                </div>
                            </button>
                        );
                    })}

                    {filteredProducts.length === 0 && (
                        <p className="col-span-full text-sm text-neutral-500">
                            Tidak ada produk ditemukan.
                        </p>
                    )}
                </div>
            </main>

            {/* Order sidebar */}
            <aside className="flex w-96 flex-col border-l border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-neutral-500">
                            Order Baru
                        </span>
                        <span className="text-sm font-semibold text-neutral-900">
                            #{Date.now().toString().slice(-5)}
                        </span>
                    </div>

                    <div className="mb-4 flex overflow-hidden rounded-full border border-neutral-300">
                        {['dine_in', 'takeaway'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setData('order_type', type)}
                                className={`flex-1 py-2 text-sm font-medium transition ${
                                    data.order_type === type
                                        ? 'bg-neutral-900 text-white'
                                        : 'text-neutral-600'
                                }`}
                            >
                                {type === 'dine_in' ? 'Dine In' : 'Take Away'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                Nama Customer
                            </label>
                            <input
                                type="text"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setData('customer_name', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                placeholder="Nama"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">
                                No. Meja
                            </label>
                            <select
                                value={data.table_no}
                                onChange={(e) =>
                                    setData('table_no', e.target.value)
                                }
                                disabled={data.order_type !== 'dine_in'}
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm disabled:bg-neutral-50 disabled:text-neutral-400"
                            >
                                <option value="">Pilih meja</option>
                                {tables.map((table) => (
                                    <option
                                        key={table.id}
                                        value={table.table_no}
                                    >
                                        {table.table_no} ({table.capacity}{' '}
                                        org)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <div className="mb-3 text-sm font-medium text-neutral-500">
                        Order List
                    </div>

                    {cart.length === 0 && (
                        <p className="text-sm text-neutral-400">
                            Belum ada item.
                        </p>
                    )}

                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3"
                            >
                                <Thumb
                                    image={item.image}
                                    name={item.name}
                                    className="h-12 w-12 rounded-xl text-sm"
                                />

                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {formatRupiah(item.price)} ×{' '}
                                        {item.qty}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQty(item.id, item.qty - 1)
                                        }
                                        className="h-6 w-6 rounded-full border border-neutral-300 text-neutral-600"
                                    >
                                        −
                                    </button>
                                    <span className="w-5 text-center text-sm">
                                        {item.qty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQty(item.id, item.qty + 1)
                                        }
                                        className="h-6 w-6 rounded-full border border-neutral-300 text-neutral-600"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    title="Batalkan item ini"
                                    className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {errors.items && (
                        <p className="mt-3 text-sm text-red-600">
                            {errors.items}
                        </p>
                    )}
                </div>

                <div className="border-t border-neutral-200 p-5">
                    <div className="mb-3">
                        <label className="mb-1 block text-xs text-neutral-500">
                            Metode Pembayaran
                        </label>
                        <select
                            value={data.payment_method}
                            onChange={(e) =>
                                setData('payment_method', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        >
                            <option value="cash">Tunai</option>
                            <option value="qris">QRIS</option>
                            <option value="debit">Debit</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center justify-between text-base font-semibold text-neutral-900">
                        <span>Total</span>
                        <span>{formatRupiah(subtotal)}</span>
                    </div>

                    <button
                        onClick={submitOrder}
                        disabled={processing || cart.length === 0}
                        className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-40"
                    >
                        Bayar
                    </button>
                </div>
            </aside>
        </>
    );
}
