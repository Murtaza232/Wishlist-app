<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Session;

class ShopifyProductWebhookController extends Controller
{
    public function productCreate(Request $request)
    {
        $data = $request->all();
        $shopDomain = $request->header('x-shopify-shop-domain');
        $shop = Session::where('shop', $shopDomain)->first();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);
        
        // Handle stock calculation - Shopify can return negative values
        $rawStock = isset($data['variants'][0]['inventory_quantity']) ? $data['variants'][0]['inventory_quantity'] : 0;
        $stock = max(0, $rawStock); // Ensure stock is never negative
        
        // Get price information from the first variant
        $variant = $data['variants'][0] ?? null;
        $price = $variant ? (float)($variant['price'] ?? 0) : 0;
        $compareAtPrice = $variant ? (float)($variant['compare_at_price'] ?? 0) : 0;
        
        Product::updateOrCreate(
            [
                'shop_id' => $shop->id,
                'shopify_product_id' => $data['id'],
            ],
            [
                'title' => $data['title'],
                'stock' => $stock,
                'price' => $price,
                'compare_at_price' => $compareAtPrice,
                'last_price_check' => now(),
            ]
        );
        return response()->json(['success' => true]);
    }

    public function productUpdate(Request $request)
    {
        $data = $request->all();
        $shopDomain = $request->header('x-shopify-shop-domain');
        $shop = Session::where('shop', $shopDomain)->first();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);
        
        // Handle stock calculation - Shopify can return negative values
        $rawStock = isset($data['variants'][0]['inventory_quantity']) ? $data['variants'][0]['inventory_quantity'] : 0;
        $stock = max(0, $rawStock); // Ensure stock is never negative
        
        // Get price information from the first variant
        $variant = $data['variants'][0] ?? null;
        $newPrice = $variant ? (float)($variant['price'] ?? 0) : 0;
        $compareAtPrice = $variant ? (float)($variant['compare_at_price'] ?? 0) : 0;
        
        // Get existing product to check for price changes
        $existingProduct = Product::where('shop_id', $shop->id)
            ->where('shopify_product_id', $data['id'])
            ->first();
        
        $oldPrice = $existingProduct ? $existingProduct->price : $newPrice;
        
        Product::updateOrCreate(
            [
                'shop_id' => $shop->id,
                'shopify_product_id' => $data['id'],
            ],
            [
                'title' => $data['title'],
                'stock' => $stock,
                'old_price' => $oldPrice,
                'price' => $newPrice,
                'compare_at_price' => $compareAtPrice,
                'last_price_check' => now(),
            ]
        );
        return response()->json(['success' => true]);
    }

    public function productDelete(Request $request)
    {
        $data = $request->all();
        $shopDomain = $request->header('x-shopify-shop-domain');
        $shop = Session::where('shop', $shopDomain)->first();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);
        Product::where('shop_id', $shop->id)
            ->where('shopify_product_id', $data['id'])
            ->delete();
        return response()->json(['success' => true]);
    }
}
