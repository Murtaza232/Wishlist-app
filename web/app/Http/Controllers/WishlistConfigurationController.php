<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Session;
use App\Models\WishlistConfiguration;
use App\Models\WishlistFeature;

class WishlistConfigurationController extends HelperController
{
    public function store(Request $request)
    {
       // Get the Session model for the shop
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        // Use the shop domain from the Session model
        $session = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();

        if (!$session) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }

        $data = $request->validate([
            'primary_color' => 'nullable|string',
            'secondary_color' => 'nullable|string',
            'icon_type' => 'nullable|in:heart,star,bookmark',
            'btn_position_on_product_page' => 'nullable|in:above_cart,below_cart,left_of_cart,right_of_cart',
            'btn_position_on_product_image' => 'nullable|in:top_left,top_right,bottom_left,bottom_right',
            'btn_type_product_page' => 'nullable|in:icon_and_text,only_icon,only_text',
            'appearance_btn_product_page' => 'nullable|in:solid,outline,plain',
            'btn_text_product_page_toggle' => 'nullable|in:before_click,after_click',
            'btn_text_product_page' => 'nullable|string',
            'btn_text_product_page_before' => 'nullable|string',
            'btn_text_product_page_after' => 'nullable|string',
            'smart_save' => 'nullable|boolean',
            'social_proof' => 'nullable|boolean',
            'add_items_wishlist_collections_page' => 'nullable|boolean',
            'btn_group_position_collections_page' => 'nullable|in:top_left,top_right,bottom_left,bottom_right',
            'wishlist_page_appearance' => 'nullable|in:side_drawer,separate_page,pop_up_modal',
            'wishlist_page_title' => 'nullable|string',
            'wishlist_btn_launch_position' => 'nullable|in:header,floating_button,navigation_menu',
            'other_settings_wishlist_page' => 'nullable|boolean',
            'permission_to_save_items_cart_page' => 'nullable|boolean',
            'pop_up_title_cart_page' => 'nullable|string',
            'primary_btn_text_cart_page' => 'nullable|string',
            'secondary_btn_text_cart_page' => 'nullable|string',
            'permission_cart_page' => 'nullable|in:ask,always',
            'show_count_floating_btn' => 'nullable|boolean',
            'floating_btn_position' => 'nullable|in:left,right,bottom-left,bottom-right',
        ]);

        $data['shop_id'] = $session->id;

        $config = WishlistConfiguration::where('shop_id', $session->id)->first();
        if ($config) {
            $config->update($data);
        } else {
            $config = WishlistConfiguration::create($data);
        }

            $api = $this->shopifyApiClient($session->shop);
            // 1. Get the shop GID
            $shopGidQuery = '{ shop { id } }';
            $shopGidResp = $api->graph($shopGidQuery);
            $shopGid = $shopGidResp['body']['data']['shop']['id'];

