<!DOCTYPE html>
<html>
<head>
    <title>My Wishlist</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            
            background: #fff;
            margin: 0;
            padding: 0;
        }

        .wishlist-title {
            font-size: 2rem; /* Increased font size */
            font-weight: bold;
            margin-bottom: 8px;
            text-align: left;
           
        }

        .wishlist-divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin-bottom: 24px;
        }

        .wishlist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 32px 24px;
      
            justify-content: start;
        }

        .wishlist-card {
            background: #ededed;
            border-radius: 12px;
            min-height: 260px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            position: relative;
        }

        .wishlist-add-cart {
            color: #222;
            font-size: 1rem;
            font-weight: 500;
            margin: 18px 0 12px 0;
            text-align: center;
            cursor: pointer;
            text-decoration: none;
            display: block;
        }

        .wishlist-container,
        .wishlist-embedded-modal,
        .wishlist-fullpage-container {
            max-width: 1100px;
            margin: 40px auto;
            padding: 24px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 12px;
        }

        @media (max-width: 700px) {
            .wishlist-grid {
                gap: 16px 8px;
            }

            .wishlist-container,
            .wishlist-embedded-modal,
            .wishlist-fullpage-container {
                padding: 12px;
                margin: 20px;
            }
        }

        .btn-close-custom {
            float: right;
            font-size: 1.2rem;
            font-weight: bold;
            background: none;
            border: none;
            cursor: pointer;
        }

        .wishlist-floating-btn {
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 1000;
            padding: 14px 28px;
            background: #111;
            color: #fff;
            font-size: 1.1rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        /* Make cards smaller in the side drawer layout */
        .wishlist-drawer-main {
      width: 400px;
      background: #fff;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 12px;
      margin-right: 20px;

    /* REMOVE these: */
    /* position: fixed; */
    /* top: 0; */
    /* height: 100vh; */
    /* z-index: 1000; */
    /* overflow-y: auto; */

    /* ADD these instead: */
    position: relative;
    height: auto;
    max-height: 100%;
    overflow-y: auto;
    }
        .wishlist-drawer-title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }
        .wishlist-drawer-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px 12px;
            justify-items: center;
        }
        .wishlist-drawer-card {
            background: #ededed;
            border-radius: 12px;
            min-width: 0;
            max-width: 220px;
            min-height: 240px;
            padding: 16px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            position: relative;
        }
        .wishlist-drawer-add-cart {
            color: #222;
            font-size: 0.95rem;
            font-weight: 500;
            margin: 10px 0 8px 0;
            text-align: center;
            cursor: pointer;
            text-decoration: none;
            display: block;
        }
        .wishlist-grid.empty,
        .wishlist-drawer-grid.empty {
            display: flex !important;
            align-items: center;
            justify-content: center;
            min-height: 220px;
            width: 100%;
        }
        .wishlist-empty-message {
            font-size: 2rem;
            font-weight: 700;
            color: #222;
            text-align: center;
            width: 100%;
        }
        .drawer-left {
            float: left !important;
            margin-right: 20px !important;
}
        .drawer-right {
            float: right !important;
            margin-left: 20px !important;
        }
    </style>
</head>
<body>
    {{-- <pre>{{ print_r($products, true) }}</pre> --}}
