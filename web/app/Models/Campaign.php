<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'title',
        'start_date',
        'end_date',
        'total_winners',
        'voucher_amount',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'voucher_amount' => 'decimal:2',
    ];
}


