<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Services\AccountingReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AkunController extends Controller
{
    public function __construct(protected AccountingReportService $reports) {}

    public function index()
    {
        return Inertia::render('Akuntansi/Akun/Index', [
            'accounts' => $this->reports->trialBalance(now()->toDateString()),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:accounts,code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:asset,liability,equity,revenue,expense'],
        ]);

        Account::create($data);

        return redirect()->route('akun.index')->with('success', 'Akun berhasil ditambahkan.');
    }
}
