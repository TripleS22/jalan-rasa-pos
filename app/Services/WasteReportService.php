<?php

namespace App\Services;

use App\Models\CustomerReturn;
use App\Models\ProductBatch;
use App\Models\QcCheck;
use App\Models\WasteLog;

class WasteReportService
{
    /**
     * Gabungkan semua sumber kerugian produk (waste manual, reject QC, retur pelanggan yang
     * dibuang) jadi satu daftar konsolidasi, terurut dari yang terbaru.
     */
    public function consolidatedLog(?string $from = null, ?string $to = null): array
    {
        $rows = collect();

        WasteLog::with('outlet', 'product', 'pic')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->get()
            ->each(function (WasteLog $waste) use ($rows) {
                $rows->push([
                    'date' => $waste->created_at,
                    'source' => 'waste_'.$waste->source_type,
                    'source_label' => match ($waste->source_type) {
                        'production_waste' => 'Waste Produksi',
                        'recall' => 'Recall',
                        'expired' => 'Kedaluwarsa',
                        default => 'Lainnya',
                    },
                    'product_name' => $waste->product?->name,
                    'outlet_name' => $waste->outlet?->name,
                    'qty' => (float) $waste->qty,
                    'estimated_loss' => (float) $waste->qty * (float) $waste->unit_cost,
                    'reason' => $waste->reason,
                    'pic_name' => $waste->pic?->name,
                    'journal_posted' => true,
                ]);
            });

        QcCheck::with('production.product', 'outlet', 'pic')
            ->where('qty_rejected', '>', 0)
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->get()
            ->each(function (QcCheck $check) use ($rows) {
                $batch = ProductBatch::where('source_type', 'production')
                    ->where('source_id', $check->production_id)
                    ->first();

                $rows->push([
                    'date' => $check->created_at,
                    'source' => 'qc_reject',
                    'source_label' => 'Reject QC Produksi',
                    'product_name' => $check->production?->product?->name,
                    'outlet_name' => $check->outlet?->name,
                    'qty' => (float) $check->qty_rejected,
                    'estimated_loss' => (float) $check->qty_rejected * (float) ($batch->unit_cost ?? 0),
                    'reason' => $check->reject_reason,
                    'pic_name' => $check->pic?->name,
                    'journal_posted' => true,
                ]);
            });

        CustomerReturn::with('product', 'order.outlet', 'user')
            ->where('action', 'waste')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->get()
            ->each(function (CustomerReturn $return) use ($rows) {
                $rows->push([
                    'date' => $return->created_at,
                    'source' => 'customer_return_discard',
                    'source_label' => 'Retur Pelanggan (Dibuang)',
                    'product_name' => $return->product?->name,
                    'outlet_name' => $return->order?->outlet?->name,
                    'qty' => (float) $return->qty,
                    'estimated_loss' => (float) $return->qty * (float) ($return->product?->cost_price ?? 0),
                    'reason' => $return->reason,
                    'pic_name' => $return->user?->name,
                    'journal_posted' => false,
                ]);
            });

        $rows = $rows->sortByDesc('date')->values();

        return [
            'rows' => $rows,
            'kpi' => [
                'total_loss' => $rows->sum('estimated_loss'),
                'total_qty' => $rows->sum('qty'),
                'by_source' => $rows->groupBy('source_label')
                    ->map(fn ($group) => [
                        'qty' => $group->sum('qty'),
                        'loss' => $group->sum('estimated_loss'),
                    ]),
            ],
        ];
    }
}
