<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\HelperController;
use App\Models\SubscriptionWebNotification;



class SubscriptionNotificationController extends HelperController
{
    public function subscription_notifications(Request $request)
{
    $session= $this->getShop($request);
    if (!$session) {
        return response()->json(['error' => 'Shop domain is required.'], 400);
    }

    $subscription_notifications = SubscriptionWebNotification::where('session_id', $session->id)->orderBy('priority', 'asc')->get();

    $data = [
        'subscription_notifications' => $subscription_notifications,
    ];

    return response()->json($data);
}
public function subscription_notification_detail(Request $request, $id)
{

    $session= $this->getShop($request);
    if (!$session) {
        return response()->json(['error' => 'Shop domain is required.'], 400);
    }
    $subscription_notification = SubscriptionWebNotification::where('session_id', $session->id)->where('id', $id)->first();

    $data = [
        'subscription_notification_data' => $subscription_notification,
    ];
    return response()->json($data);

}
public function subscription_notification_save(Request $request, $id)
{
    $session= $this->getShop($request);
    if (!$session) {
        return response()->json(['error' => 'Shop domain is required.'], 400);
    }
    $subscription_notification = SubscriptionWebNotification::where('session_id', $session->id)->where('id', $id)->first();
    if (isset($subscription_notification)) {
        $subscription_notification->session_id = $session->id;
        $subscription_notification->active_status = isset($request->active_status) ? $request->active_status : 0;
        
        // Save the data field containing customizedata and sidebarList
        if (isset($request->data)) {
            // return $request->data;
            $subscription_notification->data = $request->data;
        }
        
        // Save input field values to specific columns based on notification type
        // Only update these fields if they are explicitly present in the request
        if ($subscription_notification->title === "Wishlist Reminder") {
            if ($request->has('reminder_value')) {
                $subscription_notification->reminder_value = $request->reminder_value;
            }
            if ($request->has('reminder_time_unit')) {
                $subscription_notification->reminder_time_unit = $request->reminder_time_unit;
            }
        } elseif ($subscription_notification->title === "Send reminders on Items Saved for Later") {
            if ($request->has('saved_for_later_value')) {
                $subscription_notification->saved_for_later_value = $request->saved_for_later_value;
            }
            if ($request->has('saved_for_later_time_unit')) {
                $subscription_notification->saved_for_later_time_unit = $request->saved_for_later_time_unit;
            }
        } elseif ($subscription_notification->title === "Send low stock Alerts") {
            if ($request->has('low_stock_value')) {
                $subscription_notification->low_stock_value = $request->low_stock_value;
            }
        } elseif ($subscription_notification->title === "Send Price Drop alert") {
            if ($request->has('price_drop_value')) {
                $subscription_notification->price_drop_value = $request->price_drop_value;
            }
        }
        
        // Handle logo upload
        if (isset($request->logo) && $request->logo != "" && $request->hasFile('logo') && $request->file('logo')->isValid()) {
            $image = $request->logo;
            $destinationPath = public_path('images/');
            
            // Create directory if it doesn't exist
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            // Delete old image if exists
            if ($subscription_notification->logo && file_exists(public_path($subscription_notification->logo))) {
                unlink(public_path($subscription_notification->logo));
            }
            
            $filename = 'notification_' . $id . '_' . now()->format('YmdHis') . "." . $image->getClientOriginalExtension();
            $image->move($destinationPath, $filename);
            $subscription_notification->logo = "images/" . $filename;
        } elseif (isset($request->old_logo) && $request->old_logo != "") {
            $subscription_notification->logo = $request->old_logo;
        } elseif ($request->logo == null || $request->logo == "") {
            // Delete old image if exists when logo is removed
            if ($subscription_notification->logo && file_exists(public_path($subscription_notification->logo))) {
                unlink(public_path($subscription_notification->logo));
            }
            $subscription_notification->logo = null;
        }
        
        $subscription_notification->save();

        $data = [
            'status' => 'success',
            'message' => 'Successfully saved!'
        ];
    } else {
        $data = [
            'status' => 'error',
            'message' => 'This Email Notification not found!'
        ];
    }

    return response()->json($data);

}

public function subscription_notification_status_save(Request $request, $id)
{

    $session= $this->getShop($request);
    if (!$session) {
        return response()->json(['error' => 'Shop domain is required.'], 400);
    }
    $subscription_notification = SubscriptionWebNotification::where('session_id', $session->id)->where('id', $id)->first();
    if (isset($subscription_notification)) {
        $subscription_notification->session_id = $session->id;
        $subscription_notification->active_status = isset($request->active_status) ? $request->active_status : 0;
        $subscription_notification->save();
        $data = [
            'status' => 'success',
            'message' => 'Successfully saved!'
        ];
    } else {
        $data = [
            'status' => 'error',
            'message' => 'This Notification not found!'
        ];
    }

    return response()->json($data);

}
public function createDefaultGeneralWebNotifications($session){
    // Check if user already has templates
    $existingTemplates = SubscriptionWebNotification::where('session_id', $session->id)->count();
    
    if ($existingTemplates > 0) {
        // User already has templates, no need to create defaults
        return;
    }
    
    // Create default templates directly
    $defaultTemplates = [
        [
            'notification_type' => 'wishlist_signup_confirmation',
            'email_type' => 'Customer notifications',
            'title' => 'Sign up confirmation',
            'description' => 'Send a confirmation when shoppers save their wishlist',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Welcome to {shop_name} - Your Wishlist is Ready!","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Welcome to {shop_name}! Your wishlist has been successfully created and you can now start saving your favorite products.<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"View Wishlist","trackingButtonLink":["Wishlist Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Thank you for choosing {shop_name}!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Welcome to {shop_name}! Your wishlist has been successfully created. You can now start saving your favorite products and receive notifications about price drops, stock updates, and more.<\\/p><p>Happy shopping!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 1,
            'active_status' => 1
        ],
        [
            'notification_type' => 'wishlist_shared',
            'email_type' => 'Customer notifications',
            'title' => 'Wishlist Shared',
            'description' => 'Send an alert when shoppers share their wishlist with others',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Your {shop_name} wishlist has been shared","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Your wishlist has been successfully shared with your friends and family.<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"View Shared Wishlist","trackingButtonLink":["Shared Wishlist Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Happy sharing!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Your wishlist has been successfully shared! Your friends and family can now see your favorite items and help you decide what to get.<\\/p><p>Happy sharing!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 2,
            'active_status' => 1
        ],
        [
            'notification_type' => 'wishlist_reminder',
            'email_type' => 'Customer notifications',
            'title' => 'Wishlist Reminder',
            'description' => 'Send reminders for wishlisted items after',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Don\'t forget about your {shop_name} wishlist items!","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Don\'t forget about the amazing items in your wishlist!<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"View Wishlist","trackingButtonLink":["Wishlist Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Happy shopping!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Don\'t forget about the amazing items in your wishlist! You have {wishlist_count} items waiting for you.<\\/p><p>Happy shopping!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 3,
            'active_status' => 1
        ],
        [
            'notification_type' => 'saved_for_later_reminder',
            'email_type' => 'Customer notifications',
            'title' => 'Send reminders on Items Saved for Later',
            'description' => 'Send reminders for items saved for later after',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Your saved items are waiting for you at {shop_name}","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Your saved items are still waiting for you!<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"View Saved Items","trackingButtonLink":["Saved Items Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Happy shopping!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Your saved items are still waiting for you! You have {saved_count} items saved for later.<\\/p><p>Happy shopping!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 4,
            'active_status' => 1
        ],
        [
            'notification_type' => 'low_stock_alert',
            'email_type' => 'Customer notifications',
            'title' => 'Send low stock Alerts',
            'description' => 'Send an alert when the stock drops below',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Low stock alert: {product_name} at {shop_name}","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Hurry! {product_name} is running low on stock.<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"Buy Now","trackingButtonLink":["Product Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Don\'t miss out!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Hurry! {product_name} is running low on stock. Only {stock_count} units remaining!<\\/p><p>Don\'t miss out!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 5,
            'active_status' => 1
        ],
        [
            'notification_type' => 'price_drop_alert',
            'email_type' => 'Customer notifications',
            'title' => 'Send Price Drop alert',
            'description' => 'Send an alert when the price drops by',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Price drop alert: {product_name} at {shop_name}","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Great news! {product_name} is now on sale!<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"Shop Now","trackingButtonLink":["Product Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Happy shopping!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Great news! {product_name} is now on sale! The price has dropped by {price_drop_percentage}% from {old_price} to {new_price}.<\\/p><p>Happy shopping!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 6,
            'active_status' => 1
        ],
        [
            'notification_type' => 'back_in_stock_alert',
            'email_type' => 'Customer notifications',
            'title' => 'Send Back in stock alerts',
            'description' => 'Send an alert when wishlisted items are back in stock',
            'allowSectionData' => '{"branding":1,"text":1,"actionButton":1,"lineitem":0,"footer":1}',
            'data' => '{"customizedata":{"emailSubject":"Back in stock: {product_name} at {shop_name}","brandingType":["Store name"],"textColor":"f7f7f7","imageWidth":"10","brandingBackgroundColor":"000000","paddingTop":"35","paddingBottom":"35","statusDescriptionDetails":"<p>Hi {customer_first_name},<br><br>Great news! {product_name} is back in stock!<\\/p>","statusDescriptionTextColor":"000000","trackingButtonButtonText":"Buy Now","trackingButtonLink":["Product Link"],"trackingButtonButtonWidth":"50","trackingButtonFontSize":"14","trackingButtonButtonColor":"000000","trackingButtonTextColor":"ffffff","trackingButtonAlignment":"Center","lineItemTitleFontSize":"16","lineItemProductAmountHide":"0","lineItemProductFontSize":"14","lineItemCurrencyAlignment":"Left","lineItemItemTextColor":"000000","footerUnsubscribeButton":"0","footerUnsubscribe":"Unsubscribe","footerUnsubscribeButtonColor":"005BD3","footerTextColor":"000000","footerBackgroundColor":"ffffff","footerDetails":"<p>Don\'t miss out!<br>{shop_name}<\\/p>","themeSettingFontFamily":"SF Pro Text","themeSettingPrimaryTextColor":"000000","themeSettingPrimaryColor":"007a5c","textDescriptionAlignment":"Left","textDescriptionTextColor":"000000","textDescriptionDetails":"<p>Hi {customer_first_name} {customer_last_name},<\\/p><p>Great news! {product_name} is back in stock and ready for you to purchase!<\\/p><p>Don\'t miss out!<br>Your Friends at {shop_name}<\\/p>","footerDetailsAlignment":"Center","textDescriptionBackgroundColor":"ffffff","lineItemTitleColor":"000000","lineItemBackgroundColor":"ffffff"},"sidebarList":[{"title":"Email Subject","visible":"true"},{"title":"Branding","visible":"true"},{"title":"Text","visible":"true"},{"title":"Action button","visible":"true"},{"title":"Line items","visible":"false"},{"title":"Footer","visible":"true"}]}',
            'priority' => 7,
            'active_status' => 1
        ]
    ];
    
    foreach ($defaultTemplates as $template) {
                $subscription_not = new SubscriptionWebNotification();
                $subscription_not->session_id = $session->id;
        $subscription_not->notification_type = $template['notification_type'];
        $subscription_not->title = $template['title'];
        $subscription_not->description = $template['description'];
        $subscription_not->email_type = $template['email_type'];
        $subscription_not->allowSectionData = $template['allowSectionData'];
        $subscription_not->data = $template['data'];
        $subscription_not->priority = $template['priority'];
        $subscription_not->active_status = $template['active_status'];
                $subscription_not->save();
            }
}

/**
 * Clean up notification images when notification is deleted
 */
private function cleanupNotificationImages($notificationId)
{
    $notifications = SubscriptionWebNotification::where('id', $notificationId)->get();
    
    foreach ($notifications as $notification) {
        if ($notification->logo && file_exists(public_path($notification->logo))) {
            unlink(public_path($notification->logo));
        }
    }
}
}
