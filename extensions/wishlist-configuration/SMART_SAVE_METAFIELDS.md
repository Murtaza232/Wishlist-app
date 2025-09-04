# Smart Save with Metafields

## Overview

Smart Save is now controlled via Shopify metafields, allowing for dynamic configuration without theme changes. The system automatically tracks product visits and adds products to wishlists after reaching the configured threshold.

## Metafield Configuration

### Required Metafields

Set these metafields in your Shopify admin:

#### 1. Smart Save Enabled
- **Namespace**: `wishlist`
- **Key**: `smart_save_enabled`
- **Type**: `single_line_text_field`
- **Value**: `true` or `false`

#### 2. Visit Threshold
- **Namespace**: `wishlist`
- **Key**: `smart_save_visit_threshold`
- **Type**: `number_integer`
- **Value**: Number of visits required (1-10, default: 3)

### Example Metafield Setup

```json
{
  "wishlist": {
    "smart_save_enabled": "true",
    "smart_save_visit_threshold": "3"
  }
}
```

## How It Works

### 1. Metafield Check
- Script fetches metafields from API endpoint
- Checks if `smart_save_enabled` is `true`
- Gets visit threshold from `smart_save_visit_threshold`

### 2. Visit Tracking
- Tracks visits per product in localStorage
- Only counts visits for logged-in customers
- Prevents duplicate counting

### 3. Automatic Addition
- When visit count reaches threshold
- Automatically adds to customer's wishlist
- Shows notification to user
- Saves to database via API

## API Endpoints Used

### 1. Get Metafields
```
GET /api/wishlist-metafields
```

### 2. Check Wishlist Status
```
GET /api/smart-save/products?customer_id={customer_id}&shop_domain={shop_domain}
```

### 3. Add to Wishlist
```
POST /api/smart-save/add
Content-Type: application/json

{
  "customer_id": "customer_id",
  "product_id": "product_id",
  "shop_domain": "shop_domain"
}
```

## Configuration Steps

### 1. Set Up Metafields
1. Go to Shopify Admin → Settings → Custom data → Metafields
2. Create metafields for your shop:
   - `wishlist.smart_save_enabled` (text)
   - `wishlist.smart_save_visit_threshold` (number)

### 2. Enable Smart Save
1. Set `wishlist.smart_save_enabled` to `true`
2. Set `wishlist.smart_save_visit_threshold` to desired number (1-10)

### 3. Test the Feature
1. Log in as a customer
2. Visit a product page multiple times
3. Check if product is added to wishlist after threshold

## Features

### Visit Tracking
- Persistent localStorage storage
- Per-product visit counting
- Timestamp recording
- Duplicate prevention

### Smart Logic
- Only works on product pages
- Requires customer login
- Checks existing wishlist
- Prevents duplicate additions

### User Experience
- Beautiful notification
- Animated display
- Auto-dismiss after 5 seconds
- Heart icon with message

## Debugging

### Enable Debug Logging
```javascript
// Enable debug logging
window.wishlistSmartSave.setDebug(true);

// Check visit data
console.log(window.wishlistSmartSave.getVisitData());

// Clear visit data
window.wishlistSmartSave.clearVisitData();

// Manual processing
window.wishlistSmartSave.process();
```

### Console Messages
When debug is enabled:
- `[WISHLIST SMART SAVE] Initializing Smart Save`
- `[WISHLIST SMART SAVE] Smart Save enabled via metafields, threshold: 3`
- `[WISHLIST SMART SAVE] Processing Smart Save for product: product-handle`
- `[WISHLIST SMART SAVE] Visit count for product product-handle: 2`
- `[WISHLIST SMART SAVE] Visit count reached (3/3), adding to wishlist`

## Troubleshooting

### Common Issues

1. **Smart Save not working**
   - Check if metafields are set correctly
   - Verify `smart_save_enabled` is `true`
   - Check browser console for errors

2. **Visit count not incrementing**
   - Ensure customer is logged in
   - Check product ID detection
   - Verify localStorage is working

3. **Products not being added**
   - Check API endpoints are accessible
   - Verify customer ID detection
   - Check wishlist API responses

### Testing Checklist
- [ ] Metafields are configured
- [ ] Customer is logged in
- [ ] Visiting product pages
- [ ] Check console for debug messages
- [ ] Verify product appears in wishlist

## Privacy & Performance

### Privacy
- Only tracks logged-in customers
- Local storage only
- No external tracking
- Respects customer consent

### Performance
- Lightweight JavaScript
- Minimal API calls
- Efficient storage
- Non-blocking execution

## Browser Support

- Modern browsers with localStorage
- JavaScript enabled required
- All major browsers supported
