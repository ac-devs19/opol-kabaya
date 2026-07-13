<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    protected $table = 'users';

    protected $fillable = [
        'id_number',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'user_name',
        'gender',
        'birth_date',
        'profile_picture',
        'mobile_number',
        'mobile_verified_at',
        'email',
        'email_verified_at',
        'province',
        'municipality',
        'barangay',
        'street_name',
        'postal_code',
        'user_verified_at',
        'role',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function user_session()
    {
        return $this->hasOne(UserSession::class, 'user_id');
    }

    public function otp_verification()
    {
        return $this->hasMany(OtpVerification::class, 'user_id');
    }

    public function requirement()
    {
        return $this->hasMany(Requirement::class, 'user_id');
    }
}
