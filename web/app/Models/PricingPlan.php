<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'monthly_price',
        'annual_price',
        'currency',
        'usage_limit',
        'features',
        'badge',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'monthly_price' => 'decimal:2',
        'annual_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get active pricing plans ordered by sort order
     */
    public static function getActivePlans()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Get plan by slug
     */
    public static function findBySlug($slug)
    {
        return static::where('slug', $slug)->first();
    }

    /**
     * Check if plan has custom pricing
     */
    public function hasCustomPricing()
    {
        return is_null($this->monthly_price) && is_null($this->annual_price);
    }

    /**
     * Get formatted price for billing period
     */
    public function getFormattedPrice($billingPeriod)
    {
        if ($this->hasCustomPricing()) {
            return 'Custom Pricing';
        }

        $price = $billingPeriod === 'annual' ? $this->annual_price : $this->monthly_price;
        return '$' . number_format($price, 2);
    }

    /**
     * Get period text for billing period
     */
    public function getPeriodText($billingPeriod)
    {
        if ($this->hasCustomPricing()) {
            return '';
        }

        return $this->currency . ' / ' . ($billingPeriod === 'annual' ? 'month' : 'month');
    }

    /**
     * Calculate annual discount percentage
     */
    public function getAnnualDiscountPercentage()
    {
        // Guard against missing or zero pricing (e.g., Free plan)
        if ($this->hasCustomPricing()) {
            return 0;
        }

        $monthly = (float) $this->monthly_price;
        $annual = (float) $this->annual_price;

        // If either price is not positive, there is no discount to compute
        if ($monthly <= 0 || $annual <= 0) {
            return 0;
        }

        $monthlyTotal = $monthly * 12;
        $annualTotal = $annual * 12;

        // Avoid division by zero just in case
        if ($annualTotal <= 0) {
            return 0;
        }

        $discount = $annualTotal - $monthlyTotal;
        return round(($discount / $annualTotal) * 100);
    }
}
