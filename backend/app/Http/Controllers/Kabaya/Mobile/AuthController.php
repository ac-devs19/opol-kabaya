<?php

namespace App\Http\Controllers\Kabaya\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSession;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $user = $request->user();

        if (!$request->boolean('useBiometric')) {
            $data = $request->validate([
                'password' => ['required', 'string'],
            ]);

            if (!Hash::check($data['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'message' => 'The provided credentials are incorrect.'
                ]);
            }
        }

        UserSession::where('user_id', $user->id)
            ->update([
                'required_password' => false,
            ]);
    }

    public function signIn(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'numeric', 'digits:10', 'regex:/^9\d{9}$/'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('mobile_number', $data['mobile_number'])->first();

        if (!$user || $user->mobile_verified_at === null || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'message' => 'The provided credentials are incorrect.'
            ]);
        }

        $existingSession = UserSession::where('user_id', $user->id)->first();

        if ($existingSession && $existingSession->device_id !== $request->input('device_id')) {
            throw ValidationException::withMessages([
                'message' => 'This account is already logged in on another device.'
            ]);
        }

        UserSession::updateOrCreate(
            ['user_id' => $user->id],
            [
                'device_id' => $request->input('device_id'),
                'required_password' => false,
            ]
        );

        return response()->json([
            'token' => $user->createToken($request->input('device_name'), ['*'], now()->addWeek())->plainTextToken
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'numeric', 'digits:10', 'regex:/^9\d{9}$/'],
        ]);

        $user = User::where('mobile_number', $data['mobile_number'])->first();

        if (!$user || $user->mobile_verified_at === null) {
            throw ValidationException::withMessages([
                'message' => 'The mobile number is invalid.'
            ]);
        }

        $this->otp($user);

        return response()->json([
            'mobile_number' => $user->mobile_number
        ]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'numeric', 'digits:10', 'regex:/^9\d{9}$/'],
            'password' => ['required', Password::default()],
        ]);

        $user = User::where('mobile_number', $data['mobile_number'])->first();

        $user->update([
            'password' => Hash::make($data['password']),
        ]);
    }

    public function signUp(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string'],
            'middle_name' => ['nullable', 'string'],
            'last_name' => ['required', 'string'],
            'suffix' => ['nullable', 'string'],
            'mobile_number' => ['required', 'numeric', 'digits:10', 'regex:/^9\d{9}$/'],
            'email' => ['nullable', 'email'],
            'password' => ['required', Password::defaults()],
        ]);

        $user = User::where('mobile_number', $data['mobile_number'])->first();

        if ($user && $user->mobile_verified_at !== null) {
            throw ValidationException::withMessages([
                'message' => 'Mobile number already verified and registered.'
            ]);
        }

        if (!empty($data['email'])) {
            $userEmail = User::where('email', $data['email'])->first();

            if ($userEmail && $userEmail->email_verified_at !== null) {
                throw ValidationException::withMessages([
                    'message' => 'Email address already verified and registered.'
                ]);
            }
        }

        do {
            $year = now()->year;
            $month = now()->month;
            $random = random_int(1000, 9999);

            $id_number = "{$year}-{$month}-{$random}";
        } while (
            User::query()
                ->where('id_number', $id_number)
                ->exists()
        );

        if ($user && $user->mobile_verified_at === null) {
            $user->update([
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'],
                'last_name' => $data['last_name'],
                'suffix' => $data['suffix'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
        }

        if (!$user) {
            $user = User::create([
                'id_number' => $id_number,
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'],
                'last_name' => $data['last_name'],
                'suffix' => $data['suffix'],
                'mobile_number' => $data['mobile_number'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
        }

        $this->otp($user);

        return response()->json([
            'mobile_number' => $user->mobile_number
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'numeric', 'digits:10', 'regex:/^9\d{9}$/'],
            'otp' => ['required', 'digits:6', 'numeric'],
        ]);

        $this->verify($data);

        if (!$request->boolean('is_forgot')) {
            $user = User::where('mobile_number', $data['mobile_number'])->first();

            $user->update([
                'mobile_verified_at' => now(),
            ]);

            UserSession::create(
                [
                    'user_id' => $user->id,
                    'device_id' => $request->input('device_id'),
                    'required_password' => false,
                ]
            );

            return response()->json([
                'token' => $user->createToken($request->input('device_name'))->plainTextToken
            ]);
        }
    }

    public function resendOtp(Request $request)
    {
        $data = $request->validate([
            'mobile_number' => ['required', 'numeric', 'digits:10', 'regex:/^9\d{9}$/'],
        ]);

        $user = User::where('mobile_number', $data['mobile_number'])->first();

        $this->otp($user);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        UserSession::where('user_id', $user->id)
            ->where('device_id', $request->input('device_id'))
            ->delete();
    }

    public function lock(Request $request)
    {
        UserSession::where('device_id', $request->input('device_id'))
            ->update([
                'required_password' => true,
            ]);
    }

    public function biometrics(Request $request)
    {
        $session = UserSession::where('device_id', $request->input('device_id'))->first();

        $session->update([
            'is_biometric' => $request->is_biometric,
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required'],
            'password' => ['required', Password::default()],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
    }
}
