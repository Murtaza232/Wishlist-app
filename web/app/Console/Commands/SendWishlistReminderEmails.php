<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SendWishlistReminderEmailsJob;

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
        $this->info('Dispatching wishlist reminder emails job...');
        
        // Dispatch the job
        SendWishlistReminderEmailsJob::dispatch();
        
        $this->info('Wishlist reminder emails job has been dispatched successfully.');
        return 0;
    }
}
