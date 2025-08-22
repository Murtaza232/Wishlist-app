<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class MarketingAnalyticsController extends HelperController
{
    /**
     * Get comprehensive marketing analytics data
     */
    public function getMarketingAnalytics(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $shop = Session::where('shop', $shopSession->shop)
                ->whereNotNull('access_token')
                ->first();

            if (!$shop) {
                return response()->json(['error' => 'No valid access token for this shop.'], 400);
            }

            // Get date range (default to last 30 days)
            $endDate = Carbon::now();
            $startDate = Carbon::now()->subDays(30);

            if ($request->has('start_date') && $request->has('end_date')) {
                $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
                $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            }

            // Calculate performance metrics
            $performanceMetrics = $this->calculatePerformanceMetrics($shop->id, $startDate, $endDate);
            
            // Calculate shopper segments
            $shopperSegments = $this->calculateShopperSegments($shop->id);
            
            // Calculate potential revenue
            $potentialRevenue = $this->calculatePotentialRevenue($shop->id);
            
            // Get marketing activity data
            $marketingActivity = $this->getMarketingActivity($shop->id);
            
            // Get integration status
            $integrationStatus = $this->getIntegrationStatus($shop->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'performance_metrics' => $performanceMetrics,
                    'shopper_segments' => $shopperSegments,
                    'potential_revenue' => $potentialRevenue,
                    'marketing_activity' => $marketingActivity,
                    'integration_status' => $integrationStatus,
                    'date_range' => [
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in getMarketingAnalytics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching marketing analytics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initiate export of shopper segment data and email link to requester
     */
    public function exportShopperSegment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'segment' => 'required|string',
                'start_date' => 'required|date',
                'end_date' => 'required|date',
            ]);

            $shop = $this->getShop($request);
            if (!$shop) {
                return response()->json(['success' => false, 'message' => 'Shop not found'], 404);
            }

            // For now, we simulate async export and just send an informational email
            $info = [
                'shop' => $shop->shop,
                'segment' => $request->input('segment'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ];

            try {
                Mail::raw(
                    'Your shopper data export has been initiated.\n' .
                    'Segment: ' . $info['segment'] . "\n" .
                    'Range: ' . $info['start_date'] . ' - ' . $info['end_date'] . "\n" .
                    'Shop: ' . $info['shop'] . "\n\n" .
                    'You will receive another email with the download link when it is ready.',
                    function (Message $message) use ($request) {
                        $message->to($request->input('email'))
                                ->subject('Shopper data export initiated');
                    }
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send export initiation email: ' . $e->getMessage());
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate export',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate performance metrics based on historical data
     */
    private function calculatePerformanceMetrics(int $shopId, Carbon $startDate, Carbon $endDate): array
    {
        // Calculate date range for comparison (previous period of same length)
        $daysDiff = $endDate->copy()->diffInDays($startDate) + 1;
        $previousStartDate = $startDate->copy()->subDays($daysDiff);
        $previousEndDate = $startDate->copy()->subDay();

        // Current period metrics
        $currentSignups = Customer::where('shop_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Get wishlist activity for current period
        $currentWishlistActivity = WishlistItem::where('shop_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Get total spent from customers who made purchases in current period
        $currentRevenue = Customer::where('shop_id', $shopId)
            ->where('orders_count', '>', 0)
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->sum('total_spent');

        // Previous period metrics
        $previousSignups = Customer::where('shop_id', $shopId)
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();

        $previousWishlistActivity = WishlistItem::where('shop_id', $shopId)
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->count();

        $previousRevenue = Customer::where('shop_id', $shopId)
            ->where('orders_count', '>', 0)
            ->whereBetween('updated_at', [$previousStartDate, $previousEndDate])
            ->sum('total_spent'); 

        // Calculate actual values without capping at 100
        $signupValue = $currentSignups;
        $wishlistValue = $currentWishlistActivity;
        $revenueValue = $currentRevenue;
        
        // Store the values for reference
        $signupChange = $currentSignups;
        $wishlistChange = $currentWishlistActivity;
        $revenueChange = $currentRevenue;
            
        // Log the calculated values for debugging
        \Log::info('Marketing Metrics Calculation', [
            'shop_id' => $shopId,
            'date_range' => [
                'current' => [$startDate->toDateString(), $endDate->toDateString()],
                'previous' => [$previousStartDate->toDateString(), $previousEndDate->toDateString()]
            ],
            'signups' => [
                'current' => $currentSignups,
                'previous' => $previousSignups,
                'change' => $signupChange
            ],
            'wishlist_activity' => [
                'current' => $currentWishlistActivity,
                'previous' => $previousWishlistActivity,
                'change' => $wishlistChange
            ],
            'revenue' => [
                'current' => $currentRevenue,
                'previous' => $previousRevenue,
                'change' => $revenueChange
            ]
        ]);

        return [
            [
                'icon' => 'PersonIcon',
                'value' => number_format($signupValue, 0),
                'is_positive' => true,
                'label' => 'more signups',
                'raw_value' => $signupChange,
                'current' => $currentSignups,
                'previous' => $previousSignups
            ],
            [
                'icon' => 'HeartIcon',
                'value' => number_format($wishlistValue, 0),
                'is_positive' => true,
                'label' => 'more wishlist activity',
                'raw_value' => $wishlistChange,
                'current' => $currentWishlistActivity,
                'previous' => $previousWishlistActivity
            ],
            [
                'icon' => 'CartIcon',
                'value' => '$' . number_format($revenueValue, 0),
                'is_positive' => true,
                'label' => 'revenue growth',
                'raw_value' => $revenueChange,
                'current' => $currentRevenue,
                'previous' => $previousRevenue
            ]
        ];
    }

    /**
     * Calculate shopper segments based on wishlist behavior
     */
    private function calculateShopperSegments(int $shopId): array
    {
        // Get all customers with wishlist items
        $customersWithWishlists = DB::table('wishlist_items')
            ->join('customers', 'wishlist_items.customer_id', '=', 'customers.shopify_customer_id')
            ->where('wishlist_items.shop_id', $shopId)
            ->select('customers.id', 'customers.shopify_customer_id', 'customers.total_spent', 'customers.orders_count')
            ->distinct()
            ->get();

        $segments = [
            'havent_bought_yet' => [
                'title' => 'Shoppers who wishlisted and saved the products but haven\'t bought yet',
                'shoppers_count' => 0,
                'wishlisted_value' => 0,
                'description' => 'High-intent customers who need re-engagement'
            ],
            'currently_on_sale' => [
                'title' => 'Shoppers whose wishlisted and saved products are currently on sale',
                'shoppers_count' => 0,
                'wishlisted_value' => 0,
                'description' => 'Opportunity for immediate conversion'
            ],
            'selling_out_fast' => [
                'title' => 'Shoppers whose wishlisted and saved products are selling out fast',
                'shoppers_count' => 0,
                'wishlisted_value' => 0,
                'description' => 'Urgency-driven conversions'
            ],
            'back_in_stock' => [
                'title' => 'Shoppers whose wishlisted and saved products are back in stock',
                'shoppers_count' => 0,
                'wishlisted_value' => 0,
                'description' => 'Re-engagement opportunity'
            ],
            'frequently_wishlisted' => [
                'title' => 'Shoppers whose wishlisted products are frequently wishlisted by others',
                'shoppers_count' => 0,
                'wishlisted_value' => 0,
                'description' => 'Trending products for promotion'
            ]
        ];

        foreach ($customersWithWishlists as $customer) {
            // Get customer's wishlist items
            $wishlistItems = WishlistItem::where('wishlist_items.shop_id', $shopId)
                ->where('customer_id', $customer->shopify_customer_id)
                ->get();

            $totalWishlistedValue = 0;
            $hasOnSaleItems = false;
            $hasLowStockItems = false;
            $hasBackInStockItems = false;

            // Get all products for these wishlist items in one query
            $productIds = $wishlistItems->pluck('product_id')->unique()->toArray();
            $products = Product::where('shop_id', $shopId)
                ->whereIn('shopify_product_id', $productIds)
                ->get()
                ->keyBy('shopify_product_id');

            foreach ($wishlistItems as $item) {
                // Get the product price from wishlist item
                $itemPrice = $item->current_price ?? 0;
                $originalPrice = $item->added_price ?? 0;
                
                // Add to total wishlisted value
                $totalWishlistedValue += $itemPrice;
                
                // Check if product is on sale (current price is less than original price)
                if ($originalPrice > 0 && $itemPrice > 0 && $itemPrice < $originalPrice) {
                    $hasOnSaleItems = true;
                }
                
                // Get product from preloaded collection
                $product = $products[$item->product_id] ?? null;
                
                if ($product) {
                    // Check if product is low stock
                    if (isset($product->stock)) {
                        if ($product->stock <= 5) {
                            $hasLowStockItems = true;
                        }
                        
                        // Check if product is back in stock
                        // We'll consider it "back in stock" if:
                        // 1. Current stock is > 0
                        // 2. The product was updated recently (within last 7 days)
                        // 3. It has a price (indicates it's an active product)
                        $recentlyUpdated = $product->updated_at > now()->subDays(7);
                        $hasPrice = ($itemPrice > 0) || ($product->price > 0);
                        
                        if ($product->stock > 0 && $recentlyUpdated && $hasPrice) {
                            $hasBackInStockItems = true;
                        }
                    }
                }
            }

            // Categorize customer based on their wishlist items
            if ($customer->orders_count == 0) {
                $segments['havent_bought_yet']['shoppers_count']++;
                $segments['havent_bought_yet']['wishlisted_value'] += $totalWishlistedValue;
            }

            if ($hasOnSaleItems) {
                $segments['currently_on_sale']['shoppers_count']++;
                $segments['currently_on_sale']['wishlisted_value'] += $totalWishlistedValue;
            }

            if ($hasLowStockItems) {
                $segments['selling_out_fast']['shoppers_count']++;
                $segments['selling_out_fast']['wishlisted_value'] += $totalWishlistedValue;
            }

            if ($hasBackInStockItems) {
                $segments['back_in_stock']['shoppers_count']++;
                $segments['back_in_stock']['wishlisted_value'] += $totalWishlistedValue;
            }

            // For frequently wishlisted, we'll use a simple heuristic
            if (count($wishlistItems) > 3) {
                $segments['frequently_wishlisted']['shoppers_count']++;
                $segments['frequently_wishlisted']['wishlisted_value'] += $totalWishlistedValue;
            }
        }

        return $segments;
    }

    /**
     * Calculate potential revenue from wishlisted items
     */
    private function calculatePotentialRevenue(int $shopId): array
    {
        $totalPotentialRevenue = WishlistItem::where('wishlist_items.shop_id', $shopId)
            ->join('products', function($join) use ($shopId) {
                $join->on('wishlist_items.product_id', '=', 'products.shopify_product_id')
                     ->where('products.shop_id', '=', $shopId);
            })
            ->sum('products.price');

        $customersWithWishlists = WishlistItem::where('wishlist_items.shop_id', $shopId)
            ->distinct('customer_id')
            ->count('customer_id');

        $wishlistedProducts = WishlistItem::where('wishlist_items.shop_id', $shopId)->count();

        return [
            'total_potential_revenue' => $totalPotentialRevenue,
            'customers_count' => $customersWithWishlists,
            'products_count' => $wishlistedProducts,
            'formatted_revenue' => 'P' . number_format($totalPotentialRevenue, 0)
        ];
    }

    /**
     * Get marketing activity data
     */
    private function getMarketingActivity(int $shopId): array
    {
        // This would typically come from your marketing automation system
        // For now, we'll return sample data based on your existing structure
        return [
            [
                'title' => 'Wishlist Reminder',
                'status' => 'Live',
                'schedule_time' => 'Recurring',
                'last_updated' => Carbon::now()->subDays(2)->format('M j, Y'),
                'type' => 'wishlist_reminder'
            ],
            [
                'title' => 'Send Price Drop alert',
                'status' => 'Live',
                'schedule_time' => 'Recurring',
                'last_updated' => Carbon::now()->subDays(1)->format('M j, Y'),
                'type' => 'price_drop_alert'
            ],
            [
                'title' => 'Send Back in stock alerts',
                'status' => 'Live',
                'schedule_time' => 'Recurring',
                'last_updated' => Carbon::now()->subDays(3)->format('M j, Y'),
                'type' => 'back_in_stock_alert'
            ],
            [
                'title' => 'Send low stock Alerts',
                'status' => 'Live',
                'schedule_time' => 'Recurring',
                'last_updated' => Carbon::now()->subDays(4)->format('M j, Y'),
                'type' => 'low_stock_alert'
            ],
            [
                'title' => 'Send reminders on Items Saved for Later',
                'status' => 'Live',
                'schedule_time' => 'Recurring',
                'last_updated' => Carbon::now()->subDays(5)->format('M j, Y'),
                'type' => 'saved_for_later_reminder'
            ]
        ];
    }

    /**
     * Get integration status
     */
    private function getIntegrationStatus(int $shopId): array
    {
        try {
            // Check if notification_providers table exists
            if (!Schema::hasTable('notification_providers')) {
                return [
                    'is_connected' => false,
                    'provider_name' => null,
                    'connection_type' => 'Email',
                    'last_sync' => null
                ];
            }

            // Check if any notification providers are configured for this shop
            // Since the table uses session_id, we need to find the session for this shop
            $session = Session::where('id', $shopId)->first();
            
            if (!$session) {
                return [
                    'is_connected' => false,
                    'provider_name' => null,
                    'connection_type' => 'Email',
                    'last_sync' => null
                ];
            }

            $provider = DB::table('notification_providers')
                ->where('session_id', $session->id)
                ->first();

            // Debug logging
            \Log::info("Integration Status Debug - Session ID: {$session->id}, Provider found: " . ($provider ? 'Yes' : 'No'));

            if ($provider) {
                $providerName = $provider->email_provider ?: $provider->sms_provider ?: 'Unknown';
                $providerSettings = $provider->provider_settings ? json_decode($provider->provider_settings, true) : [];
                
                \Log::info("Provider details - Email: {$provider->email_provider}, SMS: {$provider->sms_provider}");
                \Log::info("Provider settings: " . json_encode($providerSettings));
                
                // Check if Klaviyo is connected (has API key)
                $isKlaviyoConnected = isset($providerSettings['klaviyo_api_key']) && !empty($providerSettings['klaviyo_api_key']);
                
                if ($isKlaviyoConnected) {
                    return [
                        'is_connected' => true,
                        'provider_name' => 'Klaviyo',
                        'connection_type' => 'Email',
                        'last_sync' => Carbon::now()->subHours(2)->format('M j, Y \a\t g:i A')
                    ];
                }
                
                return [
                    'is_connected' => true,
                    'provider_name' => $providerName,
                    'connection_type' => $provider->email_provider ? 'Email' : ($provider->sms_provider ? 'SMS' : 'Unknown'),
                    'last_sync' => Carbon::now()->subHours(2)->format('M j, Y \a\t g:i A')
                ];
            }

            return [
                'is_connected' => false,
                'provider_name' => null,
                'connection_type' => 'Email',
                'last_sync' => null
            ];
        } catch (\Exception $e) {
            // If there's any error, return default disconnected status
            return [
                'is_connected' => false,
                'provider_name' => null,
                'connection_type' => 'Email',
                'last_sync' => null
            ];
        }
    }
}

