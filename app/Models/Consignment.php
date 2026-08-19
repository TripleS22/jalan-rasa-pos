<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'consignment_partner_id', 'user_id', 'sent_date', 'status', 'notes'])]
class Consignment extends Model
{
    protected function casts(): array
    {
        return [
            'sent_date' => 'date',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(ConsignmentPartner::class, 'consignment_partner_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConsignmentItem::class);
    }
}
