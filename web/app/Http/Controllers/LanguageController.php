<?php

namespace App\Http\Controllers;

use App\Models\LanguageSetting;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LanguageController extends HelperController
{
    /**
     * Get all languages for the current shop
     */
    public function getLanguages(Request $request)
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }

            $languages = LanguageSetting::getLanguagesForShop($shopSession->id);
            $activeLanguage = LanguageSetting::getActiveLanguage($shopSession->id);

            return response()->json([
                'status' => true,
                'data' => [
                    'languages' => $languages,
                    'active_language' => $activeLanguage
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getLanguages: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while fetching languages.'
            ], 500);
        }
    }

    /**
     * Save language data
     */
    public function saveLanguage(Request $request)
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }
    
            $request->validate([
                'language_name' => 'required|string|max:255',
                'language_data' => 'required|array',
                'is_custom' => 'boolean'
            ]);
    
            $languageName = $request->input('language_name');
            $languageData = $request->input('language_data');
            $isCustom = $request->input('is_custom', false);
            $isActive = $request->input('is_active', true);
    
            // Check if this is a custom language
            $predefinedLanguages = [
                'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
                'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Urdu'
            ];
    
            if (!in_array($languageName, $predefinedLanguages)) {
                $isCustom = true;
            }
    
            // Check if this is the first time saving this language
            $existingLanguage = LanguageSetting::where('shop_id', $shopSession->id)
                                             ->where('language_name', $languageName)
                                             ->first();
    
            // If this is a new language or if explicitly setting as active, set it as active
            if (!$existingLanguage || $isActive) {
                $isActive = true;
            }
    
            $language = LanguageSetting::createOrUpdateLanguage(
                $shopSession->id,
                $languageName,
                $languageData,
                $isCustom,
                $isActive
            );
    
            return response()->json([
                'status' => true,
                'message' => 'Language saved successfully.',
                'data' => $language
            ]);
    
        } catch (\Exception $e) {
            Log::error('Error in saveLanguage: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while saving language.'
            ], 500);
        }
    }

    /**
     * Set active language
     */
    public function setActiveLanguage(Request $request)
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }

            $request->validate([
                'language_name' => 'required|string|max:255'
            ]);

            $languageName = $request->input('language_name');
            
            // Check if language exists for this shop
            $language = LanguageSetting::where('shop_id', $shopSession->id)
                                     ->where('language_name', $languageName)
                                     ->first();

            if (!$language) {
                // Language doesn't exist in DB, return success but indicate it's not in DB
                // The frontend will use its default data
                return response()->json([
                    'status' => true,
                    'message' => 'Language switched successfully. Using default data.',
                    'data' => [
                        'language_name' => $languageName,
                        'exists_in_db' => false
                    ]
                ]);
            }

            // Set as active language
            LanguageSetting::setActiveLanguage($shopSession->id, $languageName);

            return response()->json([
                'status' => true,
                'message' => 'Active language updated successfully.',
                'data' => [
                    'language_name' => $languageName,
                    'exists_in_db' => true,
                    'language_data' => $language->language_data
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in setActiveLanguage: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while setting active language.'
            ], 500);
        }
    }

    /**
     * Get active language
     */
    public function getActiveLanguage(Request $request)
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }

            $activeLanguage = LanguageSetting::getActiveLanguage($shopSession->id);

            if (!$activeLanguage) {
                // Return default English if no active language is set
                return response()->json([
                    'status' => true,
                    'data' => [
                        'language_name' => 'English',
                        'language_data' => $this->getDefaultEnglishData(),
                        'is_custom' => false
                    ]
                ]);
            }

            return response()->json([
                'status' => true,
                'data' => $activeLanguage
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getActiveLanguage: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while fetching active language.'
            ], 500);
        }
    }

    /**
     * Delete custom language
     */
    public function deleteLanguage(Request $request)
    {
        try {
            $shopSession = $this->getShop($request);
            if (!$shopSession) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shop domain is required.'
                ], 400);
            }

            $request->validate([
                'language_name' => 'required|string|max:255'
            ]);

            $languageName = $request->input('language_name');

            // Only allow deletion of custom languages
            $language = LanguageSetting::where('shop_id', $shopSession->id)
                                     ->where('language_name', $languageName)
                                     ->where('is_custom', true)
                                     ->first();

            if (!$language) {
                return response()->json([
                    'status' => false,
                    'message' => 'Custom language not found or cannot be deleted.'
                ], 404);
            }

            $language->delete();

            return response()->json([
                'status' => true,
                'message' => 'Language deleted successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in deleteLanguage: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while deleting language.'
            ], 500);
        }
    }

    /**
     * Get default English data structure
     */
    private function getDefaultEnglishData()
    {
        return [
            'Sidebar Tabs' => [
                'Configuration' => 'Configuration',
                'Settings' => 'Settings',
                'Customers' => 'Customers'
            ],
            'Dashboard' => [
                'Dashboard' => 'Dashboard',
                'Active Wishlist Widget' => 'Active Wishlist Widget',
                'Text active wishlist widget' => 'To ensure full functionality, please enable Wishlist Configurations in the App Embeds section of your Shopify theme.',
                'Button text activate wishlist widget' => 'Activate',
                'Wishlist Highlights' => 'Wishlist Highlights',
                'Total Wishlist Products' => 'Total Wishlist Products',
                'Total Lists' => 'Total Lists',
                'Setup Guide' => 'Setup Guide',
                'completed' => 'completed',
                'Smart Notifications Alerts' => 'Smart Notifications Alerts',
                'Set up automated email notifications for new reviews' => 'Set up automated email notifications for new reviews',
                'Button Text smart notification alerts' => 'Configure Alerts',
                'Widget Personalization' => 'Widget Personalization',
                'Paragraph Widget Personalization' => 'Choose widgets and match their design to your store',
                'Button Text Widget Personalization' => 'Customize Widget',
                'Localize' => 'Localize',
                'Paragraph Localize' => 'Edit or translate all review-related text with ease',
                'Button Text Localize' => 'Edit Text',
                'Much more than a Wishlist' => 'Much more than a Wishlist',
                'subtitle much more than wishlist' => 'Engage shoppers throughout their journey—from browsing to buying',
                'tabs why it matters' => 'Why it matters',
                'Capture Intent' => 'Capture Intent',
                'Capture Intent 1st tab Title' => 'Add Favorites to Wishlist',
                'Capture Intent 1st tab 1st paragraph' => "Makes it easy for shoppers to revisit products they love, increasing return visits and purchase likelihood.",
                'Capture Intent 1st tab 2nd Paragraph' => "Sew Trendy saw 187% increase in conversion rates for customers who add to wishlist",
                'Capture Intent 2nd tab Title' => "Save for Later from Cart",
                'Capture Intent 2nd tab 1st paragraph' => "Keep products handy for future purchase, while reducing cart deletes and helping you identify hesitant buyers.",
                'Capture Intent 2nd tab 2nd paragraph' => "Willow Boutique recovered ~15% of cart deletes and got 100x ROI on Wishlist alerts.",
                'Capture Identity' => 'Capture Identity',
                'Capture Identity 1st tab Title' => "Subscribe to Out-of-Stock Items",
                'Capture Identity 1st tab 1st paragraph' => "Prevents frustration from unavailable products, ensures they don't miss out, and helps you recover lost sales.",
                'Capture Identity 1st tab 2nd paragraph' => "Tibi saw customers 4x more likely to convert via back-in-stock alerts",
                'Capture Identity 2nd tab Title' => "Save & Share Wishlist",
                'Capture Identity 2nd tab 1st paragraph' => "Keeps shoppers engaged with personalized reminders and shared wishlists, increasing repeat visits and conversions.Gives shoppers access to their Wishlists across devices and visits, while converting anonymous visitors into identified customers.",
                'Capture Identity 2nd tab 2nd paragraph' => "Credo Beauty increased social engagement and conversions using shared wishlists",
                'Engage & Convert' => 'Engage & Convert',
                'Engage & Convert 1st tab Title' => "Wishlist Reminder Alerts",
                'Engage & Convert 1st tab 1st paragraph' => "Brings shoppers back to their saved items, reducing drop-offs and increasing conversions.",
                'Engage & Convert 1st tab 2nd paragraph' => "White Oak Pastures saw 4x more conversions & 10% higher AOV through wishlists",
                'Engage & Convert 2nd tab Title' => "Price Drop Alerts",
                'Engage & Convert 2nd tab 1st paragraph' => "Informs them of savings on items they already want, while increasing the likelihood of conversion.",
                'Engage & Convert 2nd tab 2nd paragraph' => "Brighton boosted AOV and LTV with price drop notifications",
                'Engage & Convert 3rd tab Title' => "Low Stock Alerts",
                'Engage & Convert 3rd tab 1st paragraph' => "Helps shoppers avoid missing out on their favorites, while creating a sense of urgency.",
                'Engage & Convert 3rd tab 2nd paragraph' => "Cirque Colors drove urgency and conversions using low stock alerts",
                'Retain & Re-Engage' => 'Retain & Re-Engage',
                'Retain & Re-Engage 1st tab Title' => "Personalized Campaigns",
                'Retain & Re-Engage 1st tab 1st paragraph' => "Increases customer retention with hyper-targeted campaigns for high-intent shoppers based on their wishlist and browsing activity.",
                'Retain & Re-Engage 1st tab 2nd paragraph' => "Block Zone's AOV rose 35% with Klaviyo wishlist campaigns",
                'Retain & Re-Engage 2nd tab Title' => "Win Your Wishlist Contest",
                'Retain & Re-Engage 2nd tab 1st paragraph' => "Shoppers enjoy the excitement of winning their favorite products, while boosting engagement, social sharing, and conversions.",
                'Retain & Re-Engage 2nd tab 2nd paragraph' => "POPFLEX added 90K customers via wishlist-based giveaway campaign",
                'Retain & Re-Engage 3rd tab Title' => "Omnichannel Experience",
                'Retain & Re-Engage 3rd tab 1st paragraph' => "Blurs the lines between online & in-store shopping experiences, helping sales associates personalize based on customer preferences.",
                'Retain & Re-Engage 3rd tab 2nd paragraph' => "Bombshell Sportswear saw a 73% wishlist revenue increase using Tapcart",
            ],
            'Configurations' => [
                'Basics' => 'Basics',
                'Primary color' => 'Primary color',
                'Secondary color' => 'Secondary color',
                'Icons' => 'Icons',
                'Heart' => 'Heart',
                'Bookmark' => 'Bookmark',
                'Button size' => 'Button size',
                'Icon thickness' => 'Icon thickness',
                'Product page' => 'Product page',
                'Button Position' => 'Button Position',
                'Near cart button' => 'Near cart button',
                'On product image' => 'On product image',
                'Above Cart Button' => 'Above Cart Button',
                'Below Cart Button' => 'Below Cart Button',
                'Left of Cart Button' => 'Left of Cart Button',
                'Top Left' => 'Top Left',
                'Top Right' => 'Top Right',
                'Bottom Left' => 'Bottom Left',
                'Bottom Right' => 'Bottom Right',
                'Button Type' => 'Button Type',
                'Solid' => "Solid",
                'Outline' => "Outline",
                'Plain' => "Plain",
                'Button text' => 'Button text',
                'Before Click' => 'Before Click',
                'After Click' => 'After Click',
                'Label' => 'Label',
                'Other Settings' => 'Other Settings',
                'Smart Save' => 'Smart-Save: Auto-wishlist products visited thrice or more by the shopper',
                'Social Proof' => 'Social Proof: Show the number of people who have added the product to their wishlist',
                'Add to Wishlist' => 'Add to Wishlist',
                'Added to Wishlist' => 'Added to Wishlist',
                'Collections' => 'Collections',
                'Add item to wishlist from collection page' => 'Enable shoppers to add items to wishlist from Collections pages',
                'Button Position' => 'Button Position',
                'Top Left' => 'Top Left',
                'Top Right' => 'Top Right',
                'Bottom Left' => 'Bottom Left',
                'Bottom Right' => 'Bottom Right',
                'Wishlist Page' => 'Wishlist Page',
                'Text Color' => 'Text Color',
                'Type' => 'Type',
                'Side Drawer' => 'Side Drawer',
                'Separate Page' => 'Separate Page',
                'Pop-up Modal' => 'Pop-up Modal',
                'Page Title' => 'Page Title',
                'Launch From' => 'Launch From',
                'Header' => 'Header',
                'Floating Button' => 'Floating Button',
                'Navigation Menu' => 'Navigation Menu',
                'Position' => 'Position',
                'Left' => 'Left',
                'Right' => 'Right',
                'Button Left' => 'Button Left',
                'Button Right' => 'Button Right',
                'Corner Radius' => 'Corner Radius',
                'This needs to be set up manually' => 'This needs to be set up manually',
                'Show Count' => 'Show Count',
                'Other Settings' => 'Other Settings',
                'Allow shoppers to Share Wishlist' => 'Allow shoppers to Share Wishlist',
                'Cart' => 'Cart',
                'Save for later pop-up' => 'Save for later pop-up',
                'Allow shoppers to save items' => 'Allow shoppers to save items before removing from cart',
                'Pop-up title' => 'Pop-up title',
                'Primary button text' => 'Primary button text',
                'Secondary button text' => 'Secondary button text',
                'Permission' => 'Permission',
                'Allow shoppers to save items' => 'Allow shoppers to save items before removing from cart',
                'Ask the shopper if they want to see the pop-up again' => 'Ask the shopper if they want to see the pop-up again',
                'Always show the pop-up' => 'Always show the pop-up',
            ],
            'Settings' => [
                'Installtions' => 'Installations',
                'installation subtitle' => 'Follow steps to install the wishlist app',
                'Notifications' => 'Notifications',
                'Notifications subtitle' => 'Notifications are automatically sent out.',
                'Language Settings' => 'Language Settings',
                'Language Settings subtitle' => 'Customize front-end language content.',
                'Integerations' => 'Integerations',
                'Language Settings Text' => 'When altering the language of your entire store, the Wishlist app offers comprehensive flexibility to modify the language of the all section, encompassing the Tab, Button',
                'Integrations subtitle' => 'View and manage connected apps.',
            ],
            'Notifications' => [
                'Notifications' => 'Notifications ',
                'Alerts and Notifications' => 'Alerts and Notifications',
                'Days' => 'Days',
                'Hours' => 'Hours',
                'Sign up confirmation' => 'Sign up confirmation',
                'Send a confirmation' => 'Send a confirmation when shoppers save their wishlist',
                'Wishlist Shared' => 'Wishlist Shared',
                'Send a alert when shoppers share their wishlist' => 'Send a alert when shoppers share their wishlist with others',
                'Wishlist Reminder' => 'Wishlist Reminder',
                'Send reminders for wishlist ' => 'Send reminders for wishlisted items after',
                'Send reminders on items saved for later' => 'Send reminders on items saved for later',
                'Send reminders for items saved for later after' => 'Send reminders for items saved for later after',
                'Send low stock alerts' => 'Send low stock alerts',
                'Send an alert when stock drops below' => 'Send an alert when stock drops below',
                'units' => 'units',
                'Send Price Drop alert' => 'Send Price Drop alert',
                'Send an alert when price drops by' => 'Send an alert when price drops by',
                'Send back in stock alerts' => 'Send back in stock alerts',
                'Send an alert when wislisted items are back in stock' => 'Send an alert when wislisted items are back in stock',
            ],
            'Notification Details' => [
                'insert Variables' => 'insert Variables',
                'Email Subject' => 'Email Subject',
                'Email Text sign up confirmation' => 'Welcome to {shop_name} - Your Wishlist is Ready!',
                'Email Text wishlist shared' => 'Your Wishlist has been shared',
                'Email Text wishlist reminder' => "Don't forget about your {shop_name} wishlist items!",
                'Email Text Send reminders on Items Saved for Later' => "Your saved items are waiting for you at {shop_name}",
                'Email Text Send low stocks alerts' => "Low stock alert: {product_name} at {shop_name}",
                'Email Text Send Price Drop Alert' => "Price drop alert: {product_name} at {shop_name}",
                'Email Text Send Back in stock alert' => "Back in stock: {product_name} at {shop_name}",
                'Branding' => 'Branding',
                'Branding Type' => 'Branding Type',
                'Store name' => 'Store name',
                'image' => 'image',
                'Logo' => 'Logo',
                'image width' => 'Image Width',
                'Text Color' => 'Text Color',
                'Background Color' => 'Background Color',
                'Padding Top' => 'Padding Top',
                'Padding Bottom' => 'Padding Bottom',
                'Text' => 'Text',
                'Content' => 'Content',
                'Text in Text field sign up confirmation' => 'Hi {customer_first_name} {customer_last_name}\nWelcome to {shop_name}! Your wishlist has been successfully created. You can now start saving your favorite products and receive notifications about price drops, stock updates, and more.\n\nHappy shopping!\nYour Friends at {shop_name}',
                'Text in Text field wishlist shared' => 'Hi {customer_first_name} {customer_last_name},\n\nYour wishlist has been successfully shared! Your friends and family can now see your favorite items and help you decide what to get.\n\nHappy sharing!\nYour Friends at {shop_name}',
                'Text in Text field wishlist reminder' => 'Hi {customer_first_name} {customer_last_name},\n\nDon\'t forget about the amazing items in your wishlist! You have {wishlist_count} items waiting for you.\n\nHappy shopping!\nYour Friends at {shop_name}',
                'Text in Text field Send reminders on Items Saved for Later' => 'Hi {customer_first_name} {customer_last_name},\n\nYour saved items are still waiting for you! You have {saved_count} items saved for later.\n\nHappy shopping!\nYour Friends at {shop_name}',
                'Text in Text field Send low stocks alerts' => 'Hi {customer_first_name} {customer_last_name},\n\nHurry! {product_name} is running low on stock. Only {stock_count} units remaining!\n\nDon\'t miss out!\nYour Friends at {shop_name}',
                'Text in Text field Send Price Drop Alert' => 'Hi {customer_first_name} {customer_last_name},\n\nGreat news! {product_name} is now on sale! The price has dropped by {price_drop_percentage}% from {old_price} to {new_price}.\n\nHappy shopping!\nYour Friends at {shop_name}',
                'Text in Text field Send Back in stock alert' => 'Hi {customer_first_name} {customer_last_name},\n\nGreat news! {product_name} is back in stock and ready for you to purchase!\n\nDon\'t miss out!\nYour Friends at {shop_name}',
                'Text Alignment' => 'Text Alignment',
                'Background Color' => 'Background Color',
                'Item Text Color' => 'Item Text Color',
                'Action button' => 'Action button',
                'Action Button Text' => 'Button Text',
                'Link' => 'Link',
                'Tracking Link' => 'Tracking Link',
                'Customize Link' => 'Customize Link',
                'Action Button Width (%)' => 'Button Width (%)',
                'Action Button Font Size' => 'Font Size',
                'Action Button Color' => 'Button Color',
                'Action Button Color' => 'Button Color',
                'Action Button Text Color' => 'Text Color',
                'Action Button Alignment' => 'Alignment',
                'Background Color Button Area' => 'Background Color',
                'Footer' => 'Footer',
                'Footer Text' => 'Text',
                'Footer Text to send in sign up confirmation' => 'Thank you for choosing {shop_name}!\n{shop_name}',
                'Footer Text to send in wishlist shared' => 'Happy sharing!\n{shop_name}',
                'Footer Text to send in wishlist reminder' => 'Happy shopping!\n{shop_name}',
                'Footer Text to send in Send reminders on Items Saved for Later' => 'Happy shopping!\n{shop_name}',
                'Footer Text to send in Send low stocks alerts' => 'Dont miss out!\n{shop_name}',
                'Footer Text to send in Send Price Drop Alert' => 'Happy shopping!\n{shop_name}',
                'Footer Text to send in Send Back in stock alert' => 'Dont miss out!\n{shop_name}',
                'Text Alignment Footer' => 'Text Alignment',
                'Text Color Footer' => 'Text Color',
                'Background Color Footer' => 'Background Color',
                'Theme settings' => 'Theme settings',
                'Global setting' => 'Global setting',
                'Font Family' => 'Font Family',
            ],
            'Installation' => [
                'Installation instructions' => 'Installation instructions',
                'Follow the steps below to install' => 'Follow the steps below to install the Wishlist Widget app on your Shopify store.',
                'Contact Us' => 'Contact Us',
                'Contact Support' => 'Contact Support',
                'Theme Extension Tab' => 'Theme Extension',
                'Expert Setup Tab' => 'Expert Setup',
                'Manual Install Tab' => 'Manual install',
                'Current theme status' => 'Current theme status',
                'Select Theme' => 'Select Theme',
                'App embed Status' => 'App embed Status',
                "Enable" => "Enable",
                "Disable" => "Disable",
                'Enable Wishlist app embed' => 'Enable Wishlist app embed',
                'Enable the Wishlist Configurations' => 'Enable the Wishlist Configurations from App embeds in Theme settings by going to Shopify Theme Customization.',
                'Activate Button' => 'Activate',
                'Add Wishlist block' => 'Add Wishlist block',
                'Add app block Text' => 'Add the app block to display wishlist functionality on your selected theme. Customize the block positions to achieve the perfect placement according to your preferences.',
                'Wishlist Widget Near Cart Button' => 'Wishlist Widget Near Cart Button',
                'Add Wishlist Widget Cart Button Text' => "To add a Wishlist Widget, go to Shopify's theme customization section and click on Add block.",
                'Button Text Wishlist Widget Near Cart Button' => 'Wishlist Widget Near Cart Button',
                'Wishlist Widget On Product Image' => 'Wishlist Widget On Product Image',
                'Button text Wishlist Widget On Product Image' => 'Wishlist Widget On Product Image',
                'Text Wishlist Widget product image' => "Go to Shopify's theme customization section and click on Add block to add the Wishlist Widget On Product Image",
                "Wishlist Widget Collection page" => 'Wishlist Widget On Collections Page',
                "Button text Wishlist Widget Collection page" => "Wishlist Widget On Collections Page",
                "Text Wishlist Widget Collection page" => "In Shopify's theme customization, click Add block to add the Wishlist Widget On Collections Page.",
                "My Wishlist Section" => "My Wishlist Section",
                "Button text My Wishlist Section" => "My Wishlist Section",
                "Text My Wishlist Section" => "To add a My Wishlist Section, navigate to Shopify's theme customization page and click on Add block to add the My Wishlist Section and view your Wislist items.",
            ]
        ];
    }
} 