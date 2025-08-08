<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WishlistSharedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $customerData;
    public $shopData;
    public $wishlistData;
    public $emailTemplate;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($customerData, $shopData, $wishlistData, $emailTemplate)
    {
        $this->customerData = $customerData;
        $this->shopData = $shopData;
        $this->wishlistData = $wishlistData;
        $this->emailTemplate = $emailTemplate;
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
        $subject = $processedTemplate['emailSubject'] ?? 'Your {shop_name} wishlist has been shared!';
        
        return $this->subject($subject)
                    ->view('emails.wishlist-shared-notification')
                    ->with([
                        'customerData' => $this->customerData,
                        'shopData' => $this->shopData,
                        'wishlistData' => $this->wishlistData,
                        'emailTemplate' => $processedTemplate
                    ]);
    }

    /**
     * Replace variables in the email template
     */
    private function replaceVariables($text)
    {
        $replacements = [
            '{shop_name}' => is_object($this->shopData) ? ($this->shopData->shop ?? '') : ($this->shopData['shop'] ?? ''),
            '{customer_first_name}' => $this->customerData['first_name'] ?? '',
            '{customer_last_name}' => $this->customerData['last_name'] ?? '',
            '{customer_email}' => $this->customerData['email'] ?? '',
            '{wishlist_title}' => $this->wishlistData['title'] ?? '',
            '{wishlist_link}' => $this->wishlistData['link'] ?? '',
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