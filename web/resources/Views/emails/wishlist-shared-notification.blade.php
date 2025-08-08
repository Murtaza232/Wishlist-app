<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $emailTemplate['emailSubject'] ?? 'Welcome to ' . ($shopData['name'] ?? 'Our Store') . ' - Your Wishlist is Ready!' }}</title>
    <style>
        body {
            font-family: {{ $emailTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
            line-height: 1.6;
            color: #{{ $emailTemplate['themeSettingPrimaryTextColor'] ?? '333' }};
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #{{ $emailTemplate['brandingBackgroundColor'] ?? '000000' }};
            color: #{{ $emailTemplate['textColor'] ?? 'ffffff' }};
            padding: {{ $emailTemplate['paddingTop'] ?? '35' }}px 20px {{ $emailTemplate['paddingBottom'] ?? '35' }}px 20px;
            text-align: center;
            font-family: {{ $emailTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #{{ $emailTemplate['textColor'] ?? 'ffffff' }};
        }
        .content {
            padding: 30px 20px;
            background-color: #{{ $emailTemplate['textDescriptionBackgroundColor'] ?? 'ffffff' }};
        }
        .welcome-text {
            font-size: 16px;
            margin-bottom: 20px;
            color: #{{ $emailTemplate['textDescriptionTextColor'] ?? '000000' }};
            text-align: {{ strtolower($emailTemplate['textDescriptionAlignment'] ?? 'left') }};
            font-family: {{ $emailTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .action-button {
            display: inline-block;
            background-color: #{{ $emailTemplate['trackingButtonButtonColor'] ?? '000000' }};
            color: #{{ $emailTemplate['trackingButtonTextColor'] ?? 'ffffff' }} !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-size: {{ $emailTemplate['trackingButtonFontSize'] ?? '14' }}px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            width: {{ $emailTemplate['trackingButtonButtonWidth'] ?? '50' }}%;
            font-family: {{ $emailTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .footer {
            background-color: #{{ $emailTemplate['footerBackgroundColor'] ?? 'ffffff' }};
            color: #{{ $emailTemplate['footerTextColor'] ?? '000000' }};
            padding: 20px;
            text-align: {{ strtolower($emailTemplate['footerDetailsAlignment'] ?? 'center') }};
            font-size: 14px;
            font-family: {{ $emailTemplate['themeSettingFontFamily'] ?? 'Arial, sans-serif' }};
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            color: #{{ $emailTemplate['footerUnsubscribeButtonColor'] ?? '005BD3' }};
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
        @if(isset($emailTemplate['brandingType']) && in_array('Store name', $emailTemplate['brandingType']))
        <div class="header">
            <h1>{{ $shopData['name'] ?? 'Our Store' }}</h1>
        </div>
        @endif
        
        <div class="content">
            <div class="welcome-text">
                {!! is_string($emailTemplate['textDescriptionDetails'] ?? '') ? $emailTemplate['textDescriptionDetails'] : '' !!}
            </div>
            
            @if(isset($wishlistData['link']) && $wishlistData['link'])
            <div style="text-align: {{ strtolower($emailTemplate['trackingButtonAlignment'] ?? 'center') }};">
                <a href="{{ $wishlistData['link'] }}" class="action-button">
                    {{ $emailTemplate['trackingButtonButtonText'] ?? 'View Wishlist' }}
                </a>
            </div>
            @endif
        </div>
        
        @if(isset($emailTemplate['footerDetails']) && $emailTemplate['footerDetails'])
        <div class="footer">
            <p>{!! is_string($emailTemplate['footerDetails'] ?? '') ? $emailTemplate['footerDetails'] : '' !!}</p>
            @if(isset($emailTemplate['footerUnsubscribeButton']) && $emailTemplate['footerUnsubscribeButton'] == '1')
            <p><a href="#" class="unsubscribe">{{ $emailTemplate['footerUnsubscribe'] ?? 'Unsubscribe' }}</a></p>
            @endif
        </div>
        @endif
    </div>
</body>
</html>
