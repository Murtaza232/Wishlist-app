# Smart Save Debugging Guide

## Quick Debug Steps

### 1. Check if Script is Loading
Open browser console and look for:
```
[WISHLIST SMART SAVE] Smart Save script loaded, starting initialization
[WISHLIST SMART SAVE] Smart Save script initialization complete
```

### 2. Check if on Product Page
Look for:
```
[WISHLIST SMART SAVE] Not on a product page, skipping Smart Save
```
If you see this, make sure you're on a product page (`/products/product-handle`)

### 3. Check Product ID Detection
Look for:
```
[WISHLIST SMART SAVE] Product ID from URL: product-handle
```
or
```
[WISHLIST SMART SAVE] Could not determine product ID, skipping Smart Save
```

### 4. Check Customer ID Detection
Look for:
```
[WISHLIST SMART SAVE] Customer ID from global variable: 123456789
```
or
```
[WISHLIST SMART SAVE] Could not determine customer ID, Smart Save requires customer login
```

### 5. Check Metafields
Look for:
```
[WISHLIST SMART SAVE] Metafields response: {...}
[WISHLIST SMART SAVE] Smart Save enabled: true, threshold: 3
```

### 6. Check Visit Tracking
Look for:
```
[WISHLIST SMART SAVE] Visit count for product product-handle: 1
[WISHLIST SMART SAVE] Visit count not reached yet (1/3)
```

## Manual Testing

### 1. Enable Debug Logging
```javascript
// In browser console
window.wishlistSmartSave.setDebug(true);
```

### 2. Check Current Settings
```javascript
// Check metafield settings
window.wishlistSmartSave.getSettings().then(function(settings) {
  console.log('Smart Save Settings:', settings);
});
```

### 3. Check Visit Data
```javascript
// Check current visit data
console.log('Visit Data:', window.wishlistSmartSave.getVisitData());
```

### 4. Clear Visit Data
```javascript
// Clear visit data for testing
window.wishlistSmartSave.clearVisitData();
```

### 5. Manual Processing
```javascript
// Manually trigger Smart Save
window.wishlistSmartSave.process();
```

## Common Issues & Solutions

### Issue 1: Script Not Loading
**Symptoms:** No console messages
**Solution:** Check if the script is being loaded in the configuration block

### Issue 2: Not on Product Page
**Symptoms:** "Not on a product page, skipping Smart Save"
**Solution:** Make sure you're on a URL like `/products/product-handle`

### Issue 3: No Customer ID
**Symptoms:** "Could not determine customer ID"
**Solution:** 
- Make sure customer is logged in
- Check if `window.wishlistCustomerId` is set
- Check if `[data-customer-id]` attribute exists

### Issue 4: No Product ID
**Symptoms:** "Could not determine product ID"
**Solution:**
- Check URL format
- Check if `[data-product-id]` attribute exists
- Check if `window.wishlistProductId` is set

### Issue 5: Metafields Not Working
**Symptoms:** "Error fetching metafields" or "Smart Save is disabled"
**Solution:**
- Set up metafields in Shopify admin
- Set `wishlist.smart_save_enabled` to `true`
- Set `wishlist.smart_save_visit_threshold` to desired number

### Issue 6: API Errors
**Symptoms:** "Error checking wishlist status" or "Error adding to wishlist"
**Solution:**
- Check if API endpoints are accessible
- Check network tab for failed requests
- Verify API base URL is correct

## Testing Checklist

- [ ] Script loads (see console messages)
- [ ] On product page
- [ ] Customer is logged in
- [ ] Product ID detected
- [ ] Customer ID detected
- [ ] Metafields configured
- [ ] Smart Save enabled in metafields
- [ ] Visit count increments
- [ ] Product added to wishlist after threshold
- [ ] Notification shows

## Debug Commands

```javascript
// Full debug sequence
console.log('=== SMART SAVE DEBUG ===');

// Check if script loaded
console.log('Script loaded:', typeof window.wishlistSmartSave !== 'undefined');

// Check current page
console.log('Current URL:', window.location.pathname);
console.log('Is product page:', window.location.pathname.indexOf('/products/') !== -1);

// Check IDs
console.log('Product ID:', window.wishlistProductId);
console.log('Customer ID:', window.wishlistCustomerId);

// Check visit data
console.log('Visit Data:', window.wishlistSmartSave.getVisitData());

// Check settings
window.wishlistSmartSave.getSettings().then(function(settings) {
  console.log('Settings:', settings);
});

// Manual process
window.wishlistSmartSave.process();
```

## Expected Console Output

When working correctly, you should see:
```
[WISHLIST SMART SAVE] Smart Save script loaded, starting initialization
[WISHLIST SMART SAVE] Smart Save script initialization complete
[WISHLIST SMART SAVE] Initializing Smart Save
[WISHLIST SMART SAVE] DOM already ready, processing Smart Save immediately
[WISHLIST SMART SAVE] Starting Smart Save process
[WISHLIST SMART SAVE] Product ID from URL: product-handle
[WISHLIST SMART SAVE] Customer ID from global variable: 123456789
[WISHLIST SMART SAVE] Processing Smart Save for product: product-handle, customer: 123456789
[WISHLIST SMART SAVE] Fetching Smart Save settings from metafields
[WISHLIST SMART SAVE] Metafields response: {...}
[WISHLIST SMART SAVE] Smart Save enabled: true, threshold: 3
[WISHLIST SMART SAVE] Visit count for product product-handle: 1
[WISHLIST SMART SAVE] Visit count not reached yet (1/3)
```
