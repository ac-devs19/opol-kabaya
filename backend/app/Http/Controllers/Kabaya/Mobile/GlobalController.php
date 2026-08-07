<?php

namespace App\Http\Controllers\Kabaya\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class GlobalController extends Controller
{
    public function resendOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $data['email'])->first();

        $this->otp($user->id);
    }
}
