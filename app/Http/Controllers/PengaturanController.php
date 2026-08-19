<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        return Inertia::render('Pengaturan/Index', [
            'storeSetting' => StoreSetting::current(),
            'users' => User::with('outlet')->orderBy('name')->get(['id', 'name', 'email', 'role', 'outlet_id']),
            'outlets' => Outlet::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function updateStore(Request $request)
    {
        $data = $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'tax_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'receipt_footer' => ['nullable', 'string', 'max:255'],
        ]);

        StoreSetting::current()->update($data);

        return redirect()->route('pengaturan.index')->with('success', 'Profil toko berhasil diperbarui.');
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'in:owner,kasir,gudang'],
            'outlet_id' => ['nullable', 'exists:outlets,id'],
        ]);

        User::create([
            ...$data,
            'password' => bcrypt($data['password']),
        ]);

        return redirect()->route('pengaturan.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'in:owner,kasir,gudang'],
            'outlet_id' => ['nullable', 'exists:outlets,id'],
            'password' => ['nullable', Password::defaults()],
        ]);

        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->route('pengaturan.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroyUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return redirect()->route('pengaturan.index')->with('error', 'Tidak bisa menghapus akun sendiri.');
        }

        $user->delete();

        return redirect()->route('pengaturan.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
