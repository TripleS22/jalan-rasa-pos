<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'phone', 'email', 'address'])]
class Supplier extends Model
{
    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
