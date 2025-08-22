<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Shopify\Clients\Rest;
use Shopify\Clients\Graphql;
use App\Models\Session;
use App\Models\Subscription;
use Carbon\Carbon;
use App\Lib\AuthRedirection;

class PricingController extends Controller
{
    /**
     * Get all active pricing plans
     */
    public function index(): JsonResponse
    {
        try {
            $plans = PricingPlan::getActivePlans();
            
            return response()->json([
                'success' => true,
                'data' => $plans,
                'message' => 'Pricing plans retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pricing plans',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific pricing plan by slug
     */
    public function show($slug): JsonResponse
    {
        try {
            $plan = PricingPlan::findBySlug($slug);
            
            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pricing plan not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $plan,
                'message' => 'Pricing plan retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pricing plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pricing plans with calculated discounts
     */
    public function withDiscounts(): JsonResponse
    {
        try {
            $plans = PricingPlan::getActivePlans();
            
            // Add calculated discount information
            $plansWithDiscounts = $plans->map(function ($plan) {
                $plan->annual_discount_percentage = $plan->getAnnualDiscountPercentage();
                return $plan;
            });
            
            return response()->json([
                'success' => true,
                'data' => $plansWithDiscounts,
                'message' => 'Pricing plans with discounts retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pricing plans with discounts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initiate subscription for a plan. For paid plans, returns Shopify confirmation URL.
     */
    public function SubscripePlan(Request $request): JsonResponse
    {
        try {
            $planId = $request->input('plan_id');
            if (!$planId) {
                return response()->json(['success' => false, 'message' => 'plan_id is required'], 422);
            }

            $plan = PricingPlan::find($planId);
            if (!$plan) {
                return response()->json(['success' => false, 'message' => 'Plan not found'], 404);
            }

            // Resolve shop session (prefer App Bridge session token)
            $shopSession = null;
            $sessionToken = $request->input('shopifySession');
            if ($sessionToken) {
                $shopSession = Session::where('session_id', $sessionToken)->first();
            }
            if (!$shopSession) {
                $shopDomain = $request->input('shop');
                if ($shopDomain) {
                    $shopSession = Session::where('shop', $shopDomain)->first();
                }
            }
            if (!$shopSession) {
                $shopSession = Session::first();
            }
            if (!$shopSession) {
                return response()->json(['success' => false, 'message' => 'Shop session not found'], 401);
            }

            // Determine selected billing period and price
            $billing = $request->input('billing_period', 'monthly');
            $monthly = (float) ($plan->monthly_price ?? 0);
            $annual = (float) ($plan->annual_price ?? 0);
            $selectedPrice = $billing === 'annual' ? $annual : $monthly;

            // Free plan shortcut (selected period has no price)
            if ($selectedPrice <= 0) {
                return response()->json(['success' => true, 'message' => 'Free plan activated']);
            }

            $baseUrl = rtrim(config('app.url'), '/');

            // Determine test mode from env/config (default true for dev)
            $isTest = (bool) (env('SHOPIFY_BILLING_TEST', true));

            if ($billing === 'annual') {
                // Use GraphQL AppSubscription for annual interval
                $gql = new Graphql($shopSession->shop, $shopSession->access_token);
                $mutation = <<<'GQL'
mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean!, $lineItems: [AppSubscriptionLineItemInput!]!) {
  appSubscriptionCreate(name: $name, returnUrl: $returnUrl, test: $test, lineItems: $lineItems) {
    userErrors { field message }
    confirmationUrl
    appSubscription { id }
  }
}
GQL;
                $variables = [
                    'name' => $plan->name,
                    'returnUrl' => $baseUrl . '/api/return-url?shop=' . urlencode($shopSession->shop) . '&plan_id=' . urlencode($plan->id) . '&billing=annual',
                    'test' => $isTest,
                    'lineItems' => [[
                        'plan' => [
                            'appRecurringPricingDetails' => [
                                'interval' => 'ANNUAL',
                                'price' => [
                                    'amount' => (string)$selectedPrice,
                                    'currencyCode' => $plan->currency ?: 'USD',
                                ],
                            ],
                        ],
                    ]],
                ];
                $resp = $gql->query(['query' => $mutation, 'variables' => $variables]);
                $body = $resp->getDecodedBody();
                $node = $body['data']['appSubscriptionCreate'] ?? null;
                $confirmationUrl = $node['confirmationUrl'] ?? null;
                $errors = $node['userErrors'] ?? [];
                if (!$confirmationUrl) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create annual subscription',
                        'error' => $errors ?: $body,
                    ], 500);
                }
            } else {
                // Monthly via REST Recurring Application Charge
                $rest = new Rest($shopSession->shop, $shopSession->access_token);
                $payload = [
                    'recurring_application_charge' => [
                        'name' => $plan->name,
                        'price' => $selectedPrice,
                        'return_url' => $baseUrl . '/api/return-url?shop=' . urlencode($shopSession->shop) . '&plan_id=' . urlencode($plan->id) . '&billing=monthly',
                        'trial_days' => 0,
                        'test' => $isTest,
                        'terms' => 'Monthly subscription',
                    ],
                ];
                $resp = $rest->post('recurring_application_charges', $payload);
                $body = $resp->getDecodedBody();
                $confirmationUrl = $body['recurring_application_charge']['confirmation_url'] ?? null;
            }
            if (!$confirmationUrl) {
                return response()->json(['success' => false, 'message' => 'Failed to create Shopify charge', 'error' => $body], 500);
            }

            return response()->json(['success' => true, 'return_url' => $confirmationUrl]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function ReturnUrl(Request $request)
    {
        $shop = $request->query('shop');
        $planId = $request->query('plan_id');
        $billing = $request->query('billing', 'monthly');
        $chargeId = $request->query('charge_id'); // present for monthly RAC

        $baseRedirect = rtrim(config('app.url'), '/') . '/app/pricing';

        try {
            if (!$shop || !$planId) {
                return redirect($baseRedirect . '?subscription=missing_params');
            }

            $session = Session::where('shop', $shop)->first();
            if (!$session) {
                return redirect($baseRedirect . '?subscription=no_session');
            }

            $now = Carbon::now();
            $currency = null;
            $price = 0;
            $status = 'active';
            $currentPeriodEnd = null;
            $shopifyChargeId = null;
            $shopifySubscriptionId = null;

            if ($billing === 'monthly' && $chargeId) {
                // Activate the monthly recurring charge
                $rest = new Rest($session->shop, $session->access_token);
                $resp = $rest->post("recurring_application_charges/{$chargeId}/activate", [
                    'recurring_application_charge' => [
                        'id' => $chargeId,
                    ],
                ]);
                $body = $resp->getDecodedBody();
                $rac = $body['recurring_application_charge'] ?? null;
                if (!$rac || ($rac['status'] ?? '') !== 'active') {
                    return redirect($baseRedirect . '?subscription=activate_failed');
                }
                $currency = $rac['currency'] ?? null;
                $price = (float)($rac['price'] ?? 0);
                $currentPeriodEnd = $now->copy()->addDays(30);
                $shopifyChargeId = (string)$chargeId;
            } else {
                // Annual: fetch active app subscription via GraphQL and record
                $gql = new Graphql($session->shop, $session->access_token);
                $query = <<<'GQL'
{
  appInstallation {
    activeSubscriptions {
      id
      status
      lineItems {
        plan {
          pricingDetails {
            __typename
            ... on AppRecurringPricing {
              interval
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
}
GQL;
                $resp = $gql->query($query);
                $data = $resp->getDecodedBody();
                $subs = $data['data']['appInstallation']['activeSubscriptions'] ?? [];
                // Find an annual subscription
                $match = null;
                foreach ($subs as $s) {
                    foreach ($s['lineItems'] as $li) {
                        $pd = $li['plan']['pricingDetails'] ?? null;
                        if ($pd && ($pd['__typename'] ?? '') === 'AppRecurringPricing' && ($pd['interval'] ?? '') === 'ANNUAL') {
                            $match = $s;
                            $currency = $pd['price']['currencyCode'] ?? null;
                            $price = (float)($pd['price']['amount'] ?? 0);
                            break 2;
                        }
                    }
                }
                if (!$match) {
                    return redirect($baseRedirect . '?subscription=not_found');
                }
                $status = strtolower($match['status'] ?? 'active');
                $shopifySubscriptionId = $match['id'] ?? null;
                $currentPeriodEnd = $now->copy()->addDays(365);
            }

            // Upsert subscription record
            Subscription::updateOrCreate(
                [
                    'shop_id' => $session->id,
                    'billing_period' => $billing,
                ],
                [
                    'plan_id' => $planId,
                    'status' => $status,
                    'currency' => $currency,
                    'price' => $price,
                    'shopify_charge_id' => $shopifyChargeId,
                    'shopify_subscription_id' => $shopifySubscriptionId,
                    'activated_at' => $now,
                    'current_period_end' => $currentPeriodEnd,
                    'raw_payload' => null,
                ]
            );

            // Start OAuth cleanly so Shopify provides proper host and session; this sets the nonce cookie
            return redirect('/api/auth?shop=' . urlencode($shop));
        } catch (\Exception $e) {
            return redirect('/api/auth?shop=' . urlencode($shop));
        }
    }

    /**
     * Get the active subscription for the current shop
     */
    public function active(Request $request): JsonResponse
    {
        try {
            // Resolve shop session from query first, then fallback to first session
            $shopDomain = $request->query('shop');
            $session = null;
            if ($shopDomain) {
                $session = Session::where('shop', $shopDomain)->first();
            }
            if (!$session) {
                $session = Session::first();
            }
            if (!$session) {
                return response()->json(['success' => false, 'message' => 'Shop session not found'], 404);
            }

            $subscription = Subscription::with('plan')
                ->where('shop_id', $session->id)
                ->where('status', 'active')
                ->orderByDesc('activated_at')
                ->first();

            if (!$subscription) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No active subscription'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'plan_id' => $subscription->plan_id,
                    'plan_name' => optional($subscription->plan)->name,
                    'billing_period' => $subscription->billing_period,
                    'status' => $subscription->status,
                    'currency' => $subscription->currency,
                    'price' => $subscription->price,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
