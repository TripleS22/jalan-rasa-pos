<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QcCheck;
use App\Services\QcCheckService;
use Illuminate\Http\Request;

class QcCheckController extends Controller
{
    public function __construct(protected QcCheckService $qcChecks) {}

    public function index(Request $request)
    {
        $checks = QcCheck::query()
            ->with('production.product', 'pic')
            ->latest()
            ->paginate(20);

        return response()->json($checks);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'production_id' => ['required', 'exists:productions,id'],
            'qty_checked' => ['required', 'numeric', 'min:0.01'],
            'qty_passed' => ['required', 'numeric', 'min:0'],
            'qty_rejected' => ['required', 'numeric', 'min:0'],
            'reject_reason' => ['nullable', 'string', 'max:255'],
            'pic_user_id' => ['required', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $qcCheck = $this->qcChecks->create($data, $request->user());

        return response()->json($qcCheck->load('production.product', 'pic'), 201);
    }
}
