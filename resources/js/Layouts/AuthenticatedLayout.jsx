import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import {
    ChevronIcon,
    IconCart,
    IconChart,
    IconDocument,
    IconFolder,
    IconGrid,
    IconLayers,
    IconReceipt,
} from '@/Components/Icons';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const NAV_GROUPS = [
    {
        key: 'operasional',
        label: 'Operasional',
        icon: <IconLayers />,
        links: [
            { name: 'produksi.index', label: 'Produksi' },
            { name: 'quality-control.index', label: 'Quality Control' },
            { name: 'waste.index', label: 'Waste & Recall' },
            { name: 'distribusi.index', label: 'Distribusi Antar Outlet' },
            { name: 'riwayat.index', label: 'Riwayat Transaksi' },
        ],
    },
    {
        key: 'transaksi',
        label: 'Transaksi',
        icon: <IconReceipt />,
        links: [
            { name: 'konsinyasi.index', label: 'Konsinyasi' },
            { name: 'retur-pelanggan.index', label: 'Retur Pelanggan' },
            { name: 'retur-supplier.index', label: 'Retur Supplier' },
            { name: 'pengeluaran.index', label: 'Pengeluaran' },
            { name: 'pelanggan.index', label: 'Pelanggan' },
        ],
    },
    {
        key: 'master-data',
        label: 'Master Data',
        icon: <IconFolder />,
        links: [
            { name: 'produk.index', label: 'Produk' },
            { name: 'kategori.index', label: 'Kategori' },
            { name: 'bahan-baku.index', label: 'Bahan Baku' },
            { name: 'supplier.index', label: 'Supplier' },
            { name: 'pembelian.index', label: 'Pembelian' },
            { name: 'mitra-konsinyasi.index', label: 'Mitra Konsinyasi' },
            { name: 'outlet.index', label: 'Outlet' },
            { name: 'meja.index', label: 'Meja & QR Self-Order' },
            { name: 'forecast.index', label: 'Forecast & PO' },
        ],
    },
    {
        key: 'akuntansi',
        label: 'Akuntansi',
        icon: <IconChart />,
        links: [
            { name: 'akun.index', label: 'Bagan Akun' },
            { name: 'jurnal.index', label: 'Jurnal Umum' },
            { name: 'laporan-keuangan.index', label: 'Laporan Keuangan' },
            { name: 'aset.index', label: 'Aset & Prepaid' },
        ],
    },
];

function groupIsActive(group) {
    return group.links.some((link) => route().current(link.name));
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-neutral-50">
            <nav className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center">
                            <Link
                                href={route('dashboard')}
                                className="flex shrink-0 items-center"
                            >
                                <ApplicationLogo className="block h-9 w-auto fill-current text-neutral-900" />
                            </Link>

                            <div className="hidden items-center gap-1 sm:ms-8 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="gap-1.5 px-2"
                                >
                                    <IconGrid />
                                    Dashboard
                                </NavLink>

                                {NAV_GROUPS.map((group) => (
                                    <Dropdown key={group.key}>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition duration-150 ease-in-out focus:outline-none ${
                                                    groupIsActive(group)
                                                        ? 'bg-neutral-900 text-white'
                                                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                                                }`}
                                            >
                                                {group.icon}
                                                {group.label}
                                                <ChevronIcon className="h-3.5 w-3.5 opacity-70" />
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content
                                            align="left"
                                            width="56"
                                        >
                                            {group.links.map((link) => (
                                                <Dropdown.Link
                                                    key={link.name}
                                                    href={route(link.name)}
                                                    className={
                                                        route().current(
                                                            link.name,
                                                        )
                                                            ? 'bg-neutral-100 font-medium text-neutral-900'
                                                            : ''
                                                    }
                                                >
                                                    {link.label}
                                                </Dropdown.Link>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                ))}

                                <NavLink
                                    href={route('laporan.index')}
                                    active={route().current('laporan.index')}
                                    className="gap-1.5 px-2"
                                >
                                    <IconDocument />
                                    Laporan
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 sm:flex">
                            <Link
                                href={route('kasir.index')}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition duration-150 ease-in-out ${
                                    route().current('kasir.index')
                                        ? 'bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-2'
                                        : 'bg-neutral-900 text-white hover:bg-neutral-700'
                                }`}
                            >
                                <IconCart />
                                Buka Kasir
                            </Link>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 py-1.5 pe-2 ps-1.5 text-sm font-medium text-neutral-600 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                                            {user.name?.charAt(0)}
                                        </span>
                                        <span className="max-w-[8rem] truncate">
                                            {user.name}
                                        </span>
                                        <ChevronIcon className="h-3.5 w-3.5 opacity-60" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                    >
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('pengaturan.index')}
                                    >
                                        Pengaturan
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-neutral-400 transition duration-150 ease-in-out hover:bg-neutral-100 hover:text-neutral-600 focus:bg-neutral-100 focus:text-neutral-600 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' border-t border-neutral-200 sm:hidden'
                    }
                >
                    <div className="space-y-1 px-2 py-3">
                        <Link
                            href={route('kasir.index')}
                            className="mb-2 flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            <IconCart />
                            Buka Kasir
                        </Link>
                    </div>

                    <div className="space-y-1 pb-3">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {NAV_GROUPS.map((group) => (
                            <div key={group.key} className="pt-3">
                                <div className="flex items-center gap-2 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                    {group.icon}
                                    {group.label}
                                </div>
                                {group.links.map((link) => (
                                    <ResponsiveNavLink
                                        key={link.name}
                                        href={route(link.name)}
                                        active={route().current(link.name)}
                                    >
                                        {link.label}
                                    </ResponsiveNavLink>
                                ))}
                            </div>
                        ))}

                        <div className="pt-3">
                            <ResponsiveNavLink
                                href={route('laporan.index')}
                                active={route().current('laporan.index')}
                            >
                                Laporan
                            </ResponsiveNavLink>
                        </div>
                    </div>

                    <div className="border-t border-neutral-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-neutral-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-neutral-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('pengaturan.index')}
                            >
                                Pengaturan
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
