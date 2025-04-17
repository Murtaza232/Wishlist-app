<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f7f8fa;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 650px;
            margin: 30px auto;
            background: #fff;
            padding: 35px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 20px;
        }
        .logo img {
            width: 140px;
            margin-bottom: 10px;
        }
        h2 {
            color: #2c3e50;
            font-size: 24px;
            margin-top: 0;
            font-weight: 600;
        }
        .content {
            padding: 20px 0;
        }
        .product-list {
            margin-top: 20px;
        }
        .product-item {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #eee;
            padding: 15px 0;
        }
        .product-item img {
            width: 100px;
            border-radius: 6px;
            margin-right: 20px;
            transition: 0.3s ease;
        }
        .product-item img:hover {
            opacity: 0.9;
        }
        .product-details {
            flex: 1;
        }
        .product-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 5px;
            color: #1a1a1a;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            font-size: 13px;
            color: #888;
            border-top: 1px solid #eaeaea;
            text-align: center;
        }
        a {
            color: #1a73e8;
            text-decoration: none;
        }
    </style>
</head>
<body>
<div class="email-container">
    <!-- Header -->
    <div class="header">
        <div class="logo">
            <img src="{{ asset('logo.png') }}" alt="Company Logo">
        </div>
        <h2>Order Confirmation</h2>
    </div>

    <!-- Content -->
    <div class="content">
        <p>Hi <strong>{{ $details['customer_name'] }}</strong>,</p>
        <p>Thanks for your order <strong>{{ $details['order_number'] }}</strong>. We're preparing your digital image(s) now. Below is a preview of your purchased item(s):</p>

        <!-- Product List -->
        <div class="product-list">
            @if (!empty($details['imageUrls']))
                @foreach ($details['imageUrls'] as $image)
                    <div class="product-item">
                        <a href="{{ $image['url'] }}" target="_blank">
                            <img src="{{ $image['src'] }}" alt="{{ $image['title'] }}">
                        </a>
                        <div class="product-details">
                            <div class="product-title">{{ $image['title'] }}</div>
                            <div><a href="{{ $image['url'] }}" target="_blank">View Full Image</a></div>
                        </div>
                    </div>
                @endforeach
            @endif
        </div>

        <p>If you have any questions about your order, feel free to contact our support team.</p>
        <p>Thanks again for choosing us!</p>
    </div>

    <!-- Footer -->
    <div class="footer">
        &copy; {{ date('Y') }} ArtTransformers. All rights reserved.
    </div>
</div>
</body>
</html>
