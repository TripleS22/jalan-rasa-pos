<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class JournalService
{
    /**
     * @param  array<int, array{account_code: string, debit?: float, credit?: float}>  $lines
     */
    public function post(
        string $description,
        string $entryDate,
        array $lines,
        User $user,
        ?string $referenceType = null,
        ?int $referenceId = null,
    ): JournalEntry {
        $totalDebit = round(array_sum(array_column($lines, 'debit')), 2);
        $totalCredit = round(array_sum(array_column($lines, 'credit')), 2);

        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw ValidationException::withMessages([
                'journal' => ["Jurnal tidak balance: debit {$totalDebit} != kredit {$totalCredit} ({$description})."],
            ]);
        }

        $accounts = Account::whereIn('code', array_column($lines, 'account_code'))
            ->get()
            ->keyBy('code');

        $entry = JournalEntry::create([
            'entry_no' => 'JE-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
            'entry_date' => $entryDate,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'description' => $description,
            'user_id' => $user->id,
        ]);

        foreach ($lines as $line) {
            $account = $accounts[$line['account_code']] ?? null;

            if (! $account) {
                throw ValidationException::withMessages([
                    'journal' => ["Akun dengan kode \"{$line['account_code']}\" tidak ditemukan."],
                ]);
            }

            $entry->lines()->create([
                'account_id' => $account->id,
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
            ]);
        }

        return $entry;
    }
}
