<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class CustomerWebhookController extends Controller
{
    /**
     * Handle customer creation webhook
     */
    public function customerCreate(Request $request): JsonResponse
    {
        try {
            $shopDomain = $request->header('x-shopify-shop-domain');
            Log::info('Customer create webhook received for shop: ' . $shopDomain);

            if (!$shopDomain) {
                Log::error('No shop domain in customer create webhook');
                return response()->json(['error' => 'Shop domain not found'], 400);
            }

            $session = Session::where('shop', $shopDomain)->first();
            if (!$session) {
                Log::error('Shop session not found for customer create webhook: ' . $shopDomain);
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $customerData = $request->all();
            Log::info('Customer create webhook data:', $customerData);

            // Check if customer already exists
            $existingCustomer = Customer::where('shopify_customer_id', $customerData['id'])
                                      ->where('shop_id', $session->id)
                                      ->first();

            if ($existingCustomer) {
                Log::info('Customer already exists, updating: ' . $customerData['id']);
                $this->updateCustomerFromWebhook($existingCustomer, $customerData);
            } else {
                Log::info('Creating new customer from webhook: ' . $customerData['id']);
                $this->createCustomerFromWebhook($session, $customerData);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Error in customer create webhook: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Handle customer update webhook
     */
    public function customerUpdate(Request $request): JsonResponse
    {
        try {
            $shopDomain = $request->header('x-shopify-shop-domain');
            Log::info('Customer update webhook received for shop: ' . $shopDomain);

            if (!$shopDomain) {
                Log::error('No shop domain in customer update webhook');
                return response()->json(['error' => 'Shop domain not found'], 400);
            }

            $session = Session::where('shop', $shopDomain)->first();
            if (!$session) {
                Log::error('Shop session not found for customer update webhook: ' . $shopDomain);
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $customerData = $request->all();
            Log::info('Customer update webhook data:', $customerData);

            // Find existing customer
            $customer = Customer::where('shopify_customer_id', $customerData['id'])
                              ->where('shop_id', $session->id)
                              ->first();

            if ($customer) {
                Log::info('Updating customer from webhook: ' . $customerData['id']);
                $this->updateCustomerFromWebhook($customer, $customerData);
            } else {
                Log::info('Customer not found, creating new: ' . $customerData['id']);
                $this->createCustomerFromWebhook($session, $customerData);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Error in customer update webhook: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Handle customer deletion webhook
     */
    public function customerDelete(Request $request): JsonResponse
    {
        try {
            $shopDomain = $request->header('x-shopify-shop-domain');
            Log::info('Customer delete webhook received for shop: ' . $shopDomain);

            if (!$shopDomain) {
                Log::error('No shop domain in customer delete webhook');
                return response()->json(['error' => 'Shop domain not found'], 400);
            }

            $session = Session::where('shop', $shopDomain)->first();
            if (!$session) {
                Log::error('Shop session not found for customer delete webhook: ' . $shopDomain);
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $customerData = $request->all();
            Log::info('Customer delete webhook data:', $customerData);

            // Find and delete customer
            $customer = Customer::where('shopify_customer_id', $customerData['id'])
                              ->where('shop_id', $session->id)
                              ->first();

            if ($customer) {
                Log::info('Deleting customer from webhook: ' . $customerData['id']);
                $customer->delete();
            } else {
                Log::info('Customer not found for deletion: ' . $customerData['id']);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Error in customer delete webhook: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create customer from webhook data
     */
    private function createCustomerFromWebhook(Session $session, array $customerData): void
    {
        $customer = Customer::create([
            'shop_id' => $session->id,
            'shopify_customer_id' => $customerData['id'],
            'first_name' => $customerData['first_name'] ?? null,
            'last_name' => $customerData['last_name'] ?? null,
            'email' => $customerData['email'],
            'phone' => $customerData['phone'] ?? null,
            'city' => $customerData['default_address']['city'] ?? null,
            'province' => $customerData['default_address']['province'] ?? null,
            'country' => $customerData['default_address']['country'] ?? null,
            'zip' => $customerData['default_address']['zip'] ?? null,
            'total_spent' => $customerData['total_spent'] ?? 0.00,
            'orders_count' => $customerData['orders_count'] ?? 0,
            'status' => $customerData['state'] === 'enabled' ? 'active' : 'inactive',
            // 'last_order_date' => $customerData['last_order_id'] ? date('Y-m-d H:i:s', strtotime($customerData['updated_at'])) : null,
            'created_at_shopify' => date('Y-m-d H:i:s', strtotime($customerData['created_at'])),
        ]);

        Log::info('Customer created from webhook: ' . $customer->id);
    }

    /**
     * Update customer from webhook data
     */
    private function updateCustomerFromWebhook(Customer $customer, array $customerData): void
    {
        $customer->update([
            'first_name' => $customerData['first_name'] ?? null,
            'last_name' => $customerData['last_name'] ?? null,
            'email' => $customerData['email'],
            'phone' => $customerData['phone'] ?? null,
            'city' => $customerData['default_address']['city'] ?? null,
            'province' => $customerData['default_address']['province'] ?? null,
            'country' => $customerData['default_address']['country'] ?? null,
            'zip' => $customerData['default_address']['zip'] ?? null,
            'total_spent' => $customerData['total_spent'] ?? 0.00,
            'orders_count' => $customerData['orders_count'] ?? 0,
            'status' => $customerData['state'] === 'enabled' ? 'active' : 'inactive',
            // 'last_order_date' => $customerData['last_order_id'] ? date('Y-m-d H:i:s', strtotime($customerData['updated_at'])) : null,
        ]);

        Log::info('Customer updated from webhook: ' . $customer->id);
    }
} 