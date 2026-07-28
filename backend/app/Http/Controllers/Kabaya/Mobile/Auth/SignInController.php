<?php

namespace App\Http\Controllers\Kabaya\Mobile\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SignInController extends Controller
{
    public function signIn(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required'],
        ]);

        $user = User::where('mobile_number', $data['mobile_number'])
            ->whereNotNull('mobile_number')
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'mobile_number' => 'This mobile number is not registered.',
            ]);
        }

        $this->otp($user->id);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required'],
            'otp' => ['required'],
        ]);

        $this->verify($data);

        $user = User::where('mobile_number', $data['mobile_number'])->first();

        UserSession::updateOrCreate(
            [
                'user_id' => $user->id,
                'device_id' => $request->device_id,
            ],
            [
                'required_password' => true,
            ]
        );

        return response()->json([
            'token' => $user->createToken($request->token_name, ['*'], now()->addWeek())->plainTextToken
        ]);
    }
}
