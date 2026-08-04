<?php

namespace App\Http\Controllers;

use App\Models\OtpVerification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

abstract class Controller
{
    public function otp($user_id)
    {
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
    }

    public function verify($data)
    {
        $record = OtpVerification::whereHas('user', function ($query) use ($data) {
            $query->where('mobile_number', $data['mobile_number']);
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

    public function resendOtp(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required'],
        ]);

        $user_id = User::where('mobile_number', $data['mobile_number'])->first();

        $this->otp($user_id);
    }
}
