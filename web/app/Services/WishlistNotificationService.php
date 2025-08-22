<?php

namespace App\Services;

use App\Mail\WishlistSignupConfirmation;
use App\Models\SubscriptionWebNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Options;
use Gnikyt\BasicShopifyAPI\Session;
use App\Models\Session as SessionModel;
use App\Models\NotificationProvider;
use App\Services\UsageService;

class WishlistNotificationService
{
	/**
	 * Yotpo OAuth and Analytics endpoints
	 */
	private const YOTPO_OAUTH_URL = 'https://api.yotpo.com/oauth/token';
	private const YOTPO_EMAIL_SUMMARY_BASE = 'https://api.yotpo.com/analytics/v1/emails/';
	private const YOTPO_EMAIL_RAW_PATH = '/export/raw_data';
	private const YOTPO_SMS_SUMMARY_BASE = 'https://api.yotpo.com/analytics/v1/sms/';
	private const YOTPO_SMS_RAW_PATH = '/export/raw_data';

	/**
	 * Map internal template names to Klaviyo template IDs
	 */
	/**
	 * Map internal template names to Klaviyo template IDs
	 * 
	 * @param string $templateName The internal template name (e.g., 'wishlist-signup-confirmation')
	 * @return string|null The Klaviyo template ID or null if not found
	 */
	protected function getKlaviyoTemplateId(string $templateName): ?string
	{
		// Map of Laravel Blade template names to Klaviyo template IDs
		$templates = [
			// Signup/Welcome Email
			'wishlist-signup-confirmation' => 'YOUR_WISHLIST_SIGNUP_TEMPLATE_ID',
			'welcome' => 'YOUR_WISHLIST_SIGNUP_TEMPLATE_ID', // Alias for backward compatibility
			
			// Shared Wishlist Notification
			'wishlist-shared-notification' => 'YOUR_WISHLIST_SHARED_TEMPLATE_ID',
			
			// Stock Alerts
			'back-in-stock-alert' => 'YOUR_BACK_IN_STOCK_TEMPLATE_ID',
			'low-stock-alert' => 'YOUR_LOW_STOCK_TEMPLATE_ID',
			
			// Price Alerts
			'price-drop-alert' => 'YOUR_PRICE_DROP_TEMPLATE_ID',
			
			// System/Account Emails
			'password-reset' => 'YOUR_PASSWORD_RESET_TEMPLATE_ID',
		];
		
		// Remove .blade.php if present in the template name
		$templateName = str_replace('.blade.php', '', $templateName);
		
		return $templates[$templateName] ?? null;
	}
	
	public function __construct()
	{
		Log::info('WishlistNotificationService constructor called');
	}

	/**
	 * Check if notifications are allowed based on usage limits
	 */
	private function isNotificationAllowed($shop)
	{
		try {
			$shopDomain = is_string($shop) ? $shop : $shop->shop;
			$isAllowed = UsageService::isActionAllowed($shopDomain, 'send_notification');
			
			if (!$isAllowed) {
				Log::warning("Notification blocked due to usage limit reached for shop: {$shopDomain}");
			}
			
			return $isAllowed;
		} catch (\Exception $e) {
			Log::error("Error checking notification permissions: " . $e->getMessage());
			// Default to allowing notifications if there's an error
			return true;
		}
	}

