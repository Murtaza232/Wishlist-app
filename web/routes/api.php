<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::group(['middleware' => ['shopify.auth']], function () {
    Route::get('setting', [\App\Http\Controllers\SettingController::class, 'Setting']);
    Route::post('save-setting', [\App\Http\Controllers\SettingController::class, 'SaveSetting']);

    Route::get('get-images', [\App\Http\Controllers\SwapImageController::class, 'GetImages']);



});

Route::post('swap-image', [\App\Http\Controllers\SwapImageController::class, 'SwapImage']);
Route::post('get-media-detail', [\App\Http\Controllers\SwapImageController::class, 'GetImagesbyMediaId']);


Route::post('/webhooks/order-create', function (Request $request) {
    try {

        $order=json_decode($request->getContent());

        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        \App\Jobs\OrderWebhookJob::dispatch($order,$shop);

    } catch (\Exception $e) {

    }
    return true;
});


Route::get('test', [\App\Http\Controllers\OrderController::class, 'SendMail']);
Route::get('test-api', [\App\Http\Controllers\SwapImageController::class, 'testapi']);
