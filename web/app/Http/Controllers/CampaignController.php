<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Campaign;
use App\Models\CampaignSignup;
use App\Models\Session;
use Illuminate\Support\Facades\DB;

class CampaignController extends HelperController
{
    public function save(Request $request): JsonResponse
    {
        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Shop session not found'], 400);
        }

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'total_winners' => 'nullable|integer|min:0',
            'voucher_amount' => 'nullable|numeric|min:0',
        ]);

        $data['session_id'] = $session->id;

        // Ensure only one active campaign at a time by session
        $campaign = Campaign::updateOrCreate(
            ['session_id' => $session->id, 'status' => 'active'],
            $data
        );

        return response()->json(['success' => true, 'data' => $campaign]);
    }

    public function current(Request $request): JsonResponse
    {
        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Shop session not found'], 400);
        }

        $campaign = Campaign::where('session_id', $session->id)
            ->where('status', 'active')
            ->orderByDesc('id')
            ->first();

        if (!$campaign) {
            return response()->json(['success' => true, 'data' => null]);
        }

        // Aggregate performance stats within the campaign window
        $start = \Carbon\Carbon::parse($campaign->start_date)->startOfDay();
        $end = \Carbon\Carbon::parse($campaign->end_date)->endOfDay();

        $signups = CampaignSignup::where('campaign_id', $campaign->id)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $wishlistedShoppers = DB::table('wishlist_items')
            ->where('wishlist_items.shop_id', $session->id)
            ->whereBetween('wishlist_items.created_at', [$start, $end])
            ->distinct('customer_id')
            ->count('customer_id');

        $wishlistActions = DB::table('wishlist_items')
            ->where('wishlist_items.shop_id', $session->id)
            ->whereBetween('wishlist_items.created_at', [$start, $end])
            ->count();

        $wishlistValue = DB::table('wishlist_items')
            ->leftJoin('products', function ($join) use ($session) {
                $join->on('products.shopify_product_id', '=', 'wishlist_items.product_id')
                    ->where('products.shop_id', '=', $session->id);
            })
            ->where('wishlist_items.shop_id', $session->id)
            ->whereBetween('wishlist_items.created_at', [$start, $end])
            ->selectRaw('SUM(COALESCE(wishlist_items.added_price, products.price, 0)) as total')
            ->value('total');

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => $campaign,
                'metrics' => [
                    'total_signups' => $signups,
                    'wishlisted_shoppers' => (int) ($wishlistedShoppers ?? 0),
                    'wishlist_actions' => (int) ($wishlistActions ?? 0),
                    'wishlist_value' => (float) ($wishlistValue ?? 0),
                ]
            ]
        ]);
    }

    public function trackSignup(Request $request): JsonResponse
    {
        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Shop session not found'], 400);
        }

        $campaign = Campaign::where('session_id', $session->id)
            ->where('status', 'active')
            ->first();

        if (!$campaign) {
            return response()->json(['success' => false, 'message' => 'No active campaign'], 404);
        }

        $payload = $request->validate([
            'email' => 'nullable|email',
            'customer_id' => 'nullable|numeric',
            'source' => 'nullable|string|max:100'
        ]);

        $payload['campaign_id'] = $campaign->id;
        $payload['session_id'] = $session->id;

        $row = CampaignSignup::create($payload);
        return response()->json(['success' => true, 'data' => $row]);
    }

    public function exportCsv(Request $request)
    {
        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Shop session not found'], 400);
        }
        $campaign = Campaign::where('session_id', $session->id)->where('status', 'active')->first();
        if (!$campaign) {
            return response()->json(['success' => false, 'message' => 'No active campaign'], 404);
        }

        $filename = 'campaign_signups_' . $campaign->id . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=' . $filename,
        ];

        $callback = function () use ($campaign) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'email', 'customer_id', 'source', 'created_at']);
            CampaignSignup::where('campaign_id', $campaign->id)
                ->orderBy('id')
                ->chunk(500, function ($rows) use ($out) {
                    foreach ($rows as $r) {
                        fputcsv($out, [$r->id, $r->email, $r->customer_id, $r->source, $r->created_at]);
                    }
                });
            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }
}


