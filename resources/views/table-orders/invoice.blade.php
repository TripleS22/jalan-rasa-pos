<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $tableOrder->order_no }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            max-width: 380px;
            margin: 24px auto;
            padding: 0 16px;
            color: #171717;
        }
        .center { text-align: center; }
        h1 { font-size: 16px; margin: 0 0 2px; }
        .muted { color: #737373; font-size: 12px; }
        .divider { border-top: 1px dashed #a3a3a3; margin: 12px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        td { padding: 3px 0; vertical-align: top; }
        .qty { width: 28px; }
        .amount { text-align: right; white-space: nowrap; }
        .total-row td { font-weight: bold; font-size: 14px; padding-top: 6px; }
        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 6px;
        }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-confirmed { background: #d1fae5; color: #065f46; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .print-bar { max-width: 380px; margin: 0 auto 12px; text-align: right; }
        .print-bar button {
            background: #171717;
            color: #fff;
            border: none;
            border-radius: 999px;
            padding: 8px 20px;
            font-size: 13px;
            cursor: pointer;
        }
        @media print {
            .print-bar { display: none; }
            body { margin: 0 auto; }
        }
    </style>
</head>
<body>
    <div class="print-bar">
        <button onclick="window.print()">Cetak</button>
    </div>

    <div class="center">
        <h1>{{ $tableOrder->table->outlet->name }}</h1>
        <p class="muted">Invoice / Struk Pesanan Meja</p>
        <span class="badge badge-{{ $tableOrder->status }}">
            @if ($tableOrder->status === 'pending') Menunggu Konfirmasi Kasir
            @elseif ($tableOrder->status === 'confirmed') Dikonfirmasi
            @else Dibatalkan
            @endif
        </span>
    </div>

    <div class="divider"></div>

    <table>
        <tr>
            <td class="muted">No. Pesanan</td>
            <td class="amount">{{ $tableOrder->order_no }}</td>
        </tr>
        <tr>
            <td class="muted">Meja</td>
            <td class="amount">{{ $tableOrder->table->table_no }}</td>
        </tr>
        <tr>
            <td class="muted">Waktu</td>
            <td class="amount">{{ $tableOrder->created_at->locale('id')->translatedFormat('d M Y, H:i') }}</td>
        </tr>
        @if ($tableOrder->customer_name)
            <tr>
                <td class="muted">Nama</td>
                <td class="amount">{{ $tableOrder->customer_name }}</td>
            </tr>
        @endif
        <tr>
            <td class="muted">Metode Bayar</td>
            <td class="amount">{{ strtoupper($tableOrder->payment_method) }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <table>
        @foreach ($tableOrder->items as $item)
            <tr>
                <td class="qty">{{ $item->qty }}x</td>
                <td>{{ $item->product->name }}</td>
                <td class="amount">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
        @endforeach
        <tr class="total-row">
            <td colspan="2">Total</td>
            <td class="amount">Rp {{ number_format($tableOrder->total, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <p class="muted center">
        @if ($tableOrder->status === 'pending')
            Invoice ini adalah rincian pesanan Anda. Pembayaran diproses
            oleh kasir saat pesanan dikonfirmasi.
        @else
            Terima kasih telah memesan di {{ $tableOrder->table->outlet->name }}.
        @endif
    </p>
</body>
</html>
