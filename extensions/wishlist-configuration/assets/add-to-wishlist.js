
// Prevent multiple initializations
if (window.wishlistInitialized) {
  // console.debug('[WISHLIST] Already initialized, skipping duplicate execution');
  // Exit early if already initialized
} else {
  window.wishlistInitialized = true;
  
  // Notification function for beautiful alerts
  function showNotification(message, type = 'success') {
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
    if (!document.getElementById('wishlist-notification-styles')) {
      var style = document.createElement('style');
      style.id = 'wishlist-notification-styles';
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
    
    // Remove after 5 seconds
    setTimeout(function() {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(function() {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }
  
  // Immediately hide the button to prevent any flash
  (function() {
    var btn = document.getElementById('wishlist-add-btn');
    if (btn) {
      btn.style.display = 'none';
      btn.style.visibility = 'hidden';
      btn.style.opacity = '0';
      btn.style.position = 'absolute';
      btn.style.left = '-9999px';
      btn.style.top = '-9999px';
    }
    
    // Monitor the button to ensure it stays hidden until proper logic runs
    var checkInterval = setInterval(function() {
      var btn = document.getElementById('wishlist-add-btn');
      if (btn && !window.wishlistButtonVisibilityDetermined) {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
        btn.style.opacity = '0';
        btn.style.position = 'absolute';
        btn.style.left = '-9999px';
        btn.style.top = '-9999px';
      } else if (window.wishlistButtonVisibilityDetermined) {
        clearInterval(checkInterval);
      }
    }, 100);
  })();
  
  var wishlistPrimaryColor = '#111'; // fallback, global
function createWishlistButtonOnImage(position, metafields) {
  // Check if button already exists to prevent duplicates
  var existingButton = document.getElementById('wishlist-add-btn-image');
  if (existingButton) {
    // console.debug('[WISHLIST] Product image button already exists, skipping creation');
    return;
  }
  
  // Dynamic selector logic for product media container
  var productMediaSelectors = [];
  var selectorSource = '';
  
  // 1. Try extension setting first
  if (typeof window !== 'undefined' && window.wishlistProductLinkSelectorForProductPage && window.wishlistProductLinkSelectorForProductPage !== '-') {
    productMediaSelectors.push(window.wishlistProductLinkSelectorForProductPage);
    selectorSource = 'extension setting: product_link_selector_product_page';
  }
  
  // 2. Try metafield selector
  if (metafields['product_media_selector']) {
    productMediaSelectors.push(metafields['product_media_selector']);
    selectorSource = 'metafield: product_media_selector';
  }
  
  // 3. Fallback to static selectors
  if (productMediaSelectors.length === 0) {
    productMediaSelectors = ['.product-media-container', '.product__media', '.product-gallery', '.product-images'];
    selectorSource = 'static fallback';
  }
  
  // Try each selector
  var productMediaContainer = null;
  for (var i = 0; i < productMediaSelectors.length; i++) {
    var selector = productMediaSelectors[i];
    // console.debug('[WISHLIST] Trying product media selector:', selector, 'Source:', selectorSource);
    
    productMediaContainer = document.querySelector(selector);
    if (productMediaContainer) {
      // console.debug('[WISHLIST] Found product media container using selector:', selector, 'Source:', selectorSource);
      break;
    }
  }
  
  if (!productMediaContainer) {
    // console.debug('[WISHLIST] Product media container not found with any selector');
    return;
  }

  // Create wishlist button with dynamic ID
  var wishlistBtn = document.createElement('button');
  wishlistBtn.type = 'button';
  
  // Dynamic button ID from metafields or fallback
  var buttonId = metafields['wishlist_button_id'] || 'wishlist-add-btn-image';
  wishlistBtn.id = buttonId;
  wishlistBtn.className = buttonId;
  // console.debug('[WISHLIST] Using button ID:', buttonId, 'Source:', metafields['wishlist_button_id'] ? 'metafield' : 'static fallback');
  
  wishlistBtn.setAttribute('data-product-id', window.wishlistProductId || '');
  wishlistBtn.setAttribute('data-customer-id', window.wishlistCustomerId || '');
  
  // Set button content
  var iconType = metafields['icon_type'] || 'heart';
  var iconThickness = parseFloat(metafields['icon_thickness_product_page']) || 1.7;
  var primaryColor = metafields['primary_color'] || '#111';
  var secondaryColor = metafields['secondary_color'] || '#fff';
  var btnType = metafields['btn_type_product_page'] || 'icon_and_text';
  var buttonText = metafields['btn_text_product_page_before'] || 'Add To Wishlist';
  var appearance = metafields['appearance_btn_product_page'] || 'solid';
  
  // Get button size from metafields (same as original button)
  var btnHeight = parseInt(metafields['button_size_product_page']) || 40;
  var fontSize = Math.round(btnHeight * 0.4);
  var iconSize = Math.round(btnHeight * 0.6);
  
  // Create icon container with dynamic ID
  var iconContainer = document.createElement('span');
  var iconContainerId = metafields['wishlist_icon_container_id'] || 'wishlist-add-icon-container-image';
  iconContainer.id = iconContainerId;
  iconContainer.style.display = 'inline-block';
  iconContainer.style.verticalAlign = 'middle';
  iconContainer.style.lineHeight = '1';
  // console.debug('[WISHLIST] Using icon container ID:', iconContainerId, 'Source:', metafields['wishlist_icon_container_id'] ? 'metafield' : 'static fallback');
  
  // Create text container with dynamic ID
  var textContainer = document.createElement('span');
  var textContainerId = metafields['wishlist_text_container_id'] || 'wishlist-add-btn-text-image';
  textContainer.id = textContainerId;
  textContainer.textContent = buttonText;
  // console.debug('[WISHLIST] Using text container ID:', textContainerId, 'Source:', metafields['wishlist_text_container_id'] ? 'metafield' : 'static fallback');
  
  // Add icon and text based on button type
  if (btnType === 'icon_and_text' || btnType === 'icon' || btnType === 'only_icon') {
    var customIcon = (typeof window !== 'undefined' && window.wishlistCustomIcon && window.wishlistCustomIcon !== '') ? window.wishlistCustomIcon : '';
    
    // Determine icon color based on appearance
    var iconColor = (appearance === 'outline' || appearance === 'plain') ? primaryColor : secondaryColor;
    
    if (customIcon && customIcon.trim() !== '') {
      // Use custom icon if available - use calculated size
      iconContainer.innerHTML = '<img src="' + customIcon + '" alt="Wishlist Icon" style="width:' + iconSize + 'px;height:' + iconSize + 'px;object-fit:contain;vertical-align:middle;" />';
    } else {
      // Use metafield icon with calculated size and thickness
      var svg = getWishlistIconSvg(iconType, iconColor, iconThickness, iconSize);
      iconContainer.innerHTML = svg;
    }
    wishlistBtn.appendChild(iconContainer);
  }
  
  if (btnType === 'icon_and_text' || btnType === 'text' || btnType === 'only_text') {
    // Style text for rectangular buttons - use calculated font size
    if (btnType === 'icon_and_text' || btnType === 'text' || btnType === 'only_text') {
      textContainer.style.fontSize = fontSize + 'px';
      textContainer.style.fontWeight = '600';
      textContainer.style.whiteSpace = 'nowrap';
      // Set text color based on appearance
      textContainer.style.color = (appearance === 'outline' || appearance === 'plain') ? primaryColor : secondaryColor;
      textContainer.style.lineHeight = '1';
      textContainer.style.verticalAlign = 'middle';
    }
    wishlistBtn.appendChild(textContainer);
  }
  
  // Style the button based on button type
  wishlistBtn.style.position = 'absolute';
  wishlistBtn.style.zIndex = '10';
  if (appearance === 'outline') {
    wishlistBtn.style.background = 'transparent';
    wishlistBtn.style.border = '2px solid ' + primaryColor;
    wishlistBtn.style.color = primaryColor;
    wishlistBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  } else if (appearance === 'plain') {
    wishlistBtn.style.background = 'transparent';
    wishlistBtn.style.border = 'none';
    wishlistBtn.style.color = primaryColor;
    wishlistBtn.style.boxShadow = 'none';
    wishlistBtn.style.padding = '8px 12px';
    wishlistBtn.style.margin = '0';
    wishlistBtn.style.gap = '8px';
    wishlistBtn.style.fontWeight = '600';
    wishlistBtn.style.display = 'inline-flex';
    wishlistBtn.style.alignItems = 'center';
    wishlistBtn.style.justifyContent = 'center';
    wishlistBtn.style.flexDirection = 'row';
      } else {
      // Solid button styling
      wishlistBtn.style.background = primaryColor;
      wishlistBtn.style.border = 'none';
      wishlistBtn.style.color = secondaryColor;
      wishlistBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      wishlistBtn.style.display = 'inline-flex';
      wishlistBtn.style.alignItems = 'center';
      wishlistBtn.style.justifyContent = 'center';
      wishlistBtn.style.gap = '8px';
      wishlistBtn.style.fontWeight = '600';
      wishlistBtn.style.flexDirection = 'row';
      wishlistBtn.style.marginBottom = '12px';
    }
  wishlistBtn.style.cursor = 'pointer';
  wishlistBtn.style.transition = 'all 0.2s';
  
  // Style based on button type
  if (btnType === 'icon' || btnType === 'only_icon') {
    // Circular badge for icon only - use metafield size
    wishlistBtn.style.borderRadius = '50%';
    wishlistBtn.style.width = btnHeight + 'px';
    wishlistBtn.style.height = btnHeight + 'px';
    wishlistBtn.style.padding = '0';
  } else {
    // Rectangular button for icon+text or text only - use metafield size
    wishlistBtn.style.borderRadius = '6px';
    wishlistBtn.style.padding = Math.round(btnHeight * 0.2) + 'px ' + Math.round(btnHeight * 0.4) + 'px';
    wishlistBtn.style.minWidth = '120px';
    wishlistBtn.style.height = 'auto';
    wishlistBtn.style.gap = '8px';
  }
  
  // Position the button based on the position value
  switch(position) {
    case 'top_left':
      wishlistBtn.style.top = '10px';
      wishlistBtn.style.left = '10px';
      break;
    case 'top_right':
      wishlistBtn.style.top = '10px';
      wishlistBtn.style.right = '10px';
      break;
    case 'bottom_left':
      wishlistBtn.style.bottom = '10px';
      wishlistBtn.style.left = '10px';
      break;
    case 'bottom_right':
      wishlistBtn.style.bottom = '10px';
      wishlistBtn.style.right = '10px';
      break;
    default:
      wishlistBtn.style.top = '10px';
      wishlistBtn.style.right = '10px';
  }
  
  // Add hover effect
  wishlistBtn.addEventListener('mouseenter', function() {
    wishlistBtn.style.transform = 'scale(1.1)';
  });
  
  wishlistBtn.addEventListener('mouseleave', function() {
    wishlistBtn.style.transform = 'scale(1)';
  });
  
  // Add click event (same as original button)
  wishlistBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var customerId = window.wishlistCustomerId;
    if (!customerId) {
              showNotification('Please log in to use wishlists.', 'error');
      return;
    }
    
    // Show modal using shared function
    showWishlistModal();
  });
  
  // Add button to the product media container
  productMediaContainer.style.position = 'relative';
  productMediaContainer.appendChild(wishlistBtn);
  
  // Debug summary
  // console.debug('[WISHLIST] === SELECTOR DEBUG SUMMARY ===');
  // console.debug('[WISHLIST] Product Media Container:', {
  //   selector: productMediaContainer.tagName + (productMediaContainer.className ? '.' + productMediaContainer.className.split(' ').join('.') : ''),
  //   source: selectorSource,
  //   found: !!productMediaContainer
  // });
  // console.debug('[WISHLIST] Button ID:', {
  //   id: buttonId,
  //   source: metafields['wishlist_button_id'] ? 'metafield' : 'static fallback'
  // });
  // console.debug('[WISHLIST] Icon Container ID:', {
  //   id: iconContainerId,
  //   source: metafields['wishlist_icon_container_id'] ? 'metafield' : 'static fallback'
  // });
  // console.debug('[WISHLIST] Text Container ID:', {
  //   id: textContainerId,
  //   source: metafields['wishlist_text_container_id'] ? 'metafield' : 'static fallback'
  // });
  // console.debug('[WISHLIST] Created wishlist button on product image at position:', position);
  // console.debug('[WISHLIST] === END SELECTOR DEBUG SUMMARY ===');
}

function applyWishlistBtnStyle() {
  var wishlistBtn = document.getElementById('wishlist-add-btn');
  var cartBtn = document.querySelector('button[type="submit"], .add-to-cart, #AddToCart-product-template');
  var iconContainer = document.getElementById('wishlist-add-icon-container');
  var btnText = document.getElementById('wishlist-add-btn-text');
  var btnHeight = window.wishlistButtonHeightFromMetafield && !isNaN(window.wishlistButtonHeightFromMetafield)
    ? window.wishlistButtonHeightFromMetafield
    : null;
  
  // Don't apply styling if button visibility hasn't been determined yet
  if (!window.wishlistButtonVisibilityDetermined) {
    if (wishlistBtn) {
      wishlistBtn.style.display = 'none';
      wishlistBtn.style.visibility = 'hidden';
      wishlistBtn.style.opacity = '0';
      wishlistBtn.style.position = 'absolute';
      wishlistBtn.style.left = '-9999px';
      wishlistBtn.style.top = '-9999px';
    }
    return;
  }
  
  // Don't apply styling if button is hidden
  if (wishlistBtn && wishlistBtn.style.display === 'none') {
    return;
  }
  
  // Function to match cart button height
  function matchCartButtonHeight(wishlistBtn, cartBtn) {
    if (!wishlistBtn || !cartBtn) return;
    
    var cartHeight = cartBtn.offsetHeight;
    var cartPadding = window.getComputedStyle(cartBtn).padding;
    var cartBorder = window.getComputedStyle(cartBtn).border;
    var cartBorderRadius = window.getComputedStyle(cartBtn).borderRadius;
    var cartFontSize = window.getComputedStyle(cartBtn).fontSize;
    var cartFontWeight = window.getComputedStyle(cartBtn).fontWeight;
    var cartFontFamily = window.getComputedStyle(cartBtn).fontFamily;
    var cartLineHeight = window.getComputedStyle(cartBtn).lineHeight;
    
    if (cartHeight > 0) {
      wishlistBtn.style.height = cartHeight + 'px';
      wishlistBtn.style.minHeight = cartHeight + 'px';
      wishlistBtn.style.maxHeight = cartHeight + 'px';
    }
    if (cartPadding) wishlistBtn.style.padding = cartPadding;
    if (cartBorder) wishlistBtn.style.border = cartBorder;
    if (cartBorderRadius) wishlistBtn.style.borderRadius = cartBorderRadius;
    if (cartFontSize) wishlistBtn.style.fontSize = cartFontSize;
    if (cartFontWeight) wishlistBtn.style.fontWeight = cartFontWeight;
    if (cartFontFamily) wishlistBtn.style.fontFamily = cartFontFamily;
    if (cartLineHeight) wishlistBtn.style.lineHeight = cartLineHeight;
    
    wishlistBtn.style.boxSizing = 'border-box';
  }
  
  // Ensure button is clickable
  if (wishlistBtn) {
    wishlistBtn.style.pointerEvents = 'auto';
    wishlistBtn.style.cursor = 'pointer';
    wishlistBtn.style.position = 'relative';
    wishlistBtn.style.zIndex = '10';
  }
  
  if (wishlistBtn && cartBtn) {
    var cartWidth = cartBtn.offsetWidth;
    var cartHeight = cartBtn.offsetHeight;
    var cartRadius = window.getComputedStyle(cartBtn).borderRadius;
    var cartFont = window.getComputedStyle(cartBtn).fontFamily;
    var cartFontWeight = window.getComputedStyle(cartBtn).fontWeight;
    var cartPadding = window.getComputedStyle(cartBtn).padding;
    var cartBorder = window.getComputedStyle(cartBtn).border;
    var cartFontSize = window.getComputedStyle(cartBtn).fontSize;

    // Check if button is in a flex layout (left/right positioning)
    var isInFlexLayout = wishlistBtn.parentElement && 
                        window.getComputedStyle(wishlistBtn.parentElement).display === 'flex' &&
                        wishlistBtn.parentElement.style.alignItems === 'stretch';
    
    if (cartWidth > 0 && !isInFlexLayout) wishlistBtn.style.width = cartWidth + 'px';
    if (cartHeight > 0 && !isInFlexLayout) {
      wishlistBtn.style.height = cartHeight + 'px';
      wishlistBtn.style.minHeight = cartHeight + 'px';
    }
    if (cartRadius) wishlistBtn.style.borderRadius = cartRadius;
    if (cartFont) wishlistBtn.style.fontFamily = cartFont;
    if (cartFontWeight) wishlistBtn.style.fontWeight = cartFontWeight;
    if (cartPadding) wishlistBtn.style.padding = cartPadding;
    if (cartBorder) wishlistBtn.style.border = cartBorder;
    if (cartFontSize) wishlistBtn.style.fontSize = cartFontSize;

    // Get appearance from metafields to determine styling
    var appearance = window.wishlistAppearance || 'solid';
    
    // Set styling based on appearance
    if (appearance === 'outline') {
      wishlistBtn.style.background = 'transparent';
      wishlistBtn.style.border = '2px solid ' + wishlistPrimaryColor;
      wishlistBtn.style.color = wishlistPrimaryColor;
      wishlistBtn.style.boxShadow = 'none';
    } else if (appearance === 'plain') {
      wishlistBtn.style.background = 'transparent';
      wishlistBtn.style.border = 'none';
      wishlistBtn.style.color = wishlistPrimaryColor;
      wishlistBtn.style.boxShadow = 'none';
      wishlistBtn.style.padding = '8px 12px';
      wishlistBtn.style.margin = '0';
      wishlistBtn.style.gap = '8px';
      wishlistBtn.style.fontWeight = '600';
      wishlistBtn.style.display = 'inline-flex';
      wishlistBtn.style.alignItems = 'center';
      wishlistBtn.style.justifyContent = 'center';
      wishlistBtn.style.flexDirection = 'row';
    } else {
      // Solid button styling
      wishlistBtn.style.background = wishlistPrimaryColor;
      wishlistBtn.style.border = 'none';
      wishlistBtn.style.color = fontColor;
      wishlistBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      wishlistBtn.style.display = 'inline-flex';
      wishlistBtn.style.alignItems = 'center';
      wishlistBtn.style.justifyContent = 'center';
      wishlistBtn.style.gap = '8px';
      wishlistBtn.style.fontWeight = '600';
      wishlistBtn.style.flexDirection = 'row';
      wishlistBtn.style.marginBottom = '12px';
    }

    // Calculate font size and icon size based on cart button height
    var fontSize = Math.round(cartHeight * 0.4);
    var iconSize = Math.round(cartHeight * 0.6);
    
    if (btnText) btnText.style.fontSize = fontSize + 'px';
    if (iconContainer && iconContainer.firstChild && iconContainer.firstChild.tagName && iconContainer.firstChild.tagName.toLowerCase() === 'svg') {
      iconContainer.firstChild.setAttribute('width', iconSize);
      iconContainer.firstChild.setAttribute('height', iconSize);
      iconContainer.firstChild.style.fontSize = iconSize + 'px';
    }
  }
  }
 
function getWishlistIconSvg(iconType, color, thickness, size) {
  thickness = thickness || 1.7;
  size = size || 24;
  if (iconType === "star") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  } else if (iconType === "bookmark") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
  } else if (iconType === "heart") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4.5-4.2-8-7.2-8-11.1C4 5.5 7.5 4 10 6.5c1.2 1.2 2 2.5 2 2.5s.8-1.3 2-2.5C16.5 4 20 5.5 20 9.9c0 2.2-1.2 4.2-3.5 6.7-.8.9-1.7 1.7-2.5 2.4z"/></svg>`;
  }
  return '';
}

// Helper: unescapeSelector for HTML-escaped quotes
function unescapeSelector(selector) {
  return selector.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Shared modal functionality
function setupWishlistModal() {
  // console.debug('[WISHLIST] Setting up modal functionality...');
  
  // Prevent duplicate setup
  if (window.wishlistModalSetup) {
    // console.debug('[WISHLIST] Modal already set up, skipping');
    return;
  }
  
  const modal = document.getElementById('wishlist-modal');
  const select = document.getElementById('wishlist-select');
  const addToSelectedBtn = document.getElementById('wishlist-add-to-selected-btn');
  const createBtn = document.getElementById('wishlist-create-btn');
  const titleInput = document.getElementById('wishlist-title-input');
  const closeBtn = document.getElementById('wishlist-modal-close');
  
  // console.debug('[WISHLIST] Modal elements found:', {
  //   modal: !!modal,
  //   select: !!select,
  //   addToSelectedBtn: !!addToSelectedBtn,
  //   createBtn: !!createBtn,
  //   titleInput: !!titleInput,
  //   closeBtn: !!closeBtn
  // });
  
  if (!modal || !select || !addToSelectedBtn || !createBtn || !titleInput || !closeBtn) {
    // console.warn('[WISHLIST] Modal elements not found');
    return;
  }
  
  // Mark as set up to prevent duplicates
  window.wishlistModalSetup = true;
  
  // Get product and customer IDs from global variables
  const customerId = window.wishlistCustomerId;
  const productId = window.wishlistProductId;
  
  if (!customerId || !productId) {
    // console.warn('[WISHLIST] Missing customer or product ID');
    return;
  }
  
  // Add to selected wishlist
  // console.debug('[WISHLIST] Adding click listener to addToSelectedBtn');
  addToSelectedBtn.addEventListener('click', function() {
    // console.debug('[WISHLIST] Add to selected button clicked');
    const wishlistId = select.value;
    if (!wishlistId) {
              showNotification('Please select a wishlist.', 'error');
      return;
    }
    // console.debug('[WISHLIST] Adding to wishlist:', wishlistId);
    addToSelectedBtn.textContent = 'Adding...';
    addToSelectedBtn.disabled = true;
    fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-items', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw data; });
      }
      return res.json();
    })
    .then(data => {
      // console.debug('[WISHLIST] Add to wishlist response:', data);
      if (data.status === 'true' && data.message && data.message.toLowerCase().includes('already')) {
        showNotification('Product already in this wishlist.', 'info');
      } else {
                  showNotification('Added to wishlist!', 'success');
      }
      modal.style.display = 'none';
      addToSelectedBtn.textContent = 'Add to Selected';
      addToSelectedBtn.disabled = false;
    })
    .catch((error) => {
      // console.error('[WISHLIST] Error adding to wishlist:', error);
      if (error.error_code === 'USAGE_LIMIT_REACHED') {
        showNotification('Usage limit reached. Please upgrade your plan to add more items.', 'error');
      } else {
                  showNotification('Error adding to wishlist.', 'error');
      }
      addToSelectedBtn.textContent = 'Add to Selected';
      addToSelectedBtn.disabled = false;
    });
  });

  // Create new wishlist and add item
  // console.debug('[WISHLIST] Adding click listener to createBtn');
  createBtn.addEventListener('click', function() {
    // console.debug('[WISHLIST] Create button clicked');
    const title = titleInput.value.trim();
    if (!title) {
              showNotification('Please enter a wishlist name.', 'error');
      return;
    }
    // console.debug('[WISHLIST] Creating wishlist with title:', title);
    createBtn.textContent = 'Creating...';
    createBtn.disabled = true;
    fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlists', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ customer_id: customerId, title })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw data; });
      }
      return res.json();
    })
    .then(data => {
      //  console.debug('[WISHLIST] Wishlist created:', data);
      // Now add the product to the new wishlist
      fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-items', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ wishlist_id: data.id, product_id: productId })
      })
      .then(() => {
        // console.debug('[WISHLIST] Product added to new wishlist');
        showNotification('Wishlist created and product added!', 'success');
        modal.style.display = 'none';
        titleInput.value = '';
        createBtn.textContent = 'Create and Add';
        createBtn.disabled = false;
      });
    })
    .catch((err) => {
      // console.error('[WISHLIST] Error creating wishlist:', err);
      if (err && err.message && err.message.toLowerCase().includes('already exists')) {
        showNotification('A wishlist with this title already exists.', 'error');
      } else if (err.error_code === 'USAGE_LIMIT_REACHED') {
                  showNotification('Usage limit reached. Please upgrade your plan to create more wishlists.', 'error');
      } else {
                  showNotification('Error creating wishlist.', 'error');
      }
      createBtn.textContent = 'Create and Add';
      createBtn.disabled = false;
    });
  });

  // Close modal
  // console.debug('[WISHLIST] Adding click listener to closeBtn');
  closeBtn.addEventListener('click', function() {
    // console.debug('[WISHLIST] Close button clicked');
    modal.style.display = 'none';
  });
}

