<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['outlet_id', 'name', 'category', 'purchase_date', 'purchase_cost', 'useful_life_months', 'salvage_value', 'accumulated_depreciation', 'last_depreciated_at', 'status', 'disposed_at', 'notes', 'created_by'])]
class Asset extends Model
{
    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'purchase_cost' => 'decimal:2',
            'salvage_value' => 'decimal:2',
            'accumulated_depreciation' => 'decimal:2',
            'last_depreciated_at' => 'date',
            'disposed_at' => 'date',
        ];
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
