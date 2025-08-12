<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $processedTemplate['emailSubject'] ?? 'Price Drop Alert' }}</title>
    <style>
        body {
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #{{ ltrim($processedTemplate['textDescriptionBackgroundColor'] ?? 'ffffff', '#') }};
        }
        .header {
            background-color: #{{ ltrim($processedTemplate['brandingBackgroundColor'] ?? '000000', '#') }};
            color: #{{ ltrim($processedTemplate['textColor'] ?? 'ffffff', '#') }};
            padding: {{ $processedTemplate['paddingTop'] ?? '20' }}px {{ $processedTemplate['paddingBottom'] ?? '20' }}px;
            text-align: center;
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .content {
            padding: 20px;
        }
        .description {
            color: #{{ ltrim($processedTemplate['statusDescriptionTextColor'] ?? '000000', '#') }};
            line-height: 1.6;
            margin-bottom: 20px;
            text-align: {{ strtolower($processedTemplate['textDescriptionAlignment'] ?? 'left') }};
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .product-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #{{ ltrim($processedTemplate['lineItemBackgroundColor'] ?? 'ffffff', '#') }};
        }
        .product-title {
            font-size: {{ $processedTemplate['lineItemTitleFontSize'] ?? '16' }}px;
            font-weight: bold;
            color: #{{ ltrim($processedTemplate['lineItemTitleColor'] ?? '000000', '#') }};
            margin-bottom: 10px;
        }
        .product-price {
            font-size: {{ $processedTemplate['lineItemProductFontSize'] ?? '14' }}px;
            color: #{{ ltrim($processedTemplate['lineItemItemTextColor'] ?? '000000', '#') }};
            margin-bottom: 5px;
        }
        .price-drop {
            color: #28a745;
            font-weight: bold;
        }
        .old-price {
            text-decoration: line-through;
            color: #6c757d;
        }
        .new-price {
            color: #28a745;
            font-weight: bold;
        }
        .action-button {
            display: inline-block;
            background-color: #{{ ltrim($processedTemplate['trackingButtonButtonColor'] ?? '000000', '#') }};
            color: #{{ ltrim($processedTemplate['trackingButtonTextColor'] ?? 'ffffff', '#') }} !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-size: {{ $processedTemplate['trackingButtonFontSize'] ?? '14' }}px;
            margin: 20px 0;
            text-align: center;
            width: {{ $processedTemplate['trackingButtonButtonWidth'] ?? '50' }}%;
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .footer {
            background-color: #{{ ltrim($processedTemplate['footerBackgroundColor'] ?? 'ffffff', '#') }};
            color: #{{ ltrim($processedTemplate['footerTextColor'] ?? '000000', '#') }};
            padding: 20px;
            text-align: {{ strtolower($processedTemplate['footerDetailsAlignment'] ?? 'center') }};
            font-size: 12px;
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .unsubscribe {
            color: #{{ ltrim($processedTemplate['footerUnsubscribeButtonColor'] ?? '005BD3', '#') }};
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .action-button {
                width: 100% !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        @php
            $showStoreName = isset($processedTemplate['brandingType']) && (
                (is_array($processedTemplate['brandingType']) && in_array('Store name', $processedTemplate['brandingType'])) ||
                ($processedTemplate['brandingType'] === 'Store name')
            );
            $showImage = isset($processedTemplate['brandingType']) && (
                (is_array($processedTemplate['brandingType']) && in_array('Image', $processedTemplate['brandingType'])) ||
                ($processedTemplate['brandingType'] === 'Image')
            );
        @endphp
        <div class="header">
            @if($showImage && !empty($processedTemplate['logoUrl']))
                <img src="{{ $processedTemplate['logoUrl'] }}" alt="{{ $shopData['name'] ?? $shopData['shop'] ?? 'Logo' }}" style="display:block;margin:0 auto;max-width:100%;width: {{ $processedTemplate['imageWidth'] ?? '100' }}%;height:auto;" />
            @else
                <h1>{{ $shopData['name'] ?? $shopData['shop'] ?? 'Our Store' }}</h1>
            @endif
        </div>
        
        <div class="content">
            <div class="description">
                {!! $processedTemplate['textDescriptionDetails'] ?? '<p>Hi {{ $customerData["first_name"] }},</p><p>Great news! Some items in your wishlist have dropped in price!</p>' !!}
            </div>
            
            @if(count($priceDropItems) > 0)
                <h2>Price Drop Items:</h2>
                @foreach($priceDropItems as $item)
                    <div class="product-item">
                        <div class="product-title">{{ $item->title }}</div>
                        <div class="product-price">
                            <span class="old-price">${{ number_format($item->old_price, 2) }}</span>
                            <span class="new-price"> → ${{ number_format($item->price, 2) }}</span>
                        </div>
                        @php
                            $priceDrop = $item->old_price - $item->price;
                            $priceDropPercentage = round(($priceDrop / $item->old_price) * 100, 1);
                        @endphp
                        <div class="price-drop">You save ${{ number_format($priceDrop, 2) }} ({{ $priceDropPercentage }}% off!)</div>
                    </div>
                @endforeach
            @endif
            
            @if(isset($processedTemplate['trackingButtonButtonText']) && isset($processedTemplate['trackingButtonLink']))
                <div style="text-align: {{ strtolower($processedTemplate['trackingButtonAlignment'] ?? 'center') }};">
                    <a href="{{ $wishlistData['link'] }}" class="action-button">
                        {{ $processedTemplate['trackingButtonButtonText'] }}
                    </a>
                </div>
            @endif
        </div>
        
        <div class="footer">
            @if(isset($processedTemplate['footerDetails']))
                {!! $processedTemplate['footerDetails'] !!}
            @else
                <p>Happy shopping!<br>{{ $shopData['name'] ?? $shopData['shop'] ?? 'Shop' }}</p>
            @endif
            
            @if(isset($processedTemplate['footerUnsubscribeButton']) && $processedTemplate['footerUnsubscribeButton'] == '1')
                <p><a href="#" class="unsubscribe">{{ $processedTemplate['footerUnsubscribe'] ?? 'Unsubscribe' }}</a></p>
            @endif
        </div>
    </div>
</body>
</html> 