// Shared function to show modal and load wishlists
function showWishlistModal() {
  // console.debug('[WISHLIST] showWishlistModal called');
  const modal = document.getElementById('wishlist-modal');
  const select = document.getElementById('wishlist-select');
  const customerId = window.wishlistCustomerId;
  
  // console.debug('[WISHLIST] Modal elements for showing:', {
  //   modal: !!modal,
  //   select: !!select,
  //   customerId: !!customerId
  // });
  
  if (!modal || !select || !customerId) {
    // console.warn('[WISHLIST] Cannot show modal - missing elements or customer ID');
    return;
  }
  
  modal.style.display = 'flex';
  select.innerHTML = '<option>Loading...</option>';
  
  // Load wishlists first, then try to load usage info (optional)
  fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlists?customer_id=' + encodeURIComponent(customerId))
    .then(res => res.json())
    .then(wishlistsData => {
      // Load wishlists
      select.innerHTML = '';
      if (!Array.isArray(wishlistsData) || wishlistsData.length === 0) {
        select.innerHTML = '<option disabled>No wishlists yet</option>';
      } else {
        wishlistsData.forEach(wl => {
          const opt = document.createElement('option');
          opt.value = wl.id;
          opt.textContent = wl.title;
          select.appendChild(opt);
        });
      }
      
      // Try to load usage info (optional - don't fail if this doesn't work)
      fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/usage/stats')
        .then(res => res.json())
        .then(usageData => {
          if (usageData.success && usageData.data) {
            const usageInfo = usageData.data;
            const usageText = `Usage: ${usageInfo.current_usage}/${usageInfo.limit} (${usageInfo.plan} plan)`;
            
            // Add usage info below the modal title
            let usageElement = modal.querySelector('.usage-info');
            if (!usageElement) {
              usageElement = document.createElement('div');
              usageElement.className = 'usage-info';
              usageElement.style.cssText = 'text-align: center; font-size: 0.9rem; color: #666; margin-bottom: 20px;';
              modal.querySelector('h3').insertAdjacentElement('afterend', usageElement);
            }
            usageElement.textContent = usageText;
            
            // Show warning if approaching limit
            if (usageInfo.usage_percentage > 80) {
              usageElement.style.color = '#e74c3c';
              usageElement.style.fontWeight = 'bold';
            }
          }
        })
        .catch(error => {
          // Silently fail for usage info - it's optional
          console.debug('Usage info not available:', error);
        });
    })
    .catch((error) => {
      console.error('Error loading wishlists:', error);
      select.innerHTML = '<option disabled>Error loading wishlists</option>';
    });
}

