<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['outlet_id', 'product_id', 'batch_no', 'source_type', 'source_id', 'qc_status', 'qty_initial', 'qty_remaining', 'unit_cost', 'produced_at', 'expired_at', 'user_id', 'notes'])]
class ProductBatch extends Model
{
    protected function casts(): array
    {
        return [
            'qty_initial' => 'decimal:2',
            'qty_remaining' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'produced_at' => 'date',
            'expired_at' => 'date',
        ];
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Batch dengan sisa stok, sudah lolos QC (atau tidak butuh QC), dan belum kedaluwarsa —
     * layak dijual.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('qty_remaining', '>', 0)
            ->where('qc_status', 'passed')
            ->where(function ($q) {
                $q->whereNull('expired_at')->orWhereDate('expired_at', '>=', now()->toDateString());
            });
    }

    public function scopeExpiringSoon(Builder $query, int $days = 7): Builder
    {
        return $query->where('qty_remaining', '>', 0)
            ->whereNotNull('expired_at')
            ->whereDate('expired_at', '>=', now()->toDateString())
            ->whereDate('expired_at', '<=', now()->addDays($days)->toDateString());
    }

    /**
     * Urutan konsumsi FEFO: expired paling dekat duluan, yang tanpa expired paling akhir.
     */
    public function scopeFefoOrder(Builder $query): Builder
    {
        return $query->orderByRaw('expired_at IS NULL')->orderBy('expired_at');
    }
}
