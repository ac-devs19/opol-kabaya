<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    protected $table = 'user_sessions';

    protected $fillable = [
        'user_id',
        'device_id',
        'required_password',
        'is_biometric',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
