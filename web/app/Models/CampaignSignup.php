<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignSignup extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'session_id',
        'email',
        'customer_id',
        'source',
    ];
}


