<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['stockable_type', 'stockable_id', 'type', 'qty', 'reference_type', 'reference_id', 'note'])]
class StockMovement extends Model
{
    protected function casts(): array
    {
        return [
            'qty' => 'decimal:2',
        ];
    }

    public function stockable(): MorphTo
    {
        return $this->morphTo();
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
