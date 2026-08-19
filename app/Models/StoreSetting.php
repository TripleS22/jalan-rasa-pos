<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['store_name', 'address', 'phone', 'tax_percent', 'receipt_footer'])]
class StoreSetting extends Model
{
    protected function casts(): array
    {
        return [
            'tax_percent' => 'decimal:2',
        ];
    }

    public static function current(): self
    {
        return static::firstOrCreate([], ['store_name' => 'Jalan Rasa']);
    }
}
