<?php

namespace App\Services;

use App\Models\FrequentlyWishlistedAlert;
use App\Models\FrequentlyWishlistedAlertLog;
use App\Models\Customer;
use App\Models\WishlistItem;
use App\Models\Product;
use App\Models\Session;
use App\Mail\FrequentlyWishlistedEmail;
use Illuminate\Support\Facades\Mail;
use App\Services\UsageService;
use Illuminate\Support\Facades\Log;

class FrequentlyWishlistedService
{
    public function ensureConfig(Session $session): FrequentlyWishlistedAlert
    {
        return FrequentlyWishlistedAlert::firstOrCreate(
            ['session_id' => $session->id],
            ['active_status' => false, 'threshold' => 5]
        );
    }

    /**
     * Compute trending wishlist products and notify customers who have them.
     */
    public function run(Session $session): array
    {
        $config = $this->ensureConfig($session);
        if (!$config->active_status) {
            return ['success' => true, 'message' => 'Feature disabled'];
        }

        $threshold = $config->threshold;

        // Aggregate wish counts per product for this shop
        $counts = WishlistItem::where('shop_id', $session->id)
            ->selectRaw('product_id, COUNT(*) as wish_count')
            ->groupBy('product_id')
            ->having('wish_count', '>=', $threshold)
            ->get();

        $trendingProductIds = $counts->pluck('product_id')->all();
        if (empty($trendingProductIds)) {
            return ['success' => true, 'message' => 'No trending products'];
        }

        // For each customer with wishlist items in trending products, notify once per product
        $customers = Customer::where('shop_id', $session->id)->get(['id', 'shopify_customer_id', 'email']);
        $notified = 0;

        foreach ($customers as $customer) {
            if (empty($customer->email)) continue;

            $customerItems = WishlistItem::where('shop_id', $session->id)
                ->where('customer_id', $customer->shopify_customer_id)
                ->whereIn('product_id', $trendingProductIds)
                ->get(['product_id']);

            if ($customerItems->isEmpty()) continue;

            $productSummaries = [];
            foreach ($customerItems as $item) {
                // skip if already sent for this product
                $exists = FrequentlyWishlistedAlertLog::where('session_id', $session->id)
                    ->where('customer_id', $customer->shopify_customer_id)
                    ->where('product_id', $item->product_id)
                    ->exists();
                if ($exists) continue;

                $product = Product::where('shop_id', $session->id)
                    ->where('shopify_product_id', $item->product_id)
                    ->first();
                if ($product) {
                    $productSummaries[] = [
                        'title' => $product->title ?? 'Product',
                        'url' => $product->handle ? ('https://' . $session->shop . '/products/' . $product->handle) : null,
                    ];
                    FrequentlyWishlistedAlertLog::create([
                        'session_id' => $session->id,
                        'customer_id' => $customer->shopify_customer_id,
                        'product_id' => $item->product_id,
                        'sent_at' => now(),
                    ]);
                }
            }

            if (!empty($productSummaries)) {
                // Check usage limits before sending notification
                if (!UsageService::isActionAllowed($session->shop, 'send_notification')) {
                    Log::info("Frequently wishlisted notification blocked due to usage limit reached for shop: {$session->shop}");
                    continue; // Skip this customer but continue with others
                }
                
                Mail::to($customer->email)->send(new FrequentlyWishlistedEmail($productSummaries, $session->shop));
                
                // Track usage after successful notification
                UsageService::trackUsage($session->shop, 'send_notification');
                
                $notified++;
            }
        }

        $config->last_run_at = now();
        $config->save();

        return ['success' => true, 'message' => 'Notifications sent', 'count' => $notified];
    }
}


