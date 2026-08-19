<?php

namespace App\Services;

use App\Models\CustomerReturn;
use App\Models\OrderItem;
use App\Models\StockMovement;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerReturnService
{
    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{order_item_id: int, qty: float, reason: string, action: string, notes?: ?string}  $data
     */
    public function create(array $data, User $user): CustomerReturn
    {
        $orderItem = OrderItem::with('product', 'order')->findOrFail($data['order_item_id']);

        $alreadyReturned = CustomerReturn::where('order_item_id', $orderItem->id)->sum('qty');

        if ($alreadyReturned + $data['qty'] > $orderItem->qty) {
            throw ValidationException::withMessages([
                'qty' => ['Jumlah retur melebihi jumlah yang terjual di transaksi ini.'],
            ]);
        }

        return DB::transaction(function () use ($data, $orderItem, $user) {
            $customerReturn = CustomerReturn::create([
                'order_id' => $orderItem->order_id,
                'order_item_id' => $orderItem->id,
                'product_id' => $orderItem->product_id,
                'qty' => $data['qty'],
                'reason' => $data['reason'],
                'action' => $data['action'],
                'user_id' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($data['action'] === 'restock') {
                $product = $orderItem->product;

                $expiredAt = $product->shelf_life_days
                    ? now()->addDays($product->shelf_life_days)->toDateString()
                    : null;

                $this->batches->createBatch(
                    $product,
                    $orderItem->order->outlet_id,
                    'return',
                    $customerReturn->id,
                    $data['qty'],
                    now()->toDateString(),
                    $expiredAt,
                    $user,
                    "Retur pelanggan {$orderItem->order->order_no}",
                    (float) $product->cost_price,
                );

                StockMovement::create([
                    'stockable_type' => $product::class,
                    'stockable_id' => $product->id,
                    'type' => 'in',
                    'qty' => $data['qty'],
                    'reference_type' => CustomerReturn::class,
                    'reference_id' => $customerReturn->id,
                    'note' => "Retur pelanggan {$orderItem->order->order_no} (restock)",
                ]);
            }

            $refundAmount = (float) $orderItem->price * $data['qty'];

            if ($refundAmount > 0) {
                $lines = [
                    ['account_code' => AccountCode::PENDAPATAN_PENJUALAN, 'debit' => $refundAmount],
                    ['account_code' => AccountCode::KAS, 'credit' => $refundAmount],
                ];

                if ($data['action'] === 'restock') {
                    $cogsAmount = (float) $orderItem->product->cost_price * $data['qty'];

                    if ($cogsAmount > 0) {
                        $lines[] = ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'debit' => $cogsAmount];
                        $lines[] = ['account_code' => AccountCode::HPP, 'credit' => $cogsAmount];
                    }
                }

                $this->journal->post(
                    "Retur pelanggan {$orderItem->order->order_no} ({$orderItem->product->name})",
                    now()->toDateString(),
                    $lines,
                    $user,
                    CustomerReturn::class,
                    $customerReturn->id,
                );
            }

            return $customerReturn;
        });
    }
}
