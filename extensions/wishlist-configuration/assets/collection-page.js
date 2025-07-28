
function renderWishlistIconInCollectionCards(settings) {
  var iconType = settings.iconType;
  var customIcon = (typeof window !== 'undefined' && window.wishlistCustomIcon && window.wishlistCustomIcon !== '') ? window.wishlistCustomIcon : settings.customIcon;
  var buttonType = (typeof window !== 'undefined' && window.wishlistButtonType) ? window.wishlistButtonType : 'icon_and_text';
  var buttonPosition = settings.buttonPosition || 'top-right';
  var buttonSize = parseInt(settings.buttonSize) || 24;
  var iconColor = settings.iconColor || '#000000';
  var iconThickness = parseFloat(settings.iconThickness) || 1.7;
  var svg = "";
  // --- DYNAMIC ICON LOGIC ---
  if (customIcon && customIcon.trim() !== '') {
    svg = '<img src="' + customIcon + '" alt="Wishlist Icon" style="width:' + buttonSize + 'px;height:' + buttonSize + 'px;object-fit:contain;" />';
    console.log('[WISHLIST] Using custom icon from extension settings:', customIcon);
  } else if (iconType === "star") {
    svg = `<svg width="${buttonSize}" height="${buttonSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="${iconThickness}" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    console.log('[WISHLIST] Using metafield icon: star');
  } else if (iconType === "bookmark") {
    svg = `<svg width="${buttonSize}" height="${buttonSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="${iconThickness}" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
    console.log('[WISHLIST] Using metafield icon: bookmark');
  } else if (iconType === "heart") {
    svg = `<svg width="${buttonSize}" height="${buttonSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="${iconThickness}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21c-4.5-4.2-8-7.2-8-11.1C4 5.5 7.5 4 10 6.5c1.2 1.2 2 2.5 2 2.5s.8-1.3 2-2.5C16.5 4 20 5.5 20 9.9c0 2.2-1.2 4.2-3.5 6.7-.8.9-1.7 1.7-2.5 2.4z"/>
    </svg>`;
    console.log('[WISHLIST] Using metafield icon: heart');
  }
  // --- END DYNAMIC ICON LOGIC ---
  var positionStyles = {
    'top-right': 'top:10px;right:10px;',
    'top-left': 'top:10px;left:10px;',
    'bottom-right': 'bottom:70px;right:10px;',
    'bottom-left': 'bottom:70px;left:10px;'
  };
  var iconPositionStyle = positionStyles[buttonPosition] || positionStyles['top-right'];
  // Use selectors from product_card_classes for card selection
  var productCardClasses = settings.product_card_classes || [];
  if (typeof productCardClasses === 'string') {
    try {
      productCardClasses = JSON.parse(productCardClasses);
    } catch {
      productCardClasses = productCardClasses.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  window.productCardClasses = productCardClasses; // Expose for debugging
  // --- DYNAMIC SELECTOR LOGIC ---
  var selectorsToTry = [];
  if (typeof window !== 'undefined' && window.wishlistProductLinkSelector && window.wishlistProductLinkSelector !== '-') {
    selectorsToTry.push(window.wishlistProductLinkSelector);
  }
  if (typeof window !== 'undefined' && window.wishlistProductTileSelector && window.wishlistProductTileSelector !== '-') {
    selectorsToTry.push(window.wishlistProductTileSelector);
  }
  selectorsToTry = selectorsToTry.concat(productCardClasses);
  if (!selectorsToTry.length) {
    selectorsToTry = ['.card', '.product-card-wrapper', '.card-wrapper'];
  }
  var cards = [];
  var selectorSource = '';
  for (var i = 0; i < selectorsToTry.length; i++) {
    var selector = selectorsToTry[i];
    if (selector && !selector.startsWith('.') && !selector.startsWith('#')) {
      selector = '.' + selector;
    }
    var foundCards = Array.from(document.querySelectorAll(selector));
    if (foundCards.length) {
      cards = foundCards;
      // Debug: log which selector is being used and its source
      if (i === 0 && typeof window !== 'undefined' && window.wishlistProductLinkSelector && selector === window.wishlistProductLinkSelector) {
        selectorSource = 'extension setting: product_link_selector';
      } else if (i === 1 && typeof window !== 'undefined' && window.wishlistProductTileSelector && selector === window.wishlistProductTileSelector) {
        selectorSource = 'extension setting: product_tile_selector';
      } else if (i >= 2) {
        selectorSource = 'metafield or default';
      }
      console.log('[WISHLIST] Using selector:', selector, 'Source:', selectorSource);
      break;
    }
  }
  if (!cards.length) {
    console.warn('No matching product selector found for wishlist icon.');
  }
  cards.forEach(function(card) {
    // Try to set data-product-id if not present
    if (!card.getAttribute('data-product-id')) {
      // Try to find a product link or image with product handle/id in href or data attribute
      var productLink = card.querySelector('a[href*="/products/"]');
      if (productLink && productLink.href) {
        var match = productLink.href.match(/\/products\/([a-zA-Z0-9\-]+)/);
        if (match) {
          card.setAttribute('data-product-id', match[1]); // fallback: set handle if id not available
        }
      }
      // If you have a hidden input or element with product id, use it here
      // Example: var hiddenId = card.querySelector('input[name="product_id"]');
      // if (hiddenId) card.setAttribute('data-product-id', hiddenId.value);
    }
    // Remove any old icon
    var oldIcon = card.querySelector('.wishlist-icon');
    if (oldIcon) oldIcon.remove();
    // Find the first matching selector: check card itself, then children
    let appendTarget = null;
    let usedSelector = null;
    // Check if the card itself matches any selector
    for (let selector of productCardClasses) {
      let sel = selector.trim();
      if (!sel.startsWith('.') && !sel.startsWith('#')) {
        if (sel.includes(' ')) {
          sel = '.' + sel.split(/\s+/).join('.');
        } else {
          sel = '.' + sel;
        }
      }
      // Always log per selector
      if (card.matches(sel)) {
        appendTarget = card;
        usedSelector = selector + ' (self)';
        break;
      }
    }
    // If not, look for a child
    if (!appendTarget) {
      for (let selector of productCardClasses) {
        let sel = selector.trim();
        if (!sel.startsWith('.') && !sel.startsWith('#')) {
          if (sel.includes(' ')) {
            sel = '.' + sel.split(/\s+/).join('.');
          } else {
            sel = '.' + sel;
          }
        }
        // Always log per selector for children
        let found = card.querySelector(sel);
        if (found) {
          appendTarget = found;
          usedSelector = selector;
          break;
        }
      }
    }
    if (!appendTarget) appendTarget = card;
    var iconSpan = document.createElement('span');
    iconSpan.className = 'wishlist-icon';
    iconSpan.style.cssText = "position:absolute;z-index:2;cursor:pointer;" + iconPositionStyle;
    iconSpan.innerHTML = svg;
     iconSpan.addEventListener('click', function(event) {
      event.stopPropagation();
      event.preventDefault(); // prevents default anchor behavior
    });
    appendTarget.style.position = "relative";
    appendTarget.appendChild(iconSpan);
  });
}

function isValidIconType(val) {
  return val && val !== '' && val !== 'Select icon';
}

function isValidPosition(val) {
  return val && val !== '' && val !== 'Select Position';
}

function isValidFontColor(val) {
  return val && val !== '' && val !== 'none' && val !== 'null' && val !== null && val !== 'transparent' && val !== '#00000000' && val !== 'rgba(0,0,0,0)';
}

document.addEventListener("DOMContentLoaded", function() {
  fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-metafields')
  .then(response => response.json())
  .then(function(response) {
    var metafields = {};
    var metafieldsEdges = response.metafields || [];
      metafieldsEdges.forEach(function(edge) {
        metafields[edge.node.key] = edge.node.value;
      });
      // Only show icon if add_items_wishlist_collections_page is true
      if ((metafields['add_items_wishlist_collections_page'] || '').toLowerCase() === 'true') {
      var iconType = metafields['icon_type'] || 'star';
      var buttonPosition = metafields['btn_group_position_collections_page'] ? metafields['btn_group_position_collections_page'].replace('_', '-') : 'top-right';
      var iconColor = metafields['primary_color'] || '#000000';
      // Fallback to product page metafields if collection-specific are missing/empty
      var buttonSize = parseInt(metafields['button_size_product_page']) || parseInt(metafields['button_size_product_page']) || 24;
      var iconThickness = parseFloat(metafields['icon_thickness_product_page']) || parseFloat(metafields['icon_thickness_product_page']) || 1.7;
        var settings = {
          iconType: iconType,
        customIcon: '', // Only use metafields, no custom icon
          buttonPosition: buttonPosition,
        buttonSize: buttonSize,
        iconColor: iconColor,
        iconThickness: iconThickness
      };
        renderWishlistIconInCollectionCards(settings);
        if (!document.getElementById('wishlist-modal')) {
          var modalHtml = `
            <style>
            #wishlist-modal {
              display: none;
              position: fixed;
              z-index: 9999;
              left: 0; top: 0; width: 100vw; height: 100vh;
              background: transparent;
            }
            #wishlist-modal .wishlist-modal-content {
              position: fixed;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              background: #fff;
              padding: 40px 32px 32px 32px;
              border-radius: 18px;
              width: 100%;
              max-width: 440px;
              min-width: 320px;
              min-height: 440px;
              max-height: 92vh;
              overflow-y: auto;
              box-shadow: 0 8px 32px rgba(0,0,0,0.18);
              display: flex;
              flex-direction: column;
              gap: 28px;
              font-family: inherit;
              font-size: 1.18rem;
            }
            #wishlist-modal h3 {
              margin: 0 0 12px 0;
              font-size: 1.6rem;
              font-weight: 700;
              text-align: center;
              letter-spacing: 0.01em;
            }
            #wishlist-modal .wishlist-section-title {
              font-size: 1.18rem;
              font-weight: 600;
              margin: 0 0 10px 0;
              color: #444;
            }
            #wishlist-modal select,
            #wishlist-modal input[type="text"] {
              width: 100%;
              direction: ltr;
              padding: 14px 14px;
              font-size: 1.18rem;
              border: 1.5px solid #ccc;
              border-radius: 7px;
              margin-bottom: 14px;
              box-sizing: border-box;
              background: #fafafa;
              transition: border 0.18s;
            }
            #wishlist-modal select:focus,
            #wishlist-modal input[type="text"]:focus {
              border: 2px solid #111;
              outline: none;
            }
            #wishlist-modal button {
              width: 100%;
              padding: 15px 0;
              font-size: 1.18rem;
              border: none;
              border-radius: 7px;
              margin-bottom: 14px;
              background: #111;
              color: #fff;
              font-weight: 700;
              cursor: pointer;
              transition: background 0.18s;
              letter-spacing: 0.01em;
            }
            #wishlist-section-title{
              direction: ltr;
              font-size:1.18rem;
              font-weight:700;
            }
            #wishlist-modal button#wishlist-modal-close {
              background: #eee;
              color: #222;
              margin-top: 6px;
            }
            #wishlist-modal button:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
            @media (max-width: 500px) {
              #wishlist-modal .wishlist-modal-content {
                min-width: 90vw;
                padding: 22px 6vw 22px 6vw;
                font-size: 1.05rem;
              }
            }
            </style>
            <div id="wishlist-modal">
              <div class="wishlist-modal-content">
                <h3>Save to Wishlist</h3>
                <div id="wishlist-list-section">
                  <div class="wishlist-section-title" dir="ltr" style="font-size:15px; font-weight:bold">Select Wishlist:</div>
                  <select id="wishlist-select"></select>
                  <button id="wishlist-add-to-selected-btn">Add to Selected</button>
                </div>
                <div id="wishlist-create-section">
                  <div class="wishlist-section-title" dir="ltr" style="font-size:15px; font-weight:bold">Or create new:</div>
                  <input type="text" id="wishlist-title-input" placeholder="Wishlist name" />
                  <button id="wishlist-create-btn">Create and Add</button>
                </div>
                <button id="wishlist-modal-close">Cancel</button>
              </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        // Modal logic for collection icons
        document.querySelectorAll('.wishlist-icon').forEach(function(icon) {
          icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Get product ID from the card (same as add_to_wishlist)
            var card = icon.closest('.card, .product-card-wrapper, .card-wrapper');
          var addBtn = card ? card.querySelector('.wishlist-add-btn') : null;
          var customerId = addBtn && addBtn.dataset ? addBtn.dataset.customerId : null;
          if (!customerId) {
            // Try any .wishlist-add-btn on the page
            var anyAddBtn = document.querySelector('.wishlist-add-btn');
            if (anyAddBtn && anyAddBtn.dataset) {
              customerId = anyAddBtn.dataset.customerId;
            }
          }
          if (!customerId) {
            // Try .wishlist-collection-icon data-customer-id
            var collectionIcon = document.querySelector('.wishlist-collection-icon');
            if (collectionIcon && collectionIcon.dataset && collectionIcon.dataset.customerId) {
              customerId = collectionIcon.dataset.customerId;
            }
          }
          if (!customerId) {
            var customerDiv = document.getElementById('wishlist-cart-customer');
            customerId = customerDiv ? customerDiv.getAttribute('data-customer-id') : (window.wishlistCustomerId || '');
            if (customerId) {
            }
          }
          if (!customerId && window.ShopifyAnalytics && window.ShopifyAnalytics.meta && window.ShopifyAnalytics.meta.page && window.ShopifyAnalytics.meta.page.customerId) {
            customerId = window.ShopifyAnalytics.meta.page.customerId;
          }

          // Robust productId detection
          var productId = null;
          var hiddenId = card ? card.querySelector("input[name='product_id']") : null;
          var dataProductId = card && card.getAttribute('data-product-id');
          if (hiddenId && hiddenId.value) {
            productId = hiddenId.value;
          } else if (dataProductId) {
            // If it's a number, use as is.
            if (/^\d+$/.test(dataProductId)) {
              productId = dataProductId;
            } else {
              // Try to map using ShopifyAnalytics.meta.products
              if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && Array.isArray(window.ShopifyAnalytics.meta.products)) {
                // Try to match by GID
                var found = window.ShopifyAnalytics.meta.products.find(function(p) {
                  return p.gid && p.gid.endsWith('/' + dataProductId);
                });
                if (!found) {
                  // Try to match by variant name (if you can get it from the DOM)
                  var variantName = card && card.querySelector('.product-title') ? card.querySelector('.product-title').textContent.trim() : null;
                  if (variantName) {
                    found = window.ShopifyAnalytics.meta.products.find(function(p) {
                      return p.variants && p.variants.some(function(v) { return v.name === variantName; });
                    });
                  }
                }
                // Try to match by product title as a last resort
                if (!found) {
                  var productTitle = null;
                  var titleEl = card && (card.querySelector('.card__heading a') || card.querySelector('.card__heading.h5 a'));
                  if (titleEl) {
                    productTitle = titleEl.textContent.trim();
                    found = window.ShopifyAnalytics.meta.products.find(function(p) {
                      return p.variants && p.variants.some(function(v) { return v.name === productTitle; });
                    });
                    if (found && found.id) {
                      productId = found.id;
                  
                    }
                  }
                }
                if (found && found.id) {
                  productId = found.id;
                } else if (!productId) {
                  productId = dataProductId;
                  if (card) {
                  }
                }
              } else {
                productId = dataProductId;
                console.warn('[WISHLIST] Could not map to numeric ID, using handle:', productId);
                if (card) {
                  console.debug('[WISHLIST] Card HTML for debugging:', card.outerHTML);
                }
              }
            }
          } else {
            // Fallback: try to parse from product link (handle)
            var productLink = card ? card.querySelector("a[href*='/products/']") : null;
            if (productLink && productLink.href) {
              var match = productLink.href.match(/\/products\/(\w[\w\-]*)/);
              if (match) {
                var handle = match[1];
                // Try to map handle to numeric ID
                if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && Array.isArray(window.ShopifyAnalytics.meta.products)) {
                  var found = window.ShopifyAnalytics.meta.products.find(function(p) {
                    return p.handle === handle;
                  });
                  if (found && found.id) {
                    productId = found.id;
                
                  } else {
                    productId = handle;
                   
                  }
                } else {
                  productId = handle;
                 
                }
              }
            }
          }

            if (!productId) {
              alert('Could not determine product. Please check your collection template.');
              return;
            }
            if (!customerId) {
              alert('Please log in to use wishlists.');
              return;
            }
            // Show modal
            var modal = document.getElementById('wishlist-modal');
            var select = document.getElementById('wishlist-select');
            var addToSelectedBtn = document.getElementById('wishlist-add-to-selected-btn');
            var createBtn = document.getElementById('wishlist-create-btn');
            var titleInput = document.getElementById('wishlist-title-input');
            var closeBtn = document.getElementById('wishlist-modal-close');
            modal.style.display = 'flex';
            select.innerHTML = '<option>Loading...</option>';
            fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlists?customer_id=' + encodeURIComponent(customerId))
              .then(res => res.json())
              .then(data => {
                select.innerHTML = '';
                if (!Array.isArray(data) || data.length === 0) {
                  select.innerHTML = '<option disabled>No wishlists yet</option>';
                } else {
                  data.forEach(wl => {
                    const opt = document.createElement('option');
                    opt.value = wl.id;
                    opt.textContent = wl.title;
                    select.appendChild(opt);
                  });
                }
              });

            addToSelectedBtn.onclick = function() {
              const wishlistId = select.value;
              if (!wishlistId) {
                alert('Please select a wishlist.');
                return;
              }
              addToSelectedBtn.textContent = 'Adding...';
              addToSelectedBtn.disabled = true;
              fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-items', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId })
              })
              .then(res => res.json())
              .then(data => {
                if (data.status === 'true' && data.message && data.message.toLowerCase().includes('already')) {
                  alert('Product already in this wishlist.');
                } else {
                  alert('Added to wishlist!');
                }
                modal.style.display = 'none';
                addToSelectedBtn.textContent = 'Add to Selected';
                addToSelectedBtn.disabled = false;
              })
              .catch(() => {
                alert('Error adding to wishlist.');
                addToSelectedBtn.textContent = 'Add to Selected';
                addToSelectedBtn.disabled = false;
              });
            };

            createBtn.onclick = function() {
              const title = titleInput.value.trim();
              if (!title) {
                alert('Please enter a wishlist name.');
                return;
              }
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
                // Now add the product to the new wishlist
                fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-items', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ wishlist_id: data.id, product_id: productId })
                })
                .then(() => {
                  alert('Wishlist created and product added!');
                  modal.style.display = 'none';
                  titleInput.value = '';
                  createBtn.textContent = 'Create and Add';
                  createBtn.disabled = false;
                });
              })
              .catch((err) => {
                if (err && err.message && err.message.toLowerCase().includes('already exists')) {
                  alert('A wishlist with this title already exists.');
                } else {
                  alert('Error creating wishlist.');
                }
                createBtn.textContent = 'Create and Add';
                createBtn.disabled = false;
              });
            };

            closeBtn.onclick = function() {
              modal.style.display = 'none';
            };
          });
        });
      }
      // else: do not render icon
    })
    .catch(function() {
    // Fallback: do nothing. Do not reference 'metafields' here.
    });
});
