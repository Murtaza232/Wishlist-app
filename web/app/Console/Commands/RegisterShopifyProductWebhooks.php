<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Session;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Session as ShopifySession;

class RegisterShopifyProductWebhooks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shopify:register-product-webhooks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Register product create, update, and delete webhooks with Shopify for each shop.';

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
        $baseUrl = config('app.url');
        $webhooks = [
            [
                'topic' => 'products/create',
                'address' => $baseUrl . '/webhook/shopify/product/create',
            ],
            [
                'topic' => 'products/update',
                'address' => $baseUrl . '/webhook/shopify/product/update',
            ],
            [
                'topic' => 'products/delete',
                'address' => $baseUrl . '/webhook/shopify/product/delete',
            ],
        ];
        foreach ($shops as $shop) {
            $this->info('Registering webhooks for shop: ' . $shop->shop);
            $api = $this->shopifyApiClient($shop->shop);
            foreach ($webhooks as $webhook) {
                $payload = [
                    'webhook' => [
                        'topic' => $webhook['topic'],
                        'address' => $webhook['address'],
                        'format' => 'json',
                    ]
                ];
                $response = $api->rest('POST', 'webhooks.json', $payload);
                if (isset($response['body']['webhook'])) {
                    $this->info('  Registered: ' . $webhook['topic']);
                } else {
                    $this->error('  Failed: ' . $webhook['topic']);
                }
            }
        }
        $this->info('All product webhooks registered.');
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
