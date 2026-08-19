<?php

namespace App\Services;

use App\Events\TableOrderStatusUpdated;
use App\Models\Product;
use App\Models\Table;
use App\Models\TableOrder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TableOrderService
{
    public function __construct(protected OrderService $orders) {}

    /**
     * Customer submits an order from their phone after scanning the table's QR code.
     * This only records the request — stock and accounting are untouched until a
     * staff member confirms it via confirm().
     *
     * @param  array{customer_name?: ?string, notes?: ?string, payment_method: string, items: array<int, array{product_id: int, qty: int}>}  $data
     */
    public function createFromTable(Table $table, array $data): TableOrder
    {
        $products = Product::where('is_active', true)
            ->whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        if ($products->count() !== collect($data['items'])->pluck('product_id')->unique()->count()) {
            throw ValidationException::withMessages([
                'items' => ['Salah satu produk tidak tersedia.'],
            ]);
        }

        $tableOrder = DB::transaction(function () use ($table, $data, $products) {
            $total = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $subtotal = $product->price * $item['qty'];
                $total += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'qty' => $item['qty'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ];
            }

            $tableOrder = TableOrder::create([
                'table_id' => $table->id,
                'outlet_id' => $table->outlet_id,
                'order_no' => 'TM-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                'customer_name' => $data['customer_name'] ?? null,
                'notes' => $data['notes'] ?? null,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => $data['payment_method'],
            ]);

            foreach ($itemsData as $itemData) {
                $tableOrder->items()->create($itemData);
            }

            return $tableOrder;
        });

        TableOrderStatusUpdated::dispatch($tableOrder);

        return $tableOrder;
    }

    /**
     * Staff confirms a self-order: turns it into a real, paid Order (stock is
     * consumed and journal entries are posted, same as a counter sale).
     */
    public function confirm(TableOrder $tableOrder, string $paymentMethod, User $user): TableOrder
    {
        if ($tableOrder->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Pesanan ini sudah diproses.'],
            ]);
        }

        $tableOrder->loadMissing('table', 'items');

        $order = $this->orders->create([
            'outlet_id' => $tableOrder->outlet_id,
            'order_type' => 'dine_in',
            'customer_name' => $tableOrder->customer_name,
            'table_no' => $tableOrder->table->table_no,
            'payment_method' => $paymentMethod,
            'items' => $tableOrder->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'qty' => $item->qty,
            ])->all(),
        ], $user);

        $tableOrder->update([
            'status' => 'confirmed',
            'order_id' => $order->id,
        ]);

        $tableOrder = $tableOrder->fresh();

        TableOrderStatusUpdated::dispatch($tableOrder);

        return $tableOrder;
    }

    public function cancel(TableOrder $tableOrder): TableOrder
    {
        if ($tableOrder->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Pesanan ini sudah diproses.'],
            ]);
        }

        $tableOrder->update(['status' => 'cancelled']);

        TableOrderStatusUpdated::dispatch($tableOrder);

        return $tableOrder;
    }
}
