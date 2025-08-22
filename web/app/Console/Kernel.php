<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SendWishlistReminderEmailsJob;
use App\Jobs\StockMonitoringJob;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        
        // Dispatch the wishlist reminder job every 30 minutes
        $schedule->job(new SendWishlistReminderEmailsJob())
            ->name('wishlist-reminders')
            ->everyThirtyMinutes()
            ->withoutOverlapping(30); // Prevent overlapping for 30 minutes
            
        // Dispatch the stock monitoring job every hour
        $schedule->job(new StockMonitoringJob())
            ->hourly()
            ->name('stock-monitoring')
            ->withoutOverlapping(60);

        // Run trending wishlist emails daily at 9am
        $schedule->call(function () {
            try {
                $sessions = \App\Models\Session::all();
                $svc = app(\App\Services\FrequentlyWishlistedService::class);
                foreach ($sessions as $s) {
                    $svc->run($s);
                }
            } catch (\Throwable $e) {
                \Log::error('FrequentlyWishlisted schedule failed', ['error' => $e->getMessage()]);
            }
        })->dailyAt('09:00');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
