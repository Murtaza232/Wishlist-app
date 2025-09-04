<?php

namespace App\Http\Controllers;

use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Session;
use App\Models\Wishlist;
use App\Services\WishlistNotificationService;
use App\Services\UsageService;
use App\Models\Product;

class WishlistController extends HelperController
{
    public function showWishlistPage(Request $request)
    {
        try {
            $customerId = $request->input('customer_id');
            $wishlistId = $request->input('wishlist_id');
            if (!$customerId) {
                return response(view('wishlist', ['products' => []])->render())
                    ->withHeaders(['Content-Type' => 'application/liquid']);
            }
          
            $shop = \App\Models\Session::whereNotNull('access_token')->first();
            if (!$shop) {
                return response(view('wishlist', ['products' => []])->render())
                    ->withHeaders(['Content-Type' => 'application/liquid']);
            }
            $query = \App\Models\WishlistItem::query();
           $query->where('customer_id', $customerId);
            if ($wishlistId) {
                $query->where('wishlist_id', $wishlistId);
            }
            $wishlistItems = $query->get();
            if ($wishlistItems->isEmpty()) {
                return response(view('wishlist', ['products' => []])->render())
                    ->withHeaders(['Content-Type' => 'application/liquid']);
            }


            $productIds = $wishlistItems->pluck('product_id')->toArray();
            $gids = array_map(function($id) {
                return "\"gid://shopify/Product/{$id}\"";
            }, $productIds);

            $queryStr = "{\n                nodes(ids: [" . implode(',', $gids) . "]) {\n                    ... on Product {\n                        id\n                        title\n                        handle\n                        image: featuredImage {\n                            src: url\n                        }\n                        variants(first: 1) {\n                            edges {\n                                node {\n                                    id\n                                    price\n                                }\n                            }\n                        }\n                    }\n                }\n            }";

            $api = $this->shopifyApiClient($shop->shop);
            $response = $api->graph($queryStr);
           
            $products = $response['body']['data']['nodes'] ?? [];
            return response(view('wishlist', [
                'products' => $products,
                'customerId' => $customerId,
                'wishlistId' => $wishlistId,
            ])->render())
                ->withHeaders(['Content-Type' => 'application/liquid']);

        } catch (\Exception $e) {
            \Log::error('Error in showWishlistPage: ' . $e->getMessage());
            return response(view('wishlist', ['products' => []])->render())
                ->withHeaders(['Content-Type' => 'application/liquid']);
        }
    }
    public function getWishlistCount(\Illuminate\Http\Request $request)
{
    $customerId = $request->input('customer_id');
    if (!$customerId) {
        return response()->json(['count' => 0]);
    }
    $count = \App\Models\WishlistItem::where('customer_id', $customerId)->count();
    return response()->json(['count' => $count]);
}

