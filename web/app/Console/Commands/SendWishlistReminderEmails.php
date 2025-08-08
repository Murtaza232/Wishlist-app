<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Wishlist;
use App\Models\WishlistFeature;
use App\Models\Session;
use App\Models\SubscriptionWebNotification;
use App\Services\WishlistNotificationService;
use Carbon\Carbon;

class SendWishlistReminderEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wishlist:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send wishlist reminder emails to customers after the configured number of days.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $now = Carbon::now();
        $this->info('Starting wishlist reminder email process at ' . $now);
        $shops = Session::all();
        $notificationService = new WishlistNotificationService();
        foreach ($shops as $shop) {
            $this->info('Processing shop: ' . $shop->shop . ' (ID: ' . $shop->id . ')');
            // --- Wishlist Reminder ---
            $reminder = SubscriptionWebNotification::where('session_id', $shop->id)
                ->where('notification_type', 'wishlist_reminder')
                ->where('active_status', 1)
                ->first();
            if ($reminder) {
                $reminderTime = $reminder->reminder_value ?? 0;
                $reminderUnit = $reminder->reminder_time_unit ?? 'days';
                $this->info("  Wishlist Reminder time: $reminderTime $reminderUnit");
                if ($reminderTime > 0) {
                    $wishlists = Wishlist::where('shop_id', $shop->id)->get();
                    $this->info('  Found ' . $wishlists->count() . ' wishlists for this shop.');
                    foreach ($wishlists as $wishlist) {
                        $created = Carbon::parse($wishlist->created_at);
                        $shouldSend = false;
                        switch ($reminderUnit) {
                            case 'days':
                                $shouldSend = $created->copy()->addDays($reminderTime)->lessThanOrEqualTo($now);
                                break;
                            case 'hours':
                                $shouldSend = $created->copy()->addHours($reminderTime)->lessThanOrEqualTo($now);
                                break;
                            case 'minutes':
                                $shouldSend = $created->copy()->addMinutes($reminderTime)->lessThanOrEqualTo($now);
                                break;
                            default:
                                $shouldSend = $created->copy()->addDays($reminderTime)->lessThanOrEqualTo($now);
                                break;
                        }
                        $this->info('    Wishlist ID: ' . $wishlist->id . ' | Created at: ' . $created . ' | Should send: ' . ($shouldSend ? 'YES' : 'NO'));
                        if ($shouldSend) {
                            $result = $notificationService->sendWishlistReminderEmail($wishlist->customer_id, $wishlist, $shop);
                            $this->info('      Email send result: ' . ($result ? 'SUCCESS' : 'FAIL'));
                        }
                    }
                } else {
                    $this->info('  Wishlist reminder time is not set or zero. Skipping.');
                }
            } else {
                $this->info('  No active wishlist reminder notification for this shop. Skipping.');
            }
            // --- Saved For Later Reminder ---
            $savedForLater = SubscriptionWebNotification::where('session_id', $shop->id)
                ->where('notification_type', 'saved_for_later_reminder')
                ->where('active_status', 1)
                ->first();
            if ($savedForLater) {
                $reminderTime = $savedForLater->saved_for_later_value ?? 0;
                $reminderUnit = $savedForLater->saved_for_later_time_unit ?? 'days';
                $this->info("  Saved For Later Reminder time: $reminderTime $reminderUnit");
                if ($reminderTime > 0) {
                    $wishlists = Wishlist::where('shop_id', $shop->id)->get();
                    $this->info('  Found ' . $wishlists->count() . ' wishlists for this shop.');
                    foreach ($wishlists as $wishlist) {
                        $created = Carbon::parse($wishlist->created_at);
                        $shouldSend = false;
                        switch ($reminderUnit) {
                            case 'days':
                                $shouldSend = $created->copy()->addDays($reminderTime)->lessThanOrEqualTo($now);
                                break;
                            case 'hours':
                                $shouldSend = $created->copy()->addHours($reminderTime)->lessThanOrEqualTo($now);
                                break;
                            case 'minutes':
                                $shouldSend = $created->copy()->addMinutes($reminderTime)->lessThanOrEqualTo($now);
                                break;
                            default:
                                $shouldSend = $created->copy()->addDays($reminderTime)->lessThanOrEqualTo($now);
                                break;
                        }
                        $this->info('    Wishlist ID: ' . $wishlist->id . ' | Created at: ' . $created . ' | Should send (saved for later): ' . ($shouldSend ? 'YES' : 'NO'));
                        if ($shouldSend) {
                            $result = $notificationService->sendSavedForLaterReminderEmail($wishlist->customer_id, $wishlist, $shop);
                            $this->info('      Saved for later email send result: ' . ($result ? 'SUCCESS' : 'FAIL'));
                        }
                    }
                } else {
                    $this->info('  Saved for later reminder time is not set or zero. Skipping.');
                }
            } else {
                $this->info('  No active saved for later reminder notification for this shop. Skipping.');
            }
            // --- Low Stock Alert ---
            $lowStockAlert = SubscriptionWebNotification::where('session_id', $shop->id)
                ->where('notification_type', 'low_stock_alert')
                ->where('active_status', 1)
                ->first();
            if ($lowStockAlert) {
                $threshold = $lowStockAlert->low_stock_value ?? 0;
                $this->info("  Low Stock Alert threshold: $threshold");
                if ($threshold > 0) {
                    $wishlists = Wishlist::where('shop_id', $shop->id)->get();
                    $this->info('  Found ' . $wishlists->count() . ' wishlists for this shop.');
                    foreach ($wishlists as $wishlist) {
                        // For each wishlist, check if any item is below the threshold
                        $lowStockItems = [];
                        $items = \App\Models\WishlistItem::where('wishlist_id', $wishlist->id)->get();
                        foreach ($items as $item) {
                            // Assume there is a product model with stock info, e.g., Product::find($item->product_id)->stock
                            $product = \App\Models\Product::find($item->product_id);
                            if ($product && isset($product->stock) && $product->stock <= $threshold) {
                                $lowStockItems[] = $product;
                            }
                        }
                        $this->info('    Wishlist ID: ' . $wishlist->id . ' | Low stock items: ' . count($lowStockItems));
                        if (count($lowStockItems) > 0) {
                            $result = $notificationService->sendLowStockAlertEmail($wishlist->customer_id, $wishlist, $shop, $lowStockItems);
                            $this->info('      Low stock alert email send result: ' . ($result ? 'SUCCESS' : 'FAIL'));
                        }
                    }
                } else {
                    $this->info('  Low stock alert threshold is not set or zero. Skipping.');
                }
            } else {
                $this->info('  No active low stock alert notification for this shop. Skipping.');
            }
        }
        $this->info('Wishlist reminder emails process complete.');
        return 0;
    }
}
