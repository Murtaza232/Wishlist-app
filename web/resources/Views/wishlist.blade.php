<!DOCTYPE html>
<html>
<head>
    <title>My Wishlist</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #fff;
            margin: 0;
            padding: 0;
        }
        .wishlist-title {
            font-size: 1.6rem;
            font-weight: bold;
            margin-bottom: 8px;
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
        .wishlist-floating-btn {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 48px;
            height: 48px;
            background: #111;
            border: none;
            border-radius: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            cursor: pointer;
        }
        .wishlist-floating-btn svg {
            width: 32px;
            height: 32px;
            fill: #fff;
            stroke: #fff;
        }
        .wishlist-container { /* Drawer styles */
            max-width: 700px;
            margin: 40px 0 40px 40px;
            padding: 24px;
            border: 1px solid #ddd;
            background: #fff;
        }
        .wishlist-fullpage-container { /* Page styles */
            max-width: 1100px;
            margin: 40px 0 40px 40px;
            padding: 24px;
        }
        @media (max-width: 700px) {
            .wishlist-container, .wishlist-fullpage-container {
                padding: 8px;
                margin-left: 0;
            }
            .wishlist-grid {
                gap: 16px 8px;
            }
        }
    </style>
</head>
<body>

<div id="wishlist-root">
    <!-- Bootstrap Modal (hidden by default) -->
    <div id="wishlistModal" class="modal" tabindex="-1" style="display: none; background: rgba(0,0,0,0.12);">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content" style="border-radius: 18px;">
          <div class="modal-header" style="border-bottom: none;">
            <h5 class="modal-title wishlist-title" id="wishlistTitleModal"></h5>
            <button id="wishlistModalClose" type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <hr class="wishlist-divider" />
          <div class="modal-body">
            <div style="position: relative;">
                <div class="wishlist-grid" style="margin-left: 64px;">
                    @for ($i = 0; $i < 8; $i++)
                        <div class="wishlist-card"><a class="wishlist-add-cart">+ Add to Cart</a></div>
                    @endfor
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer (hidden by default) -->
    <div id="wishlistDrawer" class="wishlist-container" style="display: none;">
        <div class="wishlist-title" id="wishlistTitleDrawer"></div>
        <hr class="wishlist-divider" />
        <div style="position: relative;">
            <div class="wishlist-grid" style="margin-left: 64px;">
                @for ($i = 0; $i < 4; $i++)
                    <div class="wishlist-card"><a class="wishlist-add-cart">+ Add to Cart</a></div>
                @endfor
            </div>
        </div>
    </div>

    <!-- Separate Page (visible by default) -->
    <div id="wishlistPage" class="wishlist-fullpage-container">
        <div class="wishlist-title" id="wishlistTitlePage"></div>
        <hr class="wishlist-divider" />
        <div class="wishlist-grid">
            @for ($i = 0; $i < 8; $i++)
                <div class="wishlist-card"><a class="wishlist-add-cart">+ Add to Cart</a></div>
            @endfor
        </div>
    </div>
    <button id="showWishlistModalBtn" style="display:none;position:fixed;bottom:32px;right:32px;z-index:10001;padding:14px 28px;background:#111;color:#fff;font-size:1.1rem;font-weight:600;border:none;border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);">My Wishlist</button>
</div>

<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get layout elements
    var modal = document.getElementById('wishlistModal');
    var drawer = document.getElementById('wishlistDrawer');
    var page = document.getElementById('wishlistPage');
    
    // Hide all except the default 'page' layout to prevent flash of content
    modal.style.display = 'none';
    drawer.style.display = 'none';

    fetch('/api/wishlist-metafields')
      .then(response => response.json())
      .then(function(metafieldsEdges) {
        var metafields = {};
        metafieldsEdges.forEach(function(edge) {
          metafields[edge.node.key] = edge.node.value;
        });

        var appearance = metafields['wishlist_page_appearance'] || 'separate_page';
        var title = metafields['wishlist_page_title'] || 'My Wishlist';

        // Set titles
        document.getElementById('wishlistTitleModal').textContent = title;
        document.getElementById('wishlistTitleDrawer').textContent = title;
        document.getElementById('wishlistTitlePage').textContent = title;

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
          // If API fails, the default 'page' layout remains visible.
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
</script>
</body>
</html>