	public function sendViaSelectedProvider(array $message, array $context, $shopId, string $channel = 'email')
	{
		// Check usage limits before sending notification
		$shop = SessionModel::find($shopId);
		if ($shop && !$this->isNotificationAllowed($shop)) {
			Log::info("Notification blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		// Get the provider settings from the database
		$providerRow = NotificationProvider::where('session_id', $shopId)->first();
		
		Log::info('=== PROVIDER CONFIGURATION DEBUG ===', [
			'shop_id' => $shopId,
			'provider_row_exists' => $providerRow ? 'YES' : 'NO',
			'provider_row_data' => $providerRow ? [
				'id' => $providerRow->id,
				'session_id' => $providerRow->session_id,
				'email_provider' => $providerRow->email_provider ?? 'NULL',
				'sms_provider' => $providerRow->sms_provider ?? 'NULL',
				'provider_settings' => $providerRow->provider_settings ? 'EXISTS' : 'NULL'
			] : 'NO RECORD FOUND'
		]);
		
		// Determine the provider based on the channel (email or sms)
		$provider = $channel === 'email' 
			? ($providerRow->email_provider ?? 'smtp')
			: ($providerRow->sms_provider ?? null);

		// Normalize explicit 'smtp' channel to email
		if ($channel === 'smtp') {
			$channel = 'email';
			$provider = 'smtp';
		}
			
		// Get provider settings
		$settings = $providerRow && $providerRow->provider_settings 
			? json_decode($providerRow->provider_settings, true) 
			: [];

		Log::info('=== PROVIDER SELECTION DEBUG ===', [
			'channel' => $channel,
			'selected_provider' => $provider,
			'settings_count' => count($settings),
			'settings_keys' => array_keys($settings)
		]);

		// Log the email sending attempt with all available context
		$logContext = [
			'to' => $message['to'] ?? null,
			'subject' => $message['subject'] ?? null,
			'template' => $message['template'] ?? null,
			'view' => $message['view'] ?? null,
			'has_mailable' => isset($message['mailable']),
			'channel' => $channel,
			'provider' => $provider,
			'provider_settings_keys' => array_keys($settings)
		];
		
		Log::info('Attempting to send notification', $logContext);

		// Default/SMTP path using Laravel Mail for email
		if ($channel === 'email' && (!$provider || strtolower($provider) === 'smtp')) {
			try {
				Log::info('=== SMTP EMAIL SENDING STARTED ===');
				Log::info('SMTP Configuration:', [
					'mail_driver' => config('mail.default'),
					'mail_host' => config('mail.mailers.smtp.host'),
					'mail_port' => config('mail.mailers.smtp.port'),
					'mail_username' => config('mail.mailers.smtp.username'),
					'from_address' => config('mail.from.address'),
					'from_name' => config('mail.from.name')
				]);

				if (isset($message['mailable'])) {
					Log::info('Sending email via Laravel SMTP', [
						'to' => $message['to'],
						'subject' => $message['subject'] ?? 'No subject',
						'mailable_class' => get_class($message['mailable'])
					]);

					// If a subject is provided (e.g., tests), render the mailable and send with forced subject
					if (!empty($message['subject'])) {
						$html = $message['mailable']->render();
						Mail::html($html, function ($mail) use ($message) {
							$mail->to($message['to']);
							$mail->subject($message['subject']);
							if (!empty($message['from'])) {
								$mail->from($message['from'], $message['from_name'] ?? null);
							}
						});
					} else {
						// Normal path – let the mailable define the subject
						Mail::to($message['to'])->send($message['mailable']);
					}

					Log::info('=== SMTP EMAIL SENT SUCCESSFULLY ===', [
						'to' => $message['to'],
						'subject' => $message['subject'] ?? 'No subject',
						'sent_via' => 'Laravel SMTP'
					]);
					
					// Track usage after successful notification
					if ($shop) {
						UsageService::trackUsage($shop->shop, 'send_notification');
					}
					
					return true;
				}
				Log::error('Cannot send email: No mailable provided');
				return false;
			} catch (\Exception $e) {
				Log::error('=== SMTP EMAIL SENDING FAILED ===', [
					'exception' => $e->getMessage(),
					'file' => $e->getFile(),
					'line' => $e->getLine(),
					'to' => $message['to'] ?? null
				]);
				return false;
			}
		}

		if ($channel === 'email' && strtolower($provider) === 'klaviyo') {
			// Get Klaviyo API key from settings
			$apiKey = $settings['klaviyo_api_key'] ?? null;
			
			Log::info('=== KLAVIYO EMAIL SENDING STARTED ===');
			Log::info('Klaviyo Configuration:', [
				'api_key_exists' => !empty($apiKey),
				'api_key_prefix' => $apiKey ? substr($apiKey, 0, 6) . '...' : 'N/A',
				'provider_settings' => array_keys($settings)
			]);
			
			// Log provider selection and settings
			Log::debug('Klaviyo provider selected', [
				'api_key_exists' => !empty($apiKey),
				'api_key_prefix' => $apiKey ? substr($apiKey, 0, 6) . '...' : 'N/A',
				'provider_settings' => array_keys($settings)
			]);
			
			if (!$apiKey) {
				$errorMsg = 'Klaviyo email sending failed: API key missing in provider settings';
				Log::error('=== KLAVIYO EMAIL SENDING FAILED ===', [
					'reason' => 'Missing API key',
					'available_settings' => array_keys($settings),
					'provider_settings' => $settings
				]);
				
				// Fallback to SMTP if configured to do so
				if (($settings['fallback_to_smtp'] ?? true) === true) {
					Log::info('=== FALLING BACK TO SMTP ===', [
						'reason' => 'Klaviyo API key missing',
						'fallback_enabled' => true
					]);
					return $this->sendViaSelectedProvider($message, $context, $shopId, 'smtp');
				}
				
				return false;
			}

			try {
				// Log the start of template rendering
				Log::debug('Starting email template rendering', [
					'has_view' => isset($message['view']),
					'has_mailable' => isset($message['mailable']),
					'context_keys' => array_keys($context)
				]);
				
				$html = null;
				$text = null;
				$startTime = microtime(true);
				
				if (isset($message['view'])) {
					// Render the Blade view to HTML
					$viewName = $message['view'];
					Log::debug('Rendering view template', ['view' => $viewName]);
					
					$html = view($viewName, $context)->render();
					
					// Create a plain text version (basic conversion)
					$text = strip_tags($html);
					$text = preg_replace('/\s+/', ' ', $text);
					$text = trim($text);
					
					Log::debug('View rendered successfully', [
						'view' => $viewName,
						'html_length' => strlen($html),
						'text_length' => strlen($text),
						'render_time' => round((microtime(true) - $startTime) * 1000, 2) . 'ms'
					]);
					
				} elseif (isset($message['mailable'])) {
					// For Mailables, we need to render them using the render() method
					$mailable = $message['mailable'];
					$mailableClass = get_class($mailable);
					
					Log::debug('Rendering Mailable', [
						'mailable' => $mailableClass,
						'subject' => $mailable->subject ?? null
					]);
					
					// Get the HTML content
					$html = $mailable->render();
					
					// Generate a plain text version
					$text = $this->htmlToPlainText($html);
					
					// Ensure variables are replaced in the content
					// The Mailable should have already done this, but let's double-check
					$html = $this->replaceVariablesInContent($html, $message);
					$text = $this->replaceVariablesInContent($text, $message);
					
					Log::debug('Mailable rendered successfully', [
						'mailable' => $mailableClass,
						'html_length' => strlen($html),
						'text_length' => strlen($text),
						'render_time' => round((microtime(true) - $startTime) * 1000, 2) . 'ms'
					]);
					
				} else {
					$errorMsg = 'No view or mailable specified for Klaviyo email';
					Log::error($errorMsg, ['message' => $message]);
					throw new \Exception($errorMsg);
				}

				// Prepare recipient email (handle both string and array formats)
				$toEmail = is_array($message['to']) ? ($message['to']['email'] ?? $message['to'][0]['email'] ?? null) : $message['to'];
				
				// Use Klaviyo's HTTP API directly instead of the SDK for email sending
				// The Klaviyo PHP SDK doesn't support direct email sending, so we'll use their HTTP API
				
				// Prepare email data for Klaviyo's HTTP API
				$emailData = [
					'from_email' => $message['from'] ?? config('mail.from.address'),
					'from_name' => $message['from_name'] ?? config('mail.from.name'),
					'subject' => $message['subject'] ?? 'Notification from Wishlist',
					'to' => [['email' => $toEmail]],
					'html' => $html,
					'text' => $text,
					'track_opens' => true,
					'track_clicks' => true,
					'tags' => ['wishlist', 'transactional']
				];

				// Add reply-to if provided
				if (!empty($message['reply_to'])) {
					$emailData['reply_to'] = $message['reply_to'];
				}

				// Prepare loggable data (without exposing full content)
				$loggableData = [
					'to' => $toEmail,
					'subject' => $emailData['subject'],
					'from' => $emailData['from_email'],
					'from_name' => $emailData['from_name']
				];
				
				Log::debug('Sending email via Klaviyo HTTP API', [
					'request_data' => $loggableData,
					'html_length' => strlen($html ?? ''),
					'text_length' => strlen($text ?? '')
				]);
				
				$startTime = microtime(true);
				
				try {
					// Send email through Klaviyo using their Events API
					// First, we need to create a profile for the recipient
					$profilePayload = [
						'data' => [
							'type' => 'profile',
							'attributes' => [
								'email' => $toEmail,
								'first_name' => $message['first_name'] ?? null,
								'last_name' => $message['last_name'] ?? null,
								'phone_number' => $message['phone'] ?? null,
							],
						],
					];
					
					Log::info('=== KLAVIYO PROFILE CREATION STARTED ===', [
						'email' => $toEmail,
						'first_name' => $message['first_name'] ?? null,
						'last_name' => $message['last_name'] ?? null
					]);
					
					Log::debug('Creating/updating Klaviyo profile', [
						'email' => $toEmail,
						'first_name' => $message['first_name'] ?? null,
						'last_name' => $message['last_name'] ?? null
					]);
					
					// Create or update the profile
					$profileResponse = Http::withHeaders([
						'Authorization' => 'Klaviyo-API-Key ' . $apiKey,
						'accept' => 'application/json',
						'revision' => '2023-02-22',
						'content-type' => 'application/json'
					])->post('https://a.klaviyo.com/api/profiles/', $profilePayload);
					
					Log::info('=== KLAVIYO PROFILE API RESPONSE ===', [
						'status' => $profileResponse->status(),
						'success' => $profileResponse->successful(),
						'body' => $profileResponse->body()
					]);
					
					if (!$profileResponse->successful()) {
						Log::warning('Failed to create/update Klaviyo profile', [
							'status' => $profileResponse->status(),
							'body' => $profileResponse->body()
						]);
					} else {
						Log::info('=== KLAVIYO PROFILE CREATED/UPDATED SUCCESSFULLY ===');
						Log::debug('Klaviyo profile created/updated successfully');
					}
					
					// Send event to Klaviyo that will trigger email sending
					// This event should be configured in Klaviyo to send an email
					$eventPayload = [
						'data' => [
							'type' => 'event',
							'attributes' => [
								'metric' => ['name' => 'Email Sent'],
								'profile' => [
									'email' => $toEmail,
								],
								'properties' => [
									'Subject' => $emailData['subject'],
									'Email Body' => $html,
									'Text Body' => $text,
									'Shop' => $message['shop'] ?? null,
									'Wishlist Title' => $message['wishlist_title'] ?? null,
									'Wishlist Link' => $message['wishlist_link'] ?? null,
									'Customer Name' => ($message['first_name'] ?? '') . ' ' . ($message['last_name'] ?? ''),
									'$email' => $toEmail,
									'$first_name' => $message['first_name'] ?? null,
									'$last_name' => $message['last_name'] ?? null,
									'Email Type' => 'Wishlist Signup Confirmation',
								],
								'time' => now()->toIso8601String(),
							],
						],
					];
					
					Log::info('=== KLAVIYO EMAIL EVENT SENDING STARTED ===', [
						'email' => $toEmail,
						'subject' => $emailData['subject'],
						'metric' => 'Email Sent',
						'event_payload_size' => strlen(json_encode($eventPayload))
					]);
					
					Log::debug('Sending Klaviyo email event', [
						'email' => $toEmail,
						'subject' => $emailData['subject'],
						'metric' => 'Email Sent'
					]);
					
					$response = Http::withHeaders([
						'Authorization' => 'Klaviyo-API-Key ' . $apiKey,
						'accept' => 'application/json',
						'revision' => '2023-02-22',
						'content-type' => 'application/json'
					])->post('https://a.klaviyo.com/api/events/', $eventPayload);
					
					$responseTime = round((microtime(true) - $startTime) * 1000, 2);
					
					Log::info('=== KLAVIYO EMAIL EVENT API RESPONSE ===', [
						'status' => $response->status(),
						'success' => $response->successful(),
						'body' => $response->body(),
						'response_time_ms' => $responseTime
					]);

					Log::debug('Klaviyo Events API response', [
						'status' => $response->status(),
						'body' => $response->body(),
						'response_time_ms' => $responseTime
					]);

					if (!$response->successful()) {
						Log::error('=== KLAVIYO EMAIL EVENT SENDING FAILED ===', [
							'status' => $response->status(),
							'body' => $response->body(),
							'response_time_ms' => $responseTime
						]);
						throw new \Exception('Failed to send email with Klaviyo: HTTP ' . $response->status() . ' - ' . $response->body());
					}

					Log::info('=== KLAVIYO EMAIL EVENT SENT SUCCESSFULLY ===', [
						'to' => $toEmail,
						'subject' => $emailData['subject'],
						'response_time_ms' => $responseTime,
						'sent_via' => 'Klaviyo Events API'
					]);

					Log::info('Klaviyo email event sent successfully', [
						'to' => $toEmail,
						'subject' => $emailData['subject'],
						'response_time_ms' => $responseTime
					]);
					
					// Track usage after successful notification
					if ($shop) {
						UsageService::trackUsage($shop->shop, 'send_notification');
					}
					
					return true;
					
				} catch (\Exception $e) {
					$responseTime = round((microtime(true) - $startTime) * 1000, 2);
					$errorMsg = 'Klaviyo API error: ' . $e->getMessage();
					
					Log::error('=== KLAVIYO EMAIL SENDING FAILED ===', [
						'exception' => $e->getMessage(),
						'file' => $e->getFile(),
						'line' => $e->getLine(),
						'response_time_ms' => $responseTime,
						'request_data' => $loggableData
					]);
					
					Log::error($errorMsg, [
						'exception' => $e,
						'response_time_ms' => $responseTime,
						'request_data' => $loggableData
					]);
					
					// Check if we should fallback to SMTP
					if (($settings['fallback_to_smtp'] ?? true) === true) {
						Log::info('=== FALLING BACK TO SMTP DUE TO KLAVIYO FAILURE ===', [
							'reason' => 'Klaviyo API error',
							'fallback_enabled' => true,
							'error' => $e->getMessage()
						]);
						
						if (isset($message['mailable'])) {
							Log::info('Attempting SMTP fallback with mailable');
							Mail::to($message['to'])->send($message['mailable']);
							Log::info('=== SMTP FALLBACK SUCCESSFUL ===', [
								'to' => $message['to'],
								'sent_via' => 'SMTP Fallback'
							]);
							
							// Track usage after successful notification
							if ($shop) {
								UsageService::trackUsage($shop->shop, 'send_notification');
							}
							
							return true;
						} else {
							Log::error('=== SMTP FALLBACK FAILED ===', [
								'reason' => 'No mailable available for fallback'
							]);
						}
					}
					
					throw new \Exception($errorMsg);
				}
				
			} catch (\Exception $e) {
				Log::error('=== KLAVIYO EMAIL PROCESSING FAILED ===', [
					'exception' => $e->getMessage(),
					'file' => $e->getFile(),
					'line' => $e->getLine(),
					'to' => $message['to'] ?? null,
					'subject' => $message['subject'] ?? null
				]);
				
				Log::error('Failed to send Klaviyo email: ' . $e->getMessage(), [
					'exception' => $e,
					'to' => $message['to'] ?? null,
					'subject' => $message['subject'] ?? null
				]);
				
				// Final fallback to SMTP if Klaviyo fails
				if (isset($message['mailable'])) {
					Log::info('=== FINAL SMTP FALLBACK ATTEMPT ===', [
						'reason' => 'Klaviyo processing failed',
						'to' => $message['to']
					]);
					
					try {
					Mail::to($message['to'])->send($message['mailable']);
						Log::info('=== FINAL SMTP FALLBACK SUCCESSFUL ===', [
							'to' => $message['to'],
							'sent_via' => 'Final SMTP Fallback'
						]);
						
						// Track usage after successful notification
						if ($shop) {
							UsageService::trackUsage($shop->shop, 'send_notification');
						}
						
					return true;
					} catch (\Exception $smtpError) {
						Log::error('=== FINAL SMTP FALLBACK FAILED ===', [
							'smtp_error' => $smtpError->getMessage(),
							'original_error' => $e->getMessage()
						]);
					}
				}
				return false;
			}
		}

		if ($channel === 'email' && strtolower($provider) === 'iterable') {
			// Get Iterable API key from settings
			$apiKey = $settings['iterable_api_key'] ?? null;
			
			Log::info('=== ITERABLE EMAIL SENDING STARTED ===');
			Log::info('Iterable Configuration:', [
				'api_key_exists' => !empty($apiKey),
				'api_key_prefix' => $apiKey ? substr($apiKey, 0, 6) . '...' : 'N/A',
				'provider_settings' => array_keys($settings)
			]);
			
			if (!$apiKey) {
				$errorMsg = 'Iterable email sending failed: API key missing in provider settings';
				Log::error('=== ITERABLE EMAIL SENDING FAILED ===', [
					'reason' => 'Missing API key',
					'available_settings' => array_keys($settings),
					'provider_settings' => $settings
				]);
				
				// Fallback to SMTP if configured to do so
				if (($settings['fallback_to_smtp'] ?? true) === true) {
					Log::info('=== FALLING BACK TO SMTP ===', [
						'reason' => 'Iterable API key missing',
						'fallback_enabled' => true
					]);
					return $this->sendViaSelectedProvider($message, $context, $shopId, 'smtp');
				}
				
				return false;
			}

			try {
				// Log the start of template rendering
				Log::debug('Starting email template rendering for Iterable', [
					'has_view' => isset($message['view']),
					'has_mailable' => isset($message['mailable']),
					'context_keys' => array_keys($context)
				]);
				
				$html = null;
				$text = null;
				$startTime = microtime(true);
				
				if (isset($message['view'])) {
					// Render the Blade view to HTML
					$viewName = $message['view'];
					Log::debug('Rendering view template for Iterable', ['view' => $viewName]);
					
					$html = view($viewName, $context)->render();
					
					// Create a plain text version (basic conversion)
					$text = strip_tags($html);
					$text = preg_replace('/\s+/', ' ', $text);
					$text = trim($text);
					
					Log::debug('View rendered successfully for Iterable', [
						'view' => $viewName,
						'html_length' => strlen($html),
						'text_length' => strlen($text),
						'render_time' => round((microtime(true) - $startTime) * 1000, 2) . 'ms'
					]);
					
				} elseif (isset($message['mailable'])) {
					// For Mailables, we need to render them using the render() method
					$mailable = $message['mailable'];
					$mailableClass = get_class($mailable);
					
					Log::debug('Rendering Mailable for Iterable', [
						'mailable' => $mailableClass,
						'subject' => $mailable->subject ?? null
					]);
					
					// Get the HTML content
					$html = $mailable->render();
					
					// Generate a plain text version
					$text = $this->htmlToPlainText($html);
					
					// Ensure variables are replaced in the content
					$html = $this->replaceVariablesInContent($html, $message);
					$text = $this->replaceVariablesInContent($text, $message);
					
					Log::debug('Mailable rendered successfully for Iterable', [
						'mailable' => $mailableClass,
						'html_length' => strlen($html),
						'text_length' => strlen($text),
						'render_time' => round((microtime(true) - $startTime) * 1000, 2) . 'ms'
					]);
					
				} else {
					$errorMsg = 'No view or mailable specified for Iterable email';
					Log::error($errorMsg, ['message' => $message]);
					throw new \Exception($errorMsg);
				}

				// Prepare recipient email (handle both string and array formats)
				$toEmail = is_array($message['to']) ? ($message['to']['email'] ?? $message['to'][0]['email'] ?? null) : $message['to'];
				
				// Send email using Iterable's API
				$emailPayload = [
					'email' => $toEmail,
					'campaignId' => $settings['iterable_campaign_id'] ?? null,
					'templateId' => $settings['iterable_template_id'] ?? null,
					'dataFields' => [
						'subject' => $message['subject'] ?? 'Notification from Wishlist',
						'html_content' => $html,
						'text_content' => $text,
						'shop' => $message['shop'] ?? null,
						'wishlist_title' => $message['wishlist_title'] ?? null,
						'wishlist_link' => $message['wishlist_link'] ?? null,
						'customer_name' => ($message['first_name'] ?? '') . ' ' . ($message['last_name'] ?? ''),
						'first_name' => $message['first_name'] ?? null,
						'last_name' => $message['last_name'] ?? null,
					],
					'allowRepeatMarketingSends' => true,
					'sendAt' => now()->toIso8601String(),
				];

				Log::info('=== ITERABLE EMAIL SENDING STARTED ===', [
					'email' => $toEmail,
					'subject' => $message['subject'] ?? 'Notification from Wishlist',
					'campaign_id' => $emailPayload['campaignId'],
					'template_id' => $emailPayload['templateId']
				]);
				
				$response = Http::withHeaders([
					'Api-Key' => $apiKey,
					'Content-Type' => 'application/json'
				])->post('https://api.iterable.com/api/email/target', $emailPayload);
				
				$responseTime = round((microtime(true) - $startTime) * 1000, 2);
				
				Log::info('=== ITERABLE EMAIL API RESPONSE ===', [
					'status' => $response->status(),
					'success' => $response->successful(),
					'body' => $response->body(),
					'response_time_ms' => $responseTime
				]);

				if (!$response->successful()) {
					Log::error('=== ITERABLE EMAIL SENDING FAILED ===', [
						'status' => $response->status(),
						'body' => $response->body(),
						'response_time_ms' => $responseTime
					]);
					throw new \Exception('Failed to send email with Iterable: HTTP ' . $response->status() . ' - ' . $response->body());
				}

				Log::info('=== ITERABLE EMAIL SENT SUCCESSFULLY ===', [
					'to' => $toEmail,
					'subject' => $message['subject'] ?? 'Notification from Wishlist',
					'response_time_ms' => $responseTime,
					'sent_via' => 'Iterable API'
				]);
				
				// Track usage after successful notification
				if ($shop) {
					UsageService::trackUsage($shop->shop, 'send_notification');
				}
				
				return true;
				
			} catch (\Exception $e) {
				$responseTime = round((microtime(true) - $startTime) * 1000, 2);
				$errorMsg = 'Iterable API error: ' . $e->getMessage();
				
				Log::error('=== ITERABLE EMAIL SENDING FAILED ===', [
					'exception' => $e->getMessage(),
					'file' => $e->getFile(),
					'line' => $e->getLine(),
					'response_time_ms' => $responseTime
				]);
				
				// Check if we should fallback to SMTP
				if (($settings['fallback_to_smtp'] ?? true) === true) {
					Log::info('=== FALLING BACK TO SMTP DUE TO ITERABLE FAILURE ===', [
						'reason' => 'Iterable API error',
						'fallback_enabled' => true,
						'error' => $e->getMessage()
					]);
					
					if (isset($message['mailable'])) {
						Log::info('Attempting SMTP fallback with mailable');
						Mail::to($message['to'])->send($message['mailable']);
											Log::info('=== SMTP FALLBACK SUCCESSFUL ===', [
						'to' => $message['to'],
						'sent_via' => 'SMTP Fallback'
					]);
					
					// Track usage after successful notification
					if ($shop) {
						UsageService::trackUsage($shop->shop, 'send_notification');
					}
					
					return true;
					}
				}
				
				throw new \Exception($errorMsg);
			}
		}

		if ($channel === 'email' && strtolower($provider) === 'yotpo') {
			$appKey = $settings['yotpo_public_key'] ?? env('YOTPO_APP_KEY');
			$secret = $settings['yotpo_private_key'] ?? env('YOTPO_SECRET');
			$triggerUrl = $settings['yotpo_email_trigger_url'] ?? env('YOTPO_EMAIL_TRIGGER_URL');

			Log::info('=== YOTPO EMAIL SENDING STARTED ===', [
				'app_key_exists' => !empty($appKey),
				'secret_exists' => !empty($secret),
				'trigger_url_exists' => !empty($triggerUrl)
			]);

			if (!$appKey || !$secret || !$triggerUrl) {
				Log::error('Yotpo email send aborted: missing app_key, secret or trigger URL');
				if (($settings['fallback_to_smtp'] ?? true) === true && isset($message['mailable'])) {
					Mail::to($message['to'])->send($message['mailable']);
					Log::info('SMTP fallback sent (Yotpo email config missing)');
					return true;
				}
				return false;
			}

			// Render content (same as other providers)
			$html = null; $text = null; $startTime = microtime(true);
			if (isset($message['view'])) {
				$html = view($message['view'], $context)->render();
				$text = trim(preg_replace('/\s+/', ' ', strip_tags($html)));
			} elseif (isset($message['mailable'])) {
				$html = $message['mailable']->render();
				$text = $this->htmlToPlainText($html);
			} else {
				Log::error('No view or mailable specified for Yotpo email');
				return false;
			}
			// Replace variables
			$html = $this->replaceVariablesInContent($html, $message);
			$text = $this->replaceVariablesInContent($text, $message);

			// OAuth
			$token = $this->yotpoGetAccessToken($appKey, $secret);
			if (!$token) {
				Log::error('Yotpo OAuth failed (email)');
				return false;
			}

			$toEmail = is_array($message['to']) ? ($message['to']['email'] ?? $message['to'][0]['email'] ?? null) : $message['to'];
			$payload = [
				'email' => $toEmail,
				'subject' => $message['subject'] ?? 'Notification from Wishlist',
				'html_content' => $html,
				'text_content' => $text,
				'data' => [
					'shop' => $message['shop'] ?? null,
					'wishlist_title' => $message['wishlist_title'] ?? null,
					'wishlist_link' => $message['wishlist_link'] ?? null,
					'first_name' => $message['first_name'] ?? null,
					'last_name' => $message['last_name'] ?? null,
				],
			];

			try {
				$res = Http::withHeaders([
					'Authorization' => 'Bearer ' . $token,
					'Content-Type' => 'application/json'
				])->post($triggerUrl, $payload);

				if (!$res->successful()) {
					Log::error('Yotpo email trigger failed', ['status' => $res->status(), 'body' => $res->body()]);
					return false;
				}
				Log::info('=== YOTPO EMAIL TRIGGERED SUCCESSFULLY ===');
				
				// Track usage after successful notification
				if ($shop) {
					UsageService::trackUsage($shop->shop, 'send_notification');
				}
				
				return true;
			} catch (\Exception $e) {
				Log::error('Yotpo email trigger exception', ['error' => $e->getMessage()]);
				return false;
			}
		}

		if ($channel === 'sms') {
			if (strtolower((string)$provider) === 'klaviyo') {
				$apiKey = $settings['klaviyo_api_key'] ?? null;
				if (!$apiKey) {
					Log::error('Klaviyo SMS sending failed: API key missing in provider_settings');
					// Continue with the process even if SMS fails
					Log::info('SMS sending skipped due to missing API key, continuing with email only');
					return true;
				}
				
				$metric = $message['metric'] ?? 'Wishlist SMS';
				$phone = $message['to'] ?? null;
				$profile = $message['profile'] ?? [];
				$properties = $message['properties'] ?? [];
				return $this->sendKlaviyoSmsEvent($apiKey, $metric, $phone, $profile, $properties, $shop);
			}

			if (strtolower((string)$provider) === 'iterable') {
				$apiKey = $settings['iterable_api_key'] ?? null;
				if (!$apiKey) {
					Log::error('Iterable SMS sending failed: API key missing in provider_settings');
					// Continue with the process even if SMS fails
					Log::info('SMS sending skipped due to missing API key, continuing with email only');
					return true;
				}
				
				$phone = $message['to'] ?? null;
				$profile = $message['profile'] ?? [];
				$properties = $message['properties'] ?? [];
				return $this->sendIterableSmsEvent($apiKey, $phone, $profile, $properties, $shop);
			}

			if (strtolower((string)$provider) === 'yotpo') {
				$appKey = $settings['yotpo_public_key'] ?? env('YOTPO_APP_KEY');
				$secret = $settings['yotpo_private_key'] ?? env('YOTPO_SECRET');
				$triggerUrl = $settings['yotpo_sms_trigger_url'] ?? env('YOTPO_SMS_TRIGGER_URL');
				if (!$appKey || !$secret || !$triggerUrl) {
					Log::error('Yotpo SMS send aborted: missing app_key, secret or trigger URL');
					return true; // do not block email
				}
				$token = $this->yotpoGetAccessToken($appKey, $secret);
				if (!$token) {
					Log::error('Yotpo OAuth failed (sms)');
					return true;
				}
				$phone = $message['to'] ?? null;
				$profile = $message['profile'] ?? [];
				$properties = $message['properties'] ?? [];

				$defaultText = $properties['text'] ?? ($properties['message'] ?? null);
				if (!$defaultText) {
					$parts = [];
					if (!empty($properties['shop'])) $parts[] = $properties['shop'];
					if (!empty($properties['wishlist_title'])) $parts[] = 'Wishlist: ' . $properties['wishlist_title'];
					$defaultText = implode(' • ', $parts);
					if (!empty($properties['wishlist_link'])) $defaultText .= ' → ' . $properties['wishlist_link'];
				}

				$payload = [
					'phone' => $phone,
					'text' => $defaultText,
					'data' => [
						'email' => $profile['email'] ?? null,
						'first_name' => $profile['first_name'] ?? null,
						'last_name' => $profile['last_name'] ?? null,
					]
				];
				try {
					$res = Http::withHeaders([
						'Authorization' => 'Bearer ' . $token,
						'Content-Type' => 'application/json'
					])->post($triggerUrl, $payload);
					if (!$res->successful()) {
						Log::error('Yotpo SMS trigger failed', ['status' => $res->status(), 'body' => $res->body()]);
						return false;
					}
					Log::info('=== YOTPO SMS TRIGGERED SUCCESSFULLY ===');
					
					// Track usage after successful notification
					if ($shop) {
						UsageService::trackUsage($shop->shop, 'send_notification');
					}
					
					return true;
				} catch (\Exception $e) {
					Log::error('Yotpo SMS trigger exception', ['error' => $e->getMessage()]);
					return false;
				}
			}

			Log::info('SMS provider send (placeholder)', [
				'provider' => $provider,
				'to' => $message['to'] ?? null,
				'body' => $message['text'] ?? null,
				'shop_id' => $shopId,
			]);
			return true;
		}

		// Final fallback
		if (isset($message['mailable'])) {
			Log::info('=== FINAL FALLBACK: USING SMTP ===', [
				'reason' => 'No specific provider handling or all providers failed',
				'to' => $message['to'],
				'channel' => $channel,
				'provider' => $provider
			]);
			
			try {
			Mail::to($message['to'])->send($message['mailable']);
				Log::info('=== FINAL FALLBACK SMTP SUCCESSFUL ===', [
					'to' => $message['to'],
					'sent_via' => 'Final SMTP Fallback'
				]);
			return true;
			} catch (\Exception $e) {
				Log::error('=== FINAL FALLBACK SMTP FAILED ===', [
					'error' => $e->getMessage(),
					'to' => $message['to']
				]);
			}
		}
		
		Log::error('=== EMAIL SENDING COMPLETELY FAILED ===', [
			'reason' => 'No mailable available and no provider succeeded',
			'to' => $message['to'] ?? null,
			'channel' => $channel,
			'provider' => $provider
		]);
		return false;
	}

	/**
	 * PUBLIC: Send an SMS event via selected provider (e.g., Klaviyo)
	 */
	public function sendSmsEvent($customerId, $shop, string $metricName, array $properties = [])
	{
		// Check usage limits before sending SMS
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("SMS event blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		$customer = $this->getCustomerData($customerId, $shop);
		if (!$customer) {
			Log::error('SMS send aborted: customer not found: ' . $customerId);
			return false;
		}
		$rawPhone = $customer['phone'] ?? null;
		$phone = $this->normalizeToE164($rawPhone, $properties['default_country'] ?? 'US');
		if (!$phone) {
			Log::error('SMS send aborted: invalid/missing E.164 phone for customer: ' . $customerId);
			return false;
		}
		$profile = [
			'email' => $customer['email'] ?? null,
			'external_id' => (string)$customerId,
			'first_name' => $customer['first_name'] ?? null,
			'last_name' => $customer['last_name'] ?? null,
		];
		return $this->sendViaSelectedProvider([
			'to' => $phone,
			'metric' => $metricName,
			'profile' => $profile,
			'properties' => $properties,
		], [], $shop->id, 'sms');
	}

	private function normalizeToE164(?string $phone, string $defaultCountry = 'US'): ?string
	{
		if (!$phone) return null;
		$digits = preg_replace('/[^0-9+]/', '', $phone);
		if (!$digits) return null;
		if (strpos($digits, '+') === 0) {
			return $digits; // assume already E.164
		}
		// naive normalization: prepend +1 for US if no country code
		if ($defaultCountry === 'US' && preg_match('/^[2-9][0-9]{9}$/', $digits)) {
			return '+1' . $digits;
		}
		// fallback: cannot safely normalize
		return null;
	}

	/**
	 * PRIVATE: Call Klaviyo Events API to trigger an SMS Flow
	 */
	private function sendKlaviyoSmsEvent(string $apiKey, string $metricName, string $phoneE164, array $profile, array $properties, $shop = null): bool
	{
		if (!$phoneE164) {
			Log::error('Klaviyo SMS send failed: phone missing');
			return false;
		}

		$payload = [
			'data' => [
				'type' => 'event',
				'attributes' => [
					'metric' => ['name' => $metricName],
					'profile' => array_merge([
						'phone_number' => $phoneE164,
					], array_filter($profile, function ($v) { return !is_null($v) && $v !== ''; })),
					'properties' => $properties,
					'time' => now()->toIso8601String(),
				],
			],
		];

		$res = Http::withHeaders([
			'Authorization' => 'Klaviyo-API-Key ' . $apiKey,
			'accept' => 'application/json',
			'revision' => '2023-02-22',
		])->post('https://a.klaviyo.com/api/events/', $payload);

		if (!$res->successful()) {
			Log::error('Klaviyo SMS send failed', [
				'status' => $res->status(),
				'body' => $res->body(),
			]);
			return false;
		}
		Log::info('Klaviyo SMS event sent successfully');
		
		// Track usage after successful SMS
		if ($shop) {
			UsageService::trackUsage($shop->shop, 'send_notification');
		}
		
		return true;
	}

	/**
	 * PRIVATE: Call Iterable Events API to trigger an SMS Flow
	 */
	private function sendIterableSmsEvent(string $apiKey, string $phoneE164, array $profile, array $properties, $shop = null): bool
	{
		if (!$phoneE164) {
			Log::error('Iterable SMS send failed: phone missing');
			return false;
		}

		// Iterable uses a different API structure for SMS
		$payload = [
			'email' => $profile['email'] ?? null,
			'phoneNumber' => $phoneE164,
			'eventName' => 'SMS_Sent',
			'dataFields' => array_merge($properties, [
				'phone_number' => $phoneE164,
				'first_name' => $profile['first_name'] ?? null,
				'last_name' => $profile['last_name'] ?? null,
				'shop' => $properties['shop'] ?? null,
				'wishlist_title' => $properties['wishlist_title'] ?? null,
				'wishlist_link' => $properties['wishlist_link'] ?? null,
			]),
			'campaignId' => null, // You can set a specific campaign ID if needed
			'templateId' => null, // You can set a specific template ID if needed
		];

		Log::info('=== ITERABLE SMS EVENT SENDING ===', [
			'phone' => $phoneE164,
			'event_name' => 'SMS_Sent',
			'profile_email' => $profile['email'] ?? null
		]);

		$res = Http::withHeaders([
			'Api-Key' => $apiKey,
			'Content-Type' => 'application/json'
		])->post('https://api.iterable.com/api/events/track', $payload);

		if (!$res->successful()) {
			Log::error('Iterable SMS send failed', [
				'status' => $res->status(),
				'body' => $res->body(),
			]);
			return false;
		}
		
		Log::info('=== ITERABLE SMS EVENT SENT SUCCESSFULLY ===', [
			'phone' => $phoneE164,
			'response_status' => $res->status()
		]);
		
		// Track usage after successful SMS
		if ($shop) {
			UsageService::trackUsage($shop->shop, 'send_notification');
		}
		
		return true;
	}

	/**
	 * Send sign-up confirmation email when a wishlist is created
	 */
	public function sendSignupConfirmationEmail($customerId, $wishlist, $shop)
	{ 
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Signup confirmation blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try { 
			$emailTemplate = $this->getEmailTemplate($shop->id);
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id);
				if (!$emailTemplate) {
					Log::error('Email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('Customer data not found for customer ID: ' . $customerId);
				return false;
			}
		
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop)
			];

			$mailable = new WishlistSignupConfirmation($customerData, $shopData, $wishlistData, $emailTemplate);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS via provider (e.g., Klaviyo)
			$this->sendSmsEvent($customerId, $shop, 'Wishlist Signup SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			]);

			Log::info('Sign-up confirmation email sent successfully to: ' . $customerData['email']);
			return true;

		} catch (\Exception $e) {
			Log::error('Error sending sign-up confirmation email: ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Send wishlist shared email when a wishlist is shared
	 */
	public function sendWishlistSharedEmail($customerId, $wishlist, $shop)
	{
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Wishlist shared notification blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try {
			$emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_shared');
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_shared');
				if (!$emailTemplate) {
					Log::error('Wishlist shared email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('Customer data not found for customer ID: ' . $customerId);
				return false;
			}
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop)
			];

			$mailable = new \App\Mail\WishlistSharedNotification($customerData, $shopData, $wishlistData, $emailTemplate);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS
			$this->sendSmsEvent($customerId, $shop, 'Wishlist Shared SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			]);
			Log::info('Wishlist shared email sent successfully to: ' . $customerData['email']);
			return true;
		} catch (\Exception $e) {
			Log::error('Error sending wishlist shared email: ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Send wishlist reminder email
	 */
	public function sendWishlistReminderEmail($customerId, $wishlist, $shop)
	{
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Wishlist reminder blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try {
			$emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_reminder');
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id, 'wishlist_reminder');
				if (!$emailTemplate) {
					Log::error('Wishlist reminder email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('Customer data not found for customer ID: ' . $customerId);
				return false;
			}
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop),
				'count' => \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->count(),
			];

			$productData = null;
			try {
				$firstItem = \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)
					->orderBy('id', 'asc')
					->first();
				if ($firstItem) {
					$product = \App\Models\Product::where('shop_id', $shop->id)
						->where('shopify_product_id', $firstItem->product_id)
						->first();
					$title = $product->title ?? '';
					$price = $product->price ?? ($firstItem->current_price ?? '');
					$productUrl = 'https://' . $shop->shop . '/products/' . ($product->handle ?? $firstItem->product_id);
					$productData = [
						'title' => $title,
						'price' => $price,
						'url' => $productUrl,
					];
				}
			} catch (\Exception $e) {
				Log::warning('Could not build product data for wishlist reminder: ' . $e->getMessage());
			}

			$mailable = new \App\Mail\WishlistSharedNotification($customerData, $shopData, $wishlistData, $emailTemplate, $productData);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS
			$this->sendSmsEvent($customerId, $shop, 'Wishlist Reminder SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
				'count' => $wishlistData['count'] ?? null,
				'product' => $productData,
			]);
			Log::info('Wishlist reminder email sent successfully to: ' . $customerData['email']);
			return true;
		} catch (\Exception $e) {
			Log::error('Error sending wishlist reminder email: ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Send saved for later reminder email
	 */
	public function sendSavedForLaterReminderEmail($customerId, $wishlist, $shop)
	{
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Saved for later reminder blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try {
			$emailTemplate = $this->getEmailTemplate($shop->id, 'saved_for_later_reminder');
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id, 'saved_for_later_reminder');
				if (!$emailTemplate) {
					Log::error('Saved for later reminder email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('Customer data not found for customer ID: ' . $customerId);
				return false;
			}
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop),
				'count' => \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->count(),
			];

			$productData = null;
			try {
				$firstItem = \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)
					->orderBy('id', 'asc')
					->first();
				if ($firstItem) {
					$product = \App\Models\Product::where('shop_id', $shop->id)
						->where('shopify_product_id', $firstItem->product_id)
						->first();
					$title = $product->title ?? '';
					$price = $product->price ?? ($firstItem->current_price ?? '');
					$productUrl = 'https://' . $shop->shop . '/products/' . ($product->handle ?? $firstItem->product_id);
					$productData = [
						'title' => $title,
						'price' => $price,
						'url' => $productUrl,
					];
				}
			} catch (\Exception $e) {
				Log::warning('Could not build product data for saved-for-later reminder: ' . $e->getMessage());
			}

			$mailable = new \App\Mail\WishlistSharedNotification($customerData, $shopData, $wishlistData, $emailTemplate, $productData);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS
			$this->sendSmsEvent($customerId, $shop, 'Saved For Later SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
				'count' => $wishlistData['count'] ?? null,
				'product' => $productData,
			]);
			Log::info('Saved for later reminder email sent successfully to: ' . $customerData['email']);
			return true;
		} catch (\Exception $e) {
			Log::error('Error sending saved for later reminder email: ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Send low stock alert email
	 */
	public function sendLowStockAlertEmail($customerId, $wishlist, $shop, $lowStockItems)
	{
		Log::info("=== SENDING LOW STOCK ALERT EMAIL ===");
		Log::info("Customer ID: $customerId, Wishlist ID: {$wishlist->id}, Shop: {$shop->shop}");
		Log::info("Low stock items count: " . count($lowStockItems));
		foreach ($lowStockItems as $index => $item) {
			Log::info("Low stock item $index: ID {$item->id}, Title: {$item->title}, Stock: {$item->stock}");
		}
		
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Low stock alert blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try {
			$emailTemplate = $this->getEmailTemplate($shop->id, 'low_stock_alert');
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id, 'low_stock_alert');
				if (!$emailTemplate) {
					Log::error('❌ Low stock alert email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('❌ Customer data not found for customer ID: ' . $customerId);
				return false;
			}
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'id' => $wishlist->id,
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop),
				'count' => \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->count()
			];

			$mailable = new \App\Mail\LowStockAlert($customerData, $shopData, $wishlistData, $emailTemplate, $lowStockItems);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS
			$this->sendSmsEvent($customerId, $shop, 'Low Stock SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
				'low_stock_count' => is_array($lowStockItems) ? count($lowStockItems) : null,
			]);
			Log::info('✅ Low stock alert email sent successfully to: ' . $customerData['email']);
			return true;
		} catch (\Exception $e) {
			Log::error('❌ Error sending low stock alert email: ' . $e->getMessage());
			Log::error('Exception file: ' . $e->getFile() . ':' . $e->getLine());
			Log::error('Exception trace: ' . $e->getTraceAsString());
			return false;
		}
	}

	/**
	 * Send back-in-stock alert email
	 */
	public function sendBackInStockAlertEmail($customerId, $wishlist, $shop, $backInStockItems)
	{
		Log::info("=== SENDING BACK-IN-STOCK ALERT EMAIL ===");
		Log::info("Customer ID: $customerId, Wishlist ID: {$wishlist->id}, Shop: {$shop->shop}");
		Log::info("Back-in-stock items count: " . count($backInStockItems));
		
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Back-in-stock alert blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try {
			$emailTemplate = $this->getEmailTemplate($shop->id, 'back_in_stock_alert');
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id, 'back_in_stock_alert');
				if (!$emailTemplate) {
					Log::error('❌ Back-in-stock alert email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('❌ Customer data not found for customer ID: ' . $customerId);
				return false;
			}
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop)
			];

			$mailable = new \App\Mail\BackInStockAlert($customerData, $shopData, $wishlistData, $emailTemplate, $backInStockItems);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS
			$this->sendSmsEvent($customerId, $shop, 'Back In Stock SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
				'back_in_stock_count' => is_array($backInStockItems) ? count($backInStockItems) : null,
			]);
			Log::info('✅ Back-in-stock alert email sent successfully to: ' . $customerData['email']);
			return true;
		} catch (\Exception $e) {
			Log::error('❌ Error sending back-in-stock alert email: ' . $e->getMessage());
			Log::error('Exception file: ' . $e->getFile() . ':' . $e->getLine());
			Log::error('Exception trace: ' . $e->getTraceAsString());
			return false;
		}
	}