            // 2. Prepare metafields input
            $metafieldsInput = [];
            foreach ($data as $key => $value) {
                if ($key === 'shop_id') continue;
                if ($value === null || $value === '') continue; // skip blank/null values
                if (is_bool($value)) {
                    $type = 'boolean';
                    $value = $value ? 'true' : 'false';
                } elseif (is_int($value)) {
                    $type = 'number_integer';
                } else {
                    $type = 'single_line_text_field';
                }
                $metafieldsInput[] = [
                    'namespace' => 'wishlist',
                    'key' => $key,
                    'type' => $type,
                    'value' => (string)$value,
                    'ownerId' => $shopGid,
                ];
            }
            // 3. Send in batches of 25
            $chunks = array_chunk($metafieldsInput, 25);
            foreach ($chunks as $chunk) {
                $metafieldsString = implode(',', array_map(function($m) {
                    return '{namespace: "'.$m['namespace'].'", key: "'.$m['key'].'", type: "'.$m['type'].'", value: "'.addslashes($m['value']).'", ownerId: "'.$m['ownerId'].'"}';
                }, $chunk));
                $mutation = "mutation metafieldsSet { metafieldsSet(metafields: [$metafieldsString]) { metafields { id key namespace value type } userErrors { field message } } }";
                $response=$api->graph($mutation);
               
            }
        return response()->json([
            'success' => true,
            'data' => $config->fresh()
        ]);
    }
    public function shop(Request $request){
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        // Use the shop domain from the Session model
        $session = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();

        if (!$session) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }
        return $shopSession->shop;
    }
    public function getThemes(Request $request)
    {
        $shopDomain = $this->getShop($request);
        if (!$shopDomain) {
            return response()->json(['error' => 'Shop domain is required.'], 400);
        }
        try {
            $api = $this->shopifyApiClient($shopDomain->shop);
            $query = '
                query {
                    themes(first: 20) {
                        edges {
                            node {
                                name
                                id
                                role
                            }
                        }
                    }
                }
            ';
            $response = $api->graph($query);   
            $themes = [];
            $activeThemeId = null;
            foreach($response['body']['data']['themes']['edges'] as $theme){
                $themeData = [
                    'shop_id' => $shopDomain->id,
                    'theme_id' => $theme['node']['id'],
                    'theme_name' => $theme['node']['name'],
                    'active_theme' => strtolower($theme['node']['role']),
                ];
                if (strtolower($theme['node']['role']) === 'main') {
                    $activeThemeId = $theme['node']['id'];
                }
                $themes[] = $themeData;
            }

            // Get product handle
            $themeId = str_replace('gid://shopify/OnlineStoreTheme/', '', $activeThemeId);
            $productQuery = 'query GetProducts {
  products(first: 1) {
    nodes {
      handle
    }
  }
}';
            $productResponse = $api->graph($productQuery);
            $products = $productResponse['body']['data']['products']['nodes'] ?? [];
            $productHandle = (!empty($products) && !empty($products[0]['handle'])) ? $products[0]['handle'] : null;

            $shopHandle = str_replace('.myshopify.com', '', $shopDomain->shop);
            $appApiKey = env('SHOPIFY_API_KEY');

            return response()->json([
                'success' => true,
                'themes' => $themes,
                'selectedTheme' => $activeThemeId,
                'shop' => $shopHandle,
                'handle' => $productHandle,
                'apikey' => $appApiKey,
                'activeTheme' => $themeId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch themes or product handle: ' . $e->getMessage()
            ], 500);
        }
    }
    // public function EditorUrl(Request $request){
    //     $shopDomain =$this->getShop($request);
    //     if (!$shopDomain) {
    //         return response()->json(['error' => 'Shop domain is required.'], 400);
    //     }
    //     $activeTheme = $this->getActiveTheme($request);
    //     if(!$activeTheme){
    //         return response()->json(['error' => 'No active theme found.'], 400);
    //     }
    //  $shopHandle= str_replace('.myshopify.com', '', $shopDomain->shop);
    //  $themeId = str_replace('gid://shopify/OnlineStoreTheme/', '', $activeTheme);
    //    $appApiKey = env('SHOPIFY_API_KEY'); 
    //    $appHandle = 'wishlist-app-embed';
       
    //    $url = "https://admin.shopify.com/store/{$shopHandle}/themes/{$themeId}/editor?context=apps&appEmbed={$appApiKey}%2F{$appHandle}";
    //    return response()->json([
    //     'success' => true,
    //     'data' => $url
    //    ]);
    // }
    // public function EditorCollectionUrl(Request $request){
    //     $shopDomain =$this->getShop($request);
    //     if (!$shopDomain) {
    //         return response()->json(['error' => 'Shop domain is required.'], 400);
    //     }
    //     $activeTheme = $this->getActiveTheme($request);
    //     if(!$activeTheme){
    //         return response()->json(['error' => 'No active theme found.'], 400);
    //     }
    //  $shopHandle= str_replace('.myshopify.com', '', $shopDomain->shop);
    //  $themeId = str_replace('gid://shopify/OnlineStoreTheme/', '', $activeTheme);
    //    $appApiKey = env('SHOPIFY_API_KEY'); 
    //    $url = "https://admin.shopify.com/store/{$shopHandle}/themes/{$themeId}/editor?context=apps&appEmbed={$appApiKey}%2Fwishlist-collections-embed";
    //    return response()->json([
    //     'success' => true,
    //     'data' => $url
    //    ]);
    // }
    protected function getActiveTheme(Request $request){
        $shopDomain = $this->getShop($request);
        if (!$shopDomain) {
            return response()->json(['error' => 'Shop domain is required.'], 400);
        }
        $api = $this->shopifyApiClient($shopDomain->shop);
        $query = '
            query {
                themes(first: 20) {
                    edges {
                        node {
                            name
                            id
                            role
                        }
                    }
                }
            }
        ';
        $response = $api->graph($query);   
        foreach($response['body']['data']['themes']['edges'] as $theme){
            if (strtolower($theme['node']['role']) === 'main') {
                return $theme['node']['id'];
            }
        }
        return response()->json([
            'success' => false,
            'data' => 'No active theme found'
        ], 404);
    }

    public function storeOrUpdateFeatures(Request $request)
    {
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        // Use the shop domain from the Session model
        $session = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();

        if (!$session) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }

    
        $data = $request->validate([
            'allow_multiple_items_wishlist' => 'nullable|boolean',
            'allow_to_share_wishlist' => 'nullable|boolean',
            'allow_to_smart_save' => 'nullable|boolean',
            'smart_save_visit_count' => 'nullable|integer',
            'smart_save_notification_position' => 'nullable|in:top_left,top_right,bottom_left,bottom_right',
            'sign_up_confirmation' => 'nullable|boolean',
            'sign_up_confirmation_email' => 'nullable|boolean',
            'sign_up_confirmation_sms' => 'nullable|boolean',
            'item_added' => 'nullable|boolean',
            'item_added_email' => 'nullable|boolean',
            'item_added_sms' => 'nullable|boolean',
            'wishlist_shared' => 'nullable|boolean',
            'wishlist_shared_email' => 'nullable|boolean',
            'wishlist_reminder' => 'nullable|boolean',
            'wishlist_reminder_email' => 'nullable|boolean',
            'wishlist_reminder_sms' => 'nullable|boolean',
            'wishlist_reminder_time' => 'nullable|integer',
            'wishlist_reminder_unit' => 'nullable|string',
            'saved_for_later_reminder' => 'nullable|boolean',
            'saved_for_later_reminder_email' => 'nullable|boolean',
            'saved_for_later_reminder_sms' => 'nullable|boolean',
            'saved_for_later_reminder_time' => 'nullable|integer',
            'saved_for_later_reminder_unit' => 'nullable|string',
            'low_stock_alert' => 'nullable|boolean',
            'low_stock_alert_email' => 'nullable|boolean',
            'low_stock_alert_sms' => 'nullable|boolean',
            'stock_alert_threshold_units' => 'nullable|integer',
            'price_drop_alert' => 'nullable|boolean',
            'price_drop_alert_email' => 'nullable|boolean',
            'price_drop_alert_sms' => 'nullable|boolean',
            'price_drop_alert_threshold_percent' => 'nullable|integer',
            'back_in_stock_alert' => 'nullable|boolean',
            'back_in_stock_alert_email' => 'nullable|boolean',
            'back_in_stock_alert_sms' => 'nullable|boolean',
        ]);
        $data['shop_id'] = $session->id;
    
        $feature = WishlistFeature::where('shop_id', $session->id)->first();
        if ($feature) {
            $feature->update($data);
        } else {
            $feature = WishlistFeature::create($data);
        }
    
        return response()->json([
            'success' => true,
            'data' => $feature
        ]);
    }
    public function getWishlistMetafields(Request $request) {
        $shopSession = $this->getShop($request);
        $session = Session::where('shop', $shopSession->shop)->first();
        $api = $this->shopifyApiClient($session->shop);
        $query = '{
          shop {
            metafields(first: 30, namespace: "wishlist") {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }';
        $result = $api->graph($query);
        return response()->json($result['body']['data']['shop']['metafields']['edges']);
    }
    
}
