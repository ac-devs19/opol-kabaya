<?php

namespace App\Http\Controllers\Kabaya\Mobile\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ForgotController extends Controller
{
    public function forgotPin(Request $request)
    {
        $user = $request->user();

        $this->otp($user->id);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required'],
        ]);

        $this->verify($data);
    }

    public function resetPin(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        UserSession::where('user_id', $user->id)
            ->where('device_id', $request->device_id)
            ->update([
                'required_password' => false,
            ]);
    }
}
