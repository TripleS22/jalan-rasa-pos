<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductBatchService
{
    public function createBatch(
        Product $product,
        int $outletId,
        string $sourceType,
        ?int $sourceId,
        float $qty,
        string $producedAt,
        ?string $expiredAt,
        User $user,
        ?string $notes = null,
        ?float $unitCost = null,
        string $qcStatus = 'passed',
    ): ProductBatch {
        return ProductBatch::create([
            'product_id' => $product->id,
            'outlet_id' => $outletId,
            'batch_no' => 'BTC-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'qc_status' => $qcStatus,
            'qty_initial' => $qty,
            'qty_remaining' => $qty,
            'unit_cost' => $unitCost,
            'produced_at' => $producedAt,
            'expired_at' => $expiredAt,
            'user_id' => $user->id,
            'notes' => $notes,
        ]);
    }

    /**
     * Konsumsi stok produk secara FEFO (expired paling dekat duluan) di satu outlet tertentu.
     * Melempar ValidationException kalau total stok aktif di outlet itu tidak cukup — batch di
     * outlet lain tidak dihitung, mencegah oversell lintas cabang. Mengembalikan total HPP
     * (qty * unit_cost) dari batch yang dikonsumsi, dipakai buat posting jurnal.
     */
    public function consume(Product $product, int $outletId, float $qty, string $referenceType, int $referenceId, string $noteLabel): float
    {
        $batches = $product->batches()->where('outlet_id', $outletId)->active()->fefoOrder()->get();
        $available = $batches->sum('qty_remaining');

        if ($available < $qty) {
            throw ValidationException::withMessages([
                'items' => ["Stok produk \"{$product->name}\" tidak cukup, tersisa {$available}."],
            ]);
        }

        $remainingToConsume = $qty;
        $totalCost = 0;

        foreach ($batches as $batch) {
            if ($remainingToConsume <= 0) {
                break;
            }

            $consumeFromBatch = min($batch->qty_remaining, $remainingToConsume);
            $batch->decrement('qty_remaining', $consumeFromBatch);
            $remainingToConsume -= $consumeFromBatch;
            $totalCost += $consumeFromBatch * (float) ($batch->unit_cost ?? 0);

            StockMovement::create([
                'stockable_type' => Product::class,
                'stockable_id' => $product->id,
                'type' => 'out',
                'qty' => $consumeFromBatch,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'note' => "{$noteLabel} (batch {$batch->batch_no})",
            ]);
        }

        return $totalCost;
    }
}
