<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Wishlist;
use App\Models\Session;
use App\Models\SubscriptionWebNotification;
use App\Services\WishlistNotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendWishlistReminderEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $now = Carbon::now();
        Log::info('Starting wishlist reminder email job at ' . $now);
        
        $shops = Session::all();
        $notificationService = new WishlistNotificationService();
        $totalProcessed = 0;
        
        foreach ($shops as $shop) {
            Log::info('Processing shop: ' . $shop->shop . ' (ID: ' . $shop->id . ')');
            
            // Process Wishlist Reminder
            $this->processWishlistReminders($shop, $notificationService, $now);
            
            // Process Saved For Later Reminder
            $this->processSavedForLaterReminders($shop, $notificationService, $now);
            
            // Process Low Stock Alert
            $this->processLowStockAlerts($shop, $notificationService, $now);
            
            $totalProcessed++;
        }
        
        Log::info("Wishlist reminder email job completed. Processed $totalProcessed shops.");
    }

    /**
     * Process wishlist reminders for a shop
     *
     * @param Session $shop
     * @param WishlistNotificationService $notificationService
     * @param Carbon $now
     * @return void
     */
    private function processWishlistReminders(Session $shop, WishlistNotificationService $notificationService, Carbon $now)
    {
        $reminder = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'wishlist_reminder')
            ->where('active_status', 1)
            ->first();

        if (!$reminder) {
            Log::info("No active wishlist reminder notification for shop: {$shop->shop}");
            return;
        }

        $reminderTime = $reminder->reminder_value ?? 0;
        $reminderUnit = $reminder->reminder_time_unit ?? 'days';

        if ($reminderTime <= 0) {
            Log::info("Wishlist reminder time is not set or zero for shop: {$shop->shop}");
            return;
        }

        Log::info("Processing wishlist reminders for shop: {$shop->shop} (time: $reminderTime $reminderUnit)");

        $wishlists = Wishlist::where('shop_id', $shop->id)->get();
        $sentCount = 0;

        foreach ($wishlists as $wishlist) {
            $created = Carbon::parse($wishlist->created_at);
            $shouldSend = $this->shouldSendReminder($created, $reminderTime, $reminderUnit, $now);

            if ($shouldSend) {
                $result = $notificationService->sendWishlistReminderEmail($wishlist->customer_id, $wishlist, $shop);
                if ($result) {
                    $sentCount++;
                    Log::info("Sent wishlist reminder email for wishlist ID: {$wishlist->id}");
                } else {
                    Log::error("Failed to send wishlist reminder email for wishlist ID: {$wishlist->id}");
                }
            }
        }

        Log::info("Sent $sentCount wishlist reminder emails for shop: {$shop->shop}");
    }

    /**
     * Process saved for later reminders for a shop
     *
     * @param Session $shop
     * @param WishlistNotificationService $notificationService
     * @param Carbon $now
     * @return void
     */
    private function processSavedForLaterReminders(Session $shop, WishlistNotificationService $notificationService, Carbon $now)
    {
        $savedForLater = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'saved_for_later_reminder')
            ->where('active_status', 1)
            ->first();

        if (!$savedForLater) {
            Log::info("No active saved for later reminder notification for shop: {$shop->shop}");
            return;
        }

        $reminderTime = $savedForLater->saved_for_later_value ?? 0;
        $reminderUnit = $savedForLater->saved_for_later_time_unit ?? 'days';

        if ($reminderTime <= 0) {
            Log::info("Saved for later reminder time is not set or zero for shop: {$shop->shop}");
            return;
        }

        Log::info("Processing saved for later reminders for shop: {$shop->shop} (time: $reminderTime $reminderUnit)");

        $wishlists = Wishlist::where('shop_id', $shop->id)->get();
        $sentCount = 0;

        foreach ($wishlists as $wishlist) {
            $created = Carbon::parse($wishlist->created_at);
            $shouldSend = $this->shouldSendReminder($created, $reminderTime, $reminderUnit, $now);

            if ($shouldSend) {
                $result = $notificationService->sendSavedForLaterReminderEmail($wishlist->customer_id, $wishlist, $shop);
                if ($result) {
                    $sentCount++;
                    Log::info("Sent saved for later reminder email for wishlist ID: {$wishlist->id}");
                } else {
                    Log::error("Failed to send saved for later reminder email for wishlist ID: {$wishlist->id}");
                }
            }
        }

        Log::info("Sent $sentCount saved for later reminder emails for shop: {$shop->shop}");
    }

    /**
     * Process low stock alerts for a shop
     *
     * @param Session $shop
     * @param WishlistNotificationService $notificationService
     * @param Carbon $now
     * @return void
     */
    private function processLowStockAlerts(Session $shop, WishlistNotificationService $notificationService, Carbon $now)
    {
        $lowStockAlert = SubscriptionWebNotification::where('session_id', $shop->id)
            ->where('notification_type', 'low_stock_alert')
            ->where('active_status', 1)
            ->first();

        if (!$lowStockAlert) {
            Log::info("No active low stock alert notification for shop: {$shop->shop}");
            return;
        }

        $threshold = $lowStockAlert->low_stock_value ?? 0;

        if ($threshold <= 0) {
            Log::info("Low stock alert threshold is not set or zero for shop: {$shop->shop}");
            return;
        }

        Log::info("Processing low stock alerts for shop: {$shop->shop} (threshold: $threshold)");

        $wishlists = Wishlist::where('shop_id', $shop->id)->get();
        $sentCount = 0;

        foreach ($wishlists as $wishlist) {
            $lowStockItems = [];
            $items = \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->get();
            
            foreach ($items as $item) {
                $product = \App\Models\Product::find($item->product_id);
                if ($product && isset($product->stock) && $product->stock <= $threshold) {
                    $lowStockItems[] = $product;
                }
            }

            if (count($lowStockItems) > 0) {
                $result = $notificationService->sendLowStockAlertEmail($wishlist->customer_id, $wishlist, $shop, $lowStockItems);
                if ($result) {
                    $sentCount++;
                    Log::info("Sent low stock alert email for wishlist ID: {$wishlist->id} with " . count($lowStockItems) . " low stock items");
                } else {
                    Log::error("Failed to send low stock alert email for wishlist ID: {$wishlist->id}");
                }
            }
        }

        Log::info("Sent $sentCount low stock alert emails for shop: {$shop->shop}");
    }

    /**
     * Determine if a reminder should be sent based on creation time and reminder settings
     *
     * @param Carbon $created
     * @param int $reminderTime
     * @param string $reminderUnit
     * @param Carbon $now
     * @return bool
     */
    private function shouldSendReminder(Carbon $created, int $reminderTime, string $reminderUnit, Carbon $now): bool
    {
        $reminderDate = match ($reminderUnit) {
            'days' => $created->copy()->addDays($reminderTime),
            'hours' => $created->copy()->addHours($reminderTime),
            'minutes' => $created->copy()->addMinutes($reminderTime),
            default => $created->copy()->addDays($reminderTime),
        };

        return $reminderDate->lessThanOrEqualTo($now);
    }
} 