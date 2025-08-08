/**
 * Smart-Save JavaScript for Wishlist App (with debug logs)
 */

(function() {
    'use strict';
    
    const config = window.WishlistSmartSaveConfig || {};
   
    if (!config.enabled) {
      
        return;
    }
    
    const VISIT_STORAGE_KEY = 'wishlist_smart_save_visits';
    const NOTIFICATION_DURATION = 5000;
    
    function getCurrentProductId() {
        const pathMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/);
        const productId = pathMatch ? pathMatch[1] : null;
       
        return productId;
    }
    
    function getVisitCount(productId) {
        try {
            const visits = JSON.parse(localStorage.getItem(VISIT_STORAGE_KEY) || '{}');
            const count = visits[productId] || 0;
        
            return count;
        } catch (error) {
          
            return 0;
        }
    }
    
    function incrementVisitCount(productId) {
        try {
            const visits = JSON.parse(localStorage.getItem(VISIT_STORAGE_KEY) || '{}');
            visits[productId] = (visits[productId] || 0) + 1;
            localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
        
            return visits[productId];
        } catch (error) {
         
            return 0;
        }
    }
    
    async function isProductInWishlist(productId) {
        if (!config.customerId || config.customerId === 'guest') {
           
            return false;
        }
        try {
            const response = await fetch(`https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist/products?customer_id=${config.customerId}`);
            const data = await response.json();
            const found = data.products && data.products.some(product => product.id && product.id.includes(productId));
         
            return found;
        } catch (error) {
           
            return false;
        }
    }
    
    async function addToWishlist(productId) {
        if (!config.customerId || config.customerId === 'guest') {
           
            return false;
        }
        try {
            const response = await fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: config.customerId,
                    product_id: productId
                })
            });
            const data = await response.json();
         
            return data.status === 'success';
        } catch (error) {
          
            return false;
        }
    }
    
    function showNotification(message, type = 'success') {
        const existingNotifications = document.querySelectorAll('.smart-save-notification');
        existingNotifications.forEach(notification => notification.remove());
        const notification = document.createElement('div');
        notification.className = `smart-save-notification smart-save-${type}`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white; padding: 15px 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000; font-family: Arial, sans-serif; font-size: 14px; max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, NOTIFICATION_DURATION);
      
    }
    
    async function processSmartSave() {
        const productId = getCurrentProductId();
        if (!productId) {
          
            return;
        }
        const isInWishlist = await isProductInWishlist(productId);
        if (isInWishlist) {
          
            return;
        }
        const newVisitCount = incrementVisitCount(productId);
        if (newVisitCount >= config.visitThreshold) {
            const success = await addToWishlist(productId);
            if (success) {
                showNotification(`🎉 Added to your wishlist! You've visited this product ${newVisitCount} times.`);
            } else {
                showNotification('❌ Failed to add to wishlist. Please try again.', 'error');
            }
        } 
    }
    
    function init() {
        processSmartSave();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})(); 