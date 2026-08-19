<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Production;
use App\Models\StockMovement;
use App\Models\User;
use App\Support\AccountCode;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionService
{
    public function __construct(
        protected ProductBatchService $batches,
        protected JournalService $journal,
    ) {}

    /**
     * @param  array{outlet_id: int, product_id: int, qty: float, produced_at: string, expired_at?: ?string, notes?: ?string}  $data
     */
    public function create(array $data, User $user): Production
    {
        $product = Product::with('recipes.rawMaterial')->findOrFail($data['product_id']);

        if ($product->sourcing_type !== 'made') {
            throw ValidationException::withMessages([
                'product_id' => ["Produk \"{$product->name}\" bukan tipe Produksi Sendiri."],
            ]);
        }

        if ($product->recipes->isEmpty()) {
            throw ValidationException::withMessages([
                'product_id' => ["Produk \"{$product->name}\" belum punya resep, tidak bisa diproduksi."],
            ]);
        }

        foreach ($product->recipes as $recipe) {
            $needed = $recipe->qty_used * $data['qty'];

            if ($recipe->rawMaterial->stock_qty < $needed) {
                throw ValidationException::withMessages([
                    'qty' => ["Stok bahan baku \"{$recipe->rawMaterial->name}\" tidak cukup untuk produksi ini."],
                ]);
            }
        }

        $expiredAt = $data['expired_at']
            ?? ($product->shelf_life_days
                ? Carbon::parse($data['produced_at'])->addDays($product->shelf_life_days)->toDateString()
                : null);

        return DB::transaction(function () use ($data, $product, $user, $expiredAt) {
            $production = Production::create([
                'outlet_id' => $data['outlet_id'],
                'product_id' => $product->id,
                'user_id' => $user->id,
                'qty' => $data['qty'],
                'produced_at' => $data['produced_at'],
                'expired_at' => $expiredAt,
                'notes' => $data['notes'] ?? null,
            ]);

            $totalRawMaterialCost = 0;

            foreach ($product->recipes as $recipe) {
                $needed = $recipe->qty_used * $data['qty'];
                $totalRawMaterialCost += $needed * (float) $recipe->rawMaterial->cost_price;

                $recipe->rawMaterial->decrement('stock_qty', $needed);

                StockMovement::create([
                    'stockable_type' => $recipe->rawMaterial::class,
                    'stockable_id' => $recipe->rawMaterial->id,
                    'type' => 'out',
                    'qty' => $needed,
                    'reference_type' => Production::class,
                    'reference_id' => $production->id,
                    'note' => "Terpakai untuk produksi {$product->name}",
                ]);
            }

            $unitCost = $data['qty'] > 0 ? $totalRawMaterialCost / $data['qty'] : 0;

            $this->batches->createBatch(
                $product,
                $data['outlet_id'],
                'production',
                $production->id,
                $data['qty'],
                $data['produced_at'],
                $expiredAt,
                $user,
                $data['notes'] ?? null,
                $unitCost,
                'pending',
            );

            $this->journal->post(
                "Produksi {$product->name} x{$data['qty']}",
                $data['produced_at'],
                [
                    ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'debit' => $totalRawMaterialCost],
                    ['account_code' => AccountCode::PERSEDIAAN_BAHAN_BAKU, 'credit' => $totalRawMaterialCost],
                ],
                $user,
                Production::class,
                $production->id,
            );

            return $production;
        });
    }
}
