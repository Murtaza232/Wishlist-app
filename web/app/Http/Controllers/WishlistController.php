<?php

namespace App\Http\Controllers;

use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Session;
use App\Models\Wishlist;

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
            // return $wishlistId;
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

        // Create the new wishlist item
        WishlistItem::create([
            'shop_id' => $shop->id,
            'customer_id' => $request->customer_id,
            'product_id' => $request->product_id,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Product added to wishlist!']);
    }
    public function getWishlistProducts(Request $request)
    {
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
            'customer_id' => $request->customer_id,
            'title' => $request->title,
        ]);
        return response()->json($wishlist);
    }

    /**
     * Add an item to a specific wishlist
     */
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
        WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'customer_id' => $wishlist->customer_id,
            'product_id' => $request->product_id,
            'shop_id' => $shopId,
        ]);
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
        // Find or create the wishlist
        $wishlist = Wishlist::firstOrCreate(
            [
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
} 