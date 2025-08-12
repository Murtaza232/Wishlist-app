<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'shop_id',
        'shopify_product_id',
        'title',
        'stock',
        'price',
        'old_price',
        'compare_at_price',
        'last_price_check'
    ];
    
}
