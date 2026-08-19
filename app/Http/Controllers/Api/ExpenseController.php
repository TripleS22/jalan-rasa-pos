<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(protected ExpenseService $expenses) {}

    public function index(Request $request)
    {
        $expenses = Expense::query()
            ->with('user')
            ->when($request->category, fn ($q, $category) => $q->where('category', $category))
            ->when($request->from, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->to, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate(20);

        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $expense = $this->expenses->create($data, $request->user());

        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense->load('user'));
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'category' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $expense->update($data);

        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json(null, 204);
    }
}
