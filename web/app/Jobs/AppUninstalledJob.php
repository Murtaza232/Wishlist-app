<?php

namespace App\Jobs;


use App\Http\Controllers\OrderController;
use App\Http\Controllers\SenderProfileController;
use App\Http\Controllers\TemplateController;
use App\Models\Log;
use App\Models\WebhookLog;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;


class AppUninstalledJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 10000000000;

    protected $shop_id;


    /**
     * Create a new job instance.
     *
     * @return void
     */

    public function __construct($shop_id)
    {
        $this->shop_id = $shop_id;
    }


    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {

        $shop_id=$this->shop_id;
      $sender_profile_controller = new SenderProfileController();
      $template_controller = new TemplateController();
      $sender_profile_controller->DeleteSenderProfileQueueJob($shop_id);
        $template_controller->DeleteTemplateQueueJob($shop_id);


        \App\Models\Order::where('shop_id',$shop_id)->delete();
        \App\Models\Charge::where('shop_id',$shop_id)->delete();
        \App\Models\LineItem::where('shop_id',$shop_id)->delete();
        \App\Models\Log::where('shop_id',$shop_id)->delete();
        \App\Models\SenderProfile::where('shop_id',$shop_id)->where('type','default')->delete();
        \App\Models\Template::where('shop_id',$shop_id)->where('type','default')->delete();


    }


}
