<?php

namespace App\Http\Controllers;

use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Session;

class WishlistController extends HelperController
{
    public function showWishlistPage(Request $request)
    {
        try {
          
            if (!$customerId) {
                // Return the view with an empty products array if no customer is specified
                return response(view('wishlist', ['products' => []])->render())
                    ->withHeaders(['Content-Type' => 'application/liquid']);
            }
    
            $shop = \App\Models\Session::whereNotNull('access_token')->first();
            if (!$shop) {
                // Handle case where no authenticated shop is found
                return response(view('wishlist', ['products' => []])->render())
                    ->withHeaders(['Content-Type' => 'application/liquid']);
            }
    
            $wishlistItems = \App\Models\WishlistItem::where('customer_id', $customerId)->get();
            if ($wishlistItems->isEmpty()) {
                return response(view('wishlist', ['products' => []])->render())
                    ->withHeaders(['Content-Type' => 'application/liquid']);
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
                        image: featuredImage {
                            src: url
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
    
            $api = $this->shopifyApiClient($shop->shop);
            $response = $api->graph($query);
    
            $products = $response['body']['data']['nodes'] ?? [];
    
            return response(view('wishlist', ['products' => $products])->render())
                ->withHeaders(['Content-Type' => 'application/liquid']);
    
        } catch (\Exception $e) {
            \Log::error('Error in showWishlistPage: ' . $e->getMessage());
            // Return a view with no products in case of an error
            return response(view('wishlist', ['products' => []])->render())
                ->withHeaders(['Content-Type' => 'application/liquid']);
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
            return response()->json(['status' => 'success', 'message' => 'Item is already in wishlist.']);
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
} 