<?php

use App\Http\Controllers\Kabaya\Mobile\AppController;
use App\Http\Controllers\Kabaya\Mobile\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
  Route::get('/kabaya/mobile/user', function (Request $request) {
    return $request->user()->load('user_session');
  });

  Route::post('/kabaya/mobile/lock', [AuthController::class, 'lock']);
  Route::post('/kabaya/mobile/login', [AuthController::class, 'login']);
  Route::post('/kabaya/mobile/logout', [AuthController::class, 'logout']);

  Route::post('/kabaya/mobile/forgot-pin', [AuthController::class, 'forgotPin']);
  Route::post('/kabaya/mobile/reset-pin', [AuthController::class, 'resetPin']);
});

Route::middleware(['guest'])->group(function () {
  Route::get('/kabaya/mobile/get-residents', [AuthController::class, 'getResident']);

  Route::post('/kabaya/mobile/sign-up', [AuthController::class, 'signUp']);
  Route::post('/kabaya/mobile/verify-otp', [AuthController::class, 'verifyOtp']);
  Route::post('/kabaya/mobile/create-pin', [AuthController::class, 'createPin']);

  Route::post('/kabaya/mobile/sign-in', [AuthController::class, 'signIn']);
});