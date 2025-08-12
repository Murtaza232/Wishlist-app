<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Shopify\Clients\Rest;

class CustomerController extends HelperController
{
    /**
     * Get all customers for a specific shop.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            Log::info('Customer index request for shop: ' . $shopSession->shop);

            $query = Customer::byShop($shopSession->id);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
                Log::info('Applied search filter: ' . $request->search);
            }

            // Apply status filter
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
                Log::info('Applied status filter: ' . $request->status);
            }

            // Get paginated results
            $customers = $query->orderBy('created_at', 'desc')
                              ->paginate($request->get('per_page', 15));

            Log::info('Retrieved ' . count($customers->items()) . ' customers for shop: ' . $shopSession->shop);

            return response()->json([
                'success' => true,
                'data' => $customers->items(),
                'pagination' => [
                    'current_page' => $customers->currentPage(),
                    'last_page' => $customers->lastPage(),
                    'per_page' => $customers->perPage(),
                    'total' => $customers->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching customers: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to fetch customers: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Store a new customer or update existing one.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $request->validate([
                'shopify_customer_id' => 'required|string',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'province' => 'nullable|string|max:255',
                'country' => 'nullable|string|max:255',
                'zip' => 'nullable|string|max:255',
                'total_spent' => 'nullable|numeric|min:0',
                'orders_count' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:active,inactive,disabled',
                'last_order_date' => 'nullable|date',
                'created_at_shopify' => 'nullable|date',
            ]);

            // Check if customer already exists
            $customer = Customer::where('shopify_customer_id', $request->shopify_customer_id)
                              ->where('shop_id', $shopSession->id)
                              ->first();

            if ($customer) {
                // Update existing customer
                $customer->update($request->except(['shopify_customer_id', 'shop_id']));
                $message = 'Customer updated successfully';
            } else {
                // Create new customer
                $customer = Customer::create(array_merge(
                    $request->all(),
                    ['shop_id' => $shopSession->id]
                ));
                $message = 'Customer created successfully';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $customer
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error storing customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to store customer'], 500);
        }
    }

    /**
     * Sync customers from Shopify.
     */
    public function syncFromShopify(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            // Mark app as installed if not already marked
            $shopSession->markAsInstalled();

            // Register customer webhooks
            $webhookService = new \App\Services\WebhookService();
            $webhooksRegistered = $webhookService->registerCustomerWebhooks($shopSession);

            if (!$webhooksRegistered) {
                Log::warning('Failed to register customer webhooks for shop: ' . $shopSession->shop);
            }

            // Create Shopify REST client
            $client = new Rest($shopSession->shop, $shopSession->access_token);

            // Get customers from Shopify
            $response = $client->get('customers', [
                'limit' => 250, // Maximum limit per request
            ]);

            if ($response->getStatusCode() !== 200) {
                Log::error('Shopify API error: ' . $response->getStatusCode());
                return response()->json(['error' => 'Failed to fetch customers from Shopify'], 500);
            }

            // Decode the response body
            $responseBody = json_decode($response->getBody()->getContents(), true);
            
            if (!$responseBody || !isset($responseBody['customers'])) {
                Log::error('Invalid response from Shopify API');
                return response()->json(['error' => 'Invalid response from Shopify API'], 500);
            }

            $shopifyCustomers = $responseBody['customers'];
            $syncedCount = 0;
            $updatedCount = 0;

            foreach ($shopifyCustomers as $shopifyCustomer) {
                $customerData = [
                    'shopify_customer_id' => $shopifyCustomer['id'],
                    'first_name' => $shopifyCustomer['first_name'] ?? null,
                    'last_name' => $shopifyCustomer['last_name'] ?? null,
                    'email' => $shopifyCustomer['email'],
                    'phone' => $shopifyCustomer['phone'] ?? null,
                    'city' => $shopifyCustomer['default_address']['city'] ?? null,
                    'province' => $shopifyCustomer['default_address']['province'] ?? null,
                    'country' => $shopifyCustomer['default_address']['country'] ?? null,
                    'zip' => $shopifyCustomer['default_address']['zip'] ?? null,
                    'total_spent' => $shopifyCustomer['total_spent'] ?? 0.00,
                    'orders_count' => $shopifyCustomer['orders_count'] ?? 0,
                    'status' => $shopifyCustomer['state'] === 'enabled' ? 'active' : 'inactive',
                    'last_order_date' => $shopifyCustomer['last_order_id'] ? date('Y-m-d H:i:s', strtotime($shopifyCustomer['updated_at'])) : null,
                    'created_at_shopify' => date('Y-m-d H:i:s', strtotime($shopifyCustomer['created_at'])),
                ];

                // Check if customer exists
                $existingCustomer = Customer::where('shopify_customer_id', $shopifyCustomer['id'])
                                          ->where('shop_id', $shopSession->id)
                                          ->first();

                if ($existingCustomer) {
                    $existingCustomer->update($customerData);
                    $updatedCount++;
                } else {
                    Customer::create(array_merge($customerData, ['shop_id' => $shopSession->id]));
                    $syncedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Customers synced successfully',
                'data' => [
                    'synced' => $syncedCount,
                    'updated' => $updatedCount,
                    'total' => count($shopifyCustomers),
                    'webhooks_registered' => $webhooksRegistered,
                    'app_installed_at' => $shopSession->installed_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error syncing customers from Shopify: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to sync customers: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get customer statistics for a shop.
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            Log::info('Customer stats request for shop: ' . $shopSession->shop);

            $stats = [
                'total_customers' => Customer::byShop($shopSession->id)->count(),
                'active_customers' => Customer::byShop($shopSession->id)->active()->count(),
                'total_revenue' => Customer::byShop($shopSession->id)->sum('total_spent'),
                'avg_order_value' => Customer::byShop($shopSession->id)->where('orders_count', '>', 0)->avg('total_spent') ?? 0,
                'customers_with_orders' => Customer::byShop($shopSession->id)->where('orders_count', '>', 0)->count(),
            ];

            Log::info('Retrieved stats for shop: ' . $shopSession->shop . ' - Total customers: ' . $stats['total_customers']);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching customer stats: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to fetch customer statistics: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Show a specific customer.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $customer = Customer::byShop($shopSession->id)->find($id);
            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $customer
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch customer'], 500);
        }
    }

    /**
     * Update a customer.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $customer = Customer::byShop($shopSession->id)->find($id);
            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'province' => 'nullable|string|max:255',
                'country' => 'nullable|string|max:255',
                'zip' => 'nullable|string|max:255',
                'total_spent' => 'nullable|numeric|min:0',
                'orders_count' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:active,inactive,disabled',
                'last_order_date' => 'nullable|date',
            ]);

            $customer->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $customer
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update customer'], 500);
        }
    }

    /**
     * Get webhook status and installation info.
     */
    public function getWebhookStatus(Request $request): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $webhookService = new \App\Services\WebhookService();
            $webhooks = $webhookService->getWebhooks($shopSession);

            $customerWebhooks = [];
            $requiredTopics = ['customers/create', 'customers/update', 'customers/delete'];

            foreach ($webhooks['webhooks'] ?? [] as $webhook) {
                if (in_array($webhook['topic'], $requiredTopics)) {
                    $customerWebhooks[] = [
                        'topic' => $webhook['topic'],
                        'address' => $webhook['address'],
                        'status' => $webhook['status'] ?? 'active',
                        'created_at' => $webhook['created_at'] ?? null
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'shop' => $shopSession->shop,
                    'installed_at' => $shopSession->installed_at,
                    'installation_date' => $shopSession->installation_date,
                    'webhooks' => $customerWebhooks,
                    'webhooks_count' => count($customerWebhooks),
                    'required_webhooks' => $requiredTopics,
                    'all_webhooks_registered' => count($customerWebhooks) === count($requiredTopics)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting webhook status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get webhook status'], 500);
        }
    }

    /**
     * Delete a customer.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json(['error' => 'Shop session not found'], 404);
            }

            $customer = Customer::byShop($shopSession->id)->find($id);
            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            $customer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting customer: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete customer'], 500);
        }
    }
} 