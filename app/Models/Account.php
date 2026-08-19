<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'type', 'is_active'])]
class Account extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function balance(): float
    {
        $debit = (float) $this->lines()->sum('debit');
        $credit = (float) $this->lines()->sum('credit');

        return in_array($this->type, ['asset', 'expense'])
            ? $debit - $credit
            : $credit - $debit;
    }
}
