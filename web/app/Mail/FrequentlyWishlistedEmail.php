<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FrequentlyWishlistedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public array $products;
    public string $shopName;

    public function __construct(array $products, string $shopName)
    {
        $this->products = $products;
        $this->shopName = $shopName;
    }

    public function build()
    {
        return $this
            ->subject('Trending picks at ' . $this->shopName)
            ->view('emails.frequently-wishlisted')
            ->with([
                'products' => $this->products,
                'shopName' => $this->shopName,
            ]);
    }
}


