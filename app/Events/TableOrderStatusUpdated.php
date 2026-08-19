<?php

namespace App\Events;

use App\Models\TableOrder;
use App\Models\TableOrderItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TableOrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TableOrder $tableOrder)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('table-orders'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'table-order.status.updated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->tableOrder->loadMissing('table', 'items.product');

        return [
            'id' => $this->tableOrder->id,
            'order_no' => $this->tableOrder->order_no,
            'table_id' => $this->tableOrder->table_id,
            'table_no' => $this->tableOrder->table->table_no,
            'outlet_id' => $this->tableOrder->outlet_id,
            'customer_name' => $this->tableOrder->customer_name,
            'notes' => $this->tableOrder->notes,
            'total' => $this->tableOrder->total,
            'status' => $this->tableOrder->status,
            'payment_method' => $this->tableOrder->payment_method,
            'order_id' => $this->tableOrder->order_id,
            'items' => $this->tableOrder->items->map(fn (TableOrderItem $item) => [
                'product_name' => $item->product->name,
                'qty' => $item->qty,
                'price' => $item->price,
                'subtotal' => $item->subtotal,
            ]),
        ];
    }
}
