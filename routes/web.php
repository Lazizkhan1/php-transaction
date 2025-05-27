<?php

use App\Http\Controllers\CardTypeController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\PaymentController; // Add this line
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::middleware(['role:admin'])->group(function () {
        Route::resource('card-types', CardTypeController::class);
    });
    Route::resource('cards', CardController::class);
    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index'); // Add this line
    Route::post('payments', [PaymentController::class, 'store'])->name('payments.store'); // Add this line

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
