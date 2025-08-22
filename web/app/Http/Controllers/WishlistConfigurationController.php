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

        $validated = $request->validate([
            // Onboarding fields
            'onboarding_dismissed' => 'nullable|boolean',
            'onboarding_completed_steps' => 'nullable|array',
            'onboarding_completed_steps.*' => 'nullable|integer',
            'primary_color' => 'nullable|string',
            'secondary_color' => 'nullable|string',
            'icon_type' => 'nullable|in:heart,star,bookmark',
            'button_position_tab' => 'nullable|in:near_cart,product_image',
            'btn_position_on_product_page' => 'nullable|in:above_cart,below_cart,left_of_cart,right_of_cart,top_left,top_right,bottom_left,bottom_right',
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
            'wishlist_drawer_appearance' => 'nullable|in:left,right',
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
            'button_size_product_page' => 'nullable|integer',
            'icon_thickness_product_page' => 'nullable|integer',
            'floating_btn_corner_radius' => 'nullable|integer',
            'text_color' => 'nullable|string',
           
        ]);
        $data = $validated;
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
            // return $data;
            // 2. Prepare metafields input
            $metafieldsInput = [];
            foreach ($data as $key => $value) {
                if ($key === 'shop_id') continue;
                if ($key === 'onboarding_completed_steps' && is_array($value)) {
                    $type = 'json';
                    $value = json_encode($value);
                } else {
                if ($value === null || $value === '') continue; // skip blank/null values
                if (is_bool($value)) {
                    $type = 'boolean';
                    $value = $value ? 'true' : 'false';
                } elseif (is_int($value)) {
                    $type = 'number_integer';
                } else {
                    $type = 'single_line_text_field';
                }
                }
                $metafieldsInput[] = [
                    'namespace' => 'wishlist',
                    'key' => $key,
                    'type' => $type,
                    'value' => (string)$value,
                    'ownerId' => $shopGid,
                ];
            }

            // 3. Send in batches of 25 (Shopify limit)
            $chunks = array_chunk($metafieldsInput, 25);
            $totalChunks = count($chunks);
            $successfulChunks = 0;
            
            foreach ($chunks as $index => $chunk) {
                $metafieldsString = implode(',', array_map(function($m) {
                    return '{namespace: "'.$m['namespace'].'", key: "'.$m['key'].'", type: "'.$m['type'].'", value: "'.addslashes($m['value']).'", ownerId: "'.$m['ownerId'].'"}';
                }, $chunk));
                $mutation = "mutation metafieldsSet { metafieldsSet(metafields: [$metafieldsString]) { metafields { id key namespace value type } userErrors { field message } } }";
                $response = $api->graph($mutation);
                
                // Check for errors in the response
                if (isset($response['body']['data']['metafieldsSet']['userErrors']) && 
                    !empty($response['body']['data']['metafieldsSet']['userErrors'])) {
                    // Log the errors but continue with other chunks
                    \Log::error('Metafields batch ' . ($index + 1) . ' failed: ' . json_encode($response['body']['data']['metafieldsSet']['userErrors']));
                } else {
                    $successfulChunks++;
                }
            }
        
        return response()->json([
            'success' => true,
            'data' => $config->fresh(),
            'metafields_processing' => [
                'total_chunks' => $totalChunks,
                'successful_chunks' => $successfulChunks,
                'total_fields' => count($metafieldsInput)
            ]
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
        
        // Ensure we have a valid Session model
        if (!($shopSession instanceof \App\Models\Session)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid shop session.'
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
        
        // Ensure we have a valid Session model
        if (!($shopDomain instanceof \App\Models\Session)) {
            return response()->json(['error' => 'Invalid shop session.'], 400);
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
    //         return response()->json(['error' =
    // 
    // > 'No active theme found.'], 400);
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
        
        $allMetafields = [];
        $hasNextPage = true;
        $cursor = null;
        
        while ($hasNextPage) {
            $cursorParam = $cursor ? ', after: "' . $cursor . '"' : '';
            $query = '{
              shop {
                metafields(first: 250, namespace: "wishlist"' . $cursorParam . ') {
                  edges {
                    node {
                      id
                      namespace
                      key
                      value
                      type
                    }
                    cursor
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }';
            
            $result = $api->graph($query);
            $metafields = $result['body']['data']['shop']['metafields'];
            
            // Add metafields to our collection
            foreach ($metafields['edges'] as $edge) {
                $allMetafields[] = $edge;
            }
            
            // Check if there are more pages
            $hasNextPage = $metafields['pageInfo']['hasNextPage'];
            $cursor = $metafields['pageInfo']['endCursor'];
        }
        
        $productCardClasses = [
            'product-media-container', 'media-type-image','media-fit-contain', 'product-card', 'card', 'product-grid-item', 'grid__item', 'product-item',
            'product-grid', 'product-list', 'product-box', 'product-container', 'media-wrapper',
            'image-wrapper', 'product-card__container', 'product-card__main', 'product-card-wrapper',
            'card-wrapper', 'card--standard', 'card--media', 'product-card__info'
        ];
        
        return response()->json([
            'metafields' => $allMetafields,
            'product_card_classes' => $productCardClasses,
            'total_metafields' => count($allMetafields)
        ]);
    }
    
    /**
     * Get the wishlist configuration for the current shop (GET endpoint)
     */
    public function show(Request $request)
    {
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }
        $session = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();
        if (!$session) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }
        $config = WishlistConfiguration::where('shop_id', $session->id)->first();
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'No configuration found.'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }
    public function hello(){
        return 'hello';
    }

    public function getExtensionStatus(Request $request)
    {
        $shopSession = $this->getShop($request);
        if (!$shopSession) {
            return response()->json([
                'status' => false,
                'message' => 'Shop domain is required.'
            ], 400);
        }

        $session = Session::where('shop', $shopSession->shop)
            ->whereNotNull('access_token')
            ->first();

        if (!$session) {
            return response()->json([
                'status' => false,
                'message' => 'No valid access token for this shop.'
            ], 400);
        }

        try {
            // Check if the extension is enabled by making a request to the store front
            $shopDomain = $session->shop;
            $app_status = false;
            
            // Try multiple pages to find the extension
            $pages_to_check = [
                'https://' . $shopDomain,
                'https://' . $shopDomain . '/products',
                'https://' . $shopDomain . '/collections'
            ];
            
            $checked_pages = [];
            
            foreach ($pages_to_check as $url) {
                $ch = curl_init();
                $timeout = 10; // Increased timeout
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
                curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language: en-US,en;q=0.5',
                    'Cache-Control: no-cache',
                    'Pragma: no-cache'
                ]);
                $data_file = curl_exec($ch);
                $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                $page_checked = [
                    'url' => $url,
                    'http_code' => $http_code,
                    'response_length' => strlen($data_file),
                    'contains_id' => str_contains($data_file, 'wishlist-extension-status-detector'),
                    'contains_class' => str_contains($data_file, 'wishlist-extension-enabled'),
                    'contains_wishlist' => str_contains($data_file, 'wishlist'),
                    'contains_extension' => str_contains($data_file, 'extension'),
                    'contains_div' => str_contains($data_file, '<div'),
                    'contains_comment' => str_contains($data_file, '<!--'),
                    'contains_unique_comment' => str_contains($data_file, 'Unique div to detect if extension is enabled'),
                    'sample_content' => substr($data_file, 0, 1000), // First 1000 chars to see what we're getting
                    'full_response_preview' => substr($data_file, 0, 2000) // First 2000 chars for better debugging
                ];
                
                $checked_pages[] = $page_checked;
                
                // Check if our unique div exists in the HTML
                if (str_contains($data_file, 'wishlist-extension-status-detector') || 
                    str_contains($data_file, 'wishlist-extension-enabled') ||
                    str_contains($data_file, 'wishlist-extension-status-detector') ||
                    str_contains($data_file, 'Unique div to detect if extension is enabled')) {
                    $app_status = true;
                    break; // Found it, no need to check other pages
                }
            }
            
            // Check if store is showing "Coming Soon" page
            $is_coming_soon = false;
            if (str_contains($data_file, 'Coming Soon') || 
                str_contains($data_file, 'ShopifySans') ||
                str_contains($data_file, 'cdn.shopify.com/shopify-marketing_assets')) {
                $is_coming_soon = true;
            }
            
            // Debug: Let's see what we're actually getting
            $debug_info = [
                'shop_domain' => $shopDomain,
                'app_status' => $app_status,
                'checked_pages' => $checked_pages,
                'total_pages_checked' => count($checked_pages),
                'is_coming_soon' => $is_coming_soon,
                'store_status' => $is_coming_soon ? 'Coming Soon/Password Protected' : 'Published',
                'search_strings' => [
                    'wishlist-extension-status-detector',
                    'wishlist-extension-enabled'
                ]
            ];
            
            // If store is coming soon, we can't check the extension status via DOM
            if ($is_coming_soon) {
                return response()->json([
                    'status' => true,
                    'extension_enabled' => false,
                    'message' => 'Store is in Coming Soon mode. Extension status cannot be determined via DOM check.',
                    'debug' => $debug_info
                ]);
            }
            
            return response()->json([
                'status' => true,
                'extension_enabled' => $app_status,
                'message' => $app_status ? 'Extension is enabled in store front' : 'Extension is not enabled in store front',
                'debug' => $debug_info
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error checking extension status: ' . $e->getMessage(),
                'extension_enabled' => false
            ], 500);
        }
    }
}
