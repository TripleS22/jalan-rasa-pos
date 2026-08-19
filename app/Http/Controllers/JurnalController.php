<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JurnalController extends Controller
{
    public function index(Request $request)
    {
        $entries = JournalEntry::query()
            ->with('lines.account', 'user')
            ->when($request->from, fn ($q, $from) => $q->whereDate('entry_date', '>=', $from))
            ->when($request->to, fn ($q, $to) => $q->whereDate('entry_date', '<=', $to))
            ->latest('entry_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Akuntansi/Jurnal/Index', [
            'entries' => $entries,
            'filters' => $request->only('from', 'to'),
        ]);
    }
}
