<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function wishlistConfigurations()
    {
        return $this->hasMany(WishlistConfiguration::class);
    }
    public function wishlistFeatures()
    {
        return $this->hasMany(WishlistFeature::class);
    }
}
