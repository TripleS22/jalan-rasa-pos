import {
    IconBox,
    IconCart,
    IconChart,
    IconDocument,
    IconFlask,
    IconTrash,
    IconTruck,
    IconWallet,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value || 0);
}

function formatPercent(value) {
    return value === null || value === undefined ? '-' : `${value}%`;
}

function greeting() {
    const hour = new Date().getHours();

    if (hour < 11) {
        return 'Selamat pagi';
    }

    if (hour < 15) {
        return 'Selamat siang';
    }

    if (hour < 18) {
        return 'Selamat sore';
    }

    return 'Selamat malam';
}

function formatToday() {
    return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

const QUICK_ACTIONS = [
    { href: 'kasir.index', label: 'Buka Kasir', icon: IconCart },
    { href: 'produksi.index', label: 'Catat Produksi', icon: IconFlask },
    { href: 'pembelian.index', label: 'Catat Pembelian', icon: IconBox },
    { href: 'distribusi.index', label: 'Buat DO', icon: IconTruck },
    { href: 'pengeluaran.index', label: 'Catat Pengeluaran', icon: IconWallet },
    { href: 'waste.index', label: 'Catat Waste', icon: IconTrash },
];

function HeroStat({ label, value, sub, emphasis = false }) {
    return (
        <div
            className={`rounded-2xl border p-5 ${
                emphasis
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-white text-neutral-900'
            }`}
        >
            <div
                className={`text-xs font-medium uppercase tracking-wide ${
                    emphasis ? 'text-neutral-300' : 'text-neutral-500'
                }`}
            >
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold sm:text-3xl">
                {value}
            </div>
            {sub && (
                <div
                    className={`mt-1 text-xs ${
                        emphasis ? 'text-neutral-400' : 'text-neutral-400'
                    }`}
                >
                    {sub}
                </div>
            )}
        </div>
    );
}

function DomainCard({ icon: Icon, title, href, children }) {
    return (
        <Link
            href={href}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                        <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900">
                        {title}
                    </h3>
                </div>
                <span className="text-xs font-medium text-neutral-400 transition group-hover:text-neutral-900">
                    Detail &rarr;
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4">{children}</div>
        </Link>
    );
}

function Metric({ label, value, sub }) {
    return (
        <div>
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
                {value}
            </div>
            {sub && (
                <div className="mt-0.5 text-xs text-neutral-400">{sub}</div>
            )}
        </div>
    );
}

export default function Dashboard({ summary }) {
    const user = usePage().props.auth.user;
    const {
        sales,
        finance,
        inventory,
        production,
        supply_chain: supplyChain,
        distribution,
        waste,
        asset,
    } = summary;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-neutral-900">
                        {greeting()}, {user.name?.split(' ')[0]}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        {formatToday()} &middot; ringkasan operasional Jalan
                        Rasa hari ini
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {!finance.is_balanced && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white">
                            Neraca tidak balance — periksa jurnal terbaru di
                            halaman Akuntansi.
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={route(href)}
                                className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center transition hover:border-neutral-900 hover:shadow-sm"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="text-xs font-medium text-neutral-700">
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Hero metrics */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <HeroStat
                            emphasis
                            label="Omzet Hari Ini"
                            value={formatRupiah(sales.omzet_today)}
                            sub={`${sales.transactions_today} transaksi`}
                        />
                        <HeroStat
                            label="Posisi Kas + Bank"
                            value={formatRupiah(finance.cash_balance)}
                        />
                        <HeroStat
                            label="Laba Bersih Bulan Ini"
                            value={formatRupiah(
                                finance.net_profit_this_month,
                            )}
                        />
                        <HeroStat
                            label="Status Neraca"
                            value={
                                finance.is_balanced ? 'Balance' : 'Tidak Balance'
                            }
                            sub={`Total aset ${formatRupiah(finance.total_assets)}`}
                        />
                    </div>

                    {/* Domain breakdown */}
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                        Ringkasan per Domain
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <DomainCard
                            icon={IconCart}
                            title="Penjualan"
                            href={route('laporan.index')}
                        >
                            <Metric
                                label="Omzet Bulan Ini"
                                value={formatRupiah(sales.omzet_this_month)}
                                sub={`${sales.transactions_this_month} transaksi`}
                            />
                            <Metric
                                label="Transaksi Hari Ini"
                                value={sales.transactions_today}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconChart}
                            title="Keuangan"
                            href={route('laporan-keuangan.index')}
                        >
                            <Metric
                                label="Posisi Kas + Bank"
                                value={formatRupiah(finance.cash_balance)}
                            />
                            <Metric
                                label="Laba Bersih Bulan Ini"
                                value={formatRupiah(
                                    finance.net_profit_this_month,
                                )}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconBox}
                            title="Inventory"
                            href={route('laporan.index')}
                        >
                            <Metric
                                label="Bahan Baku Stok Rendah"
                                value={inventory.low_stock_count}
                            />
                            <Metric
                                label="Batch Segera Kedaluwarsa"
                                value={inventory.expiring_soon_count}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconFlask}
                            title="Produksi & QC"
                            href={route('quality-control.index')}
                        >
                            <Metric
                                label="Tingkat Lolos QC"
                                value={formatPercent(production.qc_pass_rate)}
                            />
                            <Metric
                                label="Menunggu QC"
                                value={production.pending_qc_count}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconDocument}
                            title="Supply Chain"
                            href={route('forecast.index')}
                        >
                            <Metric
                                label="Kepatuhan Lead Time PO"
                                value={formatPercent(
                                    supplyChain.po_compliance_rate,
                                )}
                            />
                            <Metric
                                label="Jumlah Eksepsi PO"
                                value={supplyChain.total_exceptions}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconTruck}
                            title="Distribusi"
                            href={route('distribusi.index')}
                        >
                            <Metric
                                label="DO Menunggu Diterima"
                                value={distribution.pending_deliveries}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconTrash}
                            title="Waste & Recall"
                            href={route('waste.index')}
                        >
                            <Metric
                                label="Kerugian Bulan Ini"
                                value={formatRupiah(
                                    waste.total_loss_this_month,
                                )}
                            />
                            <Metric
                                label="Qty Terdampak"
                                value={waste.total_qty_this_month}
                            />
                        </DomainCard>

                        <DomainCard
                            icon={IconWallet}
                            title="Aset"
                            href={route('aset.index')}
                        >
                            <Metric
                                label="Aset Aktif"
                                value={asset.active_asset_count}
                            />
                            <Metric
                                label="Total Nilai Buku"
                                value={formatRupiah(asset.total_book_value)}
                            />
                        </DomainCard>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