    public function getWishlistStats(Request $request)
    {
        try {
           
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }
            // Use the shop domain from the Session model
            $shop = Session::where('shop', $shopSession->shop)
                ->whereNotNull('access_token')
                ->first();
           
            if (!$shop) {
                return response()->json([
                    'status' => false,
                    'message' => 'No valid access token for this shop.'
                ], 400);
            }
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            if (!$startDate || !$endDate) {
                return response()->json([
                    'status' => false,
                    'message' => 'Start date and end date are required.'
                ], 400);
            }

            // Convert dates to Carbon instances for proper comparison
            $startDate = \Carbon\Carbon::parse($startDate)->startOfDay();
            $endDate = \Carbon\Carbon::parse($endDate)->endOfDay();

            // Get total wishlist items (products) within date range for this shop
            $totalWishlistProducts = WishlistItem::where('shop_id', $shop->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Get total unique wishlists within date range for this shop
            $totalLists = Wishlist::where('shop_id', $shop->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Get total wishlist clicks (you might need to add this field to your models)
            $totalWishlistClicks = 0; // This would need to be implemented based on your tracking system

            // Get total wishlist conversions (you might need to add this field to your models)
            $totalWishlistConversions = 0; // This would need to be implemented based on your tracking system

            return response()->json([
                'status' => true,
                'data' => [
                    'total_wishlist_products' => $totalWishlistProducts,
                    'total_lists' => $totalLists,
                    'total_wishlist_clicks' => $totalWishlistClicks,
                    'total_wishlist_conversions' => $totalWishlistConversions,
                    'date_range' => [
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in getWishlistStats: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while fetching wishlist statistics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function add(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer',
            'product_id' => 'required|integer',
        ]);
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        // Use the shop domain from the Session model
        $shop = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();

        if (!$shop) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }
        // $shop = Auth::user(); // Get the authenticated shop

        // Check if the item already exists to avoid duplicates
        $exists = WishlistItem::where('shop_id', $shop->id)
            ->where('customer_id', $request->customer_id)
            ->where('product_id', $request->product_id)
            ->exists();

        if ($exists) {
            return response()->json(['status' => 'true', 
            'message' => 'Item is already in wishlist.']);
        }

        // Get current product price from products table
        $currentPrice = 0;
        try {
            $product = Product::where('shopify_product_id', $request->product_id)
                ->where('shop_id', $shop->id)
                ->first();
            
            if ($product) {
                $currentPrice = $product->price ?? 0;
                Log::info("Found product price: $currentPrice for product ID: {$request->product_id}");
            } else {
                Log::warning("Product not found in database for product ID: {$request->product_id}");
            }
        } catch (\Exception $e) {
            Log::error('Error fetching product price from database: ' . $e->getMessage());
        }

        // Create the new wishlist item with price tracking
        WishlistItem::create([
            'shop_id' => $shop->id,
            'customer_id' => $request->customer_id,
            'product_id' => $request->product_id,
            'added_price' => $currentPrice,
            'current_price' => $currentPrice,
            'price_checked_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Product added to wishlist!']);
    }

    /**
     * Smart Save endpoint for adding products to wishlist (public, no shop middleware)
     */
    public function smartSaveAdd(Request $request)
    {
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        $request->validate([
            'customer_id' => 'required|integer',
            'product_id' => 'required',
            'shop_domain' => 'required|string',
        ]);

        // Find the shop session
        $shop = Session::where('shop', $request->shop_domain)
            ->whereNotNull('access_token')
            ->first();

        if (!$shop) {
            return response()->json([
                'status' => false,
                'message' => 'Shop not found or not authenticated.'
            ], 400)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        // Check usage limits before adding item via Smart Save
        if (!UsageService::isActionAllowed($request->shop_domain, 'add_item')) {
            return response()->json([
                'status' => false,
                'message' => 'Usage limit reached. Please upgrade your plan to add more items.',
                'error_code' => 'USAGE_LIMIT_REACHED'
            ], 429)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        // Convert product handle to product ID if needed
        $productId = $request->product_id;
        if (!is_numeric($productId)) {
            // This is a product handle, we need to get the actual product ID
            try {
                $api = new \Shopify\Clients\Rest($shop->shop, $shop->access_token);
                $response = $api->get('products', [
                    'handle' => $productId,
                    'fields' => 'id'
                ]);
                
                $responseData = json_decode($response->getBody()->getContents(), true);
                $products = $responseData['products'] ?? [];
                if (!empty($products)) {
                    $productId = $products[0]['id'];
                    Log::info("Converted product handle '{$request->product_id}' to product ID: {$productId}");
                } else {
                    Log::error("Product not found for handle: {$request->product_id}");
                    return response()->json([
                        'status' => false,
                        'message' => 'Product not found.'
                    ], 404)
                        ->header('Access-Control-Allow-Origin', '*')
                        ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                }
            } catch (\Exception $e) {
                Log::error('Error converting product handle to ID: ' . $e->getMessage());
                return response()->json([
                    'status' => false,
                    'message' => 'Error processing product.'
                ], 500)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
        }

        // Get or create the latest wishlist for this customer
        $wishlist = Wishlist::where('shop_id', $shop->id)
            ->where('customer_id', $request->customer_id)
            ->orderBy('created_at', 'desc')
            ->first();
            
        if (!$wishlist) {
            // Create a new wishlist if none exists
            $wishlist = Wishlist::create([
                'shop_id' => $shop->id,
                'customer_id' => $request->customer_id,
                'title' => 'My Wishlist'
            ]);
            Log::info("Created new wishlist ID: {$wishlist->id} for customer: {$request->customer_id}");
        } else {
            Log::info("Using existing wishlist ID: {$wishlist->id} for customer: {$request->customer_id}");
        }

        // Get current product price from products table first
        $currentPrice = 0;
        try {
            $product = Product::where('shopify_product_id', $productId)
                ->where('shop_id', $shop->id)
                ->first();
            
            if ($product) {
                $currentPrice = $product->price ?? 0;
                Log::info("Found product price: $currentPrice for product ID: {$productId}");
            } else {
                Log::warning("Product not found in database for product ID: {$productId}");
            }
        } catch (\Exception $e) {
            Log::error('Error fetching product price from database: ' . $e->getMessage());
        }

        // Check if the item already exists for this customer across all wishlists to avoid duplicates
        $existingItem = WishlistItem::where('shop_id', $shop->id)
            ->where('customer_id', $request->customer_id)
            ->where('product_id', $productId)
            ->first();

        if ($existingItem) {
            // Product already exists in a wishlist, update it to the latest wishlist
            $existingItem->update([
                'wishlist_id' => $wishlist->id,
                'current_price' => $currentPrice,
                'price_checked_at' => now()
            ]);
            
            Log::info("Updated existing wishlist item ID: {$existingItem->id} to latest wishlist ID: {$wishlist->id}");
            
            return response()->json(['status' => 'success', 'message' => 'Item moved to latest wishlist.'])
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        // Create the new wishlist item with price tracking
        WishlistItem::create([
            'shop_id' => $shop->id,
            'customer_id' => $request->customer_id,
            'wishlist_id' => $wishlist->id,
            'product_id' => $productId,
            'added_price' => $currentPrice,
            'current_price' => $currentPrice,
            'price_checked_at' => now(),
        ]);

        // Track usage after successful creation
        UsageService::trackUsage($request->shop_domain, 'add_item');

        return response()->json(['status' => 'success', 'message' => 'Product added to wishlist!'])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Smart Save endpoint for getting wishlist products (public, no shop middleware)
     */
    public function smartSaveGetProducts(Request $request)
    {
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        try {
            $customerId = $request->input('customer_id');
            $shopDomain = $request->input('shop_domain');
            
            Log::info('Smart Save: Fetching wishlist for customer ID: ' . $customerId . ', shop: ' . $shopDomain);
    
            if (!$customerId || !$shopDomain) {
                return response()->json(['products' => [], 'error' => 'Customer ID and shop domain are required.'])
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
    
            $shop = Session::where('shop', $shopDomain)
                ->whereNotNull('access_token')
                ->first();
                
            if (!$shop) {
                Log::error('Smart Save: Could not find shop session for domain: ' . $shopDomain);
                return response()->json(['products' => [], 'error' => 'Shop not found or not authenticated.'], 500)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
    
            $wishlistItems = WishlistItem::where('customer_id', $customerId)
                ->where('shop_id', $shop->id)
                ->get();
                
            if ($wishlistItems->isEmpty()) {
                return response()->json(['products' => []])
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
    
            $productIds = $wishlistItems->pluck('product_id')->toArray();
            $gids = array_map(function($id) {
                return "\"gid://shopify/Product/{$id}\"";
            }, $productIds);
    
            $query = "{
                nodes(ids: [" . implode(',', $gids) . "]) {
                    ... on Product {
                        id
                        title
                        handle
                        images(first: 1) {
                            edges {
                                node {
                                    src
                                }
                            }
                        }
                        variants(first: 1) {
                            edges {
                                node {
                                    id
                                    price
                                }
                            }
                        }
                    }
                }
            }";
    
            $api = new \Shopify\Clients\Graphql($shop->shop, $shop->access_token);
            $response = $api->query($query);
           
            // Handle the response object properly
            $responseData = json_decode($response->getBody()->getContents(), true);
            $products = $responseData['data']['nodes'] ?? [];
            return response()->json(['products' => $products])
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
        } catch (\Exception $e) {
            Log::error('Smart Save: Error fetching wishlist products: ' . $e->getMessage());
            return response()->json(['products' => [], 'error' => 'Failed to fetch wishlist products.'], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
    }

    public function getWishlistProducts(Request $request)
    {
        // dd($request->all());
        try {
            $customerId = $request->input('customer_id');
            Log::info('Fetching wishlist for customer ID: ' . $customerId);
    
            if (!$customerId) {
                return response()->json(['products' => [], 'error' => 'Customer ID is required.']);
            }
    
            $shop = \App\Models\Session::whereNotNull('access_token')->first();
            if (!$shop) {
                Log::error('Could not find a shop session with a valid access token.');
                return response()->json(['products' => [], 'error' => 'Could not authenticate shop.'], 500);
            }
    
            $wishlistItems = WishlistItem::where('customer_id', $customerId)->get();
            if ($wishlistItems->isEmpty()) {
                return response()->json(['products' => []]);
            }
    
            $productIds = $wishlistItems->pluck('product_id')->toArray();
            $gids = array_map(function($id) {
                return "\"gid://shopify/Product/{$id}\""; // Ensure GIDs are quoted strings
            }, $productIds);
    
            $query = "{
                nodes(ids: [" . implode(',', $gids) . "]) {
                    ... on Product {
                        id
                        title
                        handle
                        images(first: 1) { edges { node { src: url } } }
                        variants(first: 1) { edges { node { id price } } }
                    }
                }
            }";
    
            Log::info('Executing GraphQL Query: ' . $query);
    
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'X-Shopify-Access-Token' => $shop->access_token,
                'Content-Type' => 'application/json',
            ])->post("https://{$shop->shop}/admin/api/2023-01/graphql.json", [
                'query' => $query
            ]);
    
            if ($response->failed()) {
                Log::error('Shopify GraphQL API request failed.', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return response()->json(['products' => [], 'error' => 'Failed to fetch products from Shopify.'], 500);
            }
    
            $products = $response->json('data.nodes') ?? [];
            Log::info('Successfully fetched ' . count($products) . ' products from Shopify.');
    
            return response()->json(['products' => $products]);
    
        } catch (\Exception $e) {
            Log::error('An unexpected error occurred in getWishlistProducts: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['products' => [], 'error' => 'An unexpected server error occurred.'], 500);
        }
    }

    /**
     * List all wishlists for a customer
     */
    public function listWishlists(Request $request)
    {
        $customerId = $request->input('customer_id');
        if (!$customerId) {
            return response()->json([], 400);
        }
        $wishlists = Wishlist::where('customer_id', $customerId)->get();
        return response()->json($wishlists);
    }

    /**
     * Create a new wishlist for a customer
     */
    public function createWishlist(Request $request)
    {
        $request->validate([
            'customer_id' => 'required',
            'title' => 'required|string|max:255',
        ]);
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        
        $shopDomain = $shopSession->shop;
        
        // Check usage limits before creating wishlist
        if (!UsageService::isActionAllowed($shopDomain, 'create_wishlist')) {
            return response()->json([
                'status' => false,
                'message' => 'Usage limit reached. Please upgrade your plan to create more wishlists.',
                'error_code' => 'USAGE_LIMIT_REACHED'
            ], 429);
        }
        
        // Use the shop domain from the Session model
        $shop = Session::where('shop', $shopDomain)
            ->whereNotNull('access_token')
            ->first();

        if (!$shop) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }
        
        // Prevent duplicate wishlist titles for the same customer
        $existing = Wishlist::where('customer_id', $request->customer_id)
            ->where('title', $request->title)
            ->first();
        if ($existing) {
            return response()->json([
                'status' => false,
                'message' => 'A wishlist with this title already exists.'
            ], 409);
        }

        $wishlist = Wishlist::create([
            'shop_id' => $shop->id,
            'customer_id' => $request->customer_id,
            'title' => $request->title,
        ]);

        // Track usage after successful creation
        UsageService::trackUsage($shopDomain, 'create_wishlist');

        if (!class_exists('\\App\\Services\\WishlistNotificationService')) {
            throw new \Exception('Service class not found');
        }
        
        $notificationService = app(\App\Services\WishlistNotificationService::class);
        $result = $notificationService->sendSignupConfirmationEmail($request->customer_id, $wishlist, $shop);
        
        return response()->json($wishlist);
    }
        public function addItemToWishlist(Request $request)
    {
        $request->validate([
            'wishlist_id' => 'required|integer',
            'product_id' => 'required|integer',
        ]);
        $wishlist = Wishlist::find($request->wishlist_id);
        if (!$wishlist) {
            return response()->json(['error' => 'Wishlist not found'], 404);
        }
        
        // Get shop domain for usage tracking
        $shopDomain = null;
        if ($wishlist->shop_id) {
            $shop = Session::find($wishlist->shop_id);
            $shopDomain = $shop ? $shop->shop : null;
        }
        
        if (!$shopDomain) {
            $shopSession = $this->getShop($request);
            if ($shopSession) {
                $shopDomain = $shopSession->shop;
            }
        }
        
        if (!$shopDomain) {
            return response()->json(['error' => 'Shop domain not found'], 400);
        }
        
        // Check usage limits before adding item
        if (!UsageService::isActionAllowed($shopDomain, 'add_item')) {
            return response()->json([
                'status' => false,
                'message' => 'Usage limit reached. Please upgrade your plan to add more items.',
                'error_code' => 'USAGE_LIMIT_REACHED'
            ], 429);
        }
        
        // Get shop_id from wishlist if available, otherwise from session
        $shopId = $wishlist->shop_id ?? null;
        if (!$shopId) {
            $shopSession = $this->getShop($request);
            if ($shopSession) {
                $shop = Session::where('shop', $shopSession->shop)
                    ->whereNotNull('access_token')
                    ->first();
                if ($shop) {
                    $shopId = $shop->id;
                }
            }
        }
        
        // Prevent duplicate items using shop_id, customer_id, and product_id
        $exists = WishlistItem::where('shop_id', $shopId)
            ->where('customer_id', $wishlist->customer_id)
            ->where('product_id', $request->product_id)
            ->exists();
        if ($exists) {
            return response()->json(['status' => 'true', 'message' => 'Item already in wishlist.']);
        }

        // Get current product price from products table
        $currentPrice = 0;
        try {
            $product = Product::where('shopify_product_id', $request->product_id)
                ->where('shop_id', $shopId)
                ->first();
            
            if ($product) {
                $currentPrice = $product->price ?? 0;
                Log::info("Found product price: $currentPrice for product ID: {$request->product_id}");
            } else {
                Log::warning("Product not found in database for product ID: {$request->product_id}");
            }
        } catch (\Exception $e) {
            Log::error('Error fetching product price from database: ' . $e->getMessage());
        }

        WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'customer_id' => $wishlist->customer_id,
            'product_id' => $request->product_id,
            'shop_id' => $shopId,
            'added_price' => $currentPrice,
            'current_price' => $currentPrice,
            'price_checked_at' => now(),
        ]);
        
        // Track usage after successful addition
        UsageService::trackUsage($shopDomain, 'add_item');
        
        return response()->json(['status' => 'success', 'message' => 'Product added to wishlist!']);
    }

    /**
     * Delete a wishlist item by wishlist_id, customer_id, and product_id
     */
    public function deleteWishlistItem(Request $request)
    {
        $request->validate([
            'wishlist_id' => 'required',
            'customer_id' => 'required',
            'product_id' => 'required',
        ]);

        $wishlistId= (int)$request->wishlist_id;
        $customerId= (int)$request->customer_id;
        $productId= (int)$request->product_id;
        $deleted = WishlistItem::where('wishlist_id', $wishlistId)
            ->where('customer_id', $customerId)
            ->where('product_id', $productId)
            ->delete();
        if ($deleted) {
            return response()->json(['status' => 'success', 'message' => 'Wishlist item removed.']);
        } else {
            return response()->json(['status' => 'not_found', 'message' => 'Wishlist item not found.'], 404);
        }
    }

    /**
     * Delete a wishlist and all its items by ID
     */
    public function destroy($id)
    {
        // Delete all items for this wishlist
        \App\Models\WishlistItem::where('wishlist_id', $id)->delete();
        // Delete the wishlist itself
        $deleted = \App\Models\Wishlist::where('id', $id)->delete();
        if ($deleted) {
            return response()->json(['status' => 'success', 'message' => 'Wishlist and its items deleted.']);
        } else {
            return response()->json(['status' => 'not_found', 'message' => 'Wishlist not found.'], 404);
        }
    }

    /**
     * Create a wishlist (if not exists) and add an item to it in one call
     */
    public function storeWishlistAndItems(Request $request)
    {
        return $request->all();
        $request->validate([
            'customer_id' => 'required',
            'title' => 'required|string|max:255',
            'product_id' => 'required|integer',
        ]);
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        // Use the shop domain from the Session model
        $shop = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();

        if (!$shop) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }
        // Find or create the wishlist
        $wishlist = Wishlist::firstOrCreate(
            [
                'shop_id' => $shop->id,
                'customer_id' => $request->customer_id,
                'title' => $request->title,
            ]
        );
        // Prevent duplicate item
        $exists = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('customer_id', $request->customer_id)
            ->where('product_id', $request->product_id)
            ->exists();
        if ($exists) {
            return response()->json([
                'status' => 'true',
                'message' => 'Item already in wishlist.',
                'wishlist' => $wishlist
            ]);
        }
        $item = WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'customer_id' => $request->customer_id,
            'product_id' => $request->product_id,
            'shop_id' => $wishlist->shop_id ?? null,
        ]);
        return response()->json([
            'status' => 'success',
            'message' => 'Wishlist and item stored.',
            'wishlist' => $wishlist,
            'item' => $item
        ]);
    }

    /**
     * Share a wishlist and send notification email
     */
    public function shareWishlist(Request $request)
    {
        $request->validate([
            'customer_id' => 'required',
            'wishlist_id' => 'required',
            'shop' => 'required',
        ]);
        $customerId = $request->input('customer_id');
        $wishlistId = $request->input('wishlist_id');
        $shopDomain = $request->input('shop');

        // Check if sharing is allowed for current plan
        if (!UsageService::isSharingAllowed($shopDomain)) {
            return response()->json([
                'status' => false, 
                'message' => 'Wishlist sharing is not available on your current plan. Please upgrade to share wishlists.',
                'error_code' => 'SHARING_NOT_ALLOWED'
            ], 403);
        }

        // Check usage limits before sharing
        if (!UsageService::isActionAllowed($shopDomain, 'share_wishlist')) {
            return response()->json([
                'status' => false,
                'message' => 'Usage limit reached. Please upgrade your plan to share more wishlists.',
                'error_code' => 'USAGE_LIMIT_REACHED'
            ], 429);
        }

        $wishlist = \App\Models\Wishlist::find($wishlistId);
        if (!$wishlist) {
            return response()->json(['status' => false, 'message' => 'Wishlist not found.'], 404);
        }
        $shop = \App\Models\Session::where('shop', $shopDomain)->whereNotNull('access_token')->first();
        if (!$shop) {
            return response()->json(['status' => false, 'message' => 'Shop not found.'], 400);
        }
        
        $notificationService = app(\App\Services\WishlistNotificationService::class);
        $result = $notificationService->sendWishlistSharedEmail($customerId, $wishlist, $shop);
        
        if ($result) {
            // Track usage after successful sharing
            UsageService::trackUsage($shopDomain, 'share_wishlist');
            return response()->json(['status' => true, 'message' => 'Wishlist shared email sent.']);
        } else {
            return response()->json(['status' => false, 'message' => 'Failed to send wishlist shared email.'], 500);
        }
    }
} 