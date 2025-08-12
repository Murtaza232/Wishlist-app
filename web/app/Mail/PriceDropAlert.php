<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PriceDropAlert extends Mailable
{
    use Queueable, SerializesModels;

    public $customerData;
    public $shopData;
    public $wishlistData;
    public $emailTemplate;
    public $priceDropItems;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($customerData, $shopData, $wishlistData, $emailTemplate, $priceDropItems)
    {
        $this->customerData = $customerData;
        $this->shopData = $shopData;
        $this->wishlistData = $wishlistData;
        $this->emailTemplate = $emailTemplate;
        $this->priceDropItems = $priceDropItems;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        // Replace variables in the email template
        $processedTemplate = $this->replaceVariablesInTemplate($this->emailTemplate);
        $subject = $processedTemplate['emailSubject'] ?? 'Price Drop Alert - {shop_name}';
        return $this->subject($subject)
                    ->view('emails.price-drop-alert')
                    ->with([
                        'customerData' => $this->customerData,
                        'shopData' => $this->shopData,
                        'wishlistData' => $this->wishlistData,
                        'processedTemplate' => $processedTemplate,
                        'priceDropItems' => $this->priceDropItems
                    ]);
    }

    /**
     * Replace variables in the email template
     */
    private function replaceVariables($text)
    {
        // Use first product for product-specific variables
        $firstProduct = null;
        if (is_array($this->priceDropItems) && count($this->priceDropItems) > 0) {
            $firstProduct = $this->priceDropItems[0];
        } elseif (is_object($this->priceDropItems) && count($this->priceDropItems) > 0) {
            $firstProduct = $this->priceDropItems[0];
        }
        $oldPrice = $firstProduct->old_price ?? ($firstProduct->price ?? '');
        $newPrice = $firstProduct->price ?? '';
        $priceDrop = ($oldPrice && $newPrice) ? $oldPrice - $newPrice : '';
        $productTitle = $firstProduct->title ?? '';
        $productPrice = $firstProduct->price ?? '';
        $priceDropPercentage = ($oldPrice && $newPrice && $oldPrice > 0) ? round((($oldPrice - $newPrice) / $oldPrice) * 100, 1) : '';
        $storeName = is_object($this->shopData) ? ($this->shopData->shop ?? $this->shopData->name ?? '') : ($this->shopData['shop'] ?? $this->shopData['name'] ?? '');
        $storeUrl = is_object($this->shopData) ? ($this->shopData->url ?? '') : ($this->shopData['url'] ?? '');
        $replacements = [
            '{shop_name}' => $storeName,
            '{store_name}' => $storeName,
            '{store_url}' => $storeUrl,
            '{customer_first_name}' => $this->customerData['first_name'] ?? '',
            '{customer_last_name}' => $this->customerData['last_name'] ?? '',
            '{customer_email}' => $this->customerData['email'] ?? '',
            '{product_name}' => $firstProduct->title ?? '',
            '{price_drop_percentage}' => $priceDropPercentage,
            '{old_price}' => $oldPrice,
            '{new_price}' => $newPrice,
            '{product_price}' => $productPrice,
            '{product_url}' => $productUrl,
            '{wishlist_link}' => $this->wishlistData['link'] ?? '',
            '{wishlist_title}' => $this->wishlistData['title'] ?? '',
        ];
        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }

    /**
     * Replace variables in the email template data
     */
    public function replaceVariablesInTemplate($templateData)
    {
        if (is_array($templateData)) {
            foreach ($templateData as $key => $value) {
                if (is_string($value)) {
                    $templateData[$key] = $this->replaceVariables($value);
                } elseif (is_array($value)) {
                    $templateData[$key] = $this->replaceVariablesInTemplate($value);
                }
            }
        }
        return $templateData;
    }
} 