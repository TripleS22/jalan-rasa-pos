<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'phone', 'email', 'address', 'points'])]
class Customer extends Model
{
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
