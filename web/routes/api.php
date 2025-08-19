<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\WishlistConfigurationController;
use App\Http\Controllers\SubscriptionNotificationController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\LanguageController;
use Shopify\Clients\Rest;
use App\Models\Session;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::get('/ensure-templates', function (Request $request) {
    $session = null;
    if ($request) {
        $session = \App\Models\Session::where('shop', $request->get('shop'))->first();
    }
    if ($session == null) {
        $session = \App\Models\Session::first();
    }// Provided by the shopify.auth middleware, guaranteed to be active
    if (!$session) {
        return response()->json(['error' => 'Shop session not found'], 400);
    }
    
    $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
    $subscriptionController->createDefaultGeneralWebNotifications($session);
    
    return response()->json(['status' => 'success', 'message' => 'Templates ensured']);
});
Route::any('/wishlist-configuration', [WishlistConfigurationController::class, 'store']);
Route::get('/wishlist-configuration/show', [WishlistConfigurationController::class, 'show']);
Route::get('/get-themes', [WishlistConfigurationController::class, 'getThemes']);
Route::get('/extension-status', [WishlistConfigurationController::class, 'getExtensionStatus']);
Route::get('/wishlist-editor-url', [WishlistConfigurationController::class, 'EditorUrl']);
Route::get('/wishlist-editor-collectionsurl', [WishlistConfigurationController::class, 'EditorCollectionUrl']);
Route::get('/theme-editor-url', [WishlistConfigurationController::class, 'getThemeEditorUrl']);
Route::any('/wishlist-features-store', [WishlistConfigurationController::class, 'storeOrUpdateFeatures']);
Route::get('/wishlist-metafields', [WishlistConfigurationController::class, 'getWishlistMetafields']);
Route::any('/proxy/wishlist', [WishlistController::class, 'showWishlistPage']);
Route::any('/shop',[WishlistConfigurationController::class,'shop']);
Route::post('/wishlist/add', [WishlistController::class, 'add']);
Route::get('/wishlist/products', [WishlistController::class, 'getWishlistProducts']);
Route::get('/wishlists', [WishlistController::class, 'listWishlists']);
Route::post('/wishlists', [WishlistController::class, 'createWishlist']);
Route::post('/wishlist-items', [WishlistController::class, 'addItemToWishlist']);
Route::any('/wishlist-items-delete', [WishlistController::class, 'deleteWishlistItem']);
Route::get('/wishlist-count', [WishlistController::class, 'getWishlistCount']);
Route::get('/wishlist-stats', [WishlistController::class, 'getWishlistStats']);
Route::delete('/wishlists/{id}', [WishlistController::class, 'destroy']);
Route::any('/wishlists/store-items', [WishlistController::class, 'storeWishlistAndItems']);
Route::any('/subscription-notifications', [SubscriptionNotificationController::class, 'subscription_notifications'])->name('subscription-notifications');
Route::any('/subscription-notification-detail/{id}', [SubscriptionNotificationController::class, 'subscription_notification_detail'])
    ->name('subscription-notification-detail');
Route::any('/subscription-notification-save/{id}', [SubscriptionNotificationController::class, 'subscription_notification_save'])
    ->name('subscription_notification-save');

// Provider selection
Route::get('/notification-providers', [ProviderController::class, 'get']);
Route::post('/notification-providers', [ProviderController::class, 'save']);

// Marketing Analytics Routes
Route::get('/marketing-analytics', [\App\Http\Controllers\MarketingAnalyticsController::class, 'getMarketingAnalytics']);
// Campaign Routes
Route::post('/campaigns/save', [\App\Http\Controllers\CampaignController::class, 'save']);
Route::get('/campaigns/current', [\App\Http\Controllers\CampaignController::class, 'current']);
Route::post('/campaigns/track-signup', [\App\Http\Controllers\CampaignController::class, 'trackSignup']);
Route::get('/campaigns/export', [\App\Http\Controllers\CampaignController::class, 'exportCsv']);
Route::post('/marketing-analytics/export', [\App\Http\Controllers\MarketingAnalyticsController::class, 'exportShopperSegment']);
// Test notification emails
Route::post('/notifications/test-send', [\App\Http\Controllers\NotificationTestController::class, 'sendTest']);

