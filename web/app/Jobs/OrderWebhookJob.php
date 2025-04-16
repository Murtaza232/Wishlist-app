<?php

namespace App\Jobs;


use App\Http\Controllers\OrderController;
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


class OrderWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 10000000000;
    protected $order;
    protected $shop;


    /**
     * Create a new job instance.
     *
     * @return void
     */

    public function __construct($order,$shop)
    {
        $this->order = $order;
        $this->shop = $shop;
    }


    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $order=$this->order;
        $shop=$this->shop;
      $ordercontroller = new OrderController();
      $ordercontroller->singleOrder($order,$shop);
    }


}
