<?php

namespace App\Http\Controllers\Api;

use App\Events\ReservationStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::query()
            ->with('customer')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->date, fn ($q, $date) => $q->whereDate('reservation_at', $date))
            ->orderBy('reservation_at')
            ->paginate(20);

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'table_no' => ['nullable', 'string', 'max:50'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'reservation_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $reservation = Reservation::create($data + ['status' => 'pending']);

        ReservationStatusUpdated::dispatch($reservation);

        return response()->json($reservation, 201);
    }

    public function show(Reservation $reservation)
    {
        return response()->json($reservation->load('customer'));
    }

    public function update(Request $request, Reservation $reservation)
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

        $reservation->update($data);

        ReservationStatusUpdated::dispatch($reservation);

        return response()->json($reservation);
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->delete();

        return response()->json(null, 204);
    }
}
