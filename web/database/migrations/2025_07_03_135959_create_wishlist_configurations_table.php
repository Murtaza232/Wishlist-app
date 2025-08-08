<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWishlistConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wishlist_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();
            $table->enum('icon_type', ['heart', 'star', 'bookmark'])->nullable();
            $table->enum('button_position_tab', ['near_cart', 'product_image'])->nullable();
            $table->enum('btn_position_on_product_page', [
                'above_cart', 'below_cart', 'left_of_cart', 'right_of_cart', 'top_left', 'top_right', 'bottom_left', 'bottom_right',
            ])->nullable(); // Only one position should be set at a time (enforced in backend)
            $table->enum('btn_type_product_page', ['icon_and_text', 'only_icon', 'only_text'])->nullable();
            $table->enum('appearance_btn_product_page', ['solid', 'outline','plain'])->nullable();
            // Button text fields
            $table->enum('btn_text_product_page_toggle', ['before_click', 'after_click'])->nullable(); // Indicates which text is active
            $table->string('btn_text_product_page')->nullable(); // Legacy: single button text
            $table->string('btn_text_product_page_before')->nullable(); // New: text for 'Before Click'
            $table->string('btn_text_product_page_after')->nullable(); // New: text for 'After Click'
            $table->boolean('smart_save')->nullable();
            $table->boolean('social_proof')->nullable();
            $table->boolean('add_items_wishlist_collections_page')->nullable();
            $table->enum('btn_group_position_collections_page', ['top_left', 'top_right', 'bottom_left', 'bottom_right'])->nullable();
            $table->enum('wishlist_page_appearance',['side_drawer','separate_page','pop_up_modal'])->nullable();
            $table->string('wishlist_page_title')->nullable();
            $table->enum('wishlist_btn_launch_position',['header', 'floating_button', 'navigation_menu'])->nullable();
            $table->enum('floating_btn_position', ['left', 'right', 'bottom-left', 'bottom-right'])->nullable();
            $table->integer('show_count_floating_btn')->nullable();
            $table->boolean('other_settings_wishlist_page')->nullable();
            $table->boolean('permission_to_save_items_cart_page')->nullable();
            $table->string('pop_up_title_cart_page')->nullable();
            $table->string('primary_btn_text_cart_page')->nullable();
            $table->string('secondary_btn_text_cart_page')->nullable();
            $table->enum('permission_cart_page', ['ask', 'always'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wishlist_configurations');
    }
}
