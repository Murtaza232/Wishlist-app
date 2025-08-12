<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BackInStockAlert extends Mailable
{
    use Queueable, SerializesModels;

    public $customerData;
    public $shopData;
    public $wishlistData;
    public $emailTemplate;
    public $backInStockItems;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($customerData, $shopData, $wishlistData, $emailTemplate, $backInStockItems)
    {
        $this->customerData = $customerData;
        $this->shopData = $shopData;
        $this->wishlistData = $wishlistData;
        $this->emailTemplate = $emailTemplate;
        $this->backInStockItems = $backInStockItems;
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
        $subject = $processedTemplate['emailSubject'] ?? 'Back in Stock - {shop_name}';
        return $this->subject($subject)
                    ->view('emails.back-in-stock-alert')
                    ->with([
                        'customerData' => $this->customerData,
                        'shopData' => $this->shopData,
                        'wishlistData' => $this->wishlistData,
                        'processedTemplate' => $processedTemplate,
                        'backInStockItems' => $this->backInStockItems
                    ]);
    }

    /**
     * Replace variables in the email template
     */
    private function replaceVariables($text)
    {
        $firstProduct = null;
        if (is_array($this->backInStockItems) && count($this->backInStockItems) > 0) {
            $firstProduct = $this->backInStockItems[0];
        } elseif (is_object($this->backInStockItems) && count($this->backInStockItems) > 0) {
            $firstProduct = $this->backInStockItems[0];
        }
        $productTitle = $firstProduct->title ?? '';
        $productPrice = $firstProduct->price ?? '';
        $productUrl = $firstProduct->url ?? ($firstProduct->product_url ?? '');
        $storeName = is_object($this->shopData) ? ($this->shopData->shop ?? $this->shopData->name ?? '') : ($this->shopData['shop'] ?? $this->shopData['name'] ?? '');
        $storeUrl = is_object($this->shopData) ? ($this->shopData->url ?? '') : ($this->shopData['url'] ?? '');
        $wishlistCount = $this->wishlistData['count'] ?? (isset($this->wishlistData['items']) ? count($this->wishlistData['items']) : '');
        $replacements = [
            '{shop_name}' => $storeName,
            '{store_name}' => $storeName,
            '{store_url}' => $storeUrl,
            '{customer_first_name}' => $this->customerData['first_name'] ?? '',
            '{customer_last_name}' => $this->customerData['last_name'] ?? '',
            '{customer_email}' => $this->customerData['email'] ?? '',
            '{product_name}' => $productTitle,
            '{product_price}' => $productPrice,
            '{product_url}' => $productUrl,
            '{wishlist_title}' => $this->wishlistData['title'] ?? '',
            '{wishlist_link}' => $this->wishlistData['link'] ?? '',
            '{wishlist_count}' => $wishlistCount,
            '{back_in_stock_count}' => count($this->backInStockItems),
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