// Test route for wishlist sign-up confirmation email
Route::get('/test-wishlist-signup-email', function (Request $request) {
    try {
        $customerId = $request->input('customer_id');
        $shopDomain = $request->input('shop_domain');
        
        if (!$customerId || !$shopDomain) {
            return response()->json(['error' => 'customer_id and shop_domain are required'], 400);
        }
        
        $shop = \App\Models\Session::where('shop', $shopDomain)->first();
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }
        
        // Check current features
        $features = \App\Models\WishlistFeature::where('shop_id', $shop->id)->first();
        $featuresData = $features ? $features->toArray() : null;
        
        // Ensure default templates exist
        $subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
        $subscriptionController->createDefaultGeneralWebNotifications($shop);
        
        // Create a test wishlist
        $wishlist = \App\Models\Wishlist::create([
            'shop_id' => $shop->id,
            'customer_id' => $customerId,
            'title' => 'Test Wishlist',
        ]);
        
        // Send the email
        $notificationService = new \App\Services\WishlistNotificationService();
        $result = $notificationService->sendSignupConfirmationEmail($customerId, $wishlist, $shop);
        
        // Clean up test wishlist
        $wishlist->delete();
        
        return response()->json([
            'success' => $result,
            'message' => $result ? 'Email sent successfully' : 'Email sending failed or disabled',
            'debug' => [
                'shop_id' => $shop->id,
                'features' => $featuresData,
                'wishlist_created' => $wishlist ? $wishlist->id : null
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

// Route to enable sign-up confirmation for testing
Route::post('/enable-signup-confirmation', function (Request $request) {
    try {
        $shopDomain = $request->input('shop_domain');
        
        if (!$shopDomain) {
            return response()->json(['error' => 'shop_domain is required'], 400);
        }
        
        $shop = \App\Models\Session::where('shop', $shopDomain)->first();
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }
        
        // Find or create features
        $features = \App\Models\WishlistFeature::where('shop_id', $shop->id)->first();
        if (!$features) {
            $features = new \App\Models\WishlistFeature();
            $features->shop_id = $shop->id;
        }
        
        // Enable sign-up confirmation
        $features->sign_up_confirmation = true;
        $features->sign_up_confirmation_email = true;
        $features->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Sign-up confirmation enabled',
            'features' => $features->toArray()
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
Route::any('/subscription-notification-status-save/{id}', [SubscriptionNotificationController::class, 'subscription_notification_status_save'])
    ->name('web-notification_status-save');
    Route::get('/images/{filename}', function ($filename) {
        $path = public_path('images/' . $filename);
        
        if (file_exists($path)) {
            return response()->file($path);
        }
        
        return response()->json(['error' => 'Image not found'], 404);
    })->where('filename', '.*');

// Language Settings Routes
Route::get('/languages', [LanguageController::class, 'getLanguages']);
Route::post('/languages', [LanguageController::class, 'saveLanguage']);
Route::post('/languages/set-active', [LanguageController::class, 'setActiveLanguage']);
Route::get('/languages/active', [LanguageController::class, 'getActiveLanguage']);
Route::delete('/languages', [LanguageController::class, 'deleteLanguage']);

// Wishlist share notification
Route::post('/wishlist/share', [App\Http\Controllers\WishlistController::class, 'shareWishlist']);

Route::post('/webhooks/product-create', [\App\Http\Controllers\ShopifyProductWebhookController::class, 'productCreate']);
Route::post('/webhooks/product-update', [\App\Http\Controllers\ShopifyProductWebhookController::class, 'productUpdate']);
Route::post('/webhooks/product-delete', [\App\Http\Controllers\ShopifyProductWebhookController::class, 'productDelete']);

// Customer Webhook Routes
Route::post('/webhooks/customer-create', [\App\Http\Controllers\CustomerWebhookController::class, 'customerCreate']);
Route::post('/webhooks/customer-update', [\App\Http\Controllers\CustomerWebhookController::class, 'customerUpdate']);
Route::post('/webhooks/customer-delete', [\App\Http\Controllers\CustomerWebhookController::class, 'customerDelete']);

// Route::get('/test-webhook', function () {
//     $session=Session::where('shop','conversion-king-x.myshopify.com')->first();
//     //
//        $client = new Rest($session->shop, $session->access_token);
//        $response = $client->get('/webhooks.json');
//        dd($response->getDecodedBody());
// });

// // Test route for stock monitoring job
// Route::post('/test-stock-monitoring', function (Request $request) {
//     try {
//         $shopDomain = $request->input('shop_domain');
        
//         if (!$shopDomain) {
//             return response()->json(['error' => 'shop_domain is required'], 400);
//         }
        
//         $shop = \App\Models\Session::where('shop', $shopDomain)->first();
//         if (!$shop) {
//             return response()->json(['error' => 'Shop not found'], 404);
//         }
        
//         // Dispatch the stock monitoring job
//         \App\Jobs\StockMonitoringJob::dispatch();
        
//         return response()->json([
//             'success' => true,
//             'message' => 'Stock monitoring job dispatched successfully',
//             'note' => 'Check the logs to see the job execution details'
//         ]);
        
//     } catch (\Exception $e) {
//         return response()->json([
//             'error' => $e->getMessage(),
//             'file' => $e->getFile(),
//             'line' => $e->getLine()
//         ], 500);
//     }
// });

// // Test route for running stock monitoring synchronously
// Route::post('/test-stock-monitoring-sync', function (Request $request) {
//     try {
//         $shopDomain = $request->input('shop_domain');
        
//         if (!$shopDomain) {
//             return response()->json(['error' => 'shop_domain is required'], 400);
//         }
        
//         $shop = \App\Models\Session::where('shop', $shopDomain)->first();
//         if (!$shop) {
//             return response()->json(['error' => 'Shop not found'], 404);
//         }
        
//         // Run the stock monitoring job synchronously
//         $job = new \App\Jobs\StockMonitoringJob();
//         $job->handle();
        
//         return response()->json([
//             'success' => true,
//             'message' => 'Stock monitoring job executed synchronously',
//             'note' => 'Check the logs to see the execution details'
//         ]);
        
//     } catch (\Exception $e) {
//         return response()->json([
//             'error' => $e->getMessage(),
//             'file' => $e->getFile(),
//             'line' => $e->getLine(),
//             'trace' => $e->getTraceAsString()
//         ], 500);
//     }
// });

// // Test route for checking stock monitoring settings
// Route::get('/check-stock-monitoring-settings', function (Request $request) {
//     try {
//         $shopDomain = $request->input('shop_domain');
        
//         if (!$shopDomain) {
//             return response()->json(['error' => 'shop_domain is required'], 400);
//         }
        
//         $shop = \App\Models\Session::where('shop', $shopDomain)->first();
//         if (!$shop) {
//             return response()->json(['error' => 'Shop not found'], 404);
//         }
        
//         // Get stock monitoring settings
//         $lowStockAlert = \App\Models\SubscriptionWebNotification::where('session_id', $shop->id)
//             ->where('notification_type', 'low_stock_alert')
//             ->where('active_status', 1)
//             ->first();
            
//         $backInStockAlert = \App\Models\SubscriptionWebNotification::where('session_id', $shop->id)
//             ->where('notification_type', 'back_in_stock_alert')
//             ->where('active_status', 1)
//             ->first();
        
//         // Get products count
//         $productsCount = \App\Models\Product::where('shop_id', $shop->id)->count();
//         $wishlistsCount = \App\Models\Wishlist::where('shop_id', $shop->id)->count();
        
//         return response()->json([
//             'success' => true,
//             'shop' => [
//                 'id' => $shop->id,
//                 'domain' => $shop->shop
//             ],
//             'settings' => [
//                 'low_stock_alert' => $lowStockAlert ? [
//                     'active' => true,
//                     'threshold' => $lowStockAlert->low_stock_value
//                 ] : ['active' => false],
//                 'back_in_stock_alert' => $backInStockAlert ? [
//                     'active' => true
//                 ] : ['active' => false]
//             ],
//             'counts' => [
//                 'products' => $productsCount,
//                 'wishlists' => $wishlistsCount
//             ]
//         ]);
        
//     } catch (\Exception $e) {
//         return response()->json([
//             'error' => $e->getMessage(),
//             'file' => $e->getFile(),
//             'line' => $e->getLine()
//         ], 500);
//     }

// });
// Route::get('/testemail', function(){
//     // dd('hello');
//     $wishlist = \App\Models\Wishlist::find(1);
//     if (!$wishlist) {
//         return response()->json(['status' => false, 'message' => 'Wishlist not found.'], 404);
//     }
//     //Sdd($wishlist);
//     $notificationService = app(\App\Services\WishlistNotificationService::class);
//     $result = $notificationService->sendWishlistSharedEmail(8515332112636, $wishlist, 'conversion-king-x.myshopify.com');
//     return $result;
// });

// Customer Management Routes
Route::prefix('customers')->group(function () {
    Route::get('/test', function () {
        return response()->json(['message' => 'Customer API is working!']);
    });
    Route::get('/', [\App\Http\Controllers\CustomerController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\CustomerController::class, 'store']);
    Route::get('/stats', [\App\Http\Controllers\CustomerController::class, 'stats']);
    Route::post('/sync', [\App\Http\Controllers\CustomerController::class, 'syncFromShopify']);
    Route::get('/webhook-status', [\App\Http\Controllers\CustomerController::class, 'getWebhookStatus']);
    Route::get('/{id}', [\App\Http\Controllers\CustomerController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\CustomerController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\CustomerController::class, 'destroy']);
});