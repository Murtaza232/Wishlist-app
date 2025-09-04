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
})->middleware('extract.shop');
Route::any('/wishlist-configuration', [WishlistConfigurationController::class, 'store'])->middleware('extract.shop');
Route::get('/wishlist-configuration/show', [WishlistConfigurationController::class, 'show'])->middleware('extract.shop');
Route::get('/get-themes', [WishlistConfigurationController::class, 'getThemes'])->middleware('extract.shop');
Route::get('/extension-status', [WishlistConfigurationController::class, 'getExtensionStatus'])->middleware('extract.shop');
Route::get('/wishlist-editor-url', [WishlistConfigurationController::class, 'EditorUrl'])->middleware('extract.shop');
Route::get('/wishlist-editor-collectionsurl', [WishlistConfigurationController::class, 'EditorCollectionUrl'])->middleware('extract.shop');
Route::get('/theme-editor-url', [WishlistConfigurationController::class, 'getThemeEditorUrl'])->middleware('extract.shop');
Route::any('/wishlist-features-store', [WishlistConfigurationController::class, 'storeOrUpdateFeatures'])->middleware('extract.shop');
Route::get('/wishlist-metafields', [WishlistConfigurationController::class, 'getWishlistMetafields'])->middleware('extract.shop');
Route::any('/proxy/wishlist', [WishlistController::class, 'showWishlistPage'])->middleware('extract.shop');
Route::any('/shop',[WishlistConfigurationController::class,'shop'])->middleware('extract.shop');
Route::post('/wishlist/add', [WishlistController::class, 'add'])->middleware('extract.shop');
Route::get('/wishlist/products', [WishlistController::class, 'getWishlistProducts'])->middleware('extract.shop');

// Public endpoints for Smart Save (no shop middleware required)
Route::match(['POST', 'OPTIONS'], '/smart-save/add', [WishlistController::class, 'smartSaveAdd']);
Route::match(['GET', 'OPTIONS'], '/smart-save/products', [WishlistController::class, 'smartSaveGetProducts']);
Route::get('/wishlists', [WishlistController::class, 'listWishlists'])->middleware('extract.shop');
Route::post('/wishlists', [WishlistController::class, 'createWishlist'])->middleware('extract.shop');
Route::post('/wishlist-items', [WishlistController::class, 'addItemToWishlist'])->middleware('extract.shop');
Route::any('/wishlist-items-delete', [WishlistController::class, 'deleteWishlistItem'])->middleware('extract.shop');
Route::get('/wishlist-count', [WishlistController::class, 'getWishlistCount'])->middleware('extract.shop');
Route::get('/wishlist-stats', [WishlistController::class, 'getWishlistStats'])->middleware('extract.shop');
Route::delete('/wishlists/{id}', [WishlistController::class, 'destroy'])->middleware('extract.shop');
Route::any('/wishlists/store-items', [WishlistController::class, 'storeWishlistAndItems'])->middleware('extract.shop');
Route::any('/subscription-notifications', [SubscriptionNotificationController::class, 'subscription_notifications'])->middleware('extract.shop')->name('subscription-notifications');
Route::any('/subscription-notification-detail/{id}', [SubscriptionNotificationController::class, 'subscription_notification_detail'])
    ->middleware('extract.shop')->name('subscription-notification-detail');
Route::any('/subscription-notification-save/{id}', [SubscriptionNotificationController::class, 'subscription_notification_save'])
    ->middleware('extract.shop')->name('subscription_notification-save');

// Provider selection
Route::get('/notification-providers', [ProviderController::class, 'get'])->middleware('extract.shop');
Route::post('/notification-providers', [ProviderController::class, 'save'])->middleware('extract.shop');

// Marketing Analytics Routes
Route::get('/marketing-analytics', [\App\Http\Controllers\MarketingAnalyticsController::class, 'getMarketingAnalytics'])->middleware('extract.shop');
// Campaign Routes
Route::post('/campaigns/save', [\App\Http\Controllers\CampaignController::class, 'save'])->middleware('extract.shop');
Route::get('/campaigns/current', [\App\Http\Controllers\CampaignController::class, 'current'])->middleware('extract.shop');
Route::post('/campaigns/track-signup', [\App\Http\Controllers\CampaignController::class, 'trackSignup'])->middleware('extract.shop');
Route::get('/campaigns/export', [\App\Http\Controllers\CampaignController::class, 'exportCsv'])->middleware('extract.shop');
Route::post('/marketing-analytics/export', [\App\Http\Controllers\MarketingAnalyticsController::class, 'exportShopperSegment'])->middleware('extract.shop');
// Frequently wishlisted alerts (Trending wishlist email)
Route::get('/frequently-wishlisted/config', [\App\Http\Controllers\FrequentlyWishlistedController::class, 'getConfig'])->middleware('extract.shop');
Route::post('/frequently-wishlisted/config', [\App\Http\Controllers\FrequentlyWishlistedController::class, 'saveConfig'])->middleware('extract.shop');
Route::post('/frequently-wishlisted/run', [\App\Http\Controllers\FrequentlyWishlistedController::class, 'runNow'])->middleware('extract.shop');
// Test notification emails
Route::post('/notifications/test-send', [\App\Http\Controllers\NotificationTestController::class, 'sendTest'])->middleware('extract.shop');

