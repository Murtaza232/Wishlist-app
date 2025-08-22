<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PricingPlan;
use Carbon\Carbon;

class UsageCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop',
        'scope',
        'period_key',
        'count',
        'plan_slug',
        'limit_snapshot',
    ];

    protected $casts = [
        'count' => 'integer',
        'limit_snapshot' => 'integer',
    ];

    /**
     * Get the current usage for a shop
     */
    public static function getCurrentUsage($shop, $scope = 'month')
    {
        $periodKey = self::getPeriodKey($scope);
        
        return static::firstOrCreate([
            'shop' => $shop,
            'scope' => $scope,
            'period_key' => $periodKey,
        ], [
            'count' => 0,
            'plan_slug' => 'free', // Default to free plan
            'limit_snapshot' => 500, // Default free plan limit
        ]);
    }

    /**
     * Increment usage count for a shop
     */
    public static function incrementUsage($shop, $scope = 'month')
    {
        $usage = self::getCurrentUsage($shop, $scope);
        $usage->increment('count');
        return $usage->fresh();
    }

    /**
     * Check if usage limit has been reached
     */
    public static function isLimitReached($shop, $scope = 'month')
    {
        $usage = self::getCurrentUsage($shop, $scope);
        return $usage->count >= $usage->limit_snapshot;
    }

    /**
     * Get remaining usage count
     */
    public static function getRemainingUsage($shop, $scope = 'month')
    {
        $usage = self::getCurrentUsage($shop, $scope);
        $remaining = $usage->limit_snapshot - $usage->count;
        return max(0, $remaining);
    }

    /**
     * Update plan and limit for a shop
     */
    public static function updatePlan($shop, $planSlug, $scope = 'month')
    {
        $usage = self::getCurrentUsage($shop, $scope);
        
        // Get the new limit from pricing plan
        $plan = PricingPlan::findBySlug($planSlug);
        if ($plan) {
            $limit = self::parseUsageLimit($plan->usage_limit);
            $usage->update([
                'plan_slug' => $planSlug,
                'limit_snapshot' => $limit,
            ]);
        }
        
        return $usage;
    }

    /**
     * Get period key based on scope
     */
    private static function getPeriodKey($scope)
    {
        if ($scope === 'month') {
            return Carbon::now()->format('Y-m');
        }
        return null; // For lifetime scope
    }

    /**
     * Parse usage limit string to integer
     */
    private static function parseUsageLimit($usageLimit)
    {
        // Handle different formats: "500 lifetime", "10,000 per month", etc.
        $number = preg_replace('/[^0-9,]/', '', $usageLimit);
        $number = str_replace(',', '', $number);
        
        if (strpos(strtolower($usageLimit), 'lifetime') !== false) {
            return (int) $number;
        }
        
        // For monthly limits, multiply by 12 to get a reasonable monthly cap
        if (strpos(strtolower($usageLimit), 'month') !== false) {
            return (int) $number;
        }
        
        // Default fallback
        return (int) $number;
    }

    /**
     * Reset usage counter for a new period
     */
    public static function resetForNewPeriod($shop, $scope = 'month')
    {
        $currentPeriod = self::getPeriodKey($scope);
        $existing = static::where('shop', $shop)
            ->where('scope', $scope)
            ->where('period_key', $currentPeriod)
            ->first();
            
        if (!$existing) {
            // Get current plan
            $usage = static::where('shop', $shop)
                ->where('scope', $scope)
                ->orderBy('created_at', 'desc')
                ->first();
                
            if ($usage) {
                static::create([
                    'shop' => $shop,
                    'scope' => $scope,
                    'period_key' => $currentPeriod,
                    'count' => 0,
                    'plan_slug' => $usage->plan_slug,
                    'limit_snapshot' => $usage->limit_snapshot,
                ]);
            }
        }
    }
}
