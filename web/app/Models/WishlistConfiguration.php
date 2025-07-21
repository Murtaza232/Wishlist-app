<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistConfiguration extends Model
{
    use HasFactory;
    protected $fillable = [
        'primary_color',
        'shop_id',
        'secondary_color',
        'icon_type',
        'btn_position_on_product_page',
        'btn_position_on_product_image',
        'btn_type_product_page',
        'appearance_btn_product_page',
        'btn_text_product_page_toggle',
        'btn_text_product_page',
        'btn_text_product_page_after',
        'btn_text_product_page_before',
        'smart_save',
        'social_proof',
        'add_items_wishlist_collections_page',
        'btn_group_position_collections_page',
        'wishlist_page_appearance',
        'wishlist_page_title',
        'wishlist_btn_launch_position',
        'other_settings_wishlist_page',
        'permission_to_save_items_cart_page',
        'pop_up_title_cart_page',
        'primary_btn_text_cart_page',
        'secondary_btn_text_cart_page',
        'permission_cart_page',
        'show_count_floating_btn',
        'floating_btn_position',
    ];
    public function session()
    {
        return $this->belongsTo(Session::class, 'shop_id');
    }
}