	/**
	 * Send price drop alert email
	 */
	public function sendPriceDropAlertEmail($customerId, $wishlist, $shop, $priceDropItems)
	{
		Log::info("=== SENDING PRICE DROP ALERT EMAIL ===");
		Log::info("Customer ID: $customerId, Wishlist ID: {$wishlist->id}, Shop: {$shop->shop}");
		foreach ($priceDropItems as $index => $item) {
			Log::info("Price drop item $index: ID {$item->id}, Title: {$item->title}, Old Price: {$item->old_price}, New Price: {$item->price}");
		}
		
		// Check usage limits before sending notification
		if (!$this->isNotificationAllowed($shop)) {
			Log::info("Price drop alert blocked due to usage limit reached for shop: {$shop->shop}");
			return false;
		}
		
		try {
			$emailTemplate = $this->getEmailTemplate($shop->id, 'price_drop_alert');
			if (!$emailTemplate) {
				$subscriptionController = new \App\Http\Controllers\SubscriptionNotificationController();
				$subscriptionController->createDefaultGeneralWebNotifications($shop);
				$emailTemplate = $this->getEmailTemplate($shop->id, 'price_drop_alert');
				if (!$emailTemplate) {
					Log::error('❌ Price drop alert email template not found for shop: ' . $shop->shop);
					return false;
				}
			}
			$customerData = $this->getCustomerData($customerId, $shop);
			if (!$customerData) {
				Log::error('❌ Customer data not found for customer ID: ' . $customerId);
				return false;
			}
			$shopData = $this->getShop($shop);
			$wishlistData = [
				'title' => $wishlist->title,
				'link' => $this->generateWishlistLink($wishlist, $shop)
			];

			$mailable = new \App\Mail\PriceDropAlert($customerData, $shopData, $wishlistData, $emailTemplate, $priceDropItems);
			$this->sendViaSelectedProvider([
				'to' => $customerData['email'],
				'mailable' => $mailable,
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'phone' => $customerData['phone'],
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
			], [], $shop->id, 'email');

			// Trigger SMS
			$this->sendSmsEvent($customerId, $shop, 'Price Drop SMS', [
				'shop' => $shop->shop,
				'wishlist_title' => $wishlistData['title'],
				'wishlist_link' => $wishlistData['link'],
				'price_drop_count' => is_array($priceDropItems) ? count($priceDropItems) : null,
			]);
			Log::info('✅ Price drop alert email sent successfully to: ' . $customerData['email']);
			return true;
		} catch (\Exception $e) {
			Log::error('❌ Error sending price drop alert email: ' . $e->getMessage());
			Log::error('Exception file: ' . $e->getFile() . ':' . $e->getLine());
			Log::error('Exception trace: ' . $e->getTraceAsString());
			return false;
		}
	}

