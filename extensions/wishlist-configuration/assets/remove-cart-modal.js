// Inject customer ID div if not present
(function() {
  if (!document.getElementById('wishlist-cart-customer')) {
    var customerId = window.wishlistCustomerId || '';
    var div = document.createElement('div');
    div.id = 'wishlist-cart-customer';
    div.setAttribute('data-customer-id', customerId);
    div.style.display = 'none';
    document.body.appendChild(div);
  }
})();

// Inject product ID divs into each <tr class="cart-item"> at runtime
(function() {
  // Use extension setting or fallback for cart item selector
  var cartItemSelector = (typeof window.wishlistCartItemSelector !== 'undefined' && window.wishlistCartItemSelector && window.wishlistCartItemSelector.trim() !== '') ? window.wishlistCartItemSelector : 'tr.cart-item, div.cart-item';
  document.querySelectorAll(cartItemSelector).forEach(function(row) {
    // Try to get product ID from a hidden div or data attribute in the cart item
    var productDiv = row.querySelector('.wishlist-cart-product');
    var productId = productDiv ? productDiv.getAttribute('data-product-id') : null;
    if (!productId) {
      productId = row.getAttribute('data-product-id');
    }
    // As a last resort, try to extract from the remove link's href (if format is known)
    if (!productId) {
      var removeBtn = row.querySelector('.cart-remove-btn, a[aria-label*="Remove"]');
      if (removeBtn && removeBtn.href) {
        var match = removeBtn.href.match(/id=(\d+):/);
        if (match) {
          productId = match[1];
        }
      }
    }
    // Only inject if we have a productId and not already present
    if (productId && !row.querySelector('.wishlist-cart-product')) {
      var div = document.createElement('div');
      div.className = 'wishlist-cart-product';
      div.setAttribute('data-product-id', productId);
      div.style.display = 'none';
      var lastCell = row.querySelector('td:last-child') || row;
      lastCell.appendChild(div);
    }
  });
})();

