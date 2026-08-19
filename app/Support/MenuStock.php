<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * Sorting rule shared by every menu a customer or cashier picks items from:
 * produk yang stoknya masih ada selalu tampil duluan, yang habis didorong
 * ke bawah (bukan disembunyikan). Dipakai bareng dengan withSum('batches
 * as available_stock', ...), yang bernilai null (bukan 0) kalau tidak ada
 * batch aktif sama sekali.
 */
final class MenuStock
{
    /**
     * @param  Collection<int, Product>  $products
     * @return Collection<int, Product>
     */
    public static function sortByAvailability(Collection $products): Collection
    {
        return $products
            ->sort(function (Product $a, Product $b) {
                $aOut = self::isOutOfStock($a);
                $bOut = self::isOutOfStock($b);

                if ($aOut !== $bOut) {
                    return $aOut <=> $bOut;
                }

                return strcmp($a->name, $b->name);
            })
            ->values();
    }

    public static function isOutOfStock(Product $product): bool
    {
        return $product->available_stock === null || (float) $product->available_stock <= 0;
    }
}
