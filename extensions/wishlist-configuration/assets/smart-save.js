/**
 * Smart Save - Auto-add products to wishlist after multiple visits
 */

(function() {
  'use strict';
  
  // Configuration
  var CONFIG = {
    STORAGE_KEY: 'wishlist_smart_save_visits',
    API_BASE_URL: 'https://phpstack-362288-5709690.cloudwaysapps.com/api',
    DEBUG: true // Enable debug by default
  };
  
  // Utility functions
  function log(message) {
    if (CONFIG.DEBUG) {
      console.log('[WISHLIST SMART SAVE]', message);
    }
  }
  
  function isProductPage() {
    return window.location.pathname.indexOf('/products/') !== -1;
  }
  
  function getProductId() {
    log('Current URL path: ' + window.location.pathname);
    
    // Method 1: From data attributes (numeric product ID)
    var productElement = document.querySelector('[data-product-id]');
    if (productElement) {
      var productId = productElement.getAttribute('data-product-id');
      log('Product ID from data-product-id attribute: ' + productId);
      
      // Check if it's a numeric ID
      if (productId && /^\d+$/.test(productId)) {
        log('Found numeric product ID: ' + productId);
        return productId;
      } else {
        log('Product ID from data-product-id is not numeric: ' + productId);
      }
    }
    
    // Method 2: From global variables (numeric product ID)
    if (typeof window !== 'undefined' && window.wishlistProductId) {
      var productId = window.wishlistProductId;
      log('Product ID from global variable: ' + productId);
      
      // Check if it's a numeric ID
      if (productId && /^\d+$/.test(productId)) {
        log('Found numeric product ID from global variable: ' + productId);
        return productId;
      } else {
        log('Product ID from global variable is not numeric: ' + productId);
      }
    }
    
    // Method 3: From meta tags
    var metaProductId = document.querySelector('meta[name="product-id"]');
    if (metaProductId) {
      var productId = metaProductId.getAttribute('content');
      log('Product ID from meta tag: ' + productId);
      
      if (productId && /^\d+$/.test(productId)) {
        log('Found numeric product ID from meta tag: ' + productId);
        return productId;
      }
    }
    
    // Method 4: From Shopify product object (if available)
    if (typeof window !== 'undefined' && window.Shopify && window.Shopify.product) {
      var productId = window.Shopify.product.id;
      if (productId) {
        log('Product ID from Shopify.product.id: ' + productId);
        return productId.toString();
      }
    }
    
    // Method 5: From URL path (fallback to handle, but log warning)
    var pathMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/);
    if (pathMatch && pathMatch[1]) {
      var productHandle = pathMatch[1];
      log('WARNING: Using product handle from URL as fallback: ' + productHandle);
      log('This will require backend conversion to numeric ID');
      return productHandle;
    }
    
    log('Could not determine valid numeric product ID');
    return null;
  }
  
  function getCustomerId() {
    // Method 1: From global variables
    if (typeof window !== 'undefined' && window.wishlistCustomerId) {
      log('Customer ID from global variable: ' + window.wishlistCustomerId);
      return window.wishlistCustomerId;
    }
    
    // Method 2: From data attributes
    var customerElement = document.querySelector('[data-customer-id]');
    if (customerElement) {
      var customerId = customerElement.getAttribute('data-customer-id');
      log('Customer ID from data attribute: ' + customerId);
      return customerId;
    }
    
    // Method 3: From meta tags
    var metaCustomerId = document.querySelector('meta[name="customer-id"]');
    if (metaCustomerId) {
      var customerId = metaCustomerId.getAttribute('content');
      log('Customer ID from meta tag: ' + customerId);
      return customerId;
    }
    
    log('Could not determine customer ID');
    return null;
  }
  
  // Storage functions
  function getVisitData() {
    try {
      var data = localStorage.getItem(CONFIG.STORAGE_KEY);
      var parsed = data ? JSON.parse(data) : {};
      log('Visit data loaded: ' + JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      log('Error reading visit data from localStorage:', e);
      return {};
    }
  }
  
  function saveVisitData(data) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
      log('Visit data saved: ' + JSON.stringify(data));
    } catch (e) {
      log('Error saving visit data to localStorage:', e);
    }
  }
  
  function incrementVisitCount(productId) {
    var visitData = getVisitData();
    
    if (!visitData[productId]) {
      visitData[productId] = {
        count: 0,
        lastVisit: null,
        addedToWishlist: false
      };
    }
    
    visitData[productId].count++;
    visitData[productId].lastVisit = new Date().toISOString();
    
    saveVisitData(visitData);
    log('Visit count for product ' + productId + ': ' + visitData[productId].count);
    
    return visitData[productId];
  }
  
  function markAsAddedToWishlist(productId) {
    var visitData = getVisitData();
    
    if (visitData[productId]) {
      visitData[productId].addedToWishlist = true;
      saveVisitData(visitData);
      log('Marked product ' + productId + ' as added to wishlist');
    }
  }
  
  function resetVisitCounter(productId) {
    var visitData = getVisitData();
    
    if (visitData[productId]) {
      visitData[productId].count = 0;
      visitData[productId].addedToWishlist = false;
      visitData[productId].lastVisit = new Date().toISOString();
      saveVisitData(visitData);
      log('Reset visit counter for product ' + productId + ' to 0');
    }
  }
  
  // Get shop domain from current URL
  function getShopDomain() {
    var hostname = window.location.hostname;
    if (hostname.includes('myshopify.com')) {
      return hostname;
    }
    // For custom domains, try to extract from URL
    return hostname;
  }
  
  // API functions
  function checkIfInWishlist(productId, customerId) {
    var shopDomain = getShopDomain();
    log('Checking if product ' + productId + ' is in wishlist for customer ' + customerId + ' in shop ' + shopDomain);
    
    return fetch(CONFIG.API_BASE_URL + '/smart-save/products?customer_id=' + encodeURIComponent(customerId) + '&shop_domain=' + encodeURIComponent(shopDomain))
      .then(response => {
        log('Wishlist check response status: ' + response.status);
        return response.json();
      })
      .then(data => {
        log('Wishlist check response: ' + JSON.stringify(data));
        
        // Check if product exists in customer's wishlists
        if (data.products && Array.isArray(data.products)) {
          var found = data.products.some(product => 
            product.id && product.id.toString().includes(productId.toString())
          );
          log('Product found in wishlist: ' + found);
          return found;
        }
        log('No products array in response');
        return false;
      })
      .catch(error => {
        log('Error checking wishlist status:', error);
        return false;
      });
  }
  
  function addToWishlist(productId, customerId) {
    var shopDomain = getShopDomain();
    log('Adding product ' + productId + ' to wishlist for customer ' + customerId + ' in shop ' + shopDomain);
    
    return fetch(CONFIG.API_BASE_URL + '/smart-save/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        product_id: productId,
        shop_domain: shopDomain
      })
    })
    .then(response => {
    //   log('Add to wishlist response status: ' + response.status);
      return response.json();
    })
    .then(data => {
    //   log('Add to wishlist response: ' + JSON.stringify(data));
      
      // Check for usage limit error
      if (data.error_code === 'USAGE_LIMIT_REACHED') {
        log('Usage limit reached for Smart Save');
        showSmartSaveNotification('Usage limit reached. Please upgrade your plan to add more items.', 'error');
        return { success: false, usageLimitReached: true };
      }
      
      var success = data.status === 'success' || data.success || false;
    //   log('Add to wishlist success: ' + success);
      return { success: success, usageLimitReached: false };
    })
    .catch(error => {
    //   log('Error adding to wishlist:', error);
      return { success: false, usageLimitReached: false };
    });
  }
  
  // Get Smart Save settings from metafields
  function getSmartSaveSettings() {
    // log('Fetching Smart Save settings from metafields');
    
    return fetch(CONFIG.API_BASE_URL + '/wishlist-metafields')
      .then(response => {
        // log('Metafields response status: ' + response.status);
        return response.json();
      })
      .then(function(response) {
        // log('Metafields response: ' + JSON.stringify(response));
        
        var metafields = {};
        var metafieldsEdges = response.metafields || [];
        metafieldsEdges.forEach(function(edge) {
          metafields[edge.node.key] = edge.node.value;
        });
        
        // log('Parsed metafields: ' + JSON.stringify(metafields));
        
        // Check if Smart Save is enabled in metafields
        var smartSaveEnabled = metafields['smart_save'] === 'true';
        var visitThreshold = parseInt(metafields['smart_save_visit_threshold']) || 3;
        
        // log('Smart Save metafield value: "' + metafields['smart_save'] + '"');
        // log('Smart Save enabled: ' + smartSaveEnabled + ', threshold: ' + visitThreshold);
        
        return {
          enabled: smartSaveEnabled,
          threshold: visitThreshold
        };
      })
      .catch(function(error) {
        // log('Error fetching metafields:', error);
        return {
          enabled: false,
          threshold: 3
        };
      });
  }
  
  // Main Smart Save logic
  function processSmartSave() {
    // log('Starting Smart Save process');
    
    // Check if we're on a product page
    if (!isProductPage()) {
    //   log('Not on a product page, skipping Smart Save');
      return;
    }
    
    // Get product and customer IDs
    var productId = getProductId();
    var customerId = getCustomerId();
    
    if (!productId) {
    //   log('Could not determine valid product ID, skipping Smart Save');
      return;
    }
    
    // Additional validation to ensure product ID looks like a real product
    if (productId.length < 3 || ['check', 'test', 'demo', 'example', 'product'].includes(productId.toLowerCase())) {
    //   log('Product ID appears invalid or is a test value: ' + productId + ', skipping Smart Save');
      return;
    }
    
    // Log the type of product ID we're using
    if (/^\d+$/.test(productId)) {
    //   log('Using numeric product ID: ' + productId);
    } else {
    //   log('Using product handle (will be converted to numeric ID by backend): ' + productId);
    }
    
    if (!customerId) {
    //   log('Could not determine customer ID, Smart Save requires customer login');
      return;
    }
    
    // log('Processing Smart Save for product: ' + productId + ', customer: ' + customerId);
    
    // Get Smart Save settings
    getSmartSaveSettings().then(function(settings) {
      if (!settings.enabled) {
        // log('Smart Save is disabled in metafields');
        return;
      }
      
    //   log('Smart Save enabled, threshold: ' + settings.threshold);
      
      // Increment visit count
      var visitInfo = incrementVisitCount(productId);
      
      // Check if already added to wishlist
      if (visitInfo.addedToWishlist) {
        // log('Product already added to wishlist via Smart Save');
        return;
      }
      
      // Check if product is already in wishlist
      checkIfInWishlist(productId, customerId).then(function(inWishlist) {
        if (inWishlist) {
        //   log('Product already in wishlist');
          markAsAddedToWishlist(productId);
          return;
        }
        
        // Check if we've reached the required visit count
        if (visitInfo.count >= settings.threshold) {
        //   log('Visit count reached (' + visitInfo.count + '/' + settings.threshold + '), adding to wishlist');
          
          // Add to wishlist
          addToWishlist(productId, customerId).then(function(result) {
            if (result.success) {
              markAsAddedToWishlist(productId);
              
              // Reset visit counter to 0 after successful addition
              resetVisitCounter(productId);
              
              // Show success notification to user
              showSmartSaveNotification('Product automatically added to your wishlist!', 'success');
            } else if (result.usageLimitReached) {
            //   log('Usage limit reached, notification already shown');
            } else {
            //   log('Failed to add product to wishlist');
              showSmartSaveNotification('Failed to add product to wishlist. Please try again.', 'error');
            }
          });
        } 
      });
    });
  }
  
  // Notification function
  function showSmartSaveNotification(message, type = 'success') {
    // log('Showing Smart Save notification: ' + message + ' (type: ' + type + ')');
    
    // Create notification element
    var notification = document.createElement('div');
    var backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: inherit;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          ${type === 'success' ? '<path d="M12 21c-4.5-4.2-8-7.2-8-11.1C4 5.5 7.5 4 10 6.5c1.2 1.2 2 2.5 2 2.5s.8-1.3 2-2.5C16.5 4 20 5.5 20 9.9c0 2.2-1.2 4.2-3.5 6.7-.8.9-1.7 1.7-2.5 2.4z"/>' : 
            type === 'error' ? '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' :
            '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>'}
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    // Add CSS animation if not already added
    if (!document.getElementById('wishlist-smart-save-notification-styles')) {
      var style = document.createElement('style');
      style.id = 'wishlist-smart-save-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    log('Notification added to page');
    
    // Remove after 5 seconds
    setTimeout(function() {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(function() {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
            log('Notification removed from page');
          }
        }, 300);
      }
    }, 5000);
  }
  
  // Initialize Smart Save
  function initializeSmartSave() {
    // log('Initializing Smart Save');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
    //   log('DOM loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', function() {
        // log('DOMContentLoaded fired, processing Smart Save');
        processSmartSave();
      });
    } else {
    //   log('DOM already ready, processing Smart Save immediately');
      processSmartSave();
    }
  }
  
  // Start Smart Save
//   log('Smart Save script loaded, starting initialization');
  initializeSmartSave();
  
  // Expose functions globally for debugging
  window.wishlistSmartSave = {
    process: processSmartSave,
    getVisitData: getVisitData,
    clearVisitData: function() {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    //   log('Visit data cleared');
    },
    setDebug: function(debug) {
      CONFIG.DEBUG = debug;
    //   log('Debug logging ' + (debug ? 'enabled' : 'disabled'));
    },
    getSettings: getSmartSaveSettings
  };
  
//   log('Smart Save script initialization complete');
  
})(); 