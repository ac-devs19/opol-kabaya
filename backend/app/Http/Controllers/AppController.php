<?php

namespace App\Http\Controllers;

use App\Models\LinkSystem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AppController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('app/dashboard');
    }

    public function resident()
    {
        return Inertia::render('app/users/resident');
    }

    public function getResident(Request $request)
    {
        $search = $request->input('search');

        $residents = User::select(
            'id',
            'id_number',
            'first_name',
            'middle_name',
            'last_name',
            'suffix',
            'user_verified_at'
        )
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id_number', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%");
                });
            })
            ->where('role', 'resident')
            ->paginate(10);

        return response()->json($residents);
    }

    public function linkSystem()
    {
        return Inertia::render('app/services/link-system');
    }

    public function getLinkSystem(Request $request)
    {
        $search = $request->input('search');

        $systems = LinkSystem::select(
            'id',
            'label',
            'icon',
            'href',
            'is_active',
        )
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('label', 'like', "%{$search}%");
                });
            })
            ->paginate(10);

        return response()->json($systems);
    }

    public function addLinkSystem(Request $request)
    {
        $data = $request->validate([
            'label' => ['required'],
            'icon' => ['required', 'image', 'mimes:jpg,jpeg,png'],
            'href' => ['required'],
            'is_active' => ['required'],
        ]);

        $data['icon'] = $request->file('icon')->store('services', 'public');

        LinkSystem::create($data);
    }

    public function updateLinkSystem(Request $request)
    {
        $system = LinkSystem::findOrFail($request->id);

        $request->validate([
            'label' => ['required'],
            'icon' => ['nullable', 'image', 'mimes:jpg,jpeg,png'],
            'href' => ['required'],
            'is_active' => ['required'],
        ]);

        if ($request->hasFile('icon')) {
            if ($system->icon && Storage::disk('public')->exists($system->icon)) {
                Storage::disk('public')->delete($system->icon);
            }

            $image_url = $request->file('icon')->store('services', 'public');

            $system->update([
                'icon' => $image_url
            ]);
        }

        $system->update([
            'label' => $request->label,
            'href' => $request->href,
            'is_active' => $request->is_active,
        ]);
    }
}
