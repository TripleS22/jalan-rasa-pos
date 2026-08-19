<?php

namespace App\Http\Controllers;

use App\Models\ConsignmentPartner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MitraKonsinyasiController extends Controller
{
    public function index(Request $request)
    {
        $partners = ConsignmentPartner::query()
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('MitraKonsinyasi/Index', [
            'partners' => $partners,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
        ]);

        ConsignmentPartner::create($data);

        return redirect()->route('mitra-konsinyasi.index')->with('success', 'Mitra konsinyasi berhasil ditambahkan.');
    }

    public function update(Request $request, ConsignmentPartner $mitraKonsinyasi)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
        ]);

        $mitraKonsinyasi->update($data);

        return redirect()->route('mitra-konsinyasi.index')->with('success', 'Mitra konsinyasi berhasil diperbarui.');
    }

    public function destroy(ConsignmentPartner $mitraKonsinyasi)
    {
        $mitraKonsinyasi->delete();

        return redirect()->route('mitra-konsinyasi.index')->with('success', 'Mitra konsinyasi berhasil dihapus.');
    }
}
