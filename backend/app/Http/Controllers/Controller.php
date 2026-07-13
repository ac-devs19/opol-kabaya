<?php

namespace App\Http\Controllers;

use App\Models\OtpVerification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use Request;

abstract class Controller
{
    public function otp($user)
    {
        do {
            $otp = random_int(100000, 999999);
        } while (
            OtpVerification::query()
                ->where('otp', $otp)
                ->exists()
        );

        OtpVerification::create([
            'user_id' => $user->id,
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
                'message' => 'Your OTP has expired. Please request a new one.'
            ]);
        }

        if ($record->otp !== $data['otp']) {
            throw ValidationException::withMessages([
                'message' => 'The OTP you entered is invalid. Please try again.'
            ]);
        }

        OtpVerification::where('user_id', $record->user_id)->delete();
    }
}
