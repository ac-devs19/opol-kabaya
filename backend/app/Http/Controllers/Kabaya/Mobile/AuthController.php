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
    public function getResident(Request $request)
    {
        $search = $request->input('search');

        $residents = User::select(
            'id',
            'first_name',
            'suffix',
            'middle_name',
            'last_name',
        )
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('suffix', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                        ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name, ' ', suffix) LIKE ?", ["%{$search}%"]);
                });
            })
            ->where('role', 'user')
            ->paginate(20);

        return response()->json($residents);
    }

    public function signUp(Request $request)
    {
        $user = User::findOrFail($request->id);

        $data = $request->validate([
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $existingUser = User::where('email', $data['email'])
            ->where('id', '!=', $user->id)
            ->whereNotNull('email_verified_at')
            ->first();

        if ($existingUser) {
            throw ValidationException::withMessages([
                'email' => 'The email has already been taken.',
            ]);
        }

        $user->update($data);

        $this->otp($user->id);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'digits:6'],
            'isRegister' => ['required', 'boolean'],
            'isForgot' => ['required', 'boolean'],
            'id' => ['nullable', 'integer', 'exists:users,id'],
            'device_id' => ['nullable', 'string'],
            'token_name' => ['nullable', 'string'],
        ]);

        $this->verify($data);

        if (!$data['isForgot']) {
            if ($data['isRegister']) {
                $user = User::findOrFail($data['id']);

                $user->update([
                    'email_verified_at' => now(),
                ]);
            } else {
                $user = User::where('email', $data['email'])->firstOrFail();

                UserSession::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'device_id' => $data['device_id'],
                    ],
                    [
                        'required_password' => true,
                    ]
                );

                return response()->json([
                    'token' => $user->createToken(
                        $data['token_name'],
                        ['*'],
                        now()->addWeek()
                    )->plainTextToken,
                ]);
            }
        }
    }

    public function createPin(Request $request)
    {
        $user = User::findOrFail($request->id);

        $data = $request->validate([
            'password' => ['required', 'digits:4'],
        ]);

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

        $user->update([
            'id_number' => $id_number,
            'password' => Hash::make($data['password']),
        ]);

        UserSession::create([
            'user_id' => $user->id,
            'device_id' => $request->input('device_id'),
        ]);

        return response()->json([
            'token' => $user->createToken($request->input('token_name'), ['*'], now()->addWeek())->plainTextToken
        ]);
    }

    public function lock(Request $request)
    {
        UserSession::where('device_id', $request->input('device_id'))
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
                'message' => 'The provided credentials are incorrect.'
            ]);
        }

        UserSession::where('user_id', $user->id)
            ->update([
                'required_password' => false,
            ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        UserSession::where('user_id', $user->id)
            ->where('device_id', $request->input('device_id'))
            ->delete();
    }

    public function signIn(Request $request)
    {
        $field = $request->filled('email') ? 'email' : 'id_number';

        $request->validate([
            $field => ['required'],
        ]);

        $user = User::where($field, $request->$field)->first();

        if (
            !$user ||
            ($field === 'email' && is_null($user->email_verified_at))
        ) {
            throw ValidationException::withMessages([
                $field => 'The' . ' ' . $field . ' ' . 'is incorrect.',
            ]);
        }

        $this->otp($user->id);

        return response()->json([
            'email' => $user->email,
        ]);
    }

    public function forgotPin(Request $request)
    {
        $user = $request->user();

        $this->otp($user->id);
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
            ->where('device_id', $request->input('device_id'))
            ->update([
                'required_password' => false,
            ]);
    }
}
