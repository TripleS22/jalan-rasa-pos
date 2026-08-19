<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Outlet;
use App\Models\PrepaidExpense;
use App\Services\AssetService;
use App\Services\PrepaidExpenseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsetController extends Controller
{
    public function __construct(
        protected AssetService $assets,
        protected PrepaidExpenseService $prepaidExpenses,
    ) {}

    public function index()
    {
        $assets = Asset::with('outlet')->latest()->get()->map(function (Asset $asset) {
            $asset->book_value = (float) $asset->purchase_cost - (float) $asset->accumulated_depreciation;

            return $asset;
        });

        $prepaidExpenses = PrepaidExpense::with('outlet')->latest()->get()->map(function (PrepaidExpense $prepaid) {
            $prepaid->remaining = (float) $prepaid->amount - (float) $prepaid->amortized_amount;

            return $prepaid;
        });

        return Inertia::render('Aset/Index', [
            'assets' => $assets,
            'prepaidExpenses' => $prepaidExpenses,
            'outlets' => Outlet::orderBy('name')->get(),
        ]);
    }

    public function storeAsset(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['required', 'exists:outlets,id'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:equipment,vehicle,furniture,building,other'],
            'purchase_date' => ['required', 'date'],
            'purchase_cost' => ['required', 'numeric', 'min:0'],
            'useful_life_months' => ['required', 'integer', 'min:1'],
            'salvage_value' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->assets->create($data, $request->user());

        return redirect()->route('aset.index')->with('success', 'Aset berhasil dicatat.');
    }

    public function depreciateAsset(Request $request, Asset $asset)
    {
        $this->assets->depreciate($asset, $request->user());

        return redirect()->route('aset.index')->with('success', 'Penyusutan aset berhasil dijalankan.');
    }

    public function disposeAsset(Request $request, Asset $asset)
    {
        $this->assets->dispose($asset, $request->user());

        return redirect()->route('aset.index')->with('success', 'Aset berhasil dilepas.');
    }

    public function storePrepaid(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['required', 'exists:outlets,id'],
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'months' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->prepaidExpenses->create($data, $request->user());

        return redirect()->route('aset.index')->with('success', 'Biaya dibayar dimuka berhasil dicatat.');
    }

    public function amortizePrepaid(Request $request, PrepaidExpense $prepaid)
    {
        $this->prepaidExpenses->amortize($prepaid, $request->user());

        return redirect()->route('aset.index')->with('success', 'Amortisasi berhasil dijalankan.');
    }
}
