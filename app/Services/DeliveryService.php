<?php

namespace App\Services;

use App\Models\Delivery;
use App\Models\Product;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DeliveryService
{
    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{from_outlet_id: int, to_outlet_id: int, notes?: ?string, items: array<int, array{product_id: int, qty: float}>}  $data
     */
    public function create(array $data, User $user): Delivery
    {
        $products = Product::whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        return DB::transaction(function () use ($data, $products, $user) {
            $delivery = Delivery::create([
                'do_no' => 'DO-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'from_outlet_id' => $data['from_outlet_id'],
                'to_outlet_id' => $data['to_outlet_id'],
                'user_id' => $user->id,
                'status' => 'sent',
                'sent_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];

                $totalCost = $this->batches->consume(
                    $product,
                    $data['from_outlet_id'],
                    $item['qty'],
                    Delivery::class,
                    $delivery->id,
                    "Kirim DO {$delivery->do_no}",
                );

                $delivery->items()->create([
                    'product_id' => $product->id,
                    'qty_sent' => $item['qty'],
                    'unit_cost' => $item['qty'] > 0 ? $totalCost / $item['qty'] : 0,
                ]);
            }

            return $delivery;
        });
    }

    /**
     * @param  array<int, array{id: int, qty_received: float, condition_ok?: bool, expired_ok?: bool}>  $itemsData
     */
    public function receive(Delivery $delivery, array $itemsData, User $user): Delivery
    {
        if ($delivery->status === 'received') {
            return $delivery;
        }

        return DB::transaction(function () use ($delivery, $itemsData, $user) {
            foreach ($itemsData as $itemInput) {
                $deliveryItem = $delivery->items()->with('product')->findOrFail($itemInput['id']);
                $qtyReceived = (float) $itemInput['qty_received'];
                $shortage = max(0, (float) $deliveryItem->qty_sent - $qtyReceived);

                $deliveryItem->update([
                    'qty_received' => $qtyReceived,
                    'condition_ok' => $itemInput['condition_ok'] ?? true,
                    'expired_ok' => $itemInput['expired_ok'] ?? true,
                ]);

                $product = $deliveryItem->product;

                if ($qtyReceived > 0) {
                    $expiredAt = $product->shelf_life_days
                        ? now()->addDays($product->shelf_life_days)->toDateString()
                        : null;

                    $this->batches->createBatch(
                        $product,
                        $delivery->to_outlet_id,
                        'delivery',
                        $deliveryItem->id,
                        $qtyReceived,
                        now()->toDateString(),
                        $expiredAt,
                        $user,
                        "Terima DO {$delivery->do_no}",
                        (float) $deliveryItem->unit_cost,
                        'passed',
                    );
                }

                if ($shortage > 0) {
                    $writeOffValue = $shortage * (float) $deliveryItem->unit_cost;

                    if ($writeOffValue > 0) {
                        $this->journal->post(
                            "Selisih DO {$delivery->do_no} ({$product->name})",
                            now()->toDateString(),
                            [
                                ['account_code' => AccountCode::BEBAN_KERUGIAN, 'debit' => $writeOffValue],
                                ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'credit' => $writeOffValue],
                            ],
                            $user,
                            Delivery::class,
                            $delivery->id,
                        );
                    }
                }
            }

            $delivery->update([
                'status' => 'received',
                'received_by' => $user->id,
                'received_at' => now(),
            ]);

            return $delivery->fresh();
        });
    }
}
