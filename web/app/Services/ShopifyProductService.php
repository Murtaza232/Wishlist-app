<?php

namespace App\Services;

use App\Models\Session;
use App\Models\Product;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Session as ShopifySession;
use Illuminate\Support\Facades\Log;

class ShopifyProductService
{
    /**
     * Fetch all products from Shopify and store/update them in the local products table.
     *
     * @param string $shopName
     * @return int Number of products fetched
     */
    public function fetchProductsForShop(string $shopName): int
    {
        $shop = Session::where('shop', $shopName)->first();
        
        if (!$shop) {
            Log::error("Shop not found: $shopName");
            return 0;
        }

        $api = $this->shopifyApiClient($shop);
        $hasNextPage = true;
        $endCursor = null;
        $fetched = 0;

        while ($hasNextPage) {
            $query = '{
              products(first: 100' . ($endCursor ? ', after: "' . $endCursor . '"' : '') . ') {
                edges {
                  node {
                    id
                    title
                    variants(first: 10) {
                      edges {
                        node {
                          id
                          inventoryQuantity
                          price
                          compareAtPrice
                        }
                      }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }';

            $response = $api->graph($query);
            $products = $response['body']['data']['products']['edges'] ?? [];

            foreach ($products as $edge) {
                $product = $edge['node'];
                $variant = $product['variants']['edges'][0]['node'] ?? null;
                $shopifyProductId = preg_replace('/[^0-9]/', '', $product['id']);
                
                // Handle stock calculation - Shopify can return negative values
                $rawStock = $variant ? $variant['inventoryQuantity'] : 0;
                $stock = max(0, $rawStock); // Ensure stock is never negative
                
                // Get price information
                $price = $variant ? (float)($variant['price'] ?? 0) : 0;
                $compareAtPrice = $variant ? (float)($variant['compareAtPrice'] ?? 0) : 0;

                Product::updateOrCreate(
                    [
                        'shop_id' => $shop->id,
                        'shopify_product_id' => $shopifyProductId,
                    ],
                    [
                        'title' => $product['title'],
                        'stock' => $stock,
                        'price' => $price,
                        'compare_at_price' => $compareAtPrice,
                        'last_price_check' => now(),
                    ]
                );
                $fetched++;
            }

            $pageInfo = $response['body']['data']['products']['pageInfo'] ?? [];
            $hasNextPage = $pageInfo['hasNextPage'] ?? false;
            $endCursor = $pageInfo['endCursor'] ?? null;
        }

        Log::info("Fetched/updated $fetched products for shop: $shopName");
        return $fetched;
    }

    /**
     * Fetch products for all shops
     *
     * @return int Total number of products fetched across all shops
     */
    public function fetchProductsForAllShops(): int
    {
        $shops = Session::all();
        $totalFetched = 0;

        foreach ($shops as $shop) {
            $fetched = $this->fetchProductsForShop($shop->shop);
            $totalFetched += $fetched;
        }

        Log::info("Total products fetched/updated across all shops: $totalFetched");
        return $totalFetched;
    }

    /**
     * Create Shopify API client for a specific shop
     *
     * @param Session $shop
     * @return BasicShopifyAPI
     */
    private function shopifyApiClient(Session $shop): BasicShopifyAPI
    {
        $options = new Options();
        $options->setType(true);
        $options->setVersion(env('SHOPIFY_API_VERSION'));
        $options->setApiKey(env('SHOPIFY_API_KEY'));
        $options->setApiSecret(env('SHOPIFY_API_SECRET'));
        $options->setApiPassword($shop->access_token);
        
        $api = new BasicShopifyAPI($options);
        $api->setSession(new ShopifySession($shop->shop));
        
        return $api;
    }
} 