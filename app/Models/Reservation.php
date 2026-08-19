<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['customer_id', 'customer_name', 'phone', 'table_no', 'guest_count', 'reservation_at', 'status', 'notes'])]
class Reservation extends Model
{
    protected function casts(): array
    {
        return [
            'reservation_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
