<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\PurchaseItem;
use App\Models\RawMaterial;
use App\Models\StockMovement;
use App\Models\SupplierReturn;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SupplierReturnService
{
    public function __construct(protected JournalService $journal) {}

    /**
     * @param  array{purchase_item_id: int, qty: float, reason: string, notes?: ?string}  $data
     */
    public function create(array $data, User $user): SupplierReturn
    {
        $purchaseItem = PurchaseItem::with('purchase', 'purchasable')->findOrFail($data['purchase_item_id']);
        $model = $purchaseItem->purchasable;

        return DB::transaction(function () use ($data, $purchaseItem, $model, $user) {
            if ($model instanceof RawMaterial && $model->stock_qty < $data['qty']) {
                throw ValidationException::withMessages([
                    'qty' => ["Stok \"{$model->name}\" tidak cukup untuk diretur sebanyak ini."],
                ]);
            }

            $batch = null;

            if ($model instanceof Product) {
                $batch = ProductBatch::where('source_type', 'purchase')
                    ->where('source_id', $purchaseItem->id)
                    ->first();

                if (! $batch || $batch->qty_remaining < $data['qty']) {
                    throw ValidationException::withMessages([
                        'qty' => ["Stok batch \"{$model->name}\" dari pembelian ini tidak cukup untuk diretur."],
                    ]);
                }
            }

            $supplierReturn = SupplierReturn::create([
                'purchase_id' => $purchaseItem->purchase_id,
                'purchase_item_id' => $purchaseItem->id,
                'purchasable_type' => $purchaseItem->purchasable_type,
                'purchasable_id' => $purchaseItem->purchasable_id,
                'qty' => $data['qty'],
                'reason' => $data['reason'],
                'user_id' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($model instanceof RawMaterial) {
                $model->decrement('stock_qty', $data['qty']);

                StockMovement::create([
                    'stockable_type' => RawMaterial::class,
                    'stockable_id' => $model->id,
                    'type' => 'out',
                    'qty' => $data['qty'],
                    'reference_type' => SupplierReturn::class,
                    'reference_id' => $supplierReturn->id,
                    'note' => "Retur supplier {$purchaseItem->purchase->invoice_no}",
                ]);
            } elseif ($model instanceof Product) {
                $batch->decrement('qty_remaining', $data['qty']);

                StockMovement::create([
                    'stockable_type' => Product::class,
                    'stockable_id' => $model->id,
                    'type' => 'out',
                    'qty' => $data['qty'],
                    'reference_type' => SupplierReturn::class,
                    'reference_id' => $supplierReturn->id,
                    'note' => "Retur supplier {$purchaseItem->purchase->invoice_no} (batch {$batch->batch_no})",
                ]);
            }

            $refundAmount = (float) $purchaseItem->price * $data['qty'];

            if ($refundAmount > 0 && $purchaseItem->purchase->status === 'received') {
                $inventoryAccount = $model instanceof RawMaterial
                    ? AccountCode::PERSEDIAAN_BAHAN_BAKU
                    : AccountCode::PERSEDIAAN_PRODUK_JADI;

                $this->journal->post(
                    "Retur supplier {$purchaseItem->purchase->invoice_no} ({$model->name})",
                    now()->toDateString(),
                    [
                        ['account_code' => AccountCode::KAS, 'debit' => $refundAmount],
                        ['account_code' => $inventoryAccount, 'credit' => $refundAmount],
                    ],
                    $user,
                    SupplierReturn::class,
                    $supplierReturn->id,
                );
            }

            return $supplierReturn;
        });
    }
}
