<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['production_id', 'outlet_id', 'qty_checked', 'qty_passed', 'qty_rejected', 'reject_reason', 'pic_user_id', 'notes', 'created_by'])]
class QcCheck extends Model
{
    protected function casts(): array
    {
        return [
            'qty_checked' => 'decimal:2',
            'qty_passed' => 'decimal:2',
            'qty_rejected' => 'decimal:2',
        ];
    }

    public function production(): BelongsTo
    {
        return $this->belongsTo(Production::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
