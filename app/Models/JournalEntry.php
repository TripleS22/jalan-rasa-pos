<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['entry_no', 'entry_date', 'reference_type', 'reference_id', 'description', 'user_id'])]
class JournalEntry extends Model
{
    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
        ];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function totalDebit(): float
    {
        return (float) $this->lines->sum('debit');
    }
}
