<?php

namespace App\Services;

use App\Models\PrepaidExpense;
use App\Models\User;
use App\Support\AccountCode;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PrepaidExpenseService
{
    public function __construct(protected JournalService $journal) {}

    /**
     * @param  array{outlet_id: int, name: string, amount: float, start_date: string, months: int, notes?: ?string}  $data
     */
    public function create(array $data, User $user): PrepaidExpense
    {
        return DB::transaction(function () use ($data, $user) {
            $prepaid = PrepaidExpense::create([
                'outlet_id' => $data['outlet_id'],
                'name' => $data['name'],
                'amount' => $data['amount'],
                'start_date' => $data['start_date'],
                'months' => $data['months'],
                'amortized_amount' => 0,
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            $this->journal->post(
                "Pembayaran dimuka {$prepaid->name}",
                $data['start_date'],
                [
                    ['account_code' => AccountCode::BIAYA_DIBAYAR_DIMUKA, 'debit' => $prepaid->amount],
                    ['account_code' => AccountCode::KAS, 'credit' => $prepaid->amount],
                ],
                $user,
                PrepaidExpense::class,
                $prepaid->id,
            );

            return $prepaid;
        });
    }

    public function amortize(PrepaidExpense $prepaid, User $user, ?string $asOf = null): PrepaidExpense
    {
        if ($prepaid->status !== 'active') {
            throw ValidationException::withMessages([
                'prepaid' => ['Biaya dibayar dimuka ini sudah selesai diamortisasi.'],
            ]);
        }

        $asOfDate = $asOf ? Carbon::parse($asOf) : now();

        if ($prepaid->last_amortized_at && $prepaid->last_amortized_at->isSameMonth($asOfDate)) {
            throw ValidationException::withMessages([
                'prepaid' => ['Amortisasi bulan ini sudah pernah dijalankan.'],
            ]);
        }

        $monthly = $prepaid->months > 0 ? (float) $prepaid->amount / $prepaid->months : 0;
        $remaining = (float) $prepaid->amount - (float) $prepaid->amortized_amount;
        $amount = round(min($monthly, $remaining), 2);

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'prepaid' => ['Biaya dibayar dimuka ini sudah habis diamortisasi.'],
            ]);
        }

        return DB::transaction(function () use ($prepaid, $user, $asOfDate, $amount) {
            $newAmortized = (float) $prepaid->amortized_amount + $amount;

            $prepaid->update([
                'amortized_amount' => $newAmortized,
                'last_amortized_at' => $asOfDate->toDateString(),
                'status' => $newAmortized >= (float) $prepaid->amount ? 'completed' : 'active',
            ]);

            $this->journal->post(
                "Amortisasi {$prepaid->name} ({$asOfDate->format('M Y')})",
                $asOfDate->toDateString(),
                [
                    ['account_code' => AccountCode::BEBAN_OPERASIONAL, 'debit' => $amount],
                    ['account_code' => AccountCode::BIAYA_DIBAYAR_DIMUKA, 'credit' => $amount],
                ],
                $user,
                PrepaidExpense::class,
                $prepaid->id,
            );

            return $prepaid->fresh();
        });
    }
}
