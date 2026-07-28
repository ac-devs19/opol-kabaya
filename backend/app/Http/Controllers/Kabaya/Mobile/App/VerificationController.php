<?php

namespace App\Http\Controllers\Kabaya\Mobile\App;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VerificationController extends Controller
{
    public function verificationPersonal(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'first_name' => ['required'],
            'suffix' => ['nullable'],
            'middle_name' => ['nullable'],
            'last_name' => ['required'],
            'birth_date' => ['required', 'date'],
            'sex' => ['required'],
            'marital_status' => ['required'],
            'religion' => ['required'],
        ]);

        $user->update($data);
    }

    public function verificationAddress(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'province' => ['required'],
            'municipality' => ['required'],
            'barangay' => ['required'],
            'postal_code' => ['required'],
        ]);

        $user->update($data);
    }
}
