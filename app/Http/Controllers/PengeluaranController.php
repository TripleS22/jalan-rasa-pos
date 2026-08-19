<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function __construct(protected ExpenseService $expenses) {}

    public function index(Request $request)
    {
        $filtered = fn () => Expense::query()
            ->when($request->category, fn ($q, $category) => $q->where('category', $category))
            ->when($request->from, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->to, fn ($q, $to) => $q->whereDate('created_at', '<=', $to));

        $expenses = $filtered()
            ->with('user')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Pengeluaran/Index', [
            'expenses' => $expenses,
            'totalAmount' => $filtered()->sum('amount'),
            'categories' => Expense::query()->distinct()->orderBy('category')->pluck('category'),
            'filters' => $request->only('category', 'from', 'to'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $this->expenses->create($data, $request->user());

        return redirect()->route('pengeluaran.index')->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function update(Request $request, Expense $pengeluaran)
    {
        $data = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $pengeluaran->update($data);

        return redirect()->route('pengeluaran.index')->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Expense $pengeluaran)
    {
        $pengeluaran->delete();

        return redirect()->route('pengeluaran.index')->with('success', 'Pengeluaran berhasil dihapus.');
    }
}
