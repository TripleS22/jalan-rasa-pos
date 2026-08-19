<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ConsignmentController;
use App\Http\Controllers\Api\ConsignmentPartnerController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerReturnController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OutletController;
use App\Http\Controllers\Api\PreOrderController;
use App\Http\Controllers\Api\PrepaidExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\Public\TableMenuController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\QcCheckController;
use App\Http\Controllers\Api\RawMaterialController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SupplierReturnController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\TableOrderController;
use App\Http\Controllers\Api\WasteController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

// Publik, tanpa login — diakses lewat QR code meja dari HP pelanggan.
Route::prefix('public')->middleware('throttle:30,1')->group(function () {
    Route::get('/tables/{code}', [TableMenuController::class, 'show']);
    Route::post('/tables/{code}/orders', [TableMenuController::class, 'store']);
    Route::get('/tables/{code}/orders/{tableOrder}', [TableMenuController::class, 'showOrder']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('raw-materials', RawMaterialController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('purchases', PurchaseController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('pre-orders', PreOrderController::class);
    Route::apiResource('consignment-partners', ConsignmentPartnerController::class);
    Route::apiResource('consignments', ConsignmentController::class);
    Route::apiResource('reservations', ReservationController::class);
    Route::apiResource('productions', ProductionController::class)->only(['index', 'store']);
    Route::apiResource('customer-returns', CustomerReturnController::class)->only(['index', 'store']);
    Route::apiResource('supplier-returns', SupplierReturnController::class)->only(['index', 'store']);
    Route::apiResource('outlets', OutletController::class);
    Route::apiResource('forecasts', ForecastController::class)->only(['index', 'store']);
    Route::apiResource('qc-checks', QcCheckController::class)->only(['index', 'store']);
    Route::apiResource('deliveries', DeliveryController::class)->only(['index', 'store', 'show']);
    Route::post('/deliveries/{delivery}/receive', [DeliveryController::class, 'receive']);
    Route::get('/waste', [WasteController::class, 'index']);
    Route::post('/waste', [WasteController::class, 'store']);
    Route::apiResource('assets', AssetController::class)->only(['index', 'store']);
    Route::post('/assets/{asset}/depreciate', [AssetController::class, 'depreciate']);
    Route::post('/assets/{asset}/dispose', [AssetController::class, 'dispose']);
    Route::apiResource('prepaid-expenses', PrepaidExpenseController::class)->only(['index', 'store']);
    Route::post('/prepaid-expenses/{prepaid}/amortize', [PrepaidExpenseController::class, 'amortize']);

    Route::apiResource('tables', TableController::class);
    Route::get('/tables/{table}/qr', [TableController::class, 'qr']);
    Route::post('/tables/{table}/regenerate-code', [TableController::class, 'regenerateCode']);
    Route::apiResource('table-orders', TableOrderController::class)->only(['index', 'show']);
    Route::post('/table-orders/{tableOrder}/confirm', [TableOrderController::class, 'confirm']);
    Route::post('/table-orders/{tableOrder}/cancel', [TableOrderController::class, 'cancel']);

    Route::prefix('reports')->group(function () {
        Route::get('/sales', [ReportController::class, 'sales']);
        Route::get('/profit-loss', [ReportController::class, 'profitLoss']);
        Route::get('/top-products', [ReportController::class, 'topProducts']);
        Route::get('/low-stock', [ReportController::class, 'lowStock']);
        Route::get('/unsold-products', [ReportController::class, 'unsoldProducts']);
    });
});
