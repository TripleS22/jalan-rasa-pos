<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\User;
use App\Support\AccountCode;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssetService
{
    public function __construct(protected JournalService $journal) {}

    /**
     * @param  array{outlet_id: int, name: string, category: string, purchase_date: string, purchase_cost: float, useful_life_months: int, salvage_value?: float, notes?: ?string}  $data
     */
    public function create(array $data, User $user): Asset
    {
        return DB::transaction(function () use ($data, $user) {
            $asset = Asset::create([
                'outlet_id' => $data['outlet_id'],
                'name' => $data['name'],
                'category' => $data['category'],
                'purchase_date' => $data['purchase_date'],
                'purchase_cost' => $data['purchase_cost'],
                'useful_life_months' => $data['useful_life_months'],
                'salvage_value' => $data['salvage_value'] ?? 0,
                'accumulated_depreciation' => 0,
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            $this->journal->post(
                "Pembelian aset {$asset->name}",
                $data['purchase_date'],
                [
                    ['account_code' => AccountCode::ASET_TETAP, 'debit' => $asset->purchase_cost],
                    ['account_code' => AccountCode::KAS, 'credit' => $asset->purchase_cost],
                ],
                $user,
                Asset::class,
                $asset->id,
            );

            return $asset;
        });
    }

    public function depreciate(Asset $asset, User $user, ?string $asOf = null): Asset
    {
        if ($asset->status !== 'active') {
            throw ValidationException::withMessages([
                'asset' => ['Aset ini sudah dilepas, tidak bisa disusutkan lagi.'],
            ]);
        }

        $asOfDate = $asOf ? Carbon::parse($asOf) : now();

        if ($asset->last_depreciated_at && $asset->last_depreciated_at->isSameMonth($asOfDate)) {
            throw ValidationException::withMessages([
                'asset' => ['Penyusutan bulan ini sudah pernah dijalankan untuk aset ini.'],
            ]);
        }

        $depreciableBase = (float) $asset->purchase_cost - (float) $asset->salvage_value;
        $monthly = $asset->useful_life_months > 0 ? $depreciableBase / $asset->useful_life_months : 0;
        $remaining = $depreciableBase - (float) $asset->accumulated_depreciation;
        $amount = round(min($monthly, $remaining), 2);

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'asset' => ['Aset ini sudah disusutkan penuh.'],
            ]);
        }

        return DB::transaction(function () use ($asset, $user, $asOfDate, $amount) {
            $asset->update([
                'accumulated_depreciation' => (float) $asset->accumulated_depreciation + $amount,
                'last_depreciated_at' => $asOfDate->toDateString(),
            ]);

            $this->journal->post(
                "Penyusutan aset {$asset->name} ({$asOfDate->format('M Y')})",
                $asOfDate->toDateString(),
                [
                    ['account_code' => AccountCode::BEBAN_PENYUSUTAN, 'debit' => $amount],
                    ['account_code' => AccountCode::AKUMULASI_PENYUSUTAN, 'credit' => $amount],
                ],
                $user,
                Asset::class,
                $asset->id,
            );

            return $asset->fresh();
        });
    }

    public function dispose(Asset $asset, User $user, ?string $disposedAt = null): Asset
    {
        if ($asset->status !== 'active') {
            throw ValidationException::withMessages([
                'asset' => ['Aset ini sudah dilepas sebelumnya.'],
            ]);
        }

        $disposedAtDate = $disposedAt ?? now()->toDateString();
        $bookValue = round((float) $asset->purchase_cost - (float) $asset->accumulated_depreciation, 2);

        return DB::transaction(function () use ($asset, $user, $disposedAtDate, $bookValue) {
            $asset->update([
                'status' => 'disposed',
                'disposed_at' => $disposedAtDate,
            ]);

            $lines = [
                ['account_code' => AccountCode::AKUMULASI_PENYUSUTAN, 'debit' => (float) $asset->accumulated_depreciation],
            ];

            if ($bookValue > 0) {
                $lines[] = ['account_code' => AccountCode::BEBAN_KERUGIAN, 'debit' => $bookValue];
            }

            $lines[] = ['account_code' => AccountCode::ASET_TETAP, 'credit' => (float) $asset->purchase_cost];

            $this->journal->post(
                "Pelepasan aset {$asset->name}",
                $disposedAtDate,
                $lines,
                $user,
                Asset::class,
                $asset->id,
            );

            return $asset->fresh();
        });
    }
}
