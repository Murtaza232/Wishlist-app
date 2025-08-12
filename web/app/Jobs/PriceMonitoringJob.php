<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\WishlistItem;
use App\Models\Session;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\Session as ShopifySession;

class PriceMonitoringJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $now = Carbon::now();
        Log::info('=== STARTING PRICE MONITORING JOB ===');
        Log::info('Starting price monitoring job at ' . $now);
        
        $shops = Session::all();
        Log::info('Total shops found: ' . $shops->count());
        
        $totalProcessed = 0;
        
        foreach ($shops as $shop) {
            Log::info('=== PROCESSING SHOP: ' . $shop->shop . ' (ID: ' . $shop->id . ') ===');
            
            // Debug shop data
            Log::info('Shop details:', [
                'id' => $shop->id,
                'shop' => $shop->shop,
                'access_token_exists' => !empty($shop->access_token)
            ]);
            
            // Process Price Updates
            $this->processPriceUpdates($shop);
            
            $totalProcessed++;
        }
        
        Log::info("=== PRICE MONITORING JOB COMPLETED ===");
        Log::info("Price monitoring job completed. Processed $totalProcessed shops.");
    }

    /**
     * Process price updates for a shop
     *
     * @param Session $shop
     * @return void
     */
    private function processPriceUpdates(Session $shop)
    {
        Log::info('--- PROCESSING PRICE UPDATES ---');
        
        // Get all wishlist items for this shop that need price updates
        $wishlistItems = WishlistItem::where('shop_id', $shop->id)
            ->whereNotNull('added_price')
            ->get();
        
        Log::info("Found " . $wishlistItems->count() . " wishlist items to check for price updates");
        
        if ($wishlistItems->count() == 0) {
            Log::info("❌ No wishlist items found for shop: {$shop->shop}");
            return;
        }

        $updatedCount = 0;
        $errorCount = 0;

        foreach ($wishlistItems as $item) {
            Log::info("Checking price for wishlist item - Product ID: {$item->product_id}, Shop ID: {$shop->id}");
            
            try {
                // Get current price from products table
                $product = Product::where('shopify_product_id', $item->product_id)
                    ->where('shop_id', $shop->id)
                    ->first();
                
                if ($product) {
                    $currentPrice = $product->price ?? 0;
                    Log::info("Product ID: {$item->product_id}, Old Price: {$item->current_price}, New Price: $currentPrice");
                    
                    // Update the wishlist item with new current price
                    $item->update([
                        'current_price' => $currentPrice,
                        'price_checked_at' => now(),
                    ]);
                    
                    $updatedCount++;
                    Log::info("✅ Updated price for product ID: {$item->product_id}");
                } else {
                    Log::warning("❌ Product not found in database for product ID: {$item->product_id}");
                    $errorCount++;
                }
                
            } catch (\Exception $e) {
                $errorCount++;
                Log::error("❌ Error updating price for product ID: {$item->product_id} - " . $e->getMessage());
            }
        }

        Log::info("--- PRICE UPDATES SUMMARY ---");
        Log::info("Total wishlist items processed: " . $wishlistItems->count());
        Log::info("Successfully updated: $updatedCount");
        Log::info("Errors: $errorCount");
    }

    /**
     * Create Shopify API client
     */
    private function shopifyApiClient($shop_name)
    {
        $shop = Session::where('shop', $shop_name)->first();
        
        // Create options for the API
        $options = new Options();
        $options->setType(true);
        $options->setVersion(env('SHOPIFY_API_VERSION'));
        $options->setApiKey(env('SHOPIFY_API_KEY'));
        $options->setApiSecret(env('SHOPIFY_API_SECRET'));
        $options->setApiPassword($shop->access_token);

        // Create the client and session
        $api = new BasicShopifyAPI($options);
        $api->setSession(new ShopifySession($shop->shop));
        return $api;
    }
} 