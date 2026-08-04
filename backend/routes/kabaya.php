<?php

use App\Http\Controllers\Controller;
use App\Http\Controllers\Kabaya\Mobile\App\VerificationController;
use App\Http\Controllers\Kabaya\Mobile\Auth\ForgotController;
use App\Http\Controllers\Kabaya\Mobile\Auth\LoginController;
use App\Http\Controllers\Kabaya\Mobile\Auth\SignInController;
use App\Http\Controllers\Kabaya\Mobile\Auth\SignUpController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
  Route::get('/kabaya/mobile/user', function (Request $request) {
    return $request->user()->load('user_session');
  });

  Route::post('/kabaya/mobile/login', [LoginController::class, 'login']);
  Route::post('/kabaya/mobile/lock', [LoginController::class, 'lock']);
  Route::post('/kabaya/mobile/biometric', [LoginController::class, 'biometric']);
  Route::post('/kabaya/mobile/login/biometric', [LoginController::class, 'loginBiometric']);
  Route::post('/kabaya/mobile/logout', [LoginController::class, 'logout']);

  Route::post('/kabaya/mobile/forgot-pin', [ForgotController::class, 'forgotPin']);
  Route::post('/kabaya/mobile/forgot/verify-otp', [ForgotController::class, 'verifyOtp']);
  Route::post('/kabaya/mobile/forgot/reset-pin', [ForgotController::class, 'resetPin']);

  Route::post('/kabaya/mobile/verification/personal', [VerificationController::class, 'verificationPersonal']);
  Route::post('/kabaya/mobile/verification/address', [VerificationController::class, 'verificationAddress']);
});

Route::middleware(['guest'])->group(function () {
  Route::get('/kabaya/mobile/get-residents', [SignUpController::class, 'getResident']);
  Route::post('/kabaya/mobile/sign-up', [SignUpController::class, 'signUp']);
  Route::post('/kabaya/mobile/sign-up/verify-otp', [SignUpController::class, 'verifyOtp']);
  Route::post('/kabaya/mobile/sign-up/create-pin', [SignUpController::class, 'createPin']);

  Route::post('/kabaya/mobile/sign-in', [SignInController::class, 'signIn']);
  Route::post('/kabaya/mobile/sign-in/verify-otp', [SignInController::class, 'verifyOtp']);
});

Route::post('/kabaya/mobile/resend-otp', [Controller::class, 'resendOtp']);