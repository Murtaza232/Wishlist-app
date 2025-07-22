<!DOCTYPE html>
<html>
<head>
    <title>My Wishlist</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #fff;
            margin: 0;
            padding: 0;
        }

        .wishlist-title {
            font-size: 2rem; /* Increased font size */
            font-weight: bold;
            margin-bottom: 8px;
            text-align: left;
            direction: ltr;
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
            direction: ltr;
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
    </style>
</head>
<body>

<div id="wishlist-root">
    <!-- Embedded Modal-Like Section -->
    <div id="wishlistModal" class="wishlist-embedded-modal" style="display: none;">
        <button id="wishlistModalClose" class="btn-close-custom" aria-label="Close">×</button>
        <div class="wishlist-title" id="wishlistTitleModal"></div>
        <hr class="wishlist-divider" />
        <div class="wishlist-grid">
            @forelse ($products as $product)
                <div class="wishlist-card">
                    <img src="{{ $product['image']['src'] ?? ($product['images']['edges'][0]['node']['src'] ?? '') }}" alt="{{ $product['title'] ?? '' }}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:16px;">
                    <div style="font-weight:600;margin:12px 0 4px 0;">{{ $product['title'] ?? 'Product' }}</div>
                    <a class="wishlist-add-cart" href="/cart/add?id={{ $product['variants']['edges'][0]['node']['id'] ?? '' }}">+ Add to Cart</a>
                </div>
            @empty
                <div>No products in your wishlist.</div>
            @endforelse
        </div>
    </div>

    <!-- Drawer Section -->
    <div id="wishlistDrawer" class="wishlist-container" style="display: none;">
        <div class="wishlist-title" id="wishlistTitleDrawer"></div>
        <hr class="wishlist-divider" />
        <div class="wishlist-grid">
            @forelse ($products as $product)
                <div class="wishlist-card">
                    <img src="{{ $product['image']['src'] ?? ($product['images']['edges'][0]['node']['src'] ?? '') }}" alt="{{ $product['title'] ?? '' }}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:16px;">
                    <div style="font-weight:600;margin:12px 0 4px 0;">{{ $product['title'] ?? 'Product' }}</div>
                    <a class="wishlist-add-cart" href="/cart/add?id={{ $product['variants']['edges'][0]['node']['id'] ?? '' }}">+ Add to Cart</a>
                </div>
            @empty
                <div>No products in your wishlist.</div>
            @endforelse
        </div>
    </div>

    <!-- Full Page Section -->
    <div id="wishlistPage" class="wishlist-fullpage-container" style="display: none;">
        <div class="wishlist-title" id="wishlistTitlePage"></div>
        <hr class="wishlist-divider" />
        <div class="wishlist-grid">
            @forelse ($products as $product)
                <div class="wishlist-card">
                    <img src="{{ $product['image']['src'] ?? ($product['images']['edges'][0]['node']['src'] ?? '') }}" alt="{{ $product['title'] ?? '' }}" style="max-width:100%;max-height:120px;border-radius:8px;margin-top:16px;">
                    <div style="font-weight:600;margin:12px 0 4px 0;">{{ $product['title'] ?? 'Product' }}</div>
                    <a class="wishlist-add-cart" href="/cart/add?id={{ $product['variants']['edges'][0]['node']['id'] ?? '' }}">+ Add to Cart</a>
                </div>
            @empty
                <div>No products in your wishlist.</div>
            @endforelse
        </div>
    </div>

    <!-- Floating Button (for modal) -->
    <button id="showWishlistModalBtn" class="wishlist-floating-btn" style="display: none;">My Wishlist</button>
</div>

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
        .then(function(metafieldsEdges) {
            var metafields = {};
            metafieldsEdges.forEach(function(edge) {
                metafields[edge.node.key] = edge.node.value;
            });

            var appearance = metafields['wishlist_page_appearance'] || 'separate_page';
            var title = metafields['wishlist_page_title'] || 'My Wishlist';
            var primaryColor = metafields['primary_color'] || '#111';
            // Set titles and color for all layouts
            var titleModalEl = document.getElementById('wishlistTitleModal');
            if (titleModalEl) {
                titleModalEl.textContent = title;
                titleModalEl.style.color = primaryColor;
            }

            var titleDrawerEl = document.getElementById('wishlistTitleDrawer');
            if (titleDrawerEl) {
                titleDrawerEl.textContent = title;
                titleDrawerEl.style.color = primaryColor;
            }

            var titlePageEl = document.getElementById('wishlistTitlePage');
            if (titlePageEl) {
                titlePageEl.textContent = title;
                titlePageEl.style.color = primaryColor;
            }

            // Hide all layouts first to handle the switch
            modal.style.display = 'none';
            drawer.style.display = 'none';
            page.style.display = 'none';

            // Show the correct layout
            if (appearance === 'side_drawer') {
                drawer.style.display = 'block';
            } else if (appearance === 'pop_up_modal') {
                modal.style.display = 'block';
            } else { // separate_page or default
                page.style.display = 'block';
            }
        })
        .catch(function(error) {
            console.error("Error fetching wishlist settings:", error);
            // If API fails, show the default 'page' layout as a fallback.
            page.style.display = 'block';
        });

    // Close button functionality for the modal
    document.getElementById('wishlistModalClose').addEventListener('click', function() {
        modal.style.display = 'none';
        // Show the show-modal button with the correct title
        var showBtn = document.getElementById('showWishlistModalBtn');
        var title = document.getElementById('wishlistTitleModal').textContent || 'My Wishlist';
        showBtn.textContent = title;
        showBtn.style.display = 'block';
    });
    // Show modal again when show-modal button is clicked
    document.getElementById('showWishlistModalBtn').addEventListener('click', function() {
        modal.style.display = 'block';
        this.style.display = 'none';
    });
});
</script></body>
</html>
