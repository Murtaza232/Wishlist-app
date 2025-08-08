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
        Product::updateOrCreate(
            [
                'shop_id' => $shop->id,
                'shopify_product_id' => $data['id'],
            ],
            [
                'title' => $data['title'],
                'stock' => isset($data['variants'][0]['inventory_quantity']) ? $data['variants'][0]['inventory_quantity'] : 0,
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
        Product::updateOrCreate(
            [
                'shop_id' => $shop->id,
                'shopify_product_id' => $data['id'],
            ],
            [
                'title' => $data['title'],
                'stock' => isset($data['variants'][0]['inventory_quantity']) ? $data['variants'][0]['inventory_quantity'] : 0,
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