(function() {
  var btn = document.getElementById('wishlist-add-btn');
  var iconContainer = document.getElementById('wishlist-add-icon-container');
  var btnText = document.getElementById('wishlist-add-btn-text');
  fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-metafields')
    .then(response => response.json())
    .then(function(response) {
      var metafields = {};
      var metafieldsEdges = response.metafields || [];
      metafieldsEdges.forEach(function(edge) {
        metafields[edge.node.key] = edge.node.value;
      });
      
      // Check button position tab first
      var buttonPositionTab = metafields['button_position_tab'];
      
      // Mark that button visibility has been determined
      window.wishlistButtonVisibilityDetermined = true;
      
      // If button should be on product image, hide the original button immediately
      if (buttonPositionTab === 'product_image') {
        if (btn) {
          btn.style.display = 'none';
        }
        // console.debug('[WISHLIST] Product image mode - skipping original button styling');
        return; // Exit early, don't style the original button
      } else if (buttonPositionTab === 'near_cart') {
        // console.debug('[WISHLIST] Near cart mode - styling original button');
        if (btn) {
          btn.style.display = 'flex';
          btn.style.visibility = 'visible';
          btn.style.opacity = '1';
          btn.style.position = 'relative';
          btn.style.left = 'auto';
          btn.style.top = 'auto';
          btn.style.pointerEvents = 'auto';
          btn.style.cursor = 'pointer';
          btn.style.zIndex = '10';
        }
      } else {
        // Default behavior (backward compatibility)
        // console.debug('[WISHLIST] Default mode - styling original button');
        if (btn) {
          btn.style.display = 'flex';
          btn.style.visibility = 'visible';
          btn.style.opacity = '1';
          btn.style.position = 'relative';
          btn.style.left = 'auto';
          btn.style.top = 'auto';
          btn.style.pointerEvents = 'auto';
          btn.style.cursor = 'pointer';
          btn.style.zIndex = '10';
        }
      }
      
      // Only style the original button if it should be near cart
      wishlistPrimaryColor = metafields['primary_color'] || '#111';
      // Set global for height from metafields
      window.wishlistButtonHeightFromMetafield = parseInt(metafields['button_size_product_page']) || null;
      var btnType = metafields['btn_type_product_page'] || 'icon_and_text';
      var iconTypeApi = metafields['icon_type'] || 'star';
      var iconThicknessApi = parseFloat(metafields['icon_thickness_product_page']) || 1.7;
      var color = metafields['secondary_color'] || '#e5e5e5';
      var buttonText = metafields['btn_text_product_page_before'] || 'Add To Wishlist';
      var appearance = metafields['appearance_btn_product_page'] || 'solid';
      var fontColor = metafields['secondary_color'] || '#e5e5e5';
      var textIconColor = (appearance === 'outline' || appearance === 'plain') ? wishlistPrimaryColor : fontColor;
      
      // Store appearance globally for other functions
      window.wishlistAppearance = appearance;
      var iconTypeToUse = iconTypeApi;
      var thicknessToUse = iconThicknessApi;
      var btnHeight = window.wishlistButtonHeightFromMetafield && !isNaN(window.wishlistButtonHeightFromMetafield)
        ? window.wishlistButtonHeightFromMetafield
        : 40;
      var fontSize = Math.round(btnHeight * 0.4);
      var iconSize = Math.round(btnHeight * 0.6);
      // Render according to btnType
      if (btnType === 'icon_and_text') {
        if (iconContainer) {
          var customIcon = (typeof window !== 'undefined' && window.wishlistCustomIcon && window.wishlistCustomIcon !== '') ? window.wishlistCustomIcon : '';
          if (customIcon && customIcon.trim() !== '') {
            iconContainer.innerHTML = '<img src="' + customIcon + '" alt="Wishlist Icon" style="width:' + iconSize + 'px;height:' + iconSize + 'px;object-fit:contain;vertical-align:middle;" />';
          } else {
            // Use primary color for outline and plain buttons, secondary color for solid buttons
            var iconColor = (appearance === 'outline' || appearance === 'plain') ? wishlistPrimaryColor : fontColor;
            var svg = getWishlistIconSvg(iconTypeToUse, iconColor, thicknessToUse, iconSize);
            iconContainer.innerHTML = svg;
          }
          iconContainer.style.display = 'inline-block';
          iconContainer.style.verticalAlign = 'middle';
          iconContainer.style.lineHeight = '1';
        }
        if (btnText) {
          btnText.textContent = buttonText;
          btnText.style.display = 'inline-block';
          btnText.style.color = (appearance === 'solid') ? fontColor : textIconColor;
          btnText.style.fontSize = fontSize + 'px';
          btnText.style.lineHeight = '1';
          btnText.style.verticalAlign = 'middle';
        }
      } else if (btnType === 'icon' || btnType === 'only_icon') {
        if (iconContainer) {
          var customIcon = (typeof window !== 'undefined' && window.wishlistCustomIcon && window.wishlistCustomIcon !== '') ? window.wishlistCustomIcon : '';
          if (customIcon && customIcon.trim() !== '') {
            iconContainer.innerHTML = '<img src="' + customIcon + '" alt="Wishlist Icon" style="width:' + iconSize + 'px;height:' + iconSize + 'px;object-fit:contain;vertical-align:middle;" />';
          } else {
            // Use primary color for outline and plain buttons, secondary color for solid buttons
            var iconColor = (appearance === 'outline' || appearance === 'plain') ? wishlistPrimaryColor : fontColor;
            var svg = getWishlistIconSvg(iconTypeToUse, iconColor, thicknessToUse, iconSize);
            iconContainer.innerHTML = svg;
          }
          iconContainer.style.display = 'inline-block';
          iconContainer.style.verticalAlign = 'middle';
          iconContainer.style.lineHeight = '1';
        }
        if (btnText) {
          btnText.style.display = 'none';
        }
      } else if (btnType === 'text' || btnType === 'only_text') {
        if (iconContainer) {
          iconContainer.innerHTML = '';
          iconContainer.style.display = 'none';
        }
        if (btnText) {
          btnText.textContent = buttonText;
          btnText.style.display = 'inline-block';
          btnText.style.color = textIconColor;
          btnText.style.fontSize = fontSize + 'px';
        }
      }
      // Appearance logic
      if (btn) {
        if (appearance === 'outline') {
          btn.style.background = 'transparent';
          btn.style.border = '2px solid ' + wishlistPrimaryColor;
          btn.style.color = wishlistPrimaryColor;
          btn.style.boxShadow = 'none';
        } else if (appearance === 'plain') {
          btn.style.background = 'transparent';
          btn.style.border = 'none';
          btn.style.color = wishlistPrimaryColor;
          btn.style.boxShadow = 'none';
          btn.style.padding = '8px 12px';
          btn.style.margin = '0';
          btn.style.display = 'inline-flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.gap = '8px';
          btn.style.fontWeight = '600';
          btn.style.flexDirection = 'row';
        } else {
          // Solid button styling
          btn.style.background = wishlistPrimaryColor;
          btn.style.border = 'none';
          btn.style.color = textIconColor;
          btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          btn.style.display = 'inline-flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.gap = '8px';
          btn.style.fontWeight = '600';
          btn.style.flexDirection = 'row';
          btn.style.marginBottom = '12px';
        }
      }
      // Remove border radius logic: always use 0
      if (btn) {
        btn.style.borderRadius = '0';
      }
      if (btn) btn.style.display = 'flex';
      
      // Add click event listener to original button
      if (btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var customerId = window.wishlistCustomerId;
          if (!customerId) {
            showNotification('Please log in to use wishlists.', 'error');
            return;
          }
          
          // Show modal using shared function
          showWishlistModal();
        });
      }
      
      applyWishlistBtnStyle();
      window.addEventListener('resize', applyWishlistBtnStyle);
    })
    .catch(function() {
      // Only apply styling if button should be visible
      var btn = document.getElementById('wishlist-add-btn');
      if (btn && btn.style.display !== 'none') {
        applyWishlistBtnStyle();
        window.addEventListener('resize', applyWishlistBtnStyle);
      }
    });
})();

