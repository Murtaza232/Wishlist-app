<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    use HasFactory;
    protected $fillable = ['shop_id', 'customer_id', 'product_id'];
} 