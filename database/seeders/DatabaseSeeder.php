<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\RawMaterial;
use App\Models\Recipe;
use App\Models\User;
use App\Services\AssetService;
use App\Services\DeliveryService;
use App\Services\ForecastService;
use App\Services\PrepaidExpenseService;
use App\Services\ProductBatchService;
use App\Services\ProductionService;
use App\Services\QcCheckService;
use App\Services\WasteService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->seedChartOfAccounts();

        $outlet = Outlet::create([
            'code' => 'OUT-001',
            'name' => 'Jalan Rasa Pusat',
            'type' => 'kitchen',
            'address' => 'Jl. Contoh No. 1',
        ]);

        $outletCabang = Outlet::create([
            'code' => 'OUT-002',
            'name' => 'Jalan Rasa Cabang Kemang',
            'type' => 'outlet',
            'address' => 'Jl. Kemang Raya No. 10',
        ]);

        $owner = User::factory()->create([
            'name' => 'Owner',
            'email' => 'owner@jalanrasa.test',
            'password' => bcrypt('password'),
            'role' => 'owner',
            'outlet_id' => $outlet->id,
        ]);

        User::factory()->create([
            'name' => 'Kasir Satu',
            'email' => 'kasir@jalanrasa.test',
            'password' => bcrypt('password'),
            'role' => 'kasir',
            'outlet_id' => $outlet->id,
        ]);

        $makanan = Category::create(['name' => 'Makanan', 'type' => 'product']);
        $minuman = Category::create(['name' => 'Minuman', 'type' => 'product']);
        $bahanCategory = Category::create(['name' => 'Bahan Baku', 'type' => 'raw_material']);

        $nasi = RawMaterial::create(['category_id' => $bahanCategory->id, 'name' => 'Nasi', 'unit' => 'gram', 'stock_qty' => 20000, 'min_stock' => 2000, 'cost_price' => 12]);
        $ayam = RawMaterial::create(['category_id' => $bahanCategory->id, 'name' => 'Ayam', 'unit' => 'gram', 'stock_qty' => 10000, 'min_stock' => 1000, 'cost_price' => 35]);
        $es = RawMaterial::create(['category_id' => $bahanCategory->id, 'name' => 'Es Batu', 'unit' => 'gram', 'stock_qty' => 15000, 'min_stock' => 1000, 'cost_price' => 3]);
        $tehBubuk = RawMaterial::create(['category_id' => $bahanCategory->id, 'name' => 'Teh Bubuk', 'unit' => 'gram', 'stock_qty' => 3000, 'min_stock' => 300, 'cost_price' => 20]);

        // Produk "Produksi Sendiri" — pakai resep, stok berbasis batch produksi harian.
        $nasiAyam = Product::create([
            'category_id' => $makanan->id,
            'sourcing_type' => 'made',
            'shelf_life_days' => 1,
            'name' => 'Nasi Ayam',
            'sku' => 'MKN-001',
            'unit' => 'porsi',
            'price' => 20000,
            'cost_price' => 8000,
            'image' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
        ]);
        Recipe::create(['product_id' => $nasiAyam->id, 'raw_material_id' => $nasi->id, 'qty_used' => 200]);
        Recipe::create(['product_id' => $nasiAyam->id, 'raw_material_id' => $ayam->id, 'qty_used' => 150]);

        $esTeh = Product::create([
            'category_id' => $minuman->id,
            'sourcing_type' => 'made',
            'shelf_life_days' => 1,
            'name' => 'Es Teh',
            'sku' => 'MNM-001',
            'unit' => 'gelas',
            'price' => 5000,
            'cost_price' => 1500,
            'image' => 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&q=80',
        ]);
        Recipe::create(['product_id' => $esTeh->id, 'raw_material_id' => $es->id, 'qty_used' => 100]);
        Recipe::create(['product_id' => $esTeh->id, 'raw_material_id' => $tehBubuk->id, 'qty_used' => 10]);

        // Produk "Beli Jadi" — dijual ulang, stok masuk lewat Pembelian.
        $ayamGoreng = Product::create([
            'category_id' => $makanan->id,
            'sourcing_type' => 'resell',
            'shelf_life_days' => 3,
            'name' => 'Ayam Goreng',
            'sku' => 'MKN-002',
            'unit' => 'porsi',
            'price' => 15000,
            'cost_price' => 6000,
            'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
        ]);

        $mieGoreng = Product::create([
            'category_id' => $makanan->id,
            'sourcing_type' => 'resell',
            'shelf_life_days' => 2,
            'name' => 'Mie Goreng',
            'sku' => 'MKN-003',
            'unit' => 'porsi',
            'price' => 12000,
            'cost_price' => 5000,
            'image' => 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
        ]);

        $esKopiSusu = Product::create([
            'category_id' => $minuman->id,
            'sourcing_type' => 'resell',
            'shelf_life_days' => 5,
            'name' => 'Es Kopi Susu',
            'sku' => 'MNM-002',
            'unit' => 'gelas',
            'price' => 12000,
            'cost_price' => 4000,
            'image' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
        ]);

        $jusAlpukat = Product::create([
            'category_id' => $minuman->id,
            'sourcing_type' => 'resell',
            'shelf_life_days' => 2,
            'name' => 'Jus Alpukat',
            'sku' => 'MNM-003',
            'unit' => 'gelas',
            'price' => 10000,
            'cost_price' => 3500,
            'image' => 'https://images.unsplash.com/photo-1560508180-03f285f67ded?w=400&q=80',
        ]);

        // Batch stok awal supaya Kasir langsung bisa dites — produksi butuh QC lolos dulu
        // sebelum batch-nya bisa dijual (Fase 5).
        $productionService = app(ProductionService::class);
        $qcCheckService = app(QcCheckService::class);

        $nasiAyamProduction = $productionService->create(['outlet_id' => $outlet->id, 'product_id' => $nasiAyam->id, 'qty' => 30, 'produced_at' => now()->toDateString()], $owner);
        $qcCheckService->create(['production_id' => $nasiAyamProduction->id, 'qty_checked' => 30, 'qty_passed' => 30, 'qty_rejected' => 0, 'pic_user_id' => $owner->id, 'notes' => 'QC awal (seeder)'], $owner);

        $esTehProduction = $productionService->create(['outlet_id' => $outlet->id, 'product_id' => $esTeh->id, 'qty' => 40, 'produced_at' => now()->toDateString()], $owner);
        $qcCheckService->create(['production_id' => $esTehProduction->id, 'qty_checked' => 40, 'qty_passed' => 40, 'qty_rejected' => 0, 'pic_user_id' => $owner->id, 'notes' => 'QC awal (seeder)'], $owner);

        $batchService = app(ProductBatchService::class);
        foreach ([$ayamGoreng, $mieGoreng, $esKopiSusu, $jusAlpukat] as $product) {
            $batchService->createBatch(
                $product,
                $outlet->id,
                'purchase',
                null,
                25,
                now()->toDateString(),
                now()->addDays($product->shelf_life_days)->toDateString(),
                $owner,
                'Stok awal (seeder)',
                (float) $product->cost_price,
            );
        }

        // Contoh log Forecast & PO — satu tepat waktu, satu eksepsi (mengikuti referensi SOP).
        $forecastService = app(ForecastService::class);
        $forecastService->create([
            'outlet_id' => $outlet->id,
            'category_id' => $makanan->id,
            'pic_user_id' => $owner->id,
            'week_label' => 'Minggu 30',
            'forecast_date' => now()->subDays(3)->toDateString(),
            'forecast_qty' => 500,
            'po_qty' => 500,
            'lead_time_days' => 3,
            'notes' => 'Sesuai jadwal normal',
        ], $owner);

        $forecastService->create([
            'outlet_id' => $outlet->id,
            'category_id' => $makanan->id,
            'pic_user_id' => $owner->id,
            'week_label' => 'Minggu 30',
            'forecast_date' => now()->subDays(2)->toDateString(),
            'forecast_qty' => 300,
            'po_qty' => 350,
            'lead_time_days' => 0,
            'exception_reason' => 'PO diubah mendadak di hari yang sama',
            'exception_approved_by' => $owner->id,
            'notes' => 'Contoh kasus dari temuan survei',
        ], $owner);

        // Contoh Delivery Order dari dapur pusat ke outlet cabang (Fase 6).
        $deliveryService = app(DeliveryService::class);
        $delivery = $deliveryService->create([
            'from_outlet_id' => $outlet->id,
            'to_outlet_id' => $outletCabang->id,
            'notes' => 'Pengiriman stok awal ke cabang Kemang',
            'items' => [
                ['product_id' => $nasiAyam->id, 'qty' => 10],
                ['product_id' => $esTeh->id, 'qty' => 15],
            ],
        ], $owner);

        $deliveryService->receive($delivery, $delivery->items->map(fn ($item) => [
            'id' => $item->id,
            'qty_received' => $item->qty_sent,
            'condition_ok' => true,
            'expired_ok' => true,
        ])->all(), $owner);

        // Contoh Waste Log (Fase 7) — Ayam Goreng rusak saat penyimpanan di outlet pusat.
        app(WasteService::class)->create([
            'outlet_id' => $outlet->id,
            'product_id' => $ayamGoreng->id,
            'source_type' => 'expired',
            'qty' => 2,
            'reason' => 'Kedaluwarsa, tidak terjual sesuai shelf life',
            'pic_user_id' => $owner->id,
            'notes' => 'Contoh data (seeder)',
        ], $owner);

        // Contoh Aset Tetap + Biaya Dibayar Dimuka (Fase 8).
        $assetService = app(AssetService::class);
        $kulkas = $assetService->create([
            'outlet_id' => $outlet->id,
            'name' => 'Kulkas Display',
            'category' => 'equipment',
            'purchase_date' => now()->subMonths(2)->toDateString(),
            'purchase_cost' => 6000000,
            'useful_life_months' => 48,
            'salvage_value' => 600000,
            'notes' => 'Contoh data (seeder)',
        ], $owner);
        $assetService->depreciate($kulkas, $owner, now()->subMonth()->toDateString());
        $assetService->depreciate($kulkas, $owner, now()->toDateString());

        app(PrepaidExpenseService::class)->create([
            'outlet_id' => $outlet->id,
            'name' => 'Sewa Ruko 1 Tahun',
            'amount' => 24000000,
            'start_date' => now()->subMonth()->toDateString(),
            'months' => 12,
            'notes' => 'Contoh data (seeder)',
        ], $owner);
    }

    protected function seedChartOfAccounts(): void
    {
        $accounts = [
            ['code' => '1101', 'name' => 'Kas', 'type' => 'asset'],
            ['code' => '1102', 'name' => 'Bank', 'type' => 'asset'],
            ['code' => '1103', 'name' => 'Piutang Usaha', 'type' => 'asset'],
            ['code' => '1104', 'name' => 'Persediaan Bahan Baku', 'type' => 'asset'],
            ['code' => '1105', 'name' => 'Persediaan Produk Jadi', 'type' => 'asset'],
            ['code' => '1106', 'name' => 'Biaya Dibayar Dimuka', 'type' => 'asset'],
            ['code' => '1201', 'name' => 'Aset Tetap', 'type' => 'asset'],
            ['code' => '1202', 'name' => 'Akumulasi Penyusutan Aset Tetap', 'type' => 'asset'],
            ['code' => '2101', 'name' => 'Utang Usaha', 'type' => 'liability'],
            ['code' => '2102', 'name' => 'Uang Muka Pelanggan', 'type' => 'liability'],
            ['code' => '3101', 'name' => 'Modal Pemilik', 'type' => 'equity'],
            ['code' => '4101', 'name' => 'Pendapatan Penjualan', 'type' => 'revenue'],
            ['code' => '5101', 'name' => 'Harga Pokok Penjualan (HPP)', 'type' => 'expense'],
            ['code' => '5102', 'name' => 'Beban Operasional', 'type' => 'expense'],
            ['code' => '5103', 'name' => 'Beban Kerugian (Waste/Retur)', 'type' => 'expense'],
            ['code' => '5104', 'name' => 'Beban Penyusutan', 'type' => 'expense'],
        ];

        foreach ($accounts as $account) {
            Account::create($account);
        }
    }
}
