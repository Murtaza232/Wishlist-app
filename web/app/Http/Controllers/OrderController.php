<?php

namespace App\Http\Controllers;

use App\Mail\SendEmail;
use App\Models\Charge;
use App\Models\ImagesSwap;
use App\Models\Lineitem;
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
use SebastianBergmann\Diff\Line;
use Shopify\Clients\Rest;

class OrderController extends Controller
{

    public function shopifyOrders(){

        $shop=Session::find(2);
        $client = new Rest($shop->shop,$shop->access_token);

        $response = $client->get('/admin/api/2023-10/orders.json');

        $orders=$response->getDecodedBody();



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

            $imageUrls = [];
            foreach ($order->line_items as $index=> $item) {
                $new_line = Lineitem::where('shopify_id', $item->id)->where('order_id', $newOrder->id)->where('shop_id', $shop->id)->first();
                if ($new_line == null) {
                    $new_line = new Lineitem();
                }
                $new_line->line_item_index=++$index;
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

                $mediaId = null;
                $type = null;
                foreach ($item->properties as $property) {
                    if ($property->name == '_media_id' && !empty($property->value)) {
                        $mediaId = $property->value;
                    }

                    if ($property->name == 'Types' && $property->value == 'Digital Image (Print Yourself) - Instant Delivery') {
                        $type = $property->value;
                    }
                }

                if ($mediaId && $type) {
                    // Check if the media already exists in the database
                    $media = ImagesSwap::where('media_id', $mediaId)->first();

                    $new_line->media_id=$mediaId;
                    $new_line->save();
                    // If the media exists and has a swapped image without watermark
                    if ($media && $media->swapped_image_without_water_mark) {
                        // Fetch the existing swapped image URL
                        $imageUrl = "https://feenchlet.com/a/art/media/{$mediaId}";

                        // Upscale the existing swapped image
                        $upscaledImageUrl = $this->UpscaleImage($media->swapped_image_without_water_mark);

                        // If the image is successfully upscaled
                        if ($upscaledImageUrl) {
                            // Save the upscaled image to the server
                            $savedImagePath = $this->saveUpscaledImage($upscaledImageUrl);

                            // If the image is saved successfully
                            if ($savedImagePath) {
                                // Update the media record with the path of the upscaled image
                                $media->upscale_image = $savedImagePath;
                                $media->save();  // Save the updated media record

                                $imageUrls[] = [
                                    'title' => $item->title,
                                    'url' => $imageUrl,
                                    'src'=>$savedImagePath
                                ];
                            }else{
                                $imageUrls[] = [
                                    'title' => $item->title,
                                    'url' => $imageUrl,
                                    'src'=>''
                                ];
                            }


                        }
                    }
                }

            }
            if(count($imageUrls) > 0) {
                $this->SendMail($imageUrls, $newOrder);
            }
        }
    }


    public function saveUpscaledImage($upscaledImageUrl)
    {
        try {
            // Download the image
            $imageContents = file_get_contents($upscaledImageUrl);

            // Generate a unique file name
            $fileName = 'arttransformers_upscaled_' . uniqid() . '.jpeg'; // You can use a different extension if needed

            // Define the path to save the image in the 'public/images' folder
            $publicPath = public_path('upscaleimage/' . $fileName);

            // Save the image to the 'public' folder
            file_put_contents($publicPath, $imageContents);

            // Return the relative path to the image (this will be publicly accessible)
            return url('upscaleimage/' . $fileName); // Return the relative path that can be accessed publicly
        } catch (\Exception $exception) {
            // Handle error (log the error or return null)
            return null;
        }
    }


    public function bye(Request $request)
    {
        $mediaId=$request->input('media_id');
        $media=ImagesSwap::where('media_id', $mediaId)->first();
        $newOrder=Order::first();
        $mediaId = null;
        $type = null;
        $line_items=Lineitem::where('order_id', $newOrder->id)->get();

        foreach ($line_items as $item) {
            $mediaId=null;
            $type=null;
            $properties = json_decode($item->properties, true);
            foreach ($properties as $property) {
                if ($property['name'] == 'media_id' && !empty($property['value'])) {
                    $mediaId = $property['value'];
                }

                if ($property['name'] == 'type' && $property['value'] == 'Digital Image ( Print Yourself ) - 24H Delivery') {
                    $type = $property['value'];
                }
            }


            if ($mediaId && $type) {
                // Check if the media already exists in the database
                $media = ImagesSwap::where('media_id', $mediaId)->first();

                // If the media exists and has a swapped image without watermark
                if ($media && $media->swapped_image_without_water_mark) {
                    $imageUrl = "https://feenchlet.com/a/art/show-image/{$mediaId}";
                    if ($media->upscale_image == null){
                        // Fetch the existing swapped image URL


                    // Upscale the existing swapped image
                    $upscaledImageUrl = $this->UpscaleImage($media->swapped_image_without_water_mark);

                    // If the image is successfully upscaled
                    if ($upscaledImageUrl) {
                        // Save the upscaled image to the server
                        $savedImagePath = $this->saveUpscaledImage($upscaledImageUrl);

                        // If the image is saved successfully
                        if ($savedImagePath) {
                            // Update the media record with the path of the upscaled image
                            $media->upscale_image = $savedImagePath;
                            $media->save();  // Save the updated media record

                            $imageUrls[] = [
                                'title' => $item->title,
                                'url' => $imageUrl,
                                'src' => $savedImagePath
                            ];
                        } else {
                            $imageUrls[] = [
                                'title' => $item->title,
                                'url' => $imageUrl,
                                'src' => ''
                            ];
                        }


                    }
                }else{
                        $imageUrls[] = [
                            'title' => $item->title,
                            'url' => $imageUrl,
                            'src' => $media->upscale_image
                        ];
                    }
                }
            }
        }
        $this->SendMail($imageUrls,$newOrder);
    }
    public function SendMail($imageUrls, $order)
    {
        $user = Session::first();
        $mail_smtp = Setting::where('shop_id', $user->id)->first();

        if ($mail_smtp && $mail_smtp->email_notification==1) {
            Config::set('mail.mailers.smtp.host', isset($mail_smtp->smtp_host) ? ($mail_smtp->smtp_host) : env('MAIL_HOST'));
            Config::set('mail.mailers.smtp.port', isset($mail_smtp->smtp_port) ? ($mail_smtp->smtp_port) : env('MAIL_PORT'));
            Config::set('mail.mailers.smtp.username', isset($mail_smtp->smtp_username) ? ($mail_smtp->smtp_username) : env('MAIL_USERNAME'));
            Config::set('mail.mailers.smtp.password', isset($mail_smtp->smtp_password) ? ($mail_smtp->smtp_password) : env('MAIL_PASSWORD'));
            Config::set('mail.from.address', isset($mail_smtp->email_from) ? ($mail_smtp->email_from) : env('MAIL_FROM_ADDRESS'));
            Config::set('mail.from.name', isset($mail_smtp->from_name) ? ($mail_smtp->from_name) : 'Dun wall');

            // Upscale the image and get the upscaled URL
            $upscaledImageUrls = [];


            $details['to'] = 'zain.irfan4442@gmail.com';
            $details['order_number'] = $order->order_number;
            $details['customer_name'] = $order->shipping_name;
            $details['imageUrls'] = $imageUrls;


            $details['subject'] = $mail_smtp->subject;

            if ($order->email) {
                try {
                    Mail::to('zain.irfan4442@gmail.com')->send(new SendEmail($details));
                    $order->email_sent=1;
                    $order->is_email_failed=0;
                    $order->save();
                } catch (\Exception $exception) {
                    // Handle the error, log or rethrow as needed
                    $order->email_sent=0;
                    $order->is_email_failed=1;
                    $order->email_error=json_encode($exception->getMessage());
                    $order->save();

                }
            }
        }
    }


    public function UpscaleImage($imageUrl)
    {
    $setting=Setting::first();
        // API endpoint and your API key
        $url = 'https://api.claid.ai/v1-beta1/image/edit';
        $apiKey = $setting->letsenhance_api_key;  // Replace with your actual API key


        [$originalWidth, $originalHeight] = getimagesize($imageUrl);

        // Determine orientation and calculate target dimensions
        if ($originalWidth >= $originalHeight) {
            // Horizontal image: height should be 4000
            $targetHeight = 4000;
            $targetWidth = intval(($originalWidth / $originalHeight) * 4000);
        } else {
            // Vertical image: width should be 4000
            $targetWidth = 4000;
            $targetHeight = intval(($originalHeight / $originalWidth) * 4000);
        }

        // Request body data
        $data = [
            "input" => $imageUrl,  // Dynamically pass the image URL here
            "operations" => [
                "resizing" => [
                    "width" => $targetWidth,
                    "height" => $targetHeight,
//                    "fit" => $setting->fit
                ],
                "adjustments" => [
                    "hdr" => $setting->hdr,
                ]
            ],
            "output" => [
                "format" => [
                    "type" => $setting->format_type,
                    "quality" => $setting->quality
                ]
            ]
        ];

        // Make the POST request
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post($url, $data);

        // Check for success
        if ($response->successful()) {
            $responseData = $response->json();
            return $responseData['data']['output']['tmp_url'] ?? null;  // Return the URL of the upscaled image
        } else {
            // Handle the error
            return null;
        }
    }


}
