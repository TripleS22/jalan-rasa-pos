import Modal from '@/Components/Modal';
import NumberInput from '@/Components/NumberInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ROLE_LABEL = {
    owner: 'Owner',
    kasir: 'Kasir',
    gudang: 'Gudang',
};

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function PengaturanIndex({ storeSetting, users, outlets }) {
    const { auth, flash } = usePage().props;
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const storeForm = useForm({
        store_name: storeSetting.store_name ?? '',
        address: storeSetting.address ?? '',
        phone: storeSetting.phone ?? '',
        tax_percent: storeSetting.tax_percent ?? 0,
        receipt_footer: storeSetting.receipt_footer ?? '',
    });

    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
        outlet_id: '',
    });

    function submitStore(e) {
        e.preventDefault();
        storeForm.put(route('pengaturan.store.update'), {
            preserveScroll: true,
        });
    }

    function openCreateUser() {
        setEditingUser(null);
        userForm.reset();
        userForm.clearErrors();
        setUserModalOpen(true);
    }

    function openEditUser(user) {
        setEditingUser(user);
        userForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            outlet_id: user.outlet_id ?? '',
        });
        userForm.clearErrors();
        setUserModalOpen(true);
    }

    function submitUser(e) {
        e.preventDefault();

        const options = {
            onSuccess: () => setUserModalOpen(false),
            preserveScroll: true,
        };

        if (editingUser) {
            userForm.put(
                route('pengaturan.users.update', editingUser.id),
                options,
            );
        } else {
            userForm.post(route('pengaturan.users.store'), options);
        }
    }

    function destroyUser(user) {
        if (user.id === auth.user.id) {
            alert('Tidak bisa menghapus akun sendiri.');
            return;
        }

        if (!confirm(`Hapus pengguna "${user.name}"?`)) {
            return;
        }

        router.delete(route('pengaturan.users.destroy', user.id), {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pengaturan
                </h2>
            }
        >
            <Head title="Pengaturan" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-white">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-lg bg-red-600 px-4 py-3 text-sm text-white">
                            {flash.error}
                        </div>
                    )}

                    {/* Store profile */}
                    <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6">
                        <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                            Profil Toko
                        </h3>
                        <p className="mb-4 text-sm text-neutral-500">
                            Informasi ini dipakai di struk & laporan.
                        </p>

                        <form onSubmit={submitStore}>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm text-neutral-600">
                                        Nama Toko
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.store_name}
                                        onChange={(e) =>
                                            storeForm.setData(
                                                'store_name',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                    />
                                    {storeForm.errors.store_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {storeForm.errors.store_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm text-neutral-600">
                                        Telepon
                                    </label>
                                    <input
                                        type="text"
                                        value={storeForm.data.phone}
                                        onChange={(e) =>
                                            storeForm.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm text-neutral-600">
                                        Pajak (%)
                                    </label>
                                    <NumberInput
                                        value={storeForm.data.tax_percent}
                                        onChange={(value) =>
                                            storeForm.setData(
                                                'tax_percent',
                                                value,
                                            )
                                        }
                                        className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm text-neutral-600">
                                        Alamat
                                    </label>
                                    <textarea
                                        value={storeForm.data.address}
                                        onChange={(e) =>
                                            storeForm.setData(
                                                'address',
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm text-neutral-600">
                                        Catatan Kaki Struk
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            storeForm.data.receipt_footer
                                        }
                                        onChange={(e) =>
                                            storeForm.setData(
                                                'receipt_footer',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Terima kasih sudah berbelanja!"
                                        className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={storeForm.processing}
                                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                            >
                                Simpan Profil Toko
                            </button>
                        </form>
                    </div>

                    {/* User management */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900">
                                    Pengguna
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Akun staf yang bisa login ke sistem.
                                </p>
                            </div>
                            <button
                                onClick={openCreateUser}
                                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                            >
                                + Tambah Pengguna
                            </button>
                        </div>

                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                                            {initials(user.name)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-neutral-900">
                                                {user.name}
                                                {user.id ===
                                                    auth.user.id && (
                                                    <span className="ml-2 text-xs text-neutral-400">
                                                        (kamu)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {user.outlet && (
                                            <span className="text-xs text-neutral-400">
                                                {user.outlet.name}
                                            </span>
                                        )}
                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                                            {ROLE_LABEL[user.role]}
                                        </span>
                                        <button
                                            onClick={() =>
                                                openEditUser(user)
                                            }
                                            className="text-sm text-neutral-600 hover:text-neutral-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                destroyUser(user)
                                            }
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={userModalOpen} onClose={() => setUserModalOpen(false)}>
                <form onSubmit={submitUser} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                        {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Nama
                        </label>
                        <input
                            type="text"
                            value={userForm.data.name}
                            onChange={(e) =>
                                userForm.setData('name', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {userForm.errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {userForm.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            Email
                        </label>
                        <input
                            type="email"
                            value={userForm.data.email}
                            onChange={(e) =>
                                userForm.setData('email', e.target.value)
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {userForm.errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {userForm.errors.email}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm text-neutral-600">
                            {editingUser
                                ? 'Password Baru (opsional)'
                                : 'Password'}
                        </label>
                        <input
                            type="password"
                            value={userForm.data.password}
                            onChange={(e) =>
                                userForm.setData(
                                    'password',
                                    e.target.value,
                                )
                            }
                            className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                        />
                        {userForm.errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {userForm.errors.password}
                            </p>
                        )}
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Role
                            </label>
                            <select
                                value={userForm.data.role}
                                onChange={(e) =>
                                    userForm.setData('role', e.target.value)
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="owner">Owner</option>
                                <option value="kasir">Kasir</option>
                                <option value="gudang">Gudang</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-neutral-600">
                                Outlet
                            </label>
                            <select
                                value={userForm.data.outlet_id}
                                onChange={(e) =>
                                    userForm.setData(
                                        'outlet_id',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border-neutral-300 text-sm shadow-sm"
                            >
                                <option value="">Semua outlet</option>
                                {outlets.map((outlet) => (
                                    <option
                                        key={outlet.id}
                                        value={outlet.id}
                                    >
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setUserModalOpen(false)}
                            className="rounded-full px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={userForm.processing}
                            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
