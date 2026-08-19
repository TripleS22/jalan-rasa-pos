<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\WasteLog;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;

class WasteService
{
    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{outlet_id: int, product_id: int, source_type: string, qty: float, reason: string, pic_user_id?: ?int, notes?: ?string}  $data
     */
    public function create(array $data, User $user): WasteLog
    {
        $product = Product::findOrFail($data['product_id']);

        return DB::transaction(function () use ($data, $product, $user) {
            $waste = WasteLog::create([
                'outlet_id' => $data['outlet_id'],
                'product_id' => $product->id,
                'source_type' => $data['source_type'],
                'qty' => $data['qty'],
                'reason' => $data['reason'],
                'pic_user_id' => $data['pic_user_id'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            $totalCost = $this->batches->consume(
                $product,
                $data['outlet_id'],
                $data['qty'],
                WasteLog::class,
                $waste->id,
                "Waste ({$data['source_type']}) {$product->name}",
            );

            $unitCost = $data['qty'] > 0 ? $totalCost / $data['qty'] : 0;
            $waste->update(['unit_cost' => $unitCost]);

            if ($totalCost > 0) {
                $this->journal->post(
                    "Waste {$product->name} ({$data['source_type']})",
                    now()->toDateString(),
                    [
                        ['account_code' => AccountCode::BEBAN_KERUGIAN, 'debit' => $totalCost],
                        ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'credit' => $totalCost],
                    ],
                    $user,
                    WasteLog::class,
                    $waste->id,
                );
            }

            return $waste;
        });
    }
}