// Helper: closestOneOf for comma-separated selectors, supports attribute selectors
function closestOneOf(element, selectors) {
  for (const selector of selectors.split(',')) {
    const sel = selector.trim();
    // Only use closest for class/id/tag selectors
    if (/^[.#a-zA-Z0-9_-]+$/.test(sel)) {
      const found = element.closest(sel);
      if (found) return found;
    } else {
      // For attribute selectors, walk up manually
      let el = element;
      while (el && el !== document) {
        try {
          if (el.matches(sel)) return el;
        } catch (e) {}
        el = el.parentElement;
      }
    }
  }
  return null;
}

// Helper: unescapeSelector for HTML-escaped quotes
function unescapeSelector(selector) {
  return selector.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

(function() {
  if (window.location.pathname === '/cart' || window.location.pathname.startsWith('/cart')) {
    fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-metafields')
    .then(response => response.json())
    .then(function(response) {
      var metafields = {};
      var metafieldsEdges = response.metafields || [];
        metafieldsEdges.forEach(function(edge) {
          metafields[edge.node.key] = edge.node.value;
        });
        var allowModal = metafields['permission_to_save_items_cart_page'] === 'true';
        var showCheckbox = metafields['permission_cart_page'] === 'ask';
        if (!allowModal) return;
        if (!document.getElementById('removeModal')) {
          var modalTitle = metafields['pop_up_title_cart_page'] || '{{ block.settings.modal_title | escape }}';
          var primaryBtnText = metafields['primary_btn_text_cart_page'] || '{{ block.settings.primary_btn_text | escape }}';
          var secondaryBtnText = metafields['secondary_btn_text_cart_page'] || '{{ block.settings.secondary_btn_text | escape }}';
          var primaryColor = metafields['primary_color'] || '#111';
          var modal = document.createElement('div');
          modal.id = 'removeModal';
          modal.style = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4); z-index:9999; align-items:center; justify-content:center;';
          var modalHeight = showCheckbox ? '220px' : '10px';
          var marginBelowTitle = showCheckbox ? '10px' : '32px';
          var marginBelowCheckbox = showCheckbox ? '50px' : '0';
          modal.innerHTML = `
            <div style="background:#fff; border-radius:14px; box-shadow:0 4px 24px rgba(0,0,0,0.12); width:480px; min-width:320px; min-height:${modalHeight}; margin:auto; text-align:left; padding:28px 24px 20px 24px; font-family:inherit; direction:ltr; display:flex; flex-direction:column; justify-content:flex-start;">
              <div style="font-size:2.2rem; font-weight:700; margin-bottom:${marginBelowTitle}; direction:ltr;">${modalTitle}</div>
              ${showCheckbox ? `
                <label style="display:flex; align-items:center; gap:7px; font-size:1.8rem; margin-bottom:${marginBelowCheckbox}; cursor:pointer; direction:ltr; font-weight:400;">
                  <input type="checkbox" id="removeModalDontAsk" style="width:16px; height:16px; margin:0; direction:ltr;">
                  Don't ask me again
                </label>
              ` : ''}
              <div style="display:flex; gap:8px; direction:ltr;">
                <button id="closeRemoveModal" style="flex:1; border:2px solid #bbb; background:#fff; color:#222; font-weight:600; border-radius:8px; padding:12px 0; font-size:1.05rem; cursor:pointer; direction:ltr;">${secondaryBtnText}</button>
                <button id="saveForLaterModal" style="flex:1; background:${primaryColor}; color:#fff; font-weight:700; border:none; border-radius:8px; padding:12px 0; font-size:1.05rem; cursor:pointer; direction:ltr;">${primaryBtnText}</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          var pendingRemoveHref = null;
          var pendingRemoveForm = null;
          var pendingProductId = null;
          var pendingCustomerId = null;

          function showWishlistSelection(customerId, productId) {
            var modalContent = document.querySelector('#removeModal > div');
            modalContent.innerHTML = `
              <style>
                .wishlist-select-item { font-size: 1.3rem; transition: background 0.18s, color 0.18s; }
                .wishlist-select-item:hover { background: #f5f5f5; color: #111; }
                .wishlist-modal-close-x {
                  position: absolute;
                  top: 1px;
                  right: 10px;
                  font-size: 2rem;
                  color: #888;
                  cursor: pointer;
                  background: none;
                  border: none;
                  z-index: 10;
                  transition: color 0.18s;
                }
                .wishlist-modal-close-x:hover { color: #111; }
                .wishlist-modal-content-relative { position: relative; }
              </style>
              <div class="wishlist-modal-content-relative">
                <button class="wishlist-modal-close-x" aria-label="Close">&times;</button>
                <div style="text-align:center; font-size:2.2rem; margin-bottom:18px;">Select a wishlist to save this product:</div>
                <div id="wishlistList" style="margin-bottom:18px;"></div>
              </div>
            `;
            // Add close icon event
            var closeX = modalContent.querySelector('.wishlist-modal-close-x');
            if (closeX) {
              closeX.onclick = function() {
                document.getElementById('removeModal').style.display = 'none';
              };
            }
            // Fetch wishlists from backend (correct endpoint and method)
            fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlists?customer_id=' + encodeURIComponent(customerId))
              .then(res => res.json())
              .then(function(wishlists) {
                var listHtml = '';
                if (Array.isArray(wishlists) && wishlists.length > 0) {
                  wishlists.forEach(function(wl) {
                    listHtml += `<div class="wishlist-select-item" data-wishlist-id="${wl.id}" style="padding:12px 0; border-bottom:1px solid #eee; font-size:1.4rem; cursor:pointer;">${wl.title}</div>`;
                  });
                } else {
                  listHtml = '<div style="color:#888;">No wishlists found.</div>';
                }
                document.getElementById('wishlistList').innerHTML = listHtml;

                document.querySelectorAll('.wishlist-select-item').forEach(function(item) {
                  item.onclick = function() {
                    var wishlistId = this.getAttribute('data-wishlist-id');
                    fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-items', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        wishlist_id: wishlistId,
                        product_id: productId
                      })
                    })
                    .then(res => res.json())
                    .then(function(data) {
                      document.getElementById('removeModal').style.display = 'none';
                      if (pendingRemoveHref) {
                        window.location.href = pendingRemoveHref;
                      } else if (pendingRemoveForm) {
                        pendingRemoveForm.submit();
                      }
                      if (data && data.status === 'success') {
                        alert('Product added to wishlist successfully!');
                      }
                    });
                  };
                });
              });
          }

          // Helper to get product ID from remove button using /cart.js
          function getProductIdFromRemoveBtn(btn, callback) {
            var lineItemKey = null;
            if (btn && btn.href) {
              var match = btn.href.match(/id=([^&]+)/);
              if (match) {
                lineItemKey = match[1];
              }
            }
            if (!lineItemKey) {
              callback(null);
              return;
            }
            fetch('/cart.js')
              .then(res => res.json())
              .then(cart => {
                var item = cart.items.find(i => i.key === lineItemKey);
                callback(item ? item.product_id : null);
              });
          }

          // Use extension setting or fallback for remove button selector
          var rawRemoveBtnSelector = (typeof window.wishlistCartRemoveSelector !== 'undefined' && window.wishlistCartRemoveSelector && window.wishlistCartRemoveSelector.trim() !== '') ? window.wishlistCartRemoveSelector : '.cart-remove-btn, a[aria-label*="Remove"]';
          var removeBtnSelector = unescapeSelector(rawRemoveBtnSelector);

          document.body.addEventListener('click', function(e) {
            var btn = closestOneOf(e.target, removeBtnSelector);
            if (btn) {
              e.preventDefault();
              e.stopImmediatePropagation();
              pendingRemoveHref = btn.href;
              pendingRemoveForm = null;
              // Get product ID from cart.js using line item key
              getProductIdFromRemoveBtn(btn, function(productId) {
                pendingProductId = productId;
                // Set customer ID as before
                pendingCustomerId = btn.getAttribute('data-customer-id');
                if (!pendingCustomerId) {
                  var customerDiv = document.getElementById('wishlist-cart-customer');
                  if (customerDiv) {
                    pendingCustomerId = customerDiv.getAttribute('data-customer-id');
                  }
                }
                document.getElementById('removeModal').style.display = 'flex';
              });
            }
          }, true);

          document.body.addEventListener('submit', function(e) {
            var form = e.target;
            if (
              form.querySelector(removeBtnSelector.split(',')[0].trim()) ||
              (form.action && form.action.indexOf('quantity=0') !== -1)
            ) {
              e.preventDefault();
              e.stopImmediatePropagation();
              pendingRemoveHref = null;
              pendingRemoveForm = form;
              // Try to extract product/customer id from form if possible
              var btn = form.querySelector(removeBtnSelector.split(',')[0].trim()); // Use first selector for querySelector
              pendingProductId = btn ? btn.getAttribute('data-product-id') : null;
              if (!pendingProductId && btn) {
                var cartItem = btn.closest('.cart-item');
                var productDiv = cartItem ? cartItem.querySelector('.wishlist-cart-product') : null;
                pendingProductId = productDiv ? productDiv.getAttribute('data-product-id') : null;
              }
              pendingCustomerId = btn ? btn.getAttribute('data-customer-id') : null;
              if (!pendingCustomerId) {
                var customerDiv = document.getElementById('wishlist-cart-customer');
                if (customerDiv) {
                  pendingCustomerId = customerDiv.getAttribute('data-customer-id');
                }
              }
              document.getElementById('removeModal').style.display = 'flex';
            }
          }, true);

          function handleModalAction() {
            if (showCheckbox && document.getElementById('removeModalDontAsk') && document.getElementById('removeModalDontAsk').checked) {
              localStorage.setItem('hideRemoveModal', '1');
            }
            document.getElementById('removeModal').style.display = 'none';
            if (pendingRemoveHref) {
              window.location.href = pendingRemoveHref;
            } else if (pendingRemoveForm) {
              pendingRemoveForm.submit();
            }
          }

          document.getElementById('closeRemoveModal').onclick = handleModalAction;
          document.getElementById('saveForLaterModal').onclick = function() {
            // Show wishlist selection if we have both IDs
            if (pendingCustomerId && pendingProductId) {
              showWishlistSelection(pendingCustomerId, pendingProductId);
            } else {
              alert('Could not determine customer or product. Please check your cart template.');
            }
          };
        }
      });
  }
})();