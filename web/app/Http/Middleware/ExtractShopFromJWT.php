<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Shopify\Utils;
use App\Models\Session;

class ExtractShopFromJWT
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Try to get shop from query parameter first
        $shop = $request->query('shop');
        
        if (!$shop) {
            // Try to get shop from JWT token in authorization header
            $authorizationHeader = $request->header('Authorization', '');
            
            // Handle multiple Bearer tokens by taking the first one
            if (preg_match_all("/Bearer\s+([^,\s]+)/", $authorizationHeader, $bearerMatches)) {
                // Use the first Bearer token found
                $firstToken = $bearerMatches[1][0] ?? null;
                
                if ($firstToken) {
                    try {
                        $payload = Utils::decodeSessionToken($firstToken);
                        Log::info('JWT payload decoded', ['payload' => $payload]);
                        
                        // Try multiple possible fields for shop domain
                        if (isset($payload['dest'])) {
                            $shop = parse_url($payload['dest'], PHP_URL_HOST);
                            Log::info('Shop extracted from JWT dest', ['shop' => $shop, 'dest' => $payload['dest']]);
                        } elseif (isset($payload['iss'])) {
                            // Extract shop from issuer field (e.g., "https://shop.myshopify.com/admin")
                            $shop = parse_url($payload['iss'], PHP_URL_HOST);
                            Log::info('Shop extracted from JWT iss', ['shop' => $shop, 'iss' => $payload['iss']]);
                        } elseif (isset($payload['aud'])) {
                            // Sometimes the audience contains the shop domain
                            $shop = parse_url($payload['aud'], PHP_URL_HOST);
                            Log::info('Shop extracted from JWT aud', ['shop' => $shop, 'aud' => $payload['aud']]);
                        } else {
                            Log::warning('JWT payload missing expected fields', ['payload_keys' => array_keys($payload)]);
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to decode JWT token', [
                            'error' => $e->getMessage(), 
                            'token' => substr($firstToken, 0, 50) . '...',
                            'authorization_header' => $authorizationHeader
                        ]);
                    }
                } else {
                    Log::warning('No Bearer token found in Authorization header', [
                        'authorization_header' => $authorizationHeader
                    ]);
                }
            } else {
                Log::info('No Bearer token pattern found in Authorization header', [
                    'authorization_header' => $authorizationHeader
                ]);
            }
        }
        
        // If still no shop, try to get from request data
        if (!$shop) {
            $shop = $request->input('store_domain');
        }
        
        // If we have a shop domain, find the session and attach it to the request
        if ($shop) {
            $session = Session::where('shop', $shop)->first();
            if ($session) {
                $request->attributes->set('shop_session', $session);
                $request->attributes->set('shop_domain', $shop);
                Log::info('Shop session attached to request', ['shop' => $shop, 'session_id' => $session->id]);
            }
        }
        
        return $next($request);
    }
}
