<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Session;
use App\Models\Product;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Session as ShopifySession;

class FetchShopifyProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shopify:fetch-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch all products from Shopify and store/update them in the local products table.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $shops = Session::all();
        foreach ($shops as $shop) {
            $this->info('Fetching products for shop: ' . $shop->shop);
            $api = $this->shopifyApiClient($shop->shop);
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
                    $stock = $variant ? $variant['inventoryQuantity'] : 0;
                    Product::updateOrCreate(
                        [
                            'shop_id' => $shop->id,
                            'shopify_product_id' => $shopifyProductId,
                        ],
                        [
                            'title' => $product['title'],
                            'stock' => $stock,
                        ]
                    );
                    $fetched++;
                }
                $pageInfo = $response['body']['data']['products']['pageInfo'] ?? [];
                $hasNextPage = $pageInfo['hasNextPage'] ?? false;
                $endCursor = $pageInfo['endCursor'] ?? null;
            }
            $this->info("Fetched/updated $fetched products for shop: {$shop->shop}");
        }
        $this->info('All products fetched and updated.');
        return 0;
    }

    private function shopifyApiClient($shop_name)
    {
        $shop = Session::where('shop', $shop_name)->first();
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
