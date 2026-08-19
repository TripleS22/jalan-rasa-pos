<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsignmentPartner;
use Illuminate\Http\Request;

class ConsignmentPartnerController extends Controller
{
    public function index(Request $request)
    {
        $partners = ConsignmentPartner::query()
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20);

        return response()->json($partners);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
        ]);

        $partner = ConsignmentPartner::create($data);

        return response()->json($partner, 201);
    }

    public function show(ConsignmentPartner $consignmentPartner)
    {
        return response()->json($consignmentPartner->load('consignments'));
    }

    public function update(Request $request, ConsignmentPartner $consignmentPartner)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
        ]);

        $consignmentPartner->update($data);

        return response()->json($consignmentPartner);
    }

    public function destroy(ConsignmentPartner $consignmentPartner)
    {
        $consignmentPartner->delete();

        return response()->json(null, 204);
    }
}
