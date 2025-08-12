<?php

namespace App\Services;

use App\Models\Session;
use Illuminate\Support\Facades\Log;
use Shopify\Clients\Rest;

class WebhookService
{
    /**
     * Register customer webhooks for a shop
     */
    public function registerCustomerWebhooks(Session $session): bool
    {
        try {
            $client = new Rest($session->shop, $session->access_token);
            $baseUrl = config('app.url');

            $webhooks = [
                [
                    'topic' => 'customers/create',
                    'address' => $baseUrl . '/api/webhooks/customer-create',
                    'format' => 'json'
                ],
                [
                    'topic' => 'customers/update',
                    'address' => $baseUrl . '/api/webhooks/customer-update',
                    'format' => 'json'
                ],
                [
                    'topic' => 'customers/delete',
                    'address' => $baseUrl . '/api/webhooks/customer-delete',
                    'format' => 'json'
                ]
            ];

            foreach ($webhooks as $webhook) {
                $this->registerWebhook($client, $webhook);
            }

            Log::info('Customer webhooks registered successfully for shop: ' . $session->shop);
            return true;

        } catch (\Exception $e) {
            Log::error('Error registering customer webhooks: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Register a single webhook
     */
    private function registerWebhook(Rest $client, array $webhookData): void
    {
        try {
            // First, check if webhook already exists
            $response = $client->get('webhooks', [
                'topic' => $webhookData['topic'],
                'address' => $webhookData['address']
            ]);

            if ($response->getStatusCode() === 200) {
                $existingWebhooks = json_decode($response->getBody()->getContents(), true);
                
                // If webhook already exists, skip registration
                if (!empty($existingWebhooks['webhooks'])) {
                    Log::info('Webhook already exists: ' . $webhookData['topic']);
                    return;
                }
            }

            // Register new webhook
            $response = $client->post('webhooks', [
                'webhook' => $webhookData
            ]);

            if ($response->getStatusCode() === 201) {
                Log::info('Webhook registered successfully: ' . $webhookData['topic']);
            } else {
                Log::error('Failed to register webhook: ' . $webhookData['topic']);
            }

        } catch (\Exception $e) {
            Log::error('Error registering webhook ' . $webhookData['topic'] . ': ' . $e->getMessage());
        }
    }

    /**
     * Unregister customer webhooks for a shop
     */
    public function unregisterCustomerWebhooks(Session $session): bool
    {
        try {
            $client = new Rest($session->shop, $session->access_token);
            $baseUrl = config('app.url');

            $webhookTopics = [
                'customers/create',
                'customers/update',
                'customers/delete'
            ];

            foreach ($webhookTopics as $topic) {
                $this->unregisterWebhook($client, $topic, $baseUrl);
            }

            Log::info('Customer webhooks unregistered successfully for shop: ' . $session->shop);
            return true;

        } catch (\Exception $e) {
            Log::error('Error unregistering customer webhooks: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Unregister a single webhook
     */
    private function unregisterWebhook(Rest $client, string $topic, string $baseUrl): void
    {
        try {
            // Get webhooks for this topic
            $response = $client->get('webhooks', ['topic' => $topic]);

            if ($response->getStatusCode() === 200) {
                $webhooks = json_decode($response->getBody()->getContents(), true);
                
                foreach ($webhooks['webhooks'] as $webhook) {
                    if (strpos($webhook['address'], $baseUrl) === 0) {
                        // Delete the webhook
                        $deleteResponse = $client->delete('webhooks/' . $webhook['id']);
                        
                        if ($deleteResponse->getStatusCode() === 200) {
                            Log::info('Webhook deleted: ' . $topic);
                        } else {
                            Log::error('Failed to delete webhook: ' . $topic);
                        }
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Error unregistering webhook ' . $topic . ': ' . $e->getMessage());
        }
    }

    /**
     * Get all webhooks for a shop
     */
    public function getWebhooks(Session $session): array
    {
        try {
            $client = new Rest($session->shop, $session->access_token);
            $response = $client->get('webhooks');

            if ($response->getStatusCode() === 200) {
                return json_decode($response->getBody()->getContents(), true);
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Error getting webhooks: ' . $e->getMessage());
            return [];
        }
    }
} 