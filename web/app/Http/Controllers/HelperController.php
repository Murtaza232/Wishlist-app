<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\Session;
use App\Models\Session as SessionModel;

class HelperController extends Controller
{ 
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
        // First try to get shop from request attributes (set by middleware)
        $shopSession = $request->attributes->get('shop_session');
        if ($shopSession) {
            return $shopSession;
        }
        
        // Fallback to query parameter
        $shop = $request->query('shop');
        // return $shop;
        if ($shop) {
            $session = SessionModel::where('shop', $shop)->first();
            if ($session) {
                return $session;
            }
        }
        
        // Fallback to request data
        $shop = $request->input('store_domain');
        if ($shop) {
            $session = SessionModel::where('shop', $shop)->first();
            if ($session) {
                return $session;
            }
        }
        
        // Final fallback to first available session
        return SessionModel::first();
    }
}
