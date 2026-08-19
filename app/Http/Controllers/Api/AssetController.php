<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Services\AssetService;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function __construct(protected AssetService $assets) {}

    public function index()
    {
        return response()->json(Asset::with('outlet')->latest()->get());
    }

    public function store(Request $request)
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

        $asset = $this->assets->create($data, $request->user());

        return response()->json($asset, 201);
    }

    public function depreciate(Request $request, Asset $asset)
    {
        return response()->json($this->assets->depreciate($asset, $request->user()));
    }

    public function dispose(Request $request, Asset $asset)
    {
        return response()->json($this->assets->dispose($asset, $request->user()));
    }
}
