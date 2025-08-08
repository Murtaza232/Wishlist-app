# Wishlist Sign-Up Confirmation Email Feature

## Overview
This feature automatically sends a sign-up confirmation email to customers when they create a new wishlist, provided that the notification is enabled in the admin settings.

## How It Works

### 1. User Configuration
- Store owners can enable/disable the sign-up confirmation email in the **Notifications** section of the app
- The setting is controlled by the `sign_up_confirmation` and `sign_up_confirmation_email` fields in the `wishlist_features` table
- Email templates can be customized in the notification detail page

### 2. Email Trigger
- When a customer creates a new wishlist via the frontend, the `createWishlist` method in `WishlistController` is called
- The system checks if sign-up confirmation is enabled for the shop
- If enabled, it triggers the email sending process

### 3. Email Content
- The email uses a customizable template stored in the `subscription_web_notifications` table
- Template supports variable replacement for:
  - `{shop_name}` - Store name
  - `{customer_first_name}` - Customer's first name
  - `{customer_last_name}` - Customer's last name
  - `{customer_email}` - Customer's email
  - `{wishlist_title}` - Wishlist title
  - `{wishlist_link}` - Direct link to the wishlist

### 4. Email Template
- Uses the template stored in the database (`subscription_web_notifications` table)
- Template can be customized through the notification detail page
- Supports all customization options including:
  - Email subject
  - Header branding (store name, logo)
  - Content text with rich HTML formatting
  - Action button (View Wishlist) with custom styling
  - Footer content
  - Colors, fonts, and layout
  - Responsive design

## Files Modified/Created

### New Files:
1. `web/app/Mail/WishlistSignupConfirmation.php` - Mail class for sending emails
2. `web/app/Services/WishlistNotificationService.php` - Service class for notification logic
3. `web/resources/views/emails/wishlist-signup-confirmation.blade.php` - Email template
4. `WISHLIST_SIGNUP_EMAIL_FEATURE.md` - This documentation

### Modified Files:
1. `web/app/Http/Controllers/WishlistController.php` - Added email sending logic to `createWishlist` method
2. `web/routes/api.php` - Added test route for email functionality

## Configuration

### Enable/Disable Feature:
1. Go to the **Notifications** page in the app
2. Find "Sign up confirmation" notification
3. Toggle the switch to enable/disable
4. Click "Save" to apply changes

### Customize Email Template:
1. Go to the **Notifications** page
2. Click on "Sign up confirmation" notification
3. Use the full email template editor to customize:
   - Email subject line
   - Branding section (store name, logo, colors)
   - Text content with rich HTML editor
   - Action button (text, colors, styling)
   - Footer content and styling
   - Theme settings (fonts, colors, layout)
4. Save changes

## Testing

### Test Route:
A test route is available at: `POST /api/test-wishlist-signup-email`

Required parameters:
- `customer_id`: Shopify customer ID
- `shop_domain`: Shop domain (e.g., "your-store.myshopify.com")

Example:
```bash
curl -X POST https://your-app-domain.com/api/test-wishlist-signup-email \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "123456789",
    "shop_domain": "your-store.myshopify.com"
  }'
```

## Error Handling

The system includes comprehensive error handling:
- If email sending fails, it logs the error but doesn't prevent wishlist creation
- If customer data can't be fetched, the email is skipped
- If the notification is disabled, no email is sent
- All errors are logged for debugging purposes

## Dependencies

- Laravel Mail system
- Shopify GraphQL API for customer data
- Existing notification system infrastructure
- Wishlist features configuration

## Notes

- The email sending is asynchronous and won't block the wishlist creation process
- Email templates support HTML content and inline CSS styling
- The feature respects the shop's notification preferences
- All email sending attempts are logged for monitoring and debugging
