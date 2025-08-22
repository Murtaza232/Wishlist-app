<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\WishlistNotificationService;

class NotificationTestController extends HelperController
{
    /**
     * Send a test notification email for a given type to a supplied address.
     */
    public function sendTest(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'email' => 'required|email',
        ]);

        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Shop session not found'], 400);
        }

        $type = $request->input('type');
        $toEmail = $request->input('email');

        try {
            $service = app(WishlistNotificationService::class);

            // Build a proper Mailable per type with sample data so SMTP fallback can work
            $emailTemplate = null;
            try {
                $map = [
                    'wishlist_reminder' => 'wishlist_reminder',
                    'saved_for_later_reminder' => 'saved_for_later_reminder',
                    'low_stock_alert' => 'low_stock_alert',
                    'back_in_stock_alert' => 'back_in_stock_alert',
                    'price_drop_alert' => 'price_drop_alert',
                ];
                $key = $map[$type] ?? null;
                if ($key) {
                    $emailTemplate = (new WishlistNotificationService())->getEmailTemplate($session->id, $key);
                }
            } catch (\Throwable $e) {}

            $customerData = [
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => $toEmail,
                'phone' => null,
            ];
            $shopData = app(WishlistNotificationService::class)->getShop($request);
            $wishlistData = [
                'title' => 'Test Wishlist',
                'link' => 'https://example.com/wishlist',
                'count' => 1,
            ];

            $mailable = null;
            switch ($type) {
                case 'low_stock_alert': {
                    $items = [(object) [
                        'title' => 'Sample Product',
                        'price' => 19.99,
                        'url' => 'https://example.com/products/sample'
                    ]];
                    $mailable = new \App\Mail\LowStockAlert($customerData, $shopData, $wishlistData, $emailTemplate ?? [], $items);
                    break;
                }
                case 'price_drop_alert': {
                    $items = [(object) [
                        'title' => 'Sample Product',
                        'old_price' => 29.99,
                        'price' => 19.99,
                        'product_url' => 'https://example.com/products/sample'
                    ]];
                    $mailable = new \App\Mail\PriceDropAlert($customerData, $shopData, $wishlistData, $emailTemplate ?? [], $items);
                    break;
                }
                case 'back_in_stock_alert': {
                    $items = [(object) [
                        'title' => 'Back In Stock Product',
                        'price' => 39.99,
                        'url' => 'https://example.com/products/back-in-stock'
                    ]];
                    $mailable = new \App\Mail\BackInStockAlert($customerData, $shopData, $wishlistData, $emailTemplate ?? [], $items);
                    break;
                }
                case 'wishlist_reminder':
                case 'saved_for_later_reminder': {
                    $productData = [
                        'title' => 'Wishlisted Product',
                        'price' => 24.99,
                        'url' => 'https://example.com/products/wishlisted'
                    ];
                    $mailable = new \App\Mail\WishlistSharedNotification($customerData, $shopData, $wishlistData, $emailTemplate ?? [], $productData);
                    break;
                }
                default: {
                    // Fallback to a generic template if type unknown
                    $productData = [ 'title' => 'Sample', 'price' => 9.99, 'url' => 'https://example.com' ];
                    $mailable = new \App\Mail\WishlistSharedNotification($customerData, $shopData, $wishlistData, $emailTemplate ?? [], $productData);
                }
            }

            // Force subject to "Test Email" for all test sends
            if ($mailable) {
                $mailable->subject('Test Email');
            }

            $message = [
                'to' => $toEmail,
                'subject' => 'Test Email',
                'mailable' => $mailable,
            ];

            $ok = $service->sendViaSelectedProvider($message, [], $session->id, 'email');
            if (!$ok) {
                return response()->json(['success' => false, 'message' => 'Provider send failed. Check provider settings or SMTP config.'], 500);
            }
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}


