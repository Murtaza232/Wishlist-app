<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Models\Session;
use App\Services\ShopifyProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;
use App\Http\Controllers\WishlistConfigurationController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    $response_product_create = Registry::register('/api/webhooks/product-create', Topics::PRODUCTS_CREATE, $shop, $session->getAccessToken());
$response_product_update = Registry::register('/api/webhooks/product-update', Topics::PRODUCTS_UPDATE, $shop, $session->getAccessToken());
$response_product_delete = Registry::register('/api/webhooks/product-delete', Topics::PRODUCTS_DELETE, $shop, $session->getAccessToken());

    // Register customer webhooks during installation
    $response_customer_create = Registry::register('/api/webhooks/customer-create', Topics::CUSTOMERS_CREATE, $shop, $session->getAccessToken());
    $response_customer_update = Registry::register('/api/webhooks/customer-update', Topics::CUSTOMERS_UPDATE, $shop, $session->getAccessToken());
    $response_customer_delete = Registry::register('/api/webhooks/customer-delete', Topics::CUSTOMERS_DELETE, $shop, $session->getAccessToken());

    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    // Log customer webhook registration results
    if ($response_customer_create->isSuccess()) {
        Log::debug("Registered CUSTOMERS_CREATE webhook for shop $shop");
    } else {
        Log::error("Failed to register CUSTOMERS_CREATE webhook for shop $shop");
    }
    
    if ($response_customer_update->isSuccess()) {
        Log::debug("Registered CUSTOMERS_UPDATE webhook for shop $shop");
    } else {
        Log::error("Failed to register CUSTOMERS_UPDATE webhook for shop $shop");
    }
    
    if ($response_customer_delete->isSuccess()) {
        Log::debug("Registered CUSTOMERS_DELETE webhook for shop $shop");
    } else {
        Log::error("Failed to register CUSTOMERS_DELETE webhook for shop $shop");
    }

    // Fetch products during app installation
    try {
        $productService = new ShopifyProductService();
        $fetchedCount = $productService->fetchProductsForShop($shop);
        Log::info("Fetched $fetchedCount products during app installation for shop: $shop");
    } catch (\Exception $e) {
        Log::error("Failed to fetch products during app installation for shop $shop: " . $e->getMessage());
    }

    // Sync customers during app installation
    try {
        $dbSession = \App\Models\Session::where('shop', $shop)->first();
        if ($dbSession) {
            // Mark app as installed
            $dbSession->markAsInstalled();
            
            // Register customer webhooks
            $webhookService = new \App\Services\WebhookService();
            $webhooksRegistered = $webhookService->registerCustomerWebhooks($dbSession);
            
            if ($webhooksRegistered) {
                Log::info("Customer webhooks registered during app installation for shop: $shop");
            } else {
                Log::warning("Failed to register customer webhooks during app installation for shop: $shop");
            }
            
            // Sync customers from Shopify
            $client = new Rest($shop, $session->getAccessToken());
            $response = $client->get('customers', ['limit' => 250]);
            
            if ($response->getStatusCode() === 200) {
                $responseBody = json_decode($response->getBody()->getContents(), true);
                
                if ($responseBody && isset($responseBody['customers'])) {
                    $shopifyCustomers = $responseBody['customers'];
                    $syncedCount = 0;
                    $updatedCount = 0;
                    
                    foreach ($shopifyCustomers as $shopifyCustomer) {
                        $customerData = [
                            'shopify_customer_id' => $shopifyCustomer['id'],
                            'first_name' => $shopifyCustomer['first_name'] ?? null,
                            'last_name' => $shopifyCustomer['last_name'] ?? null,
                            'email' => $shopifyCustomer['email'],
                            'phone' => $shopifyCustomer['phone'] ?? null,
                            'city' => $shopifyCustomer['default_address']['city'] ?? null,
                            'province' => $shopifyCustomer['default_address']['province'] ?? null,
                            'country' => $shopifyCustomer['default_address']['country'] ?? null,
                            'zip' => $shopifyCustomer['default_address']['zip'] ?? null,
                            'total_spent' => $shopifyCustomer['total_spent'] ?? 0.00,
                            'orders_count' => $shopifyCustomer['orders_count'] ?? 0,
                            'status' => $shopifyCustomer['state'] === 'enabled' ? 'active' : 'inactive',
                            // 'last_order_date' => $shopifyCustomer['last_order_id'] ? date('Y-m-d H:i:s', strtotime($shopifyCustomer['updated_at'])) : null,
                            'created_at_shopify' => date('Y-m-d H:i:s', strtotime($shopifyCustomer['created_at'])),
                        ];

                        // Check if customer exists
                        $existingCustomer = \App\Models\Customer::where('shopify_customer_id', $shopifyCustomer['id'])
                                                              ->where('shop_id', $dbSession->id)
                                                              ->first();

                        if ($existingCustomer) {
                            $existingCustomer->update($customerData);
                            $updatedCount++;
                        } else {
                            \App\Models\Customer::create(array_merge($customerData, ['shop_id' => $dbSession->id]));
                            $syncedCount++;
                        }
                    }
                    
                    Log::info("Synced $syncedCount new customers and updated $updatedCount existing customers during app installation for shop: $shop");
                }
            } else {
                Log::error("Failed to fetch customers during app installation for shop $shop: " . $response->getStatusCode());
            }
        }
    } catch (\Exception $e) {
        Log::error("Failed to sync customers during app installation for shop $shop: " . $e->getMessage());
    }

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});

Route::get('/api/products/count', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products/count');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::post('/api/products', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});

// Wishlist API routes

// Serve notification images

// Shopify product webhooks




