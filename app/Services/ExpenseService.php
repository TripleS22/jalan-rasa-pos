<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\User;
use App\Support\AccountCode;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function __construct(protected JournalService $journal) {}

    /**
     * @param  array{category: string, description?: ?string, amount: float}  $data
     */
    public function create(array $data, User $user): Expense
    {
        return DB::transaction(function () use ($data, $user) {
            $expense = Expense::create($data + ['user_id' => $user->id]);

            $this->journal->post(
                "Pengeluaran: {$expense->category}",
                now()->toDateString(),
                [
                    ['account_code' => AccountCode::BEBAN_OPERASIONAL, 'debit' => (float) $expense->amount],
                    ['account_code' => AccountCode::KAS, 'credit' => (float) $expense->amount],
                ],
                $user,
                Expense::class,
                $expense->id,
            );

            return $expense;
        });
    }
}
