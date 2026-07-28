<?php

namespace App\Http\Controllers\Kabaya\Mobile\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SignUpController extends Controller
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
            'first_name' => ['required'],
            'suffix' => ['nullable'],
            'middle_name' => ['nullable'],
            'last_name' => ['required'],
            'mobile_number' => ['required'],
        ]);

        $existing = User::where('mobile_number', $data['mobile_number'])
            ->where('id', '!=', $user->id)
            ->whereNotNull('mobile_verified_at')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'mobile_number' => 'The mobile number has already been taken.',
            ]);
        }

        $user->update($data);

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

        $user->update([
            'mobile_verified_at' => now(),
        ]);
    }

    public function createPin(Request $request)
    {
        $user = User::where('mobile_number', $request->mobile_number)
            ->whereNotNull('mobile_verified_at')
            ->first();

        $data = $request->validate([
            'password' => ['required'],
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
            'device_id' => $request->device_id,
        ]);

        return response()->json([
            'token' => $user->createToken($request->token_name, ['*'], now()->addWeek())->plainTextToken
        ]);
    }
}
