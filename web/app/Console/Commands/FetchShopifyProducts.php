<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ShopifyProductService;

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
        $productService = new ShopifyProductService();
        $totalFetched = $productService->fetchProductsForAllShops();
        
        $this->info("All products fetched and updated. Total: $totalFetched products");
        return 0;
    }
}
