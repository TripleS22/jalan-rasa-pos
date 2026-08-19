<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['outlet_id', 'product_id', 'user_id', 'qty', 'produced_at', 'expired_at', 'notes'])]
class Production extends Model
{
    protected function casts(): array
    {
        return [
            'qty' => 'decimal:2',
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

    public function qcCheck(): HasOne
    {
        return $this->hasOne(QcCheck::class);
    }
}
