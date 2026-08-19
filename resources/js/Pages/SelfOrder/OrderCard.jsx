function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value || 0);
}

function formatTime(value) {
    return new Date(value).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

const STATUS_LABEL = {
    pending: 'Menunggu konfirmasi kasir',
    confirmed: 'Dikonfirmasi — pesanan diproses',
    cancelled: 'Dibatalkan',
};

const STATUS_COLOR = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function OrderCard({ order, code, highlighted = false }) {
    return (
        <div
            className={`mb-3 rounded-2xl border bg-white p-4 ${
                highlighted
                    ? 'border-neutral-900 ring-2 ring-neutral-900'
                    : 'border-neutral-200'
            }`}
        >
            <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">
                    {order.order_no ?? `Pesanan #${order.id}`}
                </span>
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                >
                    {STATUS_LABEL[order.status]}
                </span>
            </div>
            <p className="mb-3 text-xs text-neutral-400">
                {formatTime(order.created_at)}
                {order.customer_name && ` · ${order.customer_name}`}
            </p>
            <ul className="mb-2 divide-y divide-neutral-100 text-sm">
                {order.items.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between py-1.5"
                    >
                        <span className="text-neutral-700">
                            {item.qty}&times; {item.product.name}
                        </span>
                        <span className="text-neutral-500">
                            {formatRupiah(item.subtotal)}
                        </span>
                    </li>
                ))}
            </ul>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-sm font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatRupiah(order.total)}</span>
            </div>

            {order.payment_method && order.payment_method !== 'cash' && (
                <a
                    href={route('self-order.invoice', {
                        code,
                        tableOrder: order.id,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block w-full rounded-full border border-neutral-900 py-2 text-center text-xs font-semibold text-neutral-900 hover:bg-neutral-900 hover:text-white"
                >
                    Cetak Invoice
                </a>
            )}
        </div>
    );
}