// Pricing Plans Routes
Route::get('/pricing-plans', [\App\Http\Controllers\PricingController::class, 'index'])->middleware('extract.shop');
Route::get('/pricing-plans/{slug}', [\App\Http\Controllers\PricingController::class, 'show'])->middleware('extract.shop');
Route::get('/pricing-plans-with-discounts', [\App\Http\Controllers\PricingController::class, 'withDiscounts'])->middleware('extract.shop');
Route::post('/subscribe-plan', [\App\Http\Controllers\PricingController::class, 'SubscripePlan'])->middleware('extract.shop');
Route::get('/return-url', [\App\Http\Controllers\PricingController::class, 'ReturnUrl'])->middleware('extract.shop');
Route::get('/subscription/active', [\App\Http\Controllers\PricingController::class, 'active'])->middleware('extract.shop');

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
})->middleware('extract.shop');

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
})->middleware('extract.shop');
Route::any('/subscription-notification-status-save/{id}', [SubscriptionNotificationController::class, 'subscription_notification_status_save'])
    ->middleware('extract.shop')->name('web-notification_status-save');
    Route::get('/images/{filename}', function ($filename) {
        $path = public_path('images/' . $filename);
        
        if (file_exists($path)) {
            return response()->file($path);
        }
        
        return response()->json(['error' => 'Image not found'], 404);
    })->where('filename', '.*');

// Language Settings Routes
Route::get('/languages', [LanguageController::class, 'getLanguages'])->middleware('extract.shop');
Route::post('/languages', [LanguageController::class, 'saveLanguage'])->middleware('extract.shop');
Route::post('/languages/set-active', [LanguageController::class, 'setActiveLanguage'])->middleware('extract.shop');
Route::get('/languages/active', [LanguageController::class, 'getActiveLanguage'])->middleware('extract.shop');
Route::delete('/languages', [LanguageController::class, 'deleteLanguage'])->middleware('extract.shop');

// Wishlist share notification
Route::post('/wishlist/share', [App\Http\Controllers\WishlistController::class, 'shareWishlist'])->middleware('extract.shop');

// Usage tracking routes
Route::get('/usage/stats', [App\Http\Controllers\UsageController::class, 'getStats'])->middleware('extract.shop');
Route::get('/usage/check', [App\Http\Controllers\UsageController::class, 'checkAction'])->middleware('extract.shop');

Route::post('/webhooks/product-create', [\App\Http\Controllers\ShopifyProductWebhookController::class, 'productCreate']);
Route::post('/webhooks/product-update', [\App\Http\Controllers\ShopifyProductWebhookController::class, 'productUpdate']);
Route::post('/webhooks/product-delete', [\App\Http\Controllers\ShopifyProductWebhookController::class, 'productDelete']);

// Customer Webhook Routes
Route::post('/webhooks/customer-create', [\App\Http\Controllers\CustomerWebhookController::class, 'customerCreate']);
Route::post('/webhooks/customer-update', [\App\Http\Controllers\CustomerWebhookController::class, 'customerUpdate']);
Route::post('/webhooks/customer-delete', [\App\Http\Controllers\CustomerWebhookController::class, 'customerDelete']);
Route::any('return-url', [\App\Http\Controllers\PricingController::class, 'ReturnUrl'])->middleware('extract.shop');
Route::any('subscribe-plan', [\App\Http\Controllers\PricingController::class, 'SubscripePlan'])->middleware('extract.shop');
Route::prefix('customers')->group(function () {
    Route::get('/test', function () {
        return response()->json(['message' => 'Customer API is working!']);
    });
    Route::get('/', [\App\Http\Controllers\CustomerController::class, 'index'])->middleware('extract.shop');
    Route::post('/', [\App\Http\Controllers\CustomerController::class, 'store'])->middleware('extract.shop');
    Route::get('/stats', [\App\Http\Controllers\CustomerController::class, 'stats'])->middleware('extract.shop');
    Route::post('/sync', [\App\Http\Controllers\CustomerController::class, 'syncFromShopify'])->middleware('extract.shop');
    Route::get('/webhook-status', [\App\Http\Controllers\CustomerController::class, 'getWebhookStatus'])->middleware('extract.shop');
    Route::get('/{id}', [\App\Http\Controllers\CustomerController::class, 'show'])->middleware('extract.shop');
    Route::put('/{id}', [\App\Http\Controllers\CustomerController::class, 'update'])->middleware('extract.shop');
    Route::delete('/{id}', [\App\Http\Controllers\CustomerController::class, 'destroy'])->middleware('extract.shop');
});