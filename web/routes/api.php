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

//Route::group(['middleware' => ['shopify.auth']], function () {
    Route::post('setting', [\App\Http\Controllers\SettingController::class, 'Setting']);
    Route::post('save-setting', [\App\Http\Controllers\SettingController::class, 'SaveSetting']);

//});

Route::post('swap-image', [\App\Http\Controllers\SwapImageController::class, 'SwapImage']);
Route::get('test', [\App\Http\Controllers\SettingController::class, 'getSwapDetails']);
