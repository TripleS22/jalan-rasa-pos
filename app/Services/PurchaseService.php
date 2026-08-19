<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\RawMaterial;
use App\Models\StockMovement;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseService
{
    protected array $typeMap = [
        'raw_material' => RawMaterial::class,
        'product' => Product::class,
    ];

    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{outlet_id: int, supplier_id: int, status?: ?string, items: array<int, array{purchasable_type: string, purchasable_id: int, qty: float, price: float, expired_at?: ?string}>}  $data
     */
    public function create(array $data, User $user): Purchase
    {
        return DB::transaction(function () use ($data, $user) {
            $total = collect($data['items'])->sum(fn ($item) => $item['qty'] * $item['price']);
            $status = $data['status'] ?? 'received';

            $purchase = Purchase::create([
                'outlet_id' => $data['outlet_id'],
                'invoice_no' => 'PUR-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'supplier_id' => $data['supplier_id'],
                'user_id' => $user->id,
                'total' => $total,
                'status' => $status,
            ]);

            $receivedItems = [];

            foreach ($data['items'] as $item) {
                $modelClass = $this->typeMap[$item['purchasable_type']];
                $subtotal = $item['qty'] * $item['price'];

                $purchaseItem = $purchase->items()->create([
                    'purchasable_type' => $modelClass,
                    'purchasable_id' => $item['purchasable_id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                    'expired_at' => $item['expired_at'] ?? null,
                ]);

                if ($status === 'received') {
                    $receivedItems[] = $this->receiveItem($purchaseItem, $purchase, $user);
                }
            }

            if ($receivedItems !== []) {
                $this->postReceiptJournal($purchase, $receivedItems, $user);
            }

            return $purchase;
        });
    }

    public function markReceived(Purchase $purchase): Purchase
    {
        if ($purchase->status === 'received') {
            return $purchase;
        }

        DB::transaction(function () use ($purchase) {
            $receivedItems = [];

            foreach ($purchase->items as $item) {
                $receivedItems[] = $this->receiveItem($item, $purchase, $purchase->user);
            }

            $purchase->update(['status' => 'received']);

            if ($receivedItems !== []) {
                $this->postReceiptJournal($purchase, $receivedItems, $purchase->user);
            }
        });

        return $purchase->fresh();
    }

    /**
     * @return array{account_code: string, amount: float}
     */
    protected function receiveItem(PurchaseItem $item, Purchase $purchase, User $user): array
    {
        $model = $item->purchasable;
        $amount = (float) $item->qty * (float) $item->price;

        if ($model instanceof RawMaterial) {
            $model->increment('stock_qty', $item->qty);

            StockMovement::create([
                'stockable_type' => $item->purchasable_type,
                'stockable_id' => $item->purchasable_id,
                'type' => 'in',
                'qty' => $item->qty,
                'reference_type' => Purchase::class,
                'reference_id' => $purchase->id,
                'note' => "Pembelian {$purchase->invoice_no}",
            ]);

            return ['account_code' => AccountCode::PERSEDIAAN_BAHAN_BAKU, 'amount' => $amount];
        }

        $this->batches->createBatch(
            $model,
            $purchase->outlet_id,
            'purchase',
            $item->id,
            $item->qty,
            now()->toDateString(),
            $item->expired_at?->toDateString(),
            $user,
            "Pembelian {$purchase->invoice_no}",
            (float) $item->price,
        );

        StockMovement::create([
            'stockable_type' => Product::class,
            'stockable_id' => $model->id,
            'type' => 'in',
            'qty' => $item->qty,
            'reference_type' => Purchase::class,
            'reference_id' => $purchase->id,
            'note' => "Pembelian {$purchase->invoice_no}",
        ]);

        return ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'amount' => $amount];
    }

    /**
     * @param  array<int, array{account_code: string, amount: float}>  $receivedItems
     */
    protected function postReceiptJournal(Purchase $purchase, array $receivedItems, User $user): void
    {
        $lines = [];

        foreach (collect($receivedItems)->groupBy('account_code') as $accountCode => $group) {
            $lines[] = ['account_code' => $accountCode, 'debit' => $group->sum('amount')];
        }

        $lines[] = ['account_code' => AccountCode::KAS, 'credit' => collect($receivedItems)->sum('amount')];

        $this->journal->post(
            "Pembelian {$purchase->invoice_no}",
            now()->toDateString(),
            $lines,
            $user,
            Purchase::class,
            $purchase->id,
        );
    }
}