<div id="wishlist-root">
    <!-- Embedded Modal-Like Section -->
    <div id="wishlistModal" class="wishlist-embedded-modal" style="display: none;">
        <button id="wishlistModalClose" class="btn-close-custom" aria-label="Close">×</button>
        <div class="wishlist-title" id="wishlistTitleModal" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <span id="wishlistTitleModalText"></span>
          <span id="wishlistShareBtnModal" style="display:none; align-items: center; gap: 6px; cursor: pointer;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #f5f5f5;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
            <span style="font-weight: 500; color: #222;">Share</span>
          </span>
        </div>
        <hr class="wishlist-divider" />
        <div class="wishlist-grid @if($products == null || count($products) == 0) empty @endif">
            @forelse ($products as $product)
                @php
                    $variantGid = $product['variants']['edges'][0]['node']['id'] ?? '';
                    preg_match('/(\\d+)$/', $variantGid, $matches);
                    $variantId = $matches[1] ?? '';
                    $productGid = $product['id'] ?? '';
                    preg_match('/(\\d+)$/', $productGid, $prodMatches);
                    $productId = $prodMatches[1] ?? '';
                @endphp
                <div class="wishlist-card">
                    <img src="{{ $product['image']['src'] ?? ($product['images']['edges'][0]['node']['src'] ?? '') }}" alt="{{ $product['title'] ?? '' }}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:16px;">
                    <div style="font-weight:600;margin:12px 0 4px 0;">{{ $product['title'] ?? 'Product' }}</div>
                    <a class="wishlist-add-cart" href="/cart/add?id={{ $variantId }}" data-variant-id="{{ $variantId }}" data-product-id="{{ $productId }}" data-wishlist-id="{{ $wishlistId ?? '' }}" data-customer-id="{{ $customerId ?? '' }}">+ Add to Cart</a>
                </div>
            @empty
                <div class="wishlist-empty-message">No products in your wishlist.</div>
            @endforelse
        </div>
    </div>

    <!-- Drawer Section -->
    <div id="wishlistDrawer" class="wishlist-drawer-main" style="display: none;">
        <div class="wishlist-drawer-title-row" id="wishlistTitleDrawer">
          <span id="wishlistTitleDrawerText"></span>
          <span id="wishlistShareBtnDrawer" style="display:none; align-items: center; gap: 6px; cursor: pointer;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #f5f5f5;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
            <span style="font-weight: 500; color: #222;">Share</span>
          </span>
        </div>
        <hr class="wishlist-divider" />
        <div class="wishlist-drawer-grid @if($products == null || count($products) == 0) empty @endif">
            @forelse ($products as $product)
                @php
                    $variantGid = $product['variants']['edges'][0]['node']['id'] ?? '';
                    preg_match('/(\\d+)$/', $variantGid, $matches);
                    $variantId = $matches[1] ?? '';
                    $productGid = $product['id'] ?? '';
                    preg_match('/(\\d+)$/', $productGid, $prodMatches);
                    $productId = $prodMatches[1] ?? '';
                @endphp
                <div class="wishlist-drawer-card">
                    <img src="{{ $product['image']['src'] ?? ($product['images']['edges'][0]['node']['src'] ?? '') }}" alt="{{ $product['title'] ?? '' }}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:16px;">
                    <div style="font-weight:600;margin:12px 0 4px 0;">{{ $product['title'] ?? 'Product' }}</div>
                    <a class="wishlist-drawer-add-cart" href="/cart/add?id={{ $variantId }}" data-variant-id="{{ $variantId }}" data-product-id="{{ $productId }}" data-wishlist-id="{{ $wishlistId ?? '' }}" data-customer-id="{{ $customerId ?? '' }}">+ Add to Cart</a>
                </div>
            @empty
                <div class="wishlist-empty-message">No products in your wishlist.</div>
            @endforelse
        </div>
    </div>

    <!-- Full Page Section -->
    <div id="wishlistPage" class="wishlist-fullpage-container" style="display: none;">
        <div class="wishlist-title" id="wishlistTitlePage" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <span id="wishlistTitlePageText"></span>
          <span id="wishlistShareBtnPage" style="display:none; align-items: center; gap: 6px; cursor: pointer;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #f5f5f5;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
            <span style="font-weight: 500; color: #222;">Share</span>
          </span>
        </div>
        <hr class="wishlist-divider" />
        <div class="wishlist-grid @if($products == null || count($products) == 0) empty @endif">
            @forelse ($products as $product)
                @php
                    $variantGid = $product['variants']['edges'][0]['node']['id'] ?? '';
                    preg_match('/(\\d+)$/', $variantGid, $matches);
                    $variantId = $matches[1] ?? '';
                    $productGid = $product['id'] ?? '';
                    preg_match('/(\\d+)$/', $productGid, $prodMatches);
                    $productId = $prodMatches[1] ?? '';
                @endphp
                <div class="wishlist-card">
                    <img src="{{ $product['image']['src'] ?? ($product['images']['edges'][0]['node']['src'] ?? '') }}" alt="{{ $product['title'] ?? '' }}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:16px;">
                    <div style="font-weight:600;margin:12px 0 4px 0;">{{ $product['title'] ?? 'Product' }}</div>
                    <a class="wishlist-add-cart" href="/cart/add?id={{ $variantId }}" data-variant-id="{{ $variantId }}" data-product-id="{{ $productId }}" data-wishlist-id="{{ $wishlistId ?? '' }}" data-customer-id="{{ $customerId ?? '' }}">+ Add to Cart</a>
                </div>
            @empty
                <div class="wishlist-empty-message">No products in your wishlist.</div>
            @endforelse
        </div>
    </div>

    <!-- Floating Button (for modal) -->
    <button id="showWishlistModalBtn" class="wishlist-floating-btn" style="display: none;">My Wishlist</button>
