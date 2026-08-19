<?php

namespace App\Services;

use App\Events\PreOrderStatusUpdated;
use App\Models\PreOrder;
use App\Models\Product;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PreOrderService
{
    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{outlet_id: int, customer_id?: ?int, pickup_date: string, down_payment?: float, notes?: ?string, items: array<int, array{product_id: int, qty: int}>}  $data
     */
    public function create(array $data, User $user): PreOrder
    {
        $products = Product::whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $preOrder = DB::transaction(function () use ($data, $products, $user) {
            $total = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $subtotal = $product->price * $item['qty'];
                $total += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'qty' => $item['qty'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ];
            }

            $preOrder = PreOrder::create([
                'outlet_id' => $data['outlet_id'],
                'order_no' => 'PO-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => $user->id,
                'pickup_date' => $data['pickup_date'],
                'total' => $total,
                'down_payment' => $data['down_payment'] ?? 0,
                'status' => 'pending',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($itemsData as $itemData) {
                $preOrder->items()->create($itemData);
            }

            $downPayment = (float) ($data['down_payment'] ?? 0);

            if ($downPayment > 0) {
                $this->journal->post(
                    "Uang muka pre-order {$preOrder->order_no}",
                    now()->toDateString(),
                    [
                        ['account_code' => AccountCode::KAS, 'debit' => $downPayment],
                        ['account_code' => AccountCode::UANG_MUKA_PELANGGAN, 'credit' => $downPayment],
                    ],
                    $user,
                    PreOrder::class,
                    $preOrder->id,
                );
            }

            return $preOrder;
        });

        PreOrderStatusUpdated::dispatch($preOrder);

        return $preOrder;
    }

    public function updateStatus(PreOrder $preOrder, string $status, User $user): PreOrder
    {
        if ($preOrder->status !== 'completed' && $status === 'completed') {
            DB::transaction(function () use ($preOrder, $user) {
                $totalCogs = 0;

                foreach ($preOrder->items()->with('product')->get() as $item) {
                    $totalCogs += $this->batches->consume(
                        $item->product,
                        $preOrder->outlet_id,
                        $item->qty,
                        PreOrder::class,
                        $preOrder->id,
                        "Pre-order {$preOrder->order_no} diambil",
                    );
                }

                $downPayment = (float) $preOrder->down_payment;
                $remaining = (float) $preOrder->total - $downPayment;

                $lines = [];

                if ($downPayment > 0) {
                    $lines[] = ['account_code' => AccountCode::UANG_MUKA_PELANGGAN, 'debit' => $downPayment];
                }

                if ($remaining > 0) {
                    $lines[] = ['account_code' => AccountCode::KAS, 'debit' => $remaining];
                }

                if ($lines !== []) {
                    $lines[] = ['account_code' => AccountCode::PENDAPATAN_PENJUALAN, 'credit' => (float) $preOrder->total];
                }

                if ($totalCogs > 0) {
                    $lines[] = ['account_code' => AccountCode::HPP, 'debit' => $totalCogs];
                    $lines[] = ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'credit' => $totalCogs];
                }

                if ($lines !== []) {
                    $this->journal->post(
                        "Pre-order {$preOrder->order_no} selesai",
                        now()->toDateString(),
                        $lines,
                        $user,
                        PreOrder::class,
                        $preOrder->id,
                    );
                }

                $preOrder->update(['status' => 'completed']);
            });
        } elseif ($preOrder->status !== 'cancelled' && $status === 'cancelled') {
            DB::transaction(function () use ($preOrder, $user) {
                $downPayment = (float) $preOrder->down_payment;

                if ($downPayment > 0) {
                    $this->journal->post(
                        "Pre-order {$preOrder->order_no} dibatalkan (refund uang muka)",
                        now()->toDateString(),
                        [
                            ['account_code' => AccountCode::UANG_MUKA_PELANGGAN, 'debit' => $downPayment],
                            ['account_code' => AccountCode::KAS, 'credit' => $downPayment],
                        ],
                        $user,
                        PreOrder::class,
                        $preOrder->id,
                    );
                }

                $preOrder->update(['status' => 'cancelled']);
            });
        } else {
            $preOrder->update(['status' => $status]);
        }

        $preOrder = $preOrder->fresh();

        PreOrderStatusUpdated::dispatch($preOrder);

        return $preOrder;
    }
}
