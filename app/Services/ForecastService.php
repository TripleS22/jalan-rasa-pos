<?php

namespace App\Services;

use App\Models\Forecast;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ForecastService
{
    /**
     * @param  array{outlet_id: int, category_id?: ?int, pic_user_id: int, week_label: string, forecast_date: string, forecast_qty: float, po_qty?: ?float, lead_time_days?: ?int, exception_reason?: ?string, exception_approved_by?: ?int, notes?: ?string}  $data
     */
    public function create(array $data, User $user): Forecast
    {
        $status = null;

        if (isset($data['po_qty']) && $data['po_qty'] !== null) {
            $status = (float) $data['po_qty'] === (float) $data['forecast_qty'] ? 'on_time' : 'exception';

            if ($status === 'exception' && empty($data['exception_reason'])) {
                throw ValidationException::withMessages([
                    'exception_reason' => ['Alasan eksepsi wajib diisi kalau PO Qty berbeda dari Forecast Qty.'],
                ]);
            }
        }

        return Forecast::create([
            'outlet_id' => $data['outlet_id'],
            'category_id' => $data['category_id'] ?? null,
            'pic_user_id' => $data['pic_user_id'],
            'week_label' => $data['week_label'],
            'forecast_date' => $data['forecast_date'],
            'forecast_qty' => $data['forecast_qty'],
            'po_qty' => $data['po_qty'] ?? null,
            'lead_time_days' => $data['lead_time_days'] ?? null,
            'status' => $status,
            'exception_reason' => $status === 'exception' ? $data['exception_reason'] : null,
            'exception_approved_by' => $status === 'exception' ? ($data['exception_approved_by'] ?? null) : null,
            'purchase_id' => $data['purchase_id'] ?? null,
            'notes' => $data['notes'] ?? null,
            'created_by' => $user->id,
        ]);
    }
}
