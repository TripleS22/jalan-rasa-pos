<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['outlet_id', 'category_id', 'pic_user_id', 'week_label', 'forecast_date', 'forecast_qty', 'po_qty', 'lead_time_days', 'status', 'exception_reason', 'exception_approved_by', 'purchase_id', 'notes', 'created_by'])]
class Forecast extends Model
{
    protected function casts(): array
    {
        return [
            'forecast_date' => 'date',
            'forecast_qty' => 'decimal:2',
            'po_qty' => 'decimal:2',
        ];
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function exceptionApprovedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exception_approved_by');
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