	private function getEmailTemplate($shopId, $notificationType = 'wishlist_signup_confirmation')
	{
		$notification = SubscriptionWebNotification::where('session_id', $shopId)
			->where('notification_type', $notificationType)
			->where('active_status', 1)
			->first();
		if (!$notification) {
			return null;
		}
		$data = json_decode($notification->data, true);
		return $data['customizedata'] ?? null;
	}

	private function getCustomerData($customerId, $shop)
	{   
		$api = $this->shopifyApiClient($shop->shop);
		$query = "{\n            customer(id: \"gid://shopify/Customer/{$customerId}\") {\n                email\n                firstName\n                lastName\n                phone\n            }\n        }";
		$response = $api->graph($query);
		$customer = $response['body']['data']['customer'] ?? null;
		if (!$customer) {
			return null;
		}
		return [
			'first_name' => $customer['firstName'] ?? '',
			'last_name' => $customer['lastName'] ?? '',
			'email' => $customer['email'] ?? '',
			'phone' => $customer['phone'] ?? null,
		];
	}

	private function generateWishlistLink($wishlist, $shop)
	{
		$domain = $shop->shop;
		return "https://{$domain}/a/wishlist/proxy/wishlist?customer_id={$wishlist->customer_id}&wishlist_id={$wishlist->id}";
	}
	
