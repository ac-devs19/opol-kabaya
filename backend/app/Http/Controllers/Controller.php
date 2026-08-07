<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\OtpVerification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

abstract class Controller
{
  public function otp($user_id)
  {
    $user = User::findOrFail($user_id);

    do {
      $otp = random_int(100000, 999999);
    } while (
      OtpVerification::query()
        ->where('otp', $otp)
        ->exists()
    );

    OtpVerification::create([
      'user_id' => $user_id,
      'otp' => $otp,
      'expired_at' => Carbon::now()->addMinutes(3),
    ]);

    // Mail::to($user->email)->send(new OtpMail($otp));
  }

  public function verify($data)
  {
    $record = OtpVerification::whereHas('user', function ($query) use ($data) {
      $query->where('email', $data['email']);
    })
      ->latest()
      ->first();

    if ($record->expired_at->isPast()) {
      throw ValidationException::withMessages([
        'otp' => 'Your OTP has expired. Please request a new one.'
      ]);
    }

    if ($record->otp !== $data['otp']) {
      throw ValidationException::withMessages([
        'otp' => 'The OTP you entered is invalid. Please try again.'
      ]);
    }

    OtpVerification::where('user_id', $record->user_id)->delete();
  }

  public function token()
  {
    $client_id = config('services.google.client_id');
    $client_secret = config('services.google.client_secret');
    $refresh_token = config('services.google.refresh_token');

    $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
      'client_id' => $client_id,
      'client_secret' => $client_secret,
      'refresh_token' => $refresh_token,
      'grant_type' => 'refresh_token',
    ]);

    if (!$response->successful()) {
      throw new \Exception('Failed to get Google access token: ' . $response->body());
    }

    return $response->json()['access_token'];
  }
}
