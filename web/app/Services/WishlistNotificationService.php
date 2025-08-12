<?php

namespace App\Services;

use App\Mail\WishlistSignupConfirmation;
use App\Models\WishlistFeature;
use App\Models\SubscriptionWebNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\Session;
use App\Models\Session as SessionModel;

class WishlistNotificationService
{
    public function __construct()
    {
        Log::info('WishlistNotificationService constructor called');
    }

    /**
     * Send sign-up confirmation email when a wishlist is created
     */
    public function sendSignupConfirmationEmail($customerId, $wishlist, $shop)
    { 
        // return $customerId;
        try { 
            // $features = WishlistFeature::where('shop_id', $shop->id)->first();
            
            // Get the email template
            $emailTemplate = $this->getEmailTemplate($shop->id);
            if (!$emailTemplate) {
                // Try to create default templates if they don't exist
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                
                // Try again after creating defaults
                $emailTemplate = $this->getEmailTemplate($shop->id);
                if (!$emailTemplate) {
                    Log::error('Email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            // Get customer data from Shopify
            $customerData = $this->getCustomerData($customerId, $shop);
            if (!$customerData) {
                Log::error('Customer data not found for customer ID: ' . $customerId);
                return false;
            }
           
            $shopData = $this->getShop($shop);
        //    return $customerData;
            // Prepare wishlist data
            $wishlistData = [
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop)
            ];
            // return $wishlistData;
            // Send the email
            // return $emailTemplate;
            // dd($customerData['email']);
            // return  gettype($wishlistData);
            Mail::to($customerData['email'])->send(new WishlistSignupConfirmation(
                $customerData,
                $shopData ,
                $wishlistData,
                $emailTemplate
            ));

            Log::info('Sign-up confirmation email sent successfully to: ' . $customerData['email']);
            return true;

        } catch (\Exception $e) {
            Log::error('Error sending sign-up confirmation email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send wishlist shared email when a wishlist is shared
     */
    public function sendWishlistSharedEmail($customerId, $wishlist, $shop)
    {
        try {
            // Get the email template for wishlist shared
            $emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_shared');
            // return $emailTemplate;
            if (!$emailTemplate) {
                // Try to create default templates if they don't exist
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                // Try again after creating defaults
                $emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_shared');
                if (!$emailTemplate) {
                    Log::error('Wishlist shared email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            // return $shopData;
            // Get customer data from Shopify
            
            $customerData = $this->getCustomerData($customerId, $shop);
            // return $customerData;
            if (!$customerData) {
                Log::error('Customer data not found for customer ID: ' . $customerId);
                return false;
            }
            // return $customerData;
            $shopData = $this->getShop($shop);
            // Prepare wishlist data
            $wishlistData = [
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop)
            ];
            // return $wishlistData;
            // Send the email
            //    return  gettype($wishlistData);
            
            Mail::to($customerData['email'])->send(new \App\Mail\WishlistSharedNotification(
                $customerData,
                $shopData,
                $wishlistData,
                $emailTemplate
            ));
            Log::info('Wishlist shared email sent successfully to: ' . $customerData['email']);
            return true;
        } catch (\Exception $e) {
            Log::error('Error sending wishlist shared email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send wishlist reminder email
     */
    public function sendWishlistReminderEmail($customerId, $wishlist, $shop)
    {
        try {
            // Get the email template for wishlist reminder
            $emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_reminder');
            if (!$emailTemplate) {
                // Try to create default templates if they don't exist
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                // Try again after creating defaults
                $emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_reminder');
                if (!$emailTemplate) {
                    Log::error('Wishlist reminder email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            // Get customer data from Shopify
            $customerData = $this->getCustomerData($customerId, $shop);
            if (!$customerData) {
                Log::error('Customer data not found for customer ID: ' . $customerId);
                return false;
            }
            $shopData = $this->getShop($shop);
            // Prepare wishlist data
            $wishlistData = [
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop),
                'count' => \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->count(),
            ];

            // Build product data (first item)
            $productData = null;
            try {
                $firstItem = \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)
                    ->orderBy('id', 'asc')
                    ->first();
                if ($firstItem) {
                    $product = \App\Models\Product::where('shop_id', $shop->id)
                        ->where('shopify_product_id', $firstItem->product_id)
                        ->first();
                    $title = $product->title ?? '';
                    $price = $product->price ?? ($firstItem->current_price ?? '');
                    $productUrl = 'https://' . $shop->shop . '/products/' . ($product->handle ?? $firstItem->product_id);
                    $productData = [
                        'title' => $title,
                        'price' => $price,
                        'url' => $productUrl,
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Could not build product data for wishlist reminder: ' . $e->getMessage());
            }
            // Send the email
            Mail::to($customerData['email'])->send(new \App\Mail\WishlistSharedNotification(
                $customerData,
                $shopData,
                $wishlistData,
                $emailTemplate,
                $productData
            ));
            Log::info('Wishlist reminder email sent successfully to: ' . $customerData['email']);
            return true;
        } catch (\Exception $e) {
            Log::error('Error sending wishlist reminder email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send saved for later reminder email
     */
    public function sendSavedForLaterReminderEmail($customerId, $wishlist, $shop)
    {
        try {
            // Get the email template for saved for later reminder
            $emailTemplate = $this->getEmailTemplate($shop->id, 'saved_for_later_reminder');
            if (!$emailTemplate) {
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                $emailTemplate = $this->getEmailTemplate($shop->id, 'saved_for_later_reminder');
                if (!$emailTemplate) {
                    Log::error('Saved for later reminder email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            $customerData = $this->getCustomerData($customerId, $shop);
            if (!$customerData) {
                Log::error('Customer data not found for customer ID: ' . $customerId);
                return false;
            }
            $shopData = $this->getShop($shop);
            $wishlistData = [
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop),
                'count' => \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->count(),
            ];

            // Build product data (first item)
            $productData = null;
            try {
                $firstItem = \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)
                    ->orderBy('id', 'asc')
                    ->first();
                if ($firstItem) {
                    $product = \App\Models\Product::where('shop_id', $shop->id)
                        ->where('shopify_product_id', $firstItem->product_id)
                        ->first();
                    $title = $product->title ?? '';
                    $price = $product->price ?? ($firstItem->current_price ?? '');
                    $productUrl = 'https://' . $shop->shop . '/products/' . ($product->handle ?? $firstItem->product_id);
                    $productData = [
                        'title' => $title,
                        'price' => $price,
                        'url' => $productUrl,
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Could not build product data for saved-for-later reminder: ' . $e->getMessage());
            }

            Mail::to($customerData['email'])->send(new \App\Mail\WishlistSharedNotification(
                $customerData,
                $shopData,
                $wishlistData,
                $emailTemplate,
                $productData
            ));
            Log::info('Saved for later reminder email sent successfully to: ' . $customerData['email']);
            return true;
        } catch (\Exception $e) {
            Log::error('Error sending saved for later reminder email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send low stock alert email
     */
    public function sendLowStockAlertEmail($customerId, $wishlist, $shop, $lowStockItems)
    {
        Log::info("=== SENDING LOW STOCK ALERT EMAIL ===");
        Log::info("Customer ID: $customerId, Wishlist ID: {$wishlist->id}, Shop: {$shop->shop}");
        Log::info("Low stock items count: " . count($lowStockItems));
        
        // Debug: Log each low stock item
        foreach ($lowStockItems as $index => $item) {
            Log::info("Low stock item $index: ID {$item->id}, Title: {$item->title}, Stock: {$item->stock}");
        }
        
        try {
            // Get the email template for low stock alert
            $emailTemplate = $this->getEmailTemplate($shop->id, 'low_stock_alert');
            Log::info("Email template found: " . ($emailTemplate ? 'YES' : 'NO'));
            
            if (!$emailTemplate) {
                Log::info("Creating default templates...");
                // Try to create default templates if they don't exist
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                // Try again after creating defaults
                $emailTemplate = $this->getEmailTemplate($shop->id, 'low_stock_alert');
                Log::info("Email template after creating defaults: " . ($emailTemplate ? 'YES' : 'NO'));
                
                if (!$emailTemplate) {
                    Log::error('❌ Low stock alert email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            // dd($emailTemplate);
            // Get customer data from Shopify
            $customerData = $this->getCustomerData($customerId, $shop);
            Log::info("Customer data found: " . ($customerData ? 'YES' : 'NO'));
            
            if (!$customerData) {
                Log::error('❌ Customer data not found for customer ID: ' . $customerId);
                return false;
            }
            
            Log::info("Customer email: " . ($customerData['email'] ?? 'NOT FOUND'));
            
            $shopData = $this->getShop($shop);
            Log::info("Shop data found: " . ($shopData ? 'YES' : 'NO'));
            
            // Prepare wishlist data
            $wishlistData = [
                'id' => $wishlist->id,
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop),
                'count' => \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->count()
            ];
            
            Log::info("Wishlist data prepared:", $wishlistData);
            
            // Send the email
            Log::info("Attempting to send email to: " . $customerData['email']);
            
            Mail::to($customerData['email'])->send(new \App\Mail\LowStockAlert(
                $customerData,
                $shopData,
                $wishlistData,
                $emailTemplate,
                $lowStockItems
            ));
            
            Log::info('✅ Low stock alert email sent successfully to: ' . $customerData['email']);
            return true;
            
        } catch (\Exception $e) {
            Log::error('❌ Error sending low stock alert email: ' . $e->getMessage());
            Log::error('Exception file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Exception trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Send back-in-stock alert email
     */
    public function sendBackInStockAlertEmail($customerId, $wishlist, $shop, $backInStockItems)
    {
        Log::info("=== SENDING BACK-IN-STOCK ALERT EMAIL ===");
        Log::info("Customer ID: $customerId, Wishlist ID: {$wishlist->id}, Shop: {$shop->shop}");
        Log::info("Back-in-stock items count: " . count($backInStockItems));
        
        try {
            // Get the email template for back-in-stock alert
            $emailTemplate = $this->getEmailTemplate($shop->id, 'back_in_stock_alert');
            Log::info("Email template found: " . ($emailTemplate ? 'YES' : 'NO'));
            
            if (!$emailTemplate) {
                Log::info("Creating default templates...");
                // Try to create default templates if they don't exist
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                // Try again after creating defaults
                $emailTemplate = $this->getEmailTemplate($shop->id, 'back_in_stock_alert');
                Log::info("Email template after creating defaults: " . ($emailTemplate ? 'YES' : 'NO'));
                
                if (!$emailTemplate) {
                    Log::error('❌ Back-in-stock alert email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            
            // Get customer data from Shopify
            $customerData = $this->getCustomerData($customerId, $shop);
            Log::info("Customer data found: " . ($customerData ? 'YES' : 'NO'));
            
            if (!$customerData) {
                Log::error('❌ Customer data not found for customer ID: ' . $customerId);
                return false;
            }
            
            Log::info("Customer email: " . ($customerData['email'] ?? 'NOT FOUND'));
            
            $shopData = $this->getShop($shop);
            Log::info("Shop data found: " . ($shopData ? 'YES' : 'NO'));
            
            // Prepare wishlist data
            $wishlistData = [
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop)
            ];
            
            Log::info("Wishlist data prepared:", $wishlistData);
            
            // Send the email
            Log::info("Attempting to send email to: " . $customerData['email']);
            
            Mail::to($customerData['email'])->send(new \App\Mail\BackInStockAlert(
                $customerData,
                $shopData,
                $wishlistData,
                $emailTemplate,
                $backInStockItems
            ));
            
            Log::info('✅ Back-in-stock alert email sent successfully to: ' . $customerData['email']);
            return true;
            
        } catch (\Exception $e) {
            Log::error('❌ Error sending back-in-stock alert email: ' . $e->getMessage());
            Log::error('Exception file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Exception trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Send price drop alert email
     */
    public function sendPriceDropAlertEmail($customerId, $wishlist, $shop, $priceDropItems)
    {
        Log::info("=== SENDING PRICE DROP ALERT EMAIL ===");
        Log::info("Customer ID: $customerId, Wishlist ID: {$wishlist->id}, Shop: {$shop->shop}");
        Log::info("Price drop items count: " . count($priceDropItems));
        
        // Debug: Log each price drop item
        foreach ($priceDropItems as $index => $item) {
            Log::info("Price drop item $index: ID {$item->id}, Title: {$item->title}, Old Price: {$item->old_price}, New Price: {$item->price}");
        }
        
        try {
            // Get the email template for price drop alert
            $emailTemplate = $this->getEmailTemplate($shop->id, 'price_drop_alert');
            Log::info("Email template found: " . ($emailTemplate ? 'YES' : 'NO'));
            
            if (!$emailTemplate) {
                Log::info("Creating default templates...");
                // Try to create default templates if they don't exist
                $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
                $subscriptionController->createDefaultGeneralWebNotifications($shop);
                // Try again after creating defaults
                $emailTemplate = $this->getEmailTemplate($shop->id, 'price_drop_alert');
                Log::info("Email template after creating defaults: " . ($emailTemplate ? 'YES' : 'NO'));
                
                if (!$emailTemplate) {
                    Log::error('❌ Price drop alert email template not found for shop: ' . $shop->shop);
                    return false;
                }
            }
            
            // Get customer data from Shopify
            $customerData = $this->getCustomerData($customerId, $shop);
            Log::info("Customer data found: " . ($customerData ? 'YES' : 'NO'));
            
            if (!$customerData) {
                Log::error('❌ Customer data not found for customer ID: ' . $customerId);
                return false;
            }
            
            Log::info("Customer email: " . ($customerData['email'] ?? 'NOT FOUND'));
            
            $shopData = $this->getShop($shop);
            Log::info("Shop data found: " . ($shopData ? 'YES' : 'NO'));
            
            // Prepare wishlist data
            $wishlistData = [
                'title' => $wishlist->title,
                'link' => $this->generateWishlistLink($wishlist, $shop)
            ];
            
            Log::info("Wishlist data prepared:", $wishlistData);
            
            // Send the email
            Log::info("Attempting to send email to: " . $customerData['email']);
            
            Mail::to($customerData['email'])->send(new \App\Mail\PriceDropAlert(
                $customerData,
                $shopData,
                $wishlistData,
                $emailTemplate,
                $priceDropItems
            ));
            
            Log::info('✅ Price drop alert email sent successfully to: ' . $customerData['email']);
            return true;
            
        } catch (\Exception $e) {
            Log::error('❌ Error sending price drop alert email: ' . $e->getMessage());
            Log::error('Exception file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Exception trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Get the email template for sign-up confirmation
     */
    private function getEmailTemplate($shopId, $notificationType = 'wishlist_signup_confirmation')
    {
        $notification = SubscriptionWebNotification::where('session_id', $shopId)
            ->where('notification_type', $notificationType)
            ->where('active_status', 1)
            ->first();

        if (!$notification) {
            return null;
        }

        $data = json_decode($notification->data, true);
        return $data['customizedata'] ?? null;
    }

    /**
     * Get customer data from Shopify
     */
    private function getCustomerData($customerId, $shop)
    {   
        // return $customerId;
        $api = $this->shopifyApiClient($shop->shop);
            
        $query = "{
            customer(id: \"gid://shopify/Customer/{$customerId}\") {
                email
                firstName
                lastName
            }
        }";

        $response = $api->graph($query);
        // return $response;
        $customer = $response['body']['data']['customer'] ?? null;
        // return $customer;
        if (!$customer) {
            return null;
        }

        return [
            'first_name' => $customer['firstName'] ?? '',
            'last_name' => $customer['lastName'] ?? '',
            'email' => $customer['email'] ?? '',
        ];
    }

    /**
     * Get shop data
     */

    /**
     * Generate wishlist link
     */
    private function generateWishlistLink($wishlist, $shop)
    {
        $domain = $shop->shop;
        return "https://{$domain}/apps/wishlist?customer_id={$wishlist->customer_id}&wishlist_id={$wishlist->id}";
    }
    public function shopifyApiClient($shop_name=null){
        if($shop_name){
            $shop = SessionModel::where('shop',$shop_name)->first();
        }else{
            $shop = SessionModel::where('shop',config('shopify.shop_name'))->first();
        }
        // Create options for the API
        $options = new Options();
        $options->setType(true);
        $options->setVersion(env('SHOPIFY_API_VERSION'));
        $options->setApiKey(env('SHOPIFY_API_KEY'));
        $options->setApiSecret(env('SHOPIFY_API_SECRET'));
        $options->setApiPassword($shop->access_token);

        // Create the client and session
        $api = new BasicShopifyAPI($options);
        $api->setSession(new Session($shop->shop));
        return $api;
    }
   public function getShop($request)
    {
    
        $shop = null;
        if ($request) {
            $shop = \App\Models\Session::where('shop', $request->get('shop'))->first();
        }
        if ($shop == null) {
            $shop = \App\Models\Session::first();
        }
        
        // Return array with both shop and name fields for email templates
        return [
            'shop' => $shop->shop ?? '',
            'name' => $shop->shop ?? 'Our Store', // Use shop domain as store name
            'id' => $shop->id ?? null
        ];
    }
}
