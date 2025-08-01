<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistFeature extends Model
{
    use HasFactory;
    protected $guarded = [];
    public function shop()
    {
        return $this->belongsTo(Session::class);
    }
}
