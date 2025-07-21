<?php
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\Session;

function getShop($session)
{

    $shop = null;
    if ($session) {
        $shop = \App\Models\Session::where('shop', $session->getShop())->first();
    }
    if ($shop == null) {
        $shop = \App\Models\Session::first();
    }
    return $shop;
}

function LatestShopifyVersion()
{

$session=\App\Models\Session::first();
    $options = new Options();
    $options->setType(true);
    $options->setVersion('2025-01');
    $options->setApiKey(env('SHOPIFY_API_KEY'));
    $options->setApiSecret(env('SHOPIFY_API_SECRET'));
    $options->setApiPassword($session->access_token);

    $api = new BasicShopifyAPI($options);
    $api->setSession(new Session($session->shop));

    return $api;

}


function getClient($session)
{
    $client = new \Shopify\Clients\Rest($session->getShop(), $session->getAccessToken());
    return $client;
}
function sendResponse($data = null, $status = 200)
{
    return response()->json(["errors" => false, "data" => $data], $status);
}
function sendError($data = null, $status = 400)
{
    return response()->json(["errors" => true, "data" => $data], $status);
}


 function getShopApi($shop_name)
{
    $session = \App\Models\Session::where('shop',$shop_name)->first();
    // Create options for the API
    $options = new \Gnikyt\BasicShopifyAPI\Options();
    $options->setType(true);
    $options->setVersion(env('SHOPIFY_API_VERSION'));
    $options->setApiKey(env('SHOPIFY_API_KEY'));
    $options->setApiSecret(env('SHOPIFY_API_SECRET'));
    $options->setApiPassword($session->access_token);

    // Create the client and session
    $api = new \Gnikyt\BasicShopifyAPI\BasicShopifyAPI($options);
    $api->setSession(new \Gnikyt\BasicShopifyAPI\Session($session->shop));

    return $api;
}


