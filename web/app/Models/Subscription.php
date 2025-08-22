<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function shop()
    {
        return $this->belongsTo(Session::class, 'shop_id');
    }

    public function plan()
    {
        return $this->belongsTo(PricingPlan::class, 'plan_id');
    }
}
