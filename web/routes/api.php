<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WishlistConfigurationController;
use App\Http\Controllers\WishlistController;
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
Route::any('/wishlist-configuration', [WishlistConfigurationController::class, 'store']);
Route::get('/get-themes', [WishlistConfigurationController::class, 'getThemes']);
Route::get('/wishlist-editor-url', [WishlistConfigurationController::class, 'EditorUrl']);
Route::get('/wishlist-editor-collectionsurl', [WishlistConfigurationController::class, 'EditorCollectionUrl']);
Route::get('/theme-editor-url', [WishlistConfigurationController::class, 'getThemeEditorUrl']);
Route::any('/wishlist-features-store', [WishlistConfigurationController::class, 'storeOrUpdateFeatures']);
Route::get('/wishlist-metafields', [WishlistConfigurationController::class, 'getWishlistMetafields']);
Route::any('/proxy/wishlist', [WishlistController::class, 'showWishlistPage']);
Route::any('/shop',[WishlistConfigurationController::class,'shop']);
Route::post('/wishlist/add', [WishlistController::class, 'add']);
Route::get('/wishlist/products', [WishlistController::class, 'getWishlistProducts']);
Route::get('/wishlists', [WishlistController::class, 'listWishlists']);
Route::post('/wishlists', [WishlistController::class, 'createWishlist']);
Route::post('/wishlist-items', [WishlistController::class, 'addItemToWishlist']);
Route::any('/wishlist-items-delete', [WishlistController::class, 'deleteWishlistItem']);
Route::get('/wishlist-count', [WishlistController::class, 'getWishlistCount']);
Route::delete('/wishlists/{id}', [WishlistController::class, 'destroy']);
Route::any('/wishlists/store-items', [WishlistController::class, 'storeWishlistAndItems']);