<?php

namespace App\Services;

use App\Models\UsageCounter;
use App\Models\Subscription;
use App\Models\Session;
use App\Models\PricingPlan;
use Illuminate\Support\Facades\Log;

class UsageService
{
    /**
     * Track usage for different actions
     */
    public static function trackUsage($shop, $action, $scope = 'month')
    {
        try {
            // Get current plan for the shop
            $currentPlan = self::getCurrentPlan($shop);
            
            // Update usage counter with current plan
            UsageCounter::updatePlan($shop, $currentPlan, $scope);
            
            // Increment usage
            $usage = UsageCounter::incrementUsage($shop, $scope);
            
            Log::info("Usage tracked for shop: {$shop}, action: {$action}, plan: {$currentPlan}, count: {$usage->count}, limit: {$usage->limit_snapshot}");
            
            return $usage;
        } catch (\Exception $e) {
            Log::error("Error tracking usage: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if action is allowed based on usage limits
     */
    public static function isActionAllowed($shop, $action, $scope = 'month')
    {
        try {
            // Get current plan for the shop
            $currentPlan = self::getCurrentPlan($shop);
            
            // Update usage counter with current plan
            UsageCounter::updatePlan($shop, $currentPlan, $scope);
            
            // Check if limit reached
            $isLimitReached = UsageCounter::isLimitReached($shop, $scope);
            
            if ($isLimitReached) {
                Log::warning("Usage limit reached for shop: {$shop}, plan: {$currentPlan}, action: {$action}");
            }
            
            return !$isLimitReached;
        } catch (\Exception $e) {
            Log::error("Error checking usage limits: " . $e->getMessage());
            // Default to allowing action if there's an error
            return true;
        }
    }

    /**
     * Get current plan for a shop
     */
    private static function getCurrentPlan($shop)
    {
        try {
            // First check if there's an active subscription
            $subscription = Subscription::whereHas('shop', function($query) use ($shop) {
                $query->where('shop', $shop);
            })->where('status', 'active')->first();
            
            if ($subscription && $subscription->plan) {
                return $subscription->plan->slug;
            }
            
            // If no subscription, check if shop exists and default to free
            $shopSession = Session::where('shop', $shop)->first();
            if ($shopSession) {
                return 'free';
            }
            
            // Default fallback
            return 'free';
        } catch (\Exception $e) {
            Log::error("Error getting current plan: " . $e->getMessage());
            return 'free';
        }
    }

    /**
     * Get usage statistics for a shop
     */
    public static function getUsageStats($shop, $scope = 'month')
    {
        try {
            $currentPlan = self::getCurrentPlan($shop);
            UsageCounter::updatePlan($shop, $currentPlan, $scope);
            
            $usage = UsageCounter::getCurrentUsage($shop, $scope);
            $remaining = UsageCounter::getRemainingUsage($shop, $scope);
            
            return [
                'current_usage' => $usage->count,
                'limit' => $usage->limit_snapshot,
                'remaining' => $remaining,
                'plan' => $currentPlan,
                'is_limit_reached' => $usage->count >= $usage->limit_snapshot,
                'usage_percentage' => $usage->limit_snapshot > 0 ? round(($usage->count / $usage->limit_snapshot) * 100, 2) : 0
            ];
        } catch (\Exception $e) {
            Log::error("Error getting usage stats: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get action cost (how many usage points an action consumes)
     */
    public static function getActionCost($action)
    {
        $actionCosts = [
            'create_wishlist' => 1,
            'add_item' => 1,
            'share_wishlist' => 1,
            'send_notification' => 1, // Each notification (email/SMS) counts as 1 usage
            'remove_item' => 0, // Removing doesn't count against limit
            'delete_wishlist' => 0, // Deleting doesn't count against limit
        ];
        
        return $actionCosts[$action] ?? 1;
    }

    /**
     * Check if sharing is allowed for current plan
     */
    public static function isSharingAllowed($shop)
    {
        try {
            $currentPlan = self::getCurrentPlan($shop);
            
            // Check if current plan allows sharing
            $plan = PricingPlan::findBySlug($currentPlan);
            if ($plan && isset($plan->features)) {
                $features = is_array($plan->features) ? $plan->features : json_decode($plan->features, true);
                
                foreach ($features as $feature) {
                    if (is_array($feature) && isset($feature['text'])) {
                        if (strpos(strtolower($feature['text']), 'share') !== false) {
                            return true;
                        }
                    }
                }
            }
            
            // Default: only allow sharing for paid plans
            return $currentPlan !== 'free';
        } catch (\Exception $e) {
            Log::error("Error checking sharing permissions: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Reset usage for new period (monthly reset)
     */
    public static function resetMonthlyUsage($shop)
    {
        try {
            UsageCounter::resetForNewPeriod($shop, 'month');
            Log::info("Monthly usage reset for shop: {$shop}");
            return true;
        } catch (\Exception $e) {
            Log::error("Error resetting monthly usage: " . $e->getMessage());
            return false;
        }
    }
}