	/**
	 * Convert HTML to plain text while preserving some formatting
	 */
	private function htmlToPlainText(string $html): string
	{
		// Replace line breaks and paragraphs with newlines
		$text = str_replace(["<br>", "<br />", "<br/>"], "\n", $html);
		$text = str_replace(["</p>", "</div>"], "\n\n", $text);
		
		// Remove HTML tags
		$text = strip_tags($text);
		
		// Decode HTML entities
		$text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
		
		// Normalize whitespace
		$text = preg_replace('/\s+/', ' ', $text);
		$text = trim($text);
		
		// Clean up multiple newlines
		$text = preg_replace('/\n{3,}/', "\n\n", $text);
		
		return $text;
	}

	/**
	 * Replace variables in the content with actual values from the message data
	 */
	private function replaceVariablesInContent(string $content, array $message): string
	{
		// Common variable replacements
		$replacements = [
			'{customer_first_name}' => $message['first_name'] ?? '',
			'{customer_last_name}' => $message['last_name'] ?? '',
			'{customer_email}' => $message['to'] ?? '',
			'{shop_name}' => $message['shop'] ?? '',
			'{wishlist_title}' => $message['wishlist_title'] ?? '',
			'{wishlist_link}' => $message['wishlist_link'] ?? '',
			'{customer_name}' => ($message['first_name'] ?? '') . ' ' . ($message['last_name'] ?? ''),
			'{{$email}}' => $message['to'] ?? '',
			'{{$first_name}}' => $message['first_name'] ?? '',
			'{{$last_name}}' => $message['last_name'] ?? '',
			'{{$shop}}' => $message['shop'] ?? '',
			'{{$wishlist_title}}' => $message['wishlist_title'] ?? '',
			'{{$wishlist_link}}' => $message['wishlist_link'] ?? '',
		];
		
		Log::debug('Variable replacement values', [
			'replacements' => $replacements,
			'content_length_before' => strlen($content)
		]);
		
		// Replace all variables in the content
		$content = str_replace(array_keys($replacements), array_values($replacements), $content);
		
		Log::debug('Variable replacement completed', [
			'content_length_after' => strlen($content),
			'variables_replaced' => array_keys($replacements)
		]);
		
		return $content;
	}

