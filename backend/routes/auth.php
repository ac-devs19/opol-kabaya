<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['guest'])->group(function () {
  Route::get('/login', [AuthController::class, 'create'])->name('login');
  Route::post('/login', [AuthController::class, 'store']);
});

Route::middleware(['auth', 'role:admin'])->group(function () {
  Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
});