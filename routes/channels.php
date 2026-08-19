<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Semua staf yang sudah login (kasir, dapur) berhak memantau order, reservasi,
// dan pre-order secara real-time.
Broadcast::channel('orders', function (User $user) {
    return true;
});

Broadcast::channel('reservations', function (User $user) {
    return true;
});

Broadcast::channel('pre-orders', function (User $user) {
    return true;
});

// Pesanan yang masuk dari QR meja (self-order pelanggan) juga dipantau real-time.
Broadcast::channel('table-orders', function (User $user) {
    return true;
});
