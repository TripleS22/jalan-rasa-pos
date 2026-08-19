<?php

namespace App\Services;

use App\Models\ProductBatch;
use App\Models\Production;
use App\Models\QcCheck;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QcCheckService
{
    public function __construct(protected JournalService $journal) {}

    /**
     * @param  array{production_id: int, qty_checked: float, qty_passed: float, qty_rejected: float, reject_reason?: ?string, pic_user_id: int, notes?: ?string}  $data
     */
    public function create(array $data, User $user): QcCheck
    {
        $production = Production::with('product')->findOrFail($data['production_id']);

        $batch = ProductBatch::where('source_type', 'production')
            ->where('source_id', $production->id)
            ->first();

        if (! $batch || $batch->qc_status !== 'pending') {
            throw ValidationException::withMessages([
                'production_id' => ['Produksi ini sudah pernah di-QC atau batch-nya tidak ditemukan.'],
            ]);
        }

        if ($data['qty_checked'] > $production->qty) {
            throw ValidationException::withMessages([
                'qty_checked' => ['Jumlah diperiksa tidak boleh melebihi jumlah produksi.'],
            ]);
        }

        if (abs(($data['qty_passed'] + $data['qty_rejected']) - $data['qty_checked']) > 0.01) {
            throw ValidationException::withMessages([
                'qty_passed' => ['Lolos QC + Reject QC harus sama dengan Jumlah Diperiksa.'],
            ]);
        }

        if ($data['qty_rejected'] > 0 && empty($data['reject_reason'])) {
            throw ValidationException::withMessages([
                'reject_reason' => ['Alasan reject wajib diisi kalau ada produk yang reject.'],
            ]);
        }

        return DB::transaction(function () use ($data, $production, $batch, $user) {
            $qcStatus = $data['qty_passed'] > 0 ? 'passed' : 'rejected';

            $batch->update([
                'qty_remaining' => $data['qty_passed'],
                'qc_status' => $qcStatus,
            ]);

            if ($data['qty_rejected'] > 0) {
                $rejectedValue = $data['qty_rejected'] * (float) ($batch->unit_cost ?? 0);

                if ($rejectedValue > 0) {
                    $this->journal->post(
                        "Reject QC produksi {$production->product->name}",
                        now()->toDateString(),
                        [
                            ['account_code' => AccountCode::BEBAN_KERUGIAN, 'debit' => $rejectedValue],
                            ['account_code' => AccountCode::PERSEDIAAN_PRODUK_JADI, 'credit' => $rejectedValue],
                        ],
                        $user,
                        Production::class,
                        $production->id,
                    );
                }
            }

            return QcCheck::create([
                'production_id' => $production->id,
                'outlet_id' => $production->outlet_id,
                'qty_checked' => $data['qty_checked'],
                'qty_passed' => $data['qty_passed'],
                'qty_rejected' => $data['qty_rejected'],
                'reject_reason' => $data['reject_reason'] ?? null,
                'pic_user_id' => $data['pic_user_id'],
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);
        });
    }
}