(function() {
  fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-metafields')
    .then(response => response.json())
       .then(function(response) {
      var metafields = {};
      var metafieldsEdges = response.metafields || [];
      metafieldsEdges.forEach(function(edge) {
        metafields[edge.node.key] = edge.node.value;
      });
      var btnPosition = metafields['btn_position_on_product_page'];
      var buttonPositionTab = metafields['button_position_tab'];
      var wishlistBtn = document.getElementById('wishlist-add-btn');
      
      // Mark that button visibility has been determined
      window.wishlistButtonVisibilityDetermined = true;
      
      // Check if button should be shown based on button_position_tab
      if (buttonPositionTab === 'product_image') {
        // console.debug('[WISHLIST] Product image mode - hiding original button and creating image button');
        if (wishlistBtn) {
          wishlistBtn.style.display = 'none';
          wishlistBtn.style.visibility = 'hidden';
          wishlistBtn.style.opacity = '0';
          wishlistBtn.style.position = 'absolute';
          wishlistBtn.style.left = '-9999px';
          wishlistBtn.style.top = '-9999px';
        }
        
        // Create wishlist button on product image
        if (btnPosition) {
          createWishlistButtonOnImage(btnPosition, metafields);
        }
        
        return; // Exit early - don't position the original button
      } else if (buttonPositionTab === 'near_cart') {
        // console.debug('[WISHLIST] Near cart mode - showing original button');
        if (wishlistBtn) {
          wishlistBtn.style.display = 'flex';
          wishlistBtn.style.visibility = 'visible';
          wishlistBtn.style.opacity = '1';
          wishlistBtn.style.position = 'relative';
          wishlistBtn.style.left = 'auto';
          wishlistBtn.style.top = 'auto';
        }
      } else {
        // Default behavior (backward compatibility)
        // console.debug('[WISHLIST] Default mode - showing original button');
        if (wishlistBtn) {
          wishlistBtn.style.display = 'flex';
          wishlistBtn.style.visibility = 'visible';
          wishlistBtn.style.opacity = '1';
          wishlistBtn.style.position = 'relative';
          wishlistBtn.style.left = 'auto';
          wishlistBtn.style.top = 'auto';
        }
      }
      
      // Debug log to check the value from the extension setting
      // console.debug('[WISHLIST] window.wishlistAddToWishlistSelector:', window.wishlistAddToWishlistSelector);
      
      // Dynamic cart button selector logic
      var cartButtonSelectors = [];
      var cartSelectorSource = '';
      
      // 1. Try extension setting first
      var usedExtensionSetting = (
        typeof window.wishlistAddToWishlistSelector !== 'undefined' &&
        window.wishlistAddToWishlistSelector &&
        window.wishlistAddToWishlistSelector !== '.' &&
        window.wishlistAddToWishlistSelector.trim() !== ''
      );
      
      if (usedExtensionSetting) {
        cartButtonSelectors.push(window.wishlistAddToWishlistSelector);
        cartSelectorSource = 'extension setting: add_wishlist_selector';
      }
      
      // 2. Try metafield selector
      if (metafields['cart_button_selector']) {
        cartButtonSelectors.push(metafields['cart_button_selector']);
        cartSelectorSource = 'metafield: cart_button_selector';
      }
      
      // 3. Fallback to static selectors
      if (cartButtonSelectors.length === 0) {
        cartButtonSelectors = [".button[type='submit']", ".add-to-cart", "#AddToCart-product-template"];
        cartSelectorSource = 'static fallback';
      }
      
      var addToWishlistSelector = '';
      for (var i = 0; i < cartButtonSelectors.length; i++) {
        var selector = cartButtonSelectors[i];
        // console.debug('[WISHLIST] Trying cart button selector:', selector, 'Source:', cartSelectorSource);
        
        var testElement = document.querySelector(selector);
        if (testElement) {
          addToWishlistSelector = unescapeSelector(selector).trim();
          // console.debug('[WISHLIST] Found cart button using selector:', selector, 'Source:', cartSelectorSource);
          break;
        }
      }
      
      if (!addToWishlistSelector) {
        addToWishlistSelector = unescapeSelector(cartButtonSelectors[0]).trim();
        // console.debug('[WISHLIST] Using fallback cart button selector:', addToWishlistSelector, 'Source:', cartSelectorSource);
      }
      // Sanitize selector: remove invisible characters and trim
      addToWishlistSelector = addToWishlistSelector.replace(/[\u200B\u200C\u200D\uFEFF]/g, '').trim();
      // Debug: log character codes and JSON string
      for (let i = 0; i < addToWishlistSelector.length; i++) {
        // console.log('[WISHLIST] Selector char', i, addToWishlistSelector.charCodeAt(i), addToWishlistSelector[i]);
      }
      // console.log('[WISHLIST] Selector as JSON:', JSON.stringify(addToWishlistSelector));
      // console.debug('[WISHLIST] addToWishlistSelector (final):', addToWishlistSelector);
      // console.debug('[WISHLIST] typeof addToWishlistSelector:', typeof addToWishlistSelector, 'length:', addToWishlistSelector.length);
      // console.debug('[WISHLIST] Add To Wishlist selector used:', addToWishlistSelector, 'Source:', cartSelectorSource);
      // Wait for the cart button to appear in the DOM before running position logic
      function waitForElement(selector, callback) {
        var el = document.querySelector(selector);
        if (el) return callback(el);
        var observer = new MutationObserver(function() {
          var el = document.querySelector(selector);
          if (el) {
            observer.disconnect();
            callback(el);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }

      waitForElement(addToWishlistSelector, function(cartBtn) {
        // console.debug('[WISHLIST] cartBtn found (MutationObserver):', cartBtn);
        // console.debug('[WISHLIST] wishlistBtn:', wishlistBtn);
        // console.debug('[WISHLIST] btnPosition:', btnPosition);
        if (!wishlistBtn || !cartBtn || !btnPosition) {
          // console.warn('[WISHLIST] Early return: missing wishlistBtn, cartBtn, or btnPosition', {wishlistBtn, cartBtn, btnPosition});
          return;
        }

        if (btnPosition === 'above_cart') {
          cartBtn.parentNode.insertBefore(wishlistBtn, cartBtn);
        } else if (btnPosition === 'below_cart') {
          cartBtn.parentNode.insertBefore(wishlistBtn, cartBtn.nextSibling);
        } else if (btnPosition === 'left_of_cart' || btnPosition === 'right_of_cart') {
          // Create a flex wrapper for just cart and wishlist buttons
          var flexWrapper = document.createElement('div');
          flexWrapper.style.display = 'flex';
          flexWrapper.style.flexDirection = 'row';
          flexWrapper.style.gap = '8px';
          flexWrapper.style.marginBottom = '16px'; // Add space below for Buy it now
          flexWrapper.style.alignItems = 'stretch'; // Make buttons same height
          
          // Insert the wrapper before the cart button
          cartBtn.parentNode.insertBefore(flexWrapper, cartBtn);
          if (btnPosition === 'left_of_cart') {
            flexWrapper.appendChild(wishlistBtn);
            flexWrapper.appendChild(cartBtn);
          } else {
            flexWrapper.appendChild(cartBtn);
            flexWrapper.appendChild(wishlistBtn);
          }
          
          // Apply height matching after DOM insertion with a small delay
          setTimeout(function() {
            // Get fresh cart button dimensions after DOM insertion
            var freshCartBtn = flexWrapper.querySelector('button[type="submit"], .add-to-cart, #AddToCart-product-template') || cartBtn;
            
            // Apply cart button styles to wishlist button
            if (typeof matchCartButtonHeight === 'function') {
              matchCartButtonHeight(wishlistBtn, freshCartBtn);
            } else {
              // Fallback if function is not available
              var cartHeight = freshCartBtn.offsetHeight;
              var cartPadding = window.getComputedStyle(freshCartBtn).padding;
              var cartBorder = window.getComputedStyle(freshCartBtn).border;
              var cartBorderRadius = window.getComputedStyle(freshCartBtn).borderRadius;
              var cartFontSize = window.getComputedStyle(freshCartBtn).fontSize;
              var cartFontWeight = window.getComputedStyle(freshCartBtn).fontWeight;
              var cartFontFamily = window.getComputedStyle(freshCartBtn).fontFamily;
              var cartLineHeight = window.getComputedStyle(freshCartBtn).lineHeight;
              
              if (cartHeight > 0) {
                wishlistBtn.style.height = cartHeight + 'px';
                wishlistBtn.style.minHeight = cartHeight + 'px';
                wishlistBtn.style.maxHeight = cartHeight + 'px';
              }
              if (cartPadding) wishlistBtn.style.padding = cartPadding;
              if (cartBorder) wishlistBtn.style.border = cartBorder;
              if (cartBorderRadius) wishlistBtn.style.borderRadius = cartBorderRadius;
              if (cartFontSize) wishlistBtn.style.fontSize = cartFontSize;
              if (cartFontWeight) wishlistBtn.style.fontWeight = cartFontWeight;
              if (cartFontFamily) wishlistBtn.style.fontFamily = cartFontFamily;
              if (cartLineHeight) wishlistBtn.style.lineHeight = cartLineHeight;
              wishlistBtn.style.boxSizing = 'border-box';
            }
            
            // Ensure proper flex behavior
            wishlistBtn.style.flex = '1';
            wishlistBtn.style.display = 'flex';
            wishlistBtn.style.alignItems = 'center';
            wishlistBtn.style.justifyContent = 'center';
            
            // Force a reflow to ensure styles are applied
            wishlistBtn.offsetHeight;
          }, 100);
        }
      });
    });
})();

// Remove this call since it runs before metafields are loaded
// document.addEventListener("DOMContentLoaded", function() {
//   applyWishlistBtnStyle();
// });

document.addEventListener('DOMContentLoaded', function() {
  // console.debug('[WISHLIST] DOMContentLoaded - setting up modal functionality');
  // Setup shared modal functionality
  setupWishlistModal();
});

// Also try to setup modal immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // console.debug('[WISHLIST] Document still loading, will setup modal on DOMContentLoaded');
} else {
   // console.debug('[WISHLIST] Document already loaded, setting up modal immediately');
  setupWishlistModal();
}

// Retry modal setup after a short delay to ensure modal HTML is loaded
setTimeout(function() {
  // console.debug('[WISHLIST] Retrying modal setup after delay');
  setupWishlistModal();
}, 1000);

// Remove this problematic event listener that forces all buttons to be visible
// document.addEventListener('DOMContentLoaded', function() {
//   var selector = window.wishlistBtnSelector || '.wishlist-add-btn';
//   var btns = document.querySelectorAll(selector);
//   btns.forEach(function(btn) {
//     btn.style.display = 'flex';
//     btn.style.alignItems = 'center';
//     btn.style.justifyContent = 'center';
//     btn.style.gap = '12px';
//     btn.style.fontSize = '15px';
//     btn.style.fontWeight = '600';
//     btn.style.margin = '0 auto 16px auto';
//     btn.style.boxSizing = 'border-box';
//     btn.style.border = 'none';
//     btn.style.cursor = 'pointer';
//     btn.style.transition = 'background 0.2s, color 0.2s';
//     // Focus outline (simulate :focus)
//     btn.addEventListener('focus', function() {
//       btn.style.outline = '2px solid #222';
//       btn.style.outline = '';
//     });
//   });
// });
} // Close the else block from the initialization check
