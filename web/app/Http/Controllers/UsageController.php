<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\UsageService;

class UsageController extends HelperController
{
    /**
     * Get usage statistics for a shop
     */
    public function getStats(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }

            $scope = $request->input('scope', 'month');
            $stats = UsageService::getUsageStats($shopSession->shop, $scope);

            if (!$stats) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve usage statistics.'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Usage statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve usage statistics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a specific action is allowed
     */
    public function checkAction(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'action' => 'required|string|in:create_wishlist,add_item,share_wishlist,send_notification,remove_item,delete_wishlist'
            ]);

            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }

            $action = $request->input('action');
            $scope = $request->input('scope', 'month');

            $isAllowed = UsageService::isActionAllowed($shopSession->shop, $action, $scope);
            $stats = UsageService::getUsageStats($shopSession->shop, $scope);

            return response()->json([
                'success' => true,
                'data' => [
                    'action' => $action,
                    'is_allowed' => $isAllowed,
                    'usage_stats' => $stats
                ],
                'message' => $isAllowed ? 'Action is allowed' : 'Action is not allowed due to usage limits'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check action.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
