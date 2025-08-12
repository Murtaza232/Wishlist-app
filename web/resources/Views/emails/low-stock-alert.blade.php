<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $processedTemplate['emailSubject'] ?? 'Low Stock Alert - ' . ($shopData['name'] ?? 'Our Store') }}</title>
    <style>
        body {
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
            line-height: 1.6;
            color: #{{ $processedTemplate['themeSettingPrimaryTextColor'] ?? '333' }};
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #{{ $processedTemplate['textDescriptionBackgroundColor'] ?? 'ffffff' }};
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #{{ $processedTemplate['brandingBackgroundColor'] ?? '000000' }};
            color: #{{ $processedTemplate['textColor'] ?? 'ffffff' }};
            padding: {{ $processedTemplate['paddingTop'] ?? '35' }}px 20px {{ $processedTemplate['paddingBottom'] ?? '35' }}px 20px;
            text-align: center;
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #{{ $processedTemplate['textColor'] ?? 'ffffff' }};
        }
        .content {
            padding: 30px 20px;
            background-color: #{{ $processedTemplate['textDescriptionBackgroundColor'] ?? 'ffffff' }};
        }
        .alert-text {
            font-size: 16px;
            margin-bottom: 20px;
            color: #{{ $processedTemplate['textDescriptionTextColor'] ?? '000000' }};
            text-align: {{ strtolower($processedTemplate['textDescriptionAlignment'] ?? 'left') }};
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .product-list {
            margin: 20px 0;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
        }
        .product-item {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #ffffff;
            border-radius: 3px;
        }
        .product-title {
            font-weight: bold;
            color: #d63031;
        }
        .product-stock {
            color: #e17055;
            font-size: 14px;
        }
        .action-button {
            display: inline-block;
            background-color: #{{ $processedTemplate['trackingButtonButtonColor'] ?? '000000' }};
            color: #{{ $processedTemplate['trackingButtonTextColor'] ?? 'ffffff' }} !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-size: {{ $processedTemplate['trackingButtonFontSize'] ?? '14' }}px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            width: {{ $processedTemplate['trackingButtonButtonWidth'] ?? '50' }}%;
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .footer {
            background-color: #{{ $processedTemplate['footerBackgroundColor'] ?? 'ffffff' }};
            color: #{{ $processedTemplate['footerTextColor'] ?? '000000' }};
            padding: 20px;
            text-align: {{ strtolower($processedTemplate['footerDetailsAlignment'] ?? 'center') }};
            font-size: 14px;
            font-family: {{ $processedTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            color: #{{ $processedTemplate['footerUnsubscribeButtonColor'] ?? '005BD3' }};
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
        @if($showStoreName || $showImage)
        <div class="header">
            @if($showImage && !empty($processedTemplate['logoUrl']))
                <img src="{{ $processedTemplate['logoUrl'] }}" alt="{{ $shopData['name'] ?? $shopData['shop'] ?? 'Logo' }}" style="display:block;margin:0 auto;max-width:100%;width: {{ $processedTemplate['imageWidth'] ?? '100' }}%;height:auto;" />
            @else
                <h1>{{ $shopData['name'] ?? $shopData['shop'] ?? 'Our Store' }}</h1>
            @endif
        </div>
        @endif
        
        <div class="content">
            <div class="alert-text">

                 {!! is_string($processedTemplate['textDescriptionDetails'] ?? '') ? $processedTemplate['textDescriptionDetails'] : '' !!}
            </div>
            
             @if(count($lowStockItems) > 0)
            <div class="product-list">
                <h3>Low Stock Items in Your Wishlist:</h3>
                @foreach($lowStockItems as $product)
                <div class="product-item">
                    <div class="product-title">{{ $product->title ?? 'Product' }}</div>
                    <div class="product-stock">Current Stock: {{ $product->stock ?? 0 }}</div>
                </div>
                @endforeach
            </div>
            @endif 
            
             @if(isset($wishlistData['link']) && $wishlistData['link'])
            <div style="text-align: {{ strtolower($processedTemplate['trackingButtonAlignment'] ?? 'center') }};">
                <a href="{{ $wishlistData['link'] }}" class="action-button">
                    {{ $processedTemplate['trackingButtonButtonText'] ?? 'View Wishlist' }}
                </a>
            </div>
            @endif
        </div> 
        
        @if(isset($processedTemplate['footerDetails']) && $processedTemplate['footerDetails'])
        <div class="footer">
            <p>{!! is_string($processedTemplate['footerDetails'] ?? '') ? $processedTemplate['footerDetails'] : '' !!}</p>
            @if(isset($processedTemplate['footerUnsubscribeButton']) && $processedTemplate['footerUnsubscribeButton'] == '1')
            <p><a href="#" class="unsubscribe">{{ $processedTemplate['footerUnsubscribe'] ?? 'Unsubscribe' }}</a></p>
            @endif
        </div>
        @endif
    </div>
</body>
</html> 