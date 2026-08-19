<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservasiController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'table_no' => ['nullable', 'string', 'max:50'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'reservation_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        Reservation::create($data + ['status' => 'pending']);

        return redirect()->route('kasir.index')->with('success', 'Reservasi berhasil dicatat.');
    }

    public function update(Request $request, Reservation $reservasi)
    {
        $data = $request->validate([
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'table_no' => ['nullable', 'string', 'max:50'],
            'guest_count' => ['sometimes', 'integer', 'min:1'],
            'reservation_at' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:pending,confirmed,completed,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $reservasi->update($data);

        return redirect()->route('kasir.index')->with('success', 'Reservasi berhasil diperbarui.');
    }

    public function destroy(Reservation $reservasi)
    {
        $reservasi->delete();

        return redirect()->route('kasir.index')->with('success', 'Reservasi berhasil dihapus.');
    }
}
