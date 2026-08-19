<?php

namespace App\Services;

use App\Models\Consignment;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConsignmentService
{
    public function __construct(protected JournalService $journal) {}

    /**
     * @param  array{consignment_partner_id: int, sent_date: string, notes?: ?string, items: array<int, array{product_id: int, qty_sent: int, price: float}>}  $data
     */
    public function create(array $data, User $user): Consignment
    {
        return DB::transaction(function () use ($data, $user) {
            $consignment = Consignment::create([
                'code' => 'KSG-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'consignment_partner_id' => $data['consignment_partner_id'],
                'user_id' => $user->id,
                'sent_date' => $data['sent_date'],
                'status' => 'open',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $consignment->items()->create([
                    'product_id' => $item['product_id'],
                    'qty_sent' => $item['qty_sent'],
                    'price' => $item['price'],
                ]);
            }

            return $consignment;
        });
    }

    /**
     * @param  array<int, array{id: int, qty_sold: int, qty_returned: int}>  $items
     */
    public function settle(Consignment $consignment, array $items, User $user): Consignment
    {
        DB::transaction(function () use ($items, $consignment, $user) {
            $totalRevenue = 0;
            $totalCogs = 0;

            foreach ($items as $itemData) {
                $item = $consignment->items()->with('product')->whereKey($itemData['id'])->first();

                $item->update([
                    'qty_sold' => $itemData['qty_sold'],
                    'qty_returned' => $itemData['qty_returned'],
                ]);

                $totalRevenue += (float) $item->price * $itemData['qty_sold'];
                $totalCogs += (float) $item->product->cost_price * $itemData['qty_sold'];
            }

            if ($totalRevenue > 0) {
                $lines = [
                    ['account_code' => AccountCode::KAS, 'debit' => $totalRevenue],
                    ['account_code' => AccountCode::PENDAPATAN_PENJUALAN, 'credit' => $totalRevenue],
                ];

                if ($totalCogs > 0) {
                    $lines[] = ['account_code' => AccountCode::HPP, 'debit' => $totalCogs];
                    $lines[] = ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'credit' => $totalCogs];
                }

                $this->journal->post(
                    "Setelmen konsinyasi {$consignment->code}",
                    now()->toDateString(),
                    $lines,
                    $user,
                    Consignment::class,
                    $consignment->id,
                );
            }

            $consignment->update(['status' => 'settled']);
        });

        return $consignment->fresh('items.product', 'partner');
    }
}
