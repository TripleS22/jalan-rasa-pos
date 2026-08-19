<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['delivery_id', 'product_id', 'qty_sent', 'qty_received', 'unit_cost', 'condition_ok', 'expired_ok'])]
class DeliveryItem extends Model
{
    protected function casts(): array
    {
        return [
            'qty_sent' => 'decimal:2',
            'qty_received' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'condition_ok' => 'boolean',
            'expired_ok' => 'boolean',
        ];
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
