<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Trending Picks</title>
  </head>
  <body style="font-family: Arial, sans-serif; color:#111;">
    <h2 style="margin:0 0 10px;">Trending picks at {{ $shopName }}</h2>
    <p style="margin:0 0 16px;">Shoppers are frequently wishlisting these items. Take another look before they sell out!</p>
    <ul>
      @foreach($products as $p)
        <li>
          <strong>{{ $p['title'] ?? 'Product' }}</strong>
          @if(!empty($p['url']))
            - <a href="{{ $p['url'] }}" target="_blank">View</a>
          @endif
        </li>
      @endforeach
    </ul>
  </body>
  </html>


