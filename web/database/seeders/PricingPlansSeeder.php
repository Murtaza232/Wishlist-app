<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PricingPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'For stores exploring a basic Wishlist. Limited features & usage.',
                'monthly_price' => 0,
                'annual_price' => 0,
                'currency' => 'USD',
                'usage_limit' => '500 lifetime wishlist actions',
                'features' => json_encode([
                    ['icon' => '❤', 'text' => 'Wishlist on Product Page, Collections & Cart'],
                    ['icon' => '👤', 'text' => 'Wishlist in Customer Accounts'],
                    ['icon' => '🔗', 'text' => 'Share Wishlist via Social Media']
                ]),
                'badge' => null,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'A fully featured wishlist. Highly configurable. Maximum engagement',
                'monthly_price' => 59.99,
                'annual_price' => 499.99,
                'currency' => 'USD',
                'usage_limit' => '10,000 wishlist actions per month',
                'features' => json_encode([
                    ['icon' => '🛒', 'text' => 'Advanced Integrations (e.g. Meta Pixel)'],
                    ['icon' => '🏪', 'text' => 'Shopify Markets Support (Coming Soon)']
                ]),
                'badge' => 'Best Match',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'For large brands needing API access to further tailor their Wishlist experience',
                'monthly_price' => 99.99,
                'annual_price' => 829.99,
                'currency' => 'USD',
                'usage_limit' => '25,000 wishlist actions per month',
                'features' => json_encode([
                    ['icon' => '</>', 'text' => 'Advanced Setup & Configuration Flexibility'],
                    ['icon' => '▶', 'text' => 'REST & Javascript APIs access']
                ]),
                'badge' => null,
                'is_active' => true,
                'sort_order' => 3,
            ],
           
        ];

        foreach ($plans as $plan) {
            DB::table('pricing_plans')->insert($plan);
        }
    }
}
