<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LinkSystem extends Model
{
    protected $table = 'link_systems';

    protected $fillable = [
        'label',
        'icon',
        'href',
        'is_active',
    ];
}
