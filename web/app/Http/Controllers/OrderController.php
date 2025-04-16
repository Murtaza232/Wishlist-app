<?php

namespace App\Http\Controllers;

use App\Mail\SendEmail;
use App\Models\Charge;
use App\Models\LineItem;
use App\Models\Log;
use App\Models\Order;
use App\Models\Plan;
use App\Models\SenderProfile;
use App\Models\Session;
use App\Models\Setting;
use App\Models\Template;
use Carbon\Carbon;
use Gnikyt\BasicShopifyAPI\BasicShopifyAPI;
use Gnikyt\BasicShopifyAPI\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Shopify\Clients\Rest;

class OrderController extends Controller
{

    public function shopifyOrders(){

        $shop=Session::first();
        $client = new Rest($shop->shop,$shop->access_token);

        $response = $client->get('/admin/api/2023-10/orders.json');

        $orders=$response->getDecodedBody();
  ;


            if (count($orders['orders']) > 0) {
                foreach ($orders['orders'] as $order) {
                    $order = json_decode(json_encode($order));
                    $this->singleOrder($order,$shop);
                }
            }

        if (isset($orders['link']['next'])) {

            $this->shopifyOrders($orders['link']['next']);
        }
        return redirect()->back()->with('message', 'Orders Synced Successfully');

    }

    public function singleOrder($order, $shop)
    {

        if($order->financial_status!='refunded' && $order->cancelled_at==null  ) {

            $newOrder = Order::where('shopify_id', $order->id)->where('shop_id', $shop->id)->first();
            if ($newOrder == null) {
                $newOrder = new Order();
            }
            $newOrder->shopify_id = $order->id;
            $newOrder->email = $order->email;
            $newOrder->order_number = $order->name;
            if (isset($order->shipping_address)) {
                $newOrder->shipping_name = $order->shipping_address->name;
                $newOrder->address1 = $order->shipping_address->address1;
                $newOrder->address2 = $order->shipping_address->address2;
                $newOrder->phone = $order->shipping_address->phone;
                $newOrder->city = $order->shipping_address->city;
                $newOrder->zip = $order->shipping_address->zip;
                $newOrder->province = $order->shipping_address->province;
                $newOrder->country = $order->shipping_address->country;
            }
            $newOrder->financial_status = $order->financial_status;
            $newOrder->fulfillment_status = $order->fulfillment_status;
            if (isset($order->customer)) {
                $newOrder->first_name = $order->customer->first_name;
                $newOrder->last_name = $order->customer->last_name;
                $newOrder->customer_phone = $order->customer->phone;
                $newOrder->customer_email = $order->customer->email;
                $newOrder->customer_id = $order->customer->id;
            }
            $newOrder->shopify_created_at = date_create($order->created_at)->format('Y-m-d h:i:s');
            $newOrder->shopify_updated_at = date_create($order->updated_at)->format('Y-m-d h:i:s');
            $newOrder->tags = $order->tags;
            $newOrder->note = $order->note;
            $newOrder->total_price = $order->total_price;
            $newOrder->currency = $order->currency;

            $newOrder->subtotal_price = $order->subtotal_price;
            $newOrder->total_weight = $order->total_weight;
            $newOrder->taxes_included = $order->taxes_included;
            $newOrder->total_tax = $order->total_tax;
            $newOrder->currency = $order->currency;
            $newOrder->total_discounts = $order->total_discounts;
            $newOrder->shop_id = $shop->id;
            $newOrder->save();




            foreach ($order->line_items as $item) {

                $new_line = Lineitem::where('shopify_id', $item->id)->where('order_id', $newOrder->id)->where('shop_id', $shop->id)->first();
                if ($new_line == null) {
                    $new_line = new Lineitem();
                }
                $new_line->shopify_id=$item->id;
                $new_line->shopify_product_id = $item->product_id;
                $new_line->shopify_variant_id = $item->variant_id;
                $new_line->title = $item->title;
                $new_line->quantity = $item->quantity;
                $new_line->sku = $item->sku;
                $new_line->variant_title = $item->variant_title;
                $new_line->title = $item->title;
                $new_line->vendor = $item->vendor;
                $new_line->price = $item->price;
                $new_line->requires_shipping = $item->requires_shipping;
                $new_line->taxable = $item->taxable;
                $new_line->name = $item->name;
                $new_line->properties = json_encode($item->properties, true);
                $new_line->fulfillable_quantity = $item->fulfillable_quantity;
                $new_line->fulfillment_status = $item->fulfillment_status;
                $new_line->order_id = $newOrder->id;
                $new_line->shop_id = $shop->id;
                $new_line->shopify_order_id = $order->id;
                $new_line->save();
            }
        }
    }


    public function SendMail($dun_builder_detail)
    {
        $user = Session::first();
        $order=Order::first();

        $mail_smtp = Setting::where('shop_id', $user->id)->first();
        if ($mail_smtp) {

            Config::set('mail.mailers.smtp.host', isset($mail_smtp->smtp_host) ? ($mail_smtp->smtp_host) : env('MAIL_HOST'));
            Config::set('mail.mailers.smtp.port', isset($mail_smtp->smtp_port) ? ($mail_smtp->smtp_port) : env('MAIL_PORT'));
            Config::set('mail.mailers.smtp.username', isset($mail_smtp->smtp_username) ? ($mail_smtp->smtp_username) : env('MAIL_USERNAME'));
            Config::set('mail.mailers.smtp.password', isset($mail_smtp->smtp_password) ? ($mail_smtp->smtp_password) : env('MAIL_PASSWORD'));
            Config::set('mail.from.address', isset($mail_smtp->email_from) ? ($mail_smtp->email_from) : env('MAIL_FROM_ADDRESS'));
            Config::set('mail.from.name', isset($mail_smtp->from_name) ? ($mail_smtp->from_name) : 'Dun wall');


            $details['to'] = 'zain.irfan4442@gmail.com';
            $details['order_number'] = $order->order_number;
            $details['customer_name'] = $order->shipping_name;

            if ($dun_builder_detail->email) {
                try {
                    Mail::to('zain.irfan4442@gmail.com')->send(new SendEmail($details));
                    $dun_builder_detail->is_email_failed = 0;
                    $dun_builder_detail->email_error = null;
                    $dun_builder_detail->save();
                } catch (\Exception $exception) {
                    dd($exception->getMessage());
                    $dun_builder_detail->is_email_failed = 1;
                    $dun_builder_detail->email_error = json_encode($exception->getMessage());
                    $dun_builder_detail->save();
                    throw $exception;
                }

            }

        }
    }

}
