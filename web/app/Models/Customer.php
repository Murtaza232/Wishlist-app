<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'shopify_customer_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'city',
        'province',
        'country',
        'zip',
        'total_spent',
        'orders_count',
        'status',
        'last_order_date',
        'created_at_shopify',
    ];

    protected $casts = [
        'total_spent' => 'decimal:2',
        'orders_count' => 'integer',
        'last_order_date' => 'datetime',
        'created_at_shopify' => 'datetime',
    ];

    /**
     * Get the shop that owns the customer.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Session::class, 'shop_id');
    }

    /**
     * Get the customer's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the customer's location as a formatted string.
     */
    public function getLocationAttribute(): string
    {
        $parts = array_filter([$this->city, $this->province, $this->country]);
        return implode(', ', $parts) ?: 'Unknown';
    }

    /**
     * Scope to get customers by shop.
     */
    public function scopeByShop($query, $shopId)
    {
        return $query->where('shop_id', $shopId);
    }

    /**
     * Scope to get active customers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to search customers by name or email.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }
} 