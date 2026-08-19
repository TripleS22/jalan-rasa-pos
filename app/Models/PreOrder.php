<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['outlet_id', 'order_no', 'customer_id', 'user_id', 'pickup_date', 'total', 'down_payment', 'status', 'notes'])]
class PreOrder extends Model
{
    protected function casts(): array
    {
        return [
            'pickup_date' => 'date',
            'total' => 'decimal:2',
            'down_payment' => 'decimal:2',
        ];
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PreOrderItem::class);
    }
}
