<?php

namespace App\Services;

use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{outlet_id: int, customer_id?: ?int, order_type?: string, customer_name?: ?string, table_no?: ?string, discount?: float, tax?: float, payment_method: string, items: array<int, array{product_id: int, qty: int}>}  $data
     */
    public function create(array $data, User $user): Order
    {
        $products = Product::whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $order = DB::transaction(function () use ($data, $products, $user) {
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $itemSubtotal = $product->price * $item['qty'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'qty' => $item['qty'],
                    'price' => $product->price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;

            $order = Order::create([
                'outlet_id' => $data['outlet_id'],
                'order_no' => 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'customer_id' => $data['customer_id'] ?? null,
                'order_type' => $data['order_type'] ?? 'dine_in',
                'customer_name' => $data['customer_name'] ?? null,
                'table_no' => $data['table_no'] ?? null,
                'user_id' => $user->id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'status' => 'paid',
            ]);

            $totalCogs = 0;

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);

                $product = $products[$itemData['product_id']];

                $totalCogs += $this->batches->consume(
                    $product,
                    $data['outlet_id'],
                    $itemData['qty'],
                    Order::class,
                    $order->id,
                    "Penjualan {$order->order_no}",
                );
            }

            $cashAccount = $data['payment_method'] === 'cash' ? AccountCode::KAS : AccountCode::BANK;

            $journalLines = [
                ['account_code' => $cashAccount, 'debit' => $total],
                ['account_code' => AccountCode::PENDAPATAN_PENJUALAN, 'credit' => $total],
            ];

            if ($totalCogs > 0) {
                $journalLines[] = ['account_code' => AccountCode::HPP, 'debit' => $totalCogs];
                $journalLines[] = ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'credit' => $totalCogs];
            }

            $this->journal->post(
                "Penjualan {$order->order_no}",
                now()->toDateString(),
                $journalLines,
                $user,
                Order::class,
                $order->id,
            );

            return $order;
        });

        OrderStatusUpdated::dispatch($order);

        return $order;
    }
}