	public function shopifyApiClient($shop_name=null){
		if($shop_name){
			$shop = SessionModel::where('shop',$shop_name)->first();
		}else{
			$shop = SessionModel::where('shop',config('shopify.shop_name'))->first();
		}
		$options = new Options();
		$options->setType(true);
		$options->setVersion(env('SHOPIFY_API_VERSION'));
		$options->setApiKey(env('SHOPIFY_API_KEY'));
		$options->setApiSecret(env('SHOPIFY_API_SECRET'));
		$options->setApiPassword($shop->access_token);
		$api = new BasicShopifyAPI($options);
		$api->setSession(new Session($shop->shop));
		return $api;
	}
   public function getShop($request)
    {
    
        $shop = null;
        if ($request) {
            $shop = \App\Models\Session::where('shop', $request->get('shop'))->first();
        }
        if ($shop == null) {
            $shop = \App\Models\Session::first();
        }
        return [
            'shop' => $shop->shop ?? '',
            'name' => $shop->shop ?? 'Our Store',
            'id' => $shop->id ?? null
        ];
    }

	private function yotpoGetAccessToken(string $appKey, string $secret): ?string
	{
		try {
			$res = Http::asJson()->post(self::YOTPO_OAUTH_URL, [
				'app_key' => $appKey,
				'secret' => $secret,
			]);
			if (!$res->successful()) {
				Log::error('Yotpo OAuth failed', ['status' => $res->status(), 'body' => $res->body()]);
				return null;
			}
			return data_get($res->json(), 'access_token');
		} catch (\Exception $e) {
			Log::error('Yotpo OAuth exception', ['error' => $e->getMessage()]);
			return null;
		}
	}

	public function getYotpoAnalyticsSummary(array $settings, string $since, string $until): array
	{
		$appKey = $settings['yotpo_public_key'] ?? env('YOTPO_APP_KEY');
		$secret = $settings['yotpo_private_key'] ?? env('YOTPO_SECRET');
		$token = $appKey && $secret ? $this->yotpoGetAccessToken($appKey, $secret) : null;
		if (!$token || !$appKey) return ['email' => null, 'sms' => null];
		$emailUrl = self::YOTPO_EMAIL_SUMMARY_BASE . $appKey;
		$smsUrl = self::YOTPO_SMS_SUMMARY_BASE . $appKey;
		$emailRes = Http::get($emailUrl, ['token' => $token, 'since' => $since, 'until' => $until]);
		$smsRes = Http::get($smsUrl, ['token' => $token, 'since' => $since, 'until' => $until]);
		return [
			'email' => $emailRes->successful() ? $emailRes->json() : null,
			'sms' => $smsRes->successful() ? $smsRes->json() : null,
		];
	}
}
