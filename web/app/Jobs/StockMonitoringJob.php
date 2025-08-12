<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Product;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Models\Session;
use App\Models\SubscriptionWebNotification;
use App\Services\WishlistNotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StockMonitoringJob implements ShouldQueue
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
        $shops = Session::all();
        $notificationService = new WishlistNotificationService();
        $totalProcessed = 0;
        
        foreach ($shops as $shop) {
            // Process Low Stock Alerts
            $this->processLowStockAlerts($shop, $notificationService);
            
            // Process Back-in-Stock Alerts
            $this->processBackInStockAlerts($shop, $notificationService);
            
            // Process Price Drop Alerts
            $this->processPriceDropAlerts($shop, $notificationService);
            
            $totalProcessed++;
        }
        
    }

    /**
     * Process low stock alerts for a shop
     *
     * @param Session $shop
     * @param WishlistNotificationService $notificationService
     * @return void
     */
    private function processLowStockAlerts(Session $shop, WishlistNotificationService $notificationService)
    {
        
        $lowStockAlert = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'low_stock_alert')
            ->where('active_status', 1)
            ->first();

        if (!$lowStockAlert) {
            
            $allLowStockAlerts = SubscriptionWebNotification::where('session_id', $shop->id)
                ->where('notification_type', 'low_stock_alert')
                ->get();
            
            return;
        }

        $threshold = $lowStockAlert->low_stock_value ?? 0;



        // Debug: Check if email templates exist
        $lowStockTemplate = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'low_stock_alert')
            ->where('active_status', 1)
            ->first();
        
        $backInStockTemplate = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'back_in_stock_alert')
            ->where('active_status', 1)
            ->first();


        // Get all wishlists for this shop
        $wishlists = Wishlist::where('shop_id', $shop->id)->get();

        
      

        $sentCount = 0;
        $totalLowStockItems = 0;

        foreach ($wishlists as $wishlist) {
           
            
            $lowStockItems = [];
            $items = WishlistItem::where('wishlist_id', $wishlist->id)->get();
          
            
            foreach ($items as $item) {
              
                
                // Debug: Check what products exist in database
                $allProducts = Product::where('shop_id', $shop->id)->get();
              
                
                $product = Product::where('shopify_product_id', $item->product_id)
                    ->where('shop_id', $shop->id)
                    ->first();
                if ($product) {
                    
                    if (isset($product->stock) && $product->stock <= $threshold) {
                        $lowStockItems[] = $product;
                    } else {
                    }
                }
            }

            $totalLowStockItems += count($lowStockItems);

            if (count($lowStockItems) > 0) {
               
                
                try {
                    $result = $notificationService->sendLowStockAlertEmail($wishlist->customer_id, $wishlist, $shop, $lowStockItems);
                    if ($result) {
                        $sentCount++;
                    }
                } catch (\Exception $e) {
                    Log::error("❌ Exception sending low stock alert email for wishlist ID: {$wishlist->id} - " . $e->getMessage());
                    Log::error("Exception trace: " . $e->getTraceAsString());
                }
            }
        }

      
    }

    /**
     * Process back-in-stock alerts for a shop
     *
     * @param Session $shop
     * @param WishlistNotificationService $notificationService
     * @return void
     */
    private function processBackInStockAlerts(Session $shop, WishlistNotificationService $notificationService)
    {
       
        
        $backInStockAlert = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'back_in_stock_alert')
            ->where('active_status', 1)
            ->first();

        if (!$backInStockAlert) {
           
            
            $allBackInStockAlerts = SubscriptionWebNotification::where('session_id', $shop->id)
                ->where('notification_type', 'back_in_stock_alert')
                ->get();
            
           
            foreach ($allBackInStockAlerts as $alert) {
              
            }
            return;
        }

       

        // Get all wishlists for this shop
        $wishlists = Wishlist::where('shop_id', $shop->id)->get();
      
        
        if ($wishlists->count() == 0) {
            return;
        }

        $sentCount = 0;
        $totalBackInStockItems = 0;

        foreach ($wishlists as $wishlist) {
         
            
            $backInStockItems = [];
            $items = WishlistItem::where('wishlist_id', $wishlist->id)->get();
          
            
            foreach ($items as $item) {
              
                
                $product = Product::where('shopify_product_id', $item->product_id)
                    ->where('shop_id', $shop->id)
                    ->first();
                if ($product) {
                 
                    
                    if (isset($product->stock) && $product->stock > 0) {
                        $backInStockItems[] = $product;
                       
                    }
                }
            }

          
            $totalBackInStockItems += count($backInStockItems);

            if (count($backInStockItems) > 0) {
            
                
                try {
                    $result = $notificationService->sendBackInStockAlertEmail($wishlist->customer_id, $wishlist, $shop, $backInStockItems);
                    if ($result) {
                        $sentCount++;
                    }
                } catch (\Exception $e) {
                   
                }
            }
        }

       
    }

    /**
     * Process price drop alerts for a shop
     *
     * @param Session $shop
     * @param WishlistNotificationService $notificationService
     * @return void
     */
    private function processPriceDropAlerts(Session $shop, WishlistNotificationService $notificationService)
    {
      
        
        $priceDropAlert = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'price_drop_alert')
            ->where('active_status', 1)
            ->first();

        if (!$priceDropAlert) {
           
            
            $allPriceDropAlerts = SubscriptionWebNotification::where('session_id', $shop->id)
                ->where('notification_type', 'price_drop_alert')
                ->get();
            
         
        
            return;
        }

        $threshold = $priceDropAlert->price_drop_value ?? 0;


        if ($threshold <= 0) {
       
            return;
        }

      

        // Get all wishlists for this shop
        $wishlists = Wishlist::where('shop_id', $shop->id)->get();
        Log::info("Found " . $wishlists->count() . " wishlists for shop: {$shop->shop}");
        
        if ($wishlists->count() == 0) {
            Log::info("❌ No wishlists found for shop: {$shop->shop}");
            return;
        }

        $sentCount = 0;
        $totalPriceDropItems = 0;

        foreach ($wishlists as $wishlist) {
            Log::info("Processing wishlist ID: {$wishlist->id} for customer: {$wishlist->customer_id}");
            
            $priceDropItems = [];
            $items = WishlistItem::where('wishlist_id', $wishlist->id)->get();
            Log::info("Found " . $items->count() . " items in wishlist {$wishlist->id}");
            
            foreach ($items as $item) {
                Log::info("Checking wishlist item - Product ID: {$item->product_id}, Shop ID: {$shop->id}");
                
                // Skip items without price tracking
                if (!$item->added_price || !$item->current_price) {
                    Log::info("❌ Wishlist item {$item->id} missing price data - Added: {$item->added_price}, Current: {$item->current_price}");
                    continue;
                }
                
                $product = Product::where('shopify_product_id', $item->product_id)
                    ->where('shop_id', $shop->id)
                    ->first();
                if ($product) {
                    Log::info("Product ID: {$product->id}, Title: {$product->title}, Added Price: {$item->added_price}, Current Price: {$item->current_price}");
                    
                    // Check if price has dropped by the threshold percentage
                    $priceDrop = $item->added_price - $item->current_price;
                    $priceDropPercentage = ($priceDrop / $item->added_price) * 100;
                    
                    Log::info("Price drop: $priceDrop, Percentage: {$priceDropPercentage}%, Threshold: $threshold");
                    
                    if ($priceDrop > 0 && $priceDropPercentage >= $threshold) {
                        // Update the product with current price data for the email
                        $product->old_price = $item->added_price;
                        $product->price = $item->current_price;
                        $priceDropItems[] = $product;
                        Log::info("✅ Added to price drop items: {$product->title} (Drop: {$priceDropPercentage}%)");
                    } else {
                        Log::info("❌ Product NOT added - Price drop: {$priceDropPercentage}%, Threshold: $threshold");
                    }
                } else {
                    Log::info("❌ Product not found for Shopify product ID: {$item->product_id}");
                }
            }

            Log::info("Price drop items found for wishlist {$wishlist->id}: " . count($priceDropItems));
            $totalPriceDropItems += count($priceDropItems);

            if (count($priceDropItems) > 0) {
                Log::info("Attempting to send price drop alert email for wishlist ID: {$wishlist->id}");
                
                try {
                    $result = $notificationService->sendPriceDropAlertEmail($wishlist->customer_id, $wishlist, $shop, $priceDropItems);
                    if ($result) {
                        $sentCount++;
                        Log::info("✅ Sent price drop alert email for wishlist ID: {$wishlist->id} with " . count($priceDropItems) . " price drop items");
                    } else {
                        Log::error("❌ Failed to send price drop alert email for wishlist ID: {$wishlist->id}");
                    }
                } catch (\Exception $e) {
                    Log::error("❌ Exception sending price drop alert email for wishlist ID: {$wishlist->id} - " . $e->getMessage());
                    Log::error("Exception trace: " . $e->getTraceAsString());
                }
            }
        }

        Log::info("--- PRICE DROP ALERTS SUMMARY ---");
        Log::info("Total wishlists processed: " . $wishlists->count());
        Log::info("Total price drop items found: $totalPriceDropItems");
        Log::info("Emails sent successfully: $sentCount");
    }
} 