</div>

<script>
// Injected from backend
window.customerId = @json($customerId ?? '');
window.wishlistId = @json($wishlistId ?? '');
window.shopDomain = @json(request()->get('shop') ?? (isset($shopData['shop']) ? $shopData['shop'] : ''));
</script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get layout elements
    var modal = document.getElementById('wishlistModal');
    var drawer = document.getElementById('wishlistDrawer');
    var page = document.getElementById('wishlistPage');

    // Hide ALL layouts initially to prevent the flash of static content
    modal.style.display = 'none';
    drawer.style.display = 'none';
    page.style.display = 'none'; // This line prevents the default page from showing

    fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-metafields')
    .then(response => response.json())
    .then(function(response) {
      var metafields = {};
      var metafieldsEdges = response.metafields || [];
            metafieldsEdges.forEach(function(edge) {
                metafields[edge.node.key] = edge.node.value;
            });

            // Debug: Log the metafields
          

            var appearance = metafields['wishlist_page_appearance'] || 'separate_page';
            var drawerAppearance = metafields['wishlist_drawer_appearance'] || 'left';
            var title = metafields['wishlist_page_title'] || 'My Wishlist';
            var primaryColor = metafields['primary_color'] || '#111';
            var textColor = metafields['text_color'] || '#222';
            
            // Set titles and color for all layouts
            var titleModalEl = document.getElementById('wishlistTitleModalText');
            if (titleModalEl) {
                titleModalEl.textContent = title;
                titleModalEl.style.color = textColor;
            }

            var titleDrawerEl = document.getElementById('wishlistTitleDrawerText');
            if (titleDrawerEl) {
                titleDrawerEl.textContent = title;
                titleDrawerEl.style.color = textColor;
            }

            var titlePageEl = document.getElementById('wishlistTitlePageText');
            if (titlePageEl) {
                titlePageEl.textContent = title;
                titlePageEl.style.color = textColor;
            }

            // Set add to cart button color for all layouts
            document.querySelectorAll('.wishlist-add-cart, .wishlist-drawer-add-cart').forEach(function(btn) {
                btn.style.color = textColor;
            });

            // Show share button if metafield is true
            var showShare = metafields['other_settings_wishlist_page'] === 'true';
            if (showShare) {
                var shareBtnModal = document.getElementById('wishlistShareBtnModal');
                if (shareBtnModal) shareBtnModal.style.display = 'inline-flex';
                var shareBtnDrawer = document.getElementById('wishlistShareBtnDrawer');
                if (shareBtnDrawer) shareBtnDrawer.style.display = 'inline-flex';
                var shareBtnPage = document.getElementById('wishlistShareBtnPage');
                if (shareBtnPage) shareBtnPage.style.display = 'inline-flex';
            }

            // Hide all layouts first to handle the switch
            modal.style.display = 'none';
            drawer.style.display = 'none';
            page.style.display = 'none';

            // Show the correct layout
            if (appearance === 'side_drawer') {
                // Use the drawer appearance setting from metafields
             
                drawer.classList.remove('drawer-left', 'drawer-right');
                drawer.classList.add('drawer-' + drawerAppearance);
                drawer.style.display = 'block';
            } else if (appearance === 'pop_up_modal') {
                modal.style.display = 'block';
            } else { // separate_page or default
                page.style.display = 'block';
            }

            // Set share text color for all layouts
            var shareBtnModal = document.getElementById('wishlistShareBtnModal');
            if (shareBtnModal) {
                var shareText = shareBtnModal.querySelector('span[style*="font-weight: 500"]');
                if (shareText) shareText.style.color = textColor;
            }
            var shareBtnDrawer = document.getElementById('wishlistShareBtnDrawer');
            if (shareBtnDrawer) {
                var shareText = shareBtnDrawer.querySelector('span[style*="font-weight: 500"]');
                if (shareText) shareText.style.color = textColor;
            }
            var shareBtnPage = document.getElementById('wishlistShareBtnPage');
            if (shareBtnPage) {
                var shareText = shareBtnPage.querySelector('span[style*="font-weight: 500"]');
                if (shareText) shareText.style.color = textColor;
            }
        })
        .catch(function(error) {
            page.style.display = 'block';
        });

    // Close button functionality for the modal
    var closeBtn = document.getElementById('wishlistModalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            // Show the show-modal button with the correct title
            var showBtn = document.getElementById('showWishlistModalBtn');
            var title = document.getElementById('wishlistTitleModal').textContent || 'My Wishlist';
            showBtn.textContent = title;
            showBtn.style.display = 'block';
        });
    }
    // Show modal again when show-modal button is clicked
    var showModalBtn = document.getElementById('showWishlistModalBtn');
    if (showModalBtn) {
        showModalBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            this.style.display = 'none';
        });
    }

    // Add to Cart + Remove from Wishlist logic
    function handleAddToCartClick(e) {
        var btn = e.target.closest('.wishlist-add-cart, .wishlist-drawer-add-cart');
        if (!btn) return;
        e.preventDefault();
        var variantId = btn.getAttribute('data-variant-id');
        var productId = btn.getAttribute('data-product-id');
        var wishlistId = btn.getAttribute('data-wishlist-id');
        var customerId = btn.getAttribute('data-customer-id');
        if (!variantId || !wishlistId || !customerId || !productId) {
            alert('Missing data to remove from wishlist.');
            return;
        }
        // Add to Shopify cart
        fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity: 1 })
        })
        .then(function(res) {
            if (!res.ok) throw new Error('Failed to add to cart');
            return res.json();
        })
        .then(function() {
            // Remove from wishlist
            fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist-items-delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wishlist_id: wishlistId, customer_id: customerId, product_id: productId })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.status === 'success') {
                    // Remove the card from the DOM
                    var card = btn.closest('.wishlist-card, .wishlist-drawer-card');
                    if (card) card.remove();
                    alert('Added to cart and removed from wishlist!');
                } else {
                    alert('Added to cart, but failed to remove from wishlist.');
                }
            });
        })
        .catch(function() {
            alert('Failed to add to cart.');
        });
    }
    document.body.addEventListener('click', handleAddToCartClick);
});

// Add shareWishlist function
document.addEventListener('click', function(e) {
    if (e.target.closest('#wishlistShareBtnModal, #wishlistShareBtnDrawer, #wishlistShareBtnPage')) {
        shareWishlist();
    }
});
function shareWishlist() {
    const url = window.location.href;
    const customerId = window.customerId;
    const wishlistId = window.wishlistId;
    const shop = window.shopDomain;

    // 1. Trigger the backend email
    if (customerId && wishlistId && shop) {
        fetch('https://phpstack-362288-5709690.cloudwaysapps.com/api/wishlist/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: customerId,
                wishlist_id: wishlistId,
                shop: shop
            })
        })
        .then(res => res.json())
        .then(data => {
            // Optionally show a message to the user
            if (data.status) {
                console.log('Wishlist shared email sent!');
            } else {
                console.log('Failed to send wishlist shared email.');
            }
        });
    }

    // 2. Continue with the original share logic
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Wishlist link copied to clipboard!');
    }
}
</script>
</body>
</html>