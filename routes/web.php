<?php

use App\Http\Controllers\AkunController;
use App\Http\Controllers\AsetController;
use App\Http\Controllers\BahanBakuController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DistribusiController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\JurnalController;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KonsinyasiController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\MejaController;
use App\Http\Controllers\MitraKonsinyasiController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\PembelianController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PesananMejaController;
use App\Http\Controllers\PreOrderController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\ProduksiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QualityControlController;
use App\Http\Controllers\ReservasiController;
use App\Http\Controllers\ReturPelangganController;
use App\Http\Controllers\ReturSupplierController;
use App\Http\Controllers\RiwayatController;
use App\Http\Controllers\SelfOrderController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\WasteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Publik, tanpa login — halaman yang kebuka saat pelanggan scan QR meja.
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/order/t/{code}', [SelfOrderController::class, 'show'])->name('self-order.show');
    Route::post('/order/t/{code}', [SelfOrderController::class, 'store'])->name('self-order.store');
    Route::get('/order/t/{code}/riwayat', [SelfOrderController::class, 'history'])->name('self-order.history');
    Route::get('/order/t/{code}/invoice/{tableOrder}', [SelfOrderController::class, 'invoice'])->name('self-order.invoice');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/kasir', [KasirController::class, 'index'])->name('kasir.index');
    Route::post('/kasir', [KasirController::class, 'store'])->name('kasir.store');

    Route::get('/riwayat', [RiwayatController::class, 'index'])->name('riwayat.index');

    Route::post('/pesanan-meja/{pesananMeja}/confirm', [PesananMejaController::class, 'confirm'])->name('pesanan-meja.confirm');
    Route::post('/pesanan-meja/{pesananMeja}/cancel', [PesananMejaController::class, 'cancel'])->name('pesanan-meja.cancel');

    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');

    Route::get('/produk', [ProdukController::class, 'index'])->name('produk.index');
    Route::post('/produk', [ProdukController::class, 'store'])->name('produk.store');
    Route::put('/produk/{produk}', [ProdukController::class, 'update'])->name('produk.update');
    Route::delete('/produk/{produk}', [ProdukController::class, 'destroy'])->name('produk.destroy');

    Route::get('/kategori', [KategoriController::class, 'index'])->name('kategori.index');
    Route::post('/kategori', [KategoriController::class, 'store'])->name('kategori.store');
    Route::put('/kategori/{kategori}', [KategoriController::class, 'update'])->name('kategori.update');
    Route::delete('/kategori/{kategori}', [KategoriController::class, 'destroy'])->name('kategori.destroy');

    Route::get('/bahan-baku', [BahanBakuController::class, 'index'])->name('bahan-baku.index');
    Route::post('/bahan-baku', [BahanBakuController::class, 'store'])->name('bahan-baku.store');
    Route::put('/bahan-baku/{bahanBaku}', [BahanBakuController::class, 'update'])->name('bahan-baku.update');
    Route::delete('/bahan-baku/{bahanBaku}', [BahanBakuController::class, 'destroy'])->name('bahan-baku.destroy');

    Route::get('/supplier', [SupplierController::class, 'index'])->name('supplier.index');
    Route::post('/supplier', [SupplierController::class, 'store'])->name('supplier.store');
    Route::put('/supplier/{supplier}', [SupplierController::class, 'update'])->name('supplier.update');
    Route::delete('/supplier/{supplier}', [SupplierController::class, 'destroy'])->name('supplier.destroy');

    Route::get('/pembelian', [PembelianController::class, 'index'])->name('pembelian.index');
    Route::post('/pembelian', [PembelianController::class, 'store'])->name('pembelian.store');
    Route::put('/pembelian/{pembelian}', [PembelianController::class, 'update'])->name('pembelian.update');
    Route::delete('/pembelian/{pembelian}', [PembelianController::class, 'destroy'])->name('pembelian.destroy');

    Route::get('/pelanggan', [PelangganController::class, 'index'])->name('pelanggan.index');
    Route::post('/pelanggan', [PelangganController::class, 'store'])->name('pelanggan.store');
    Route::put('/pelanggan/{pelanggan}', [PelangganController::class, 'update'])->name('pelanggan.update');
    Route::delete('/pelanggan/{pelanggan}', [PelangganController::class, 'destroy'])->name('pelanggan.destroy');

    Route::get('/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran.index');
    Route::post('/pengeluaran', [PengeluaranController::class, 'store'])->name('pengeluaran.store');
    Route::put('/pengeluaran/{pengeluaran}', [PengeluaranController::class, 'update'])->name('pengeluaran.update');
    Route::delete('/pengeluaran/{pengeluaran}', [PengeluaranController::class, 'destroy'])->name('pengeluaran.destroy');

    Route::post('/reservasi', [ReservasiController::class, 'store'])->name('reservasi.store');
    Route::put('/reservasi/{reservasi}', [ReservasiController::class, 'update'])->name('reservasi.update');
    Route::delete('/reservasi/{reservasi}', [ReservasiController::class, 'destroy'])->name('reservasi.destroy');

    Route::post('/pre-order', [PreOrderController::class, 'store'])->name('pre-order.store');
    Route::put('/pre-order/{preOrder}', [PreOrderController::class, 'update'])->name('pre-order.update');
    Route::delete('/pre-order/{preOrder}', [PreOrderController::class, 'destroy'])->name('pre-order.destroy');

    Route::get('/konsinyasi', [KonsinyasiController::class, 'index'])->name('konsinyasi.index');
    Route::post('/konsinyasi', [KonsinyasiController::class, 'store'])->name('konsinyasi.store');
    Route::put('/konsinyasi/{konsinyasi}', [KonsinyasiController::class, 'update'])->name('konsinyasi.update');
    Route::delete('/konsinyasi/{konsinyasi}', [KonsinyasiController::class, 'destroy'])->name('konsinyasi.destroy');

    Route::get('/mitra-konsinyasi', [MitraKonsinyasiController::class, 'index'])->name('mitra-konsinyasi.index');
    Route::post('/mitra-konsinyasi', [MitraKonsinyasiController::class, 'store'])->name('mitra-konsinyasi.store');
    Route::put('/mitra-konsinyasi/{mitraKonsinyasi}', [MitraKonsinyasiController::class, 'update'])->name('mitra-konsinyasi.update');
    Route::delete('/mitra-konsinyasi/{mitraKonsinyasi}', [MitraKonsinyasiController::class, 'destroy'])->name('mitra-konsinyasi.destroy');

    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan.index');
    Route::put('/pengaturan/toko', [PengaturanController::class, 'updateStore'])->name('pengaturan.store.update');
    Route::post('/pengaturan/pengguna', [PengaturanController::class, 'storeUser'])->name('pengaturan.users.store');
    Route::put('/pengaturan/pengguna/{user}', [PengaturanController::class, 'updateUser'])->name('pengaturan.users.update');
    Route::delete('/pengaturan/pengguna/{user}', [PengaturanController::class, 'destroyUser'])->name('pengaturan.users.destroy');

    Route::get('/produksi', [ProduksiController::class, 'index'])->name('produksi.index');
    Route::post('/produksi', [ProduksiController::class, 'store'])->name('produksi.store');

    Route::get('/retur-pelanggan', [ReturPelangganController::class, 'index'])->name('retur-pelanggan.index');
    Route::post('/retur-pelanggan', [ReturPelangganController::class, 'store'])->name('retur-pelanggan.store');

    Route::get('/retur-supplier', [ReturSupplierController::class, 'index'])->name('retur-supplier.index');
    Route::post('/retur-supplier', [ReturSupplierController::class, 'store'])->name('retur-supplier.store');

    Route::get('/akun', [AkunController::class, 'index'])->name('akun.index');
    Route::post('/akun', [AkunController::class, 'store'])->name('akun.store');

    Route::get('/jurnal', [JurnalController::class, 'index'])->name('jurnal.index');

    Route::get('/laporan-keuangan', [LaporanKeuanganController::class, 'index'])->name('laporan-keuangan.index');

    Route::get('/outlet', [OutletController::class, 'index'])->name('outlet.index');
    Route::post('/outlet', [OutletController::class, 'store'])->name('outlet.store');
    Route::put('/outlet/{outlet}', [OutletController::class, 'update'])->name('outlet.update');
    Route::delete('/outlet/{outlet}', [OutletController::class, 'destroy'])->name('outlet.destroy');

    Route::get('/meja', [MejaController::class, 'index'])->name('meja.index');
    Route::post('/meja', [MejaController::class, 'store'])->name('meja.store');
    Route::put('/meja/{meja}', [MejaController::class, 'update'])->name('meja.update');
    Route::delete('/meja/{meja}', [MejaController::class, 'destroy'])->name('meja.destroy');
    Route::post('/meja/{meja}/regenerate-code', [MejaController::class, 'regenerateCode'])->name('meja.regenerate-code');
    Route::get('/meja/{meja}/qr', [MejaController::class, 'qr'])->name('meja.qr');

    Route::get('/forecast', [ForecastController::class, 'index'])->name('forecast.index');
    Route::post('/forecast', [ForecastController::class, 'store'])->name('forecast.store');

    Route::get('/quality-control', [QualityControlController::class, 'index'])->name('quality-control.index');
    Route::post('/quality-control', [QualityControlController::class, 'store'])->name('quality-control.store');

    Route::get('/distribusi', [DistribusiController::class, 'index'])->name('distribusi.index');
    Route::post('/distribusi', [DistribusiController::class, 'store'])->name('distribusi.store');
    Route::post('/distribusi/{distribusi}/receive', [DistribusiController::class, 'receive'])->name('distribusi.receive');

    Route::get('/waste', [WasteController::class, 'index'])->name('waste.index');
    Route::post('/waste', [WasteController::class, 'store'])->name('waste.store');

    Route::get('/aset', [AsetController::class, 'index'])->name('aset.index');
    Route::post('/aset', [AsetController::class, 'storeAsset'])->name('aset.store');
    Route::post('/aset/{asset}/penyusutan', [AsetController::class, 'depreciateAsset'])->name('aset.depreciate');
    Route::post('/aset/{asset}/lepas', [AsetController::class, 'disposeAsset'])->name('aset.dispose');
    Route::post('/aset/prepaid', [AsetController::class, 'storePrepaid'])->name('aset.prepaid.store');
    Route::post('/aset/prepaid/{prepaid}/amortisasi', [AsetController::class, 'amortizePrepaid'])->name('aset.prepaid.amortize');
});

require __DIR__.'/auth.php';
