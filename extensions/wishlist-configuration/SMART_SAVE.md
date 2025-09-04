# Smart Save Feature

## Overview

Smart Save is an intelligent feature that automatically adds products to a customer's wishlist after they visit the product page a specified number of times. This helps capture customer interest and increases engagement.

## How It Works

### 1. Visit Tracking
- Tracks how many times a customer visits each product page
- Stores visit data in the browser's localStorage
- Only counts visits when the customer is logged in

### 2. Automatic Addition
- When a customer reaches the configured visit threshold (default: 3 visits)
- Automatically adds the product to their default wishlist
- Shows a notification to inform the customer

### 3. Smart Logic
- Only works on product pages (`/products/*`)
- Checks if product is already in wishlist before adding
- Prevents duplicate additions
- Requires customer to be logged in

## Configuration

### Enable Smart Save
1. Go to your theme customizer
2. Find the "Wishlist Configuration" block
3. Check the "Enable Smart Save" checkbox
4. Set the "Number of Visits Required" (default: 3)
5. Save your changes

### Settings
- **Enable Smart Save**: Turn the feature on/off
- **Number of Visits Required**: How many times a customer must visit before auto-adding (1-10)

## Features

### Visit Tracking
- Persistent storage using localStorage
- Tracks visit count per product
- Records last visit timestamp
- Prevents duplicate counting

### Customer Requirements
- Customer must be logged in
- Works with existing customer accounts
- Respects customer privacy

### Notification System
- Shows success notification when product is added
- Animated notification in top-right corner
- Auto-dismisses after 5 seconds
- Heart icon with success message

## Technical Details

### Storage
- Uses `localStorage` with key: `wishlist_smart_save_visits`
- Stores data per product ID
- Includes visit count, last visit, and added status

### API Integration
- Checks existing wishlist via API
- Adds products to default wishlist
- Uses existing wishlist API endpoints

### Product Detection
- Extracts product ID from URL path
- Falls back to meta tags and data attributes
- Supports various product ID formats

## Debugging

### Enable Debug Logging
```javascript
// Enable debug logging
window.wishlistSmartSave.setDebug(true);

// Check visit data
console.log(window.wishlistSmartSave.getVisitData());

// Clear visit data
window.wishlistSmartSave.clearVisitData();

// Manually process Smart Save
window.wishlistSmartSave.process();
```

### Console Messages
When debug is enabled, you'll see messages like:
- `[WISHLIST SMART SAVE] Initializing Smart Save`
- `[WISHLIST SMART SAVE] Processing Smart Save for product: product-handle`
- `[WISHLIST SMART SAVE] Visit count for product product-handle: 2`
- `[WISHLIST SMART SAVE] Visit count reached (3/3), adding to wishlist`

## Privacy & Performance

### Privacy
- Only tracks logged-in customers
- Data stored locally in browser
- No external tracking services
- Respects customer consent

### Performance
- Lightweight JavaScript
- Minimal API calls
- Efficient localStorage usage
- Non-blocking execution

## Troubleshooting

### Common Issues

1. **Not working for guest users**
   - Smart Save requires customer login
   - Guest users won't see the feature

2. **Visit count not incrementing**
   - Check if customer is logged in
   - Verify product ID detection
   - Check browser console for errors

3. **Products not being added**
   - Verify API endpoints are working
   - Check customer ID detection
   - Ensure wishlist API is accessible

### Testing
1. Enable Smart Save in configuration
2. Log in as a customer
3. Visit a product page multiple times
4. Check console for debug messages
5. Verify product appears in wishlist

## API Endpoints Used

- `GET /api/wishlist-check` - Check if product is in wishlist
- `POST /api/wishlist-add` - Add product to wishlist

## Browser Support

- Modern browsers with localStorage support
- Requires JavaScript enabled
- Works with all major browsers (Chrome, Firefox, Safari, Edge)
