<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrepaidExpense;
use App\Services\PrepaidExpenseService;
use Illuminate\Http\Request;

class PrepaidExpenseController extends Controller
{
    public function __construct(protected PrepaidExpenseService $prepaidExpenses) {}

    public function index()
    {
        return response()->json(PrepaidExpense::with('outlet')->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'outlet_id' => ['required', 'exists:outlets,id'],
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'months' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $prepaid = $this->prepaidExpenses->create($data, $request->user());

        return response()->json($prepaid, 201);
    }

    public function amortize(Request $request, PrepaidExpense $prepaid)
    {
        return response()->json($this->prepaidExpenses->amortize($prepaid, $request->user()));
    }
}
