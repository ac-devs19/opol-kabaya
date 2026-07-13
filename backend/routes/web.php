<?php

use App\Http\Controllers\AppController;
use Illuminate\Support\Facades\Route;

// web
Route::middleware(['auth:sanctum'])->group(function () {
  Route::get('/dashboard', [AppController::class, 'dashboard']);

  Route::get('/users/residents', [AppController::class, 'resident']);

  Route::get('/services/link-systems', [AppController::class, 'linkSystem']);
});

// api's
Route::middleware(['auth:sanctum'])->group(function () {
  Route::get('/api/users/residents', [AppController::class, 'getResident']);

  Route::get('/api/services/link-systems', [AppController::class, 'getLinkSystem']);
  Route::post('/api/services/add/link-systems', [AppController::class, 'addLinkSystem']);
  Route::post('/api/services/update/link-systems/{id}', [AppController::class, 'updateLinkSystem']);
});

require __DIR__ . '/auth.php';
