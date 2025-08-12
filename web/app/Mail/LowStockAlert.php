<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LowStockAlert extends Mailable
{
    use Queueable, SerializesModels;

    public $customerData;
    public $shopData;
    public $wishlistData;
    public $emailTemplate;
    public $lowStockItems;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($customerData, $shopData, $wishlistData, $emailTemplate, $lowStockItems)
    {
        $this->customerData = $customerData;
        $this->shopData = $shopData;
        $this->wishlistData = $wishlistData;
        $this->emailTemplate = $emailTemplate;
        $this->lowStockItems = $lowStockItems;
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
        $subject = $processedTemplate['emailSubject'] ?? 'Low Stock Alert - {shop_name}';
        // dd($processedTemplate["textDescriptionDetails"]);
        return $this->subject($subject)
                    ->view('emails.low-stock-alert')
                    ->with([
                        'customerData' => $this->customerData,
                        'shopData' => $this->shopData,
                        'wishlistData' => $this->wishlistData,
                        'processedTemplate' => $processedTemplate,
                        'lowStockItems' => $this->lowStockItems
                    ]);
    }

    /**
     * Replace variables in the email template
     */
    private function replaceVariables($text)
    {
        // Get wishlist count from wishlistData
        $wishlistCount = $this->wishlistData['count'] ?? 0;
        $firstProduct = null;
        if (is_array($this->lowStockItems) && count($this->lowStockItems) > 0) {
            $firstProduct = $this->lowStockItems[0];
        } elseif (is_object($this->lowStockItems) && count($this->lowStockItems) > 0) {
            $firstProduct = $this->lowStockItems[0];
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
            // '{shop_name}' => is_object($this->shopData) ? ($this->shopData->shop ?? '') : ($this->shopData['shop'] ?? ''),
            '{customer_first_name}' => $this->customerData['first_name'] ?? '',
            '{customer_last_name}' => $this->customerData['last_name'] ?? '',
            '{customer_email}' => $this->customerData['email'] ?? '',
            '{wishlist_count}' => $wishlistCount,
            '{Wishlist_link}' => $this->wishlistData['link'] ?? '',
            '{stock_count}' => count($this->lowStockItems),
            '{product_name}' => count($this->lowStockItems) > 0 ? $this->lowStockItems[0]->title ?? 'Product' : 'Product',
            '{saved_count}' => $wishlistCount,
            '{product_price}' => $productPrice,
            '{product_url}' => $productUrl,
        ];
        // dd($replacements);
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