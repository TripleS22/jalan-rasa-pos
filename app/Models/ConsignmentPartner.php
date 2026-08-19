<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'phone', 'address'])]
class ConsignmentPartner extends Model
{
    public function consignments(): HasMany
    {
        return $this->hasMany(Consignment::class);
    }
}
