<?php

use App\Http\Controllers\Kabaya\Mobile\AppController;
use App\Http\Controllers\Kabaya\Mobile\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
  Route::get('/kabaya/mobile/user', function (Request $request) {
    return $request->user()->load('user_session');
  });

  Route::post('/kabaya/mobile/login', [AuthController::class, 'login']);
  Route::get('/kabaya/mobile/logout', [AuthController::class, 'logout']);
  Route::post('/kabaya/mobile/lock', [AuthController::class, 'lock']);
  Route::post('/kabaya/mobile/biometrics', [AuthController::class, 'biometrics']);
  Route::post('/kabaya/mobile/change-password', [AuthController::class, 'changePassword']);

  Route::get('/kabaya/mobile/link-systems', [AppController::class, 'getLinkSystem']);
});

Route::middleware(['guest'])->group(function () {
  Route::post('/kabaya/mobile/sign-in', [AuthController::class, 'signIn']);
  Route::post('/kabaya/mobile/forgot-password', [AuthController::class, 'forgotPassword']);
  Route::post('/kabaya/mobile/reset-password', [AuthController::class, 'resetPassword']);
  Route::post('/kabaya/mobile/sign-up', [AuthController::class, 'signUp']);
  Route::post('/kabaya/mobile/verify-otp', [AuthController::class, 'verifyOtp']);
  Route::post('/kabaya/mobile/resend-otp', [AuthController::class, 'resendOtp']);
});