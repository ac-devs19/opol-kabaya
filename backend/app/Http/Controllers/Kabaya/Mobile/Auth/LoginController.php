<?php

namespace App\Http\Controllers\Kabaya\Mobile\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function lock(Request $request)
    {
        $user = $request->user();

        UserSession::where("user_id", $user->id)
            ->where('device_id', $request->device_id)
            ->update([
                'required_password' => true,
            ]);
    }

    public function login(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'The provided credentials are incorrect.'
            ]);
        }

        UserSession::where('user_id', $user->id)
            ->where('device_id', $request->device_id)
            ->update([
                'required_password' => false,
            ]);
    }

    public function biometric(Request $request)
    {
        $user = $request->user();

        $session = UserSession::where('user_id', $user->id)
            ->where('device_id', $request->device_id)->first();

        $session->update([
            'is_biometric' => $request->is_biometric,
        ]);
    }

    public function loginBiometric(Request $request)
    {
        $user = $request->user();

        UserSession::where('user_id', $user->id)
            ->where('device_id', $request->device_id)
            ->update([
                'required_password' => false,
            ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();
    }
}
