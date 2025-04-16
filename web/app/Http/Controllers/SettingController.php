<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SettingController extends Controller
{

    public function Setting(Request $request)
    {
        try {
            $shop = getShop($request->get('shopifySession'));
            if ($shop) {

                $setting=Setting::where('shop_id',$shop->id)->first();
                if($setting){
                    $data = [
                        'data' =>$setting,
                        'success' => true
                    ];
                }else{
                    $data = [
                        'message' =>'No record found',
                        'success' => true
                    ];
                }


            }
        }catch (\Exception $exception){
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }

    public function SaveSetting(Request $request)
    {

        try {
            $shop = getShop($request->get('shopifySession'));
            if ($shop) {

                $setting=Setting::where('shop_id',$shop->id)->first();
                if($setting==null){
                $setting=new Setting();
                }
                $setting->shop_id=$shop->id;
                $setting->type=$request->type;
                $setting->magic_api_key=$request->magic_api_key;
                $setting->deepface_api_key=$request->deepface_api_key;
                $setting->smtp_host=$request->smtp_host;
                $setting->smtp_username=$request->smtp_username;
                $setting->smtp_password=$request->smtp_password;
                $setting->email_from=$request->email_from;
                $setting->from_name=$request->from_name;
                $setting->reply_to=$request->reply_to;
                $setting->smtp_type=$request->smtp_type;
                $setting->smtp_port=$request->smtp_port;
                $setting->subject=$request->subject;
                $setting->save();
                $data = [
                    'message' =>'Setting Save Successfully',
                    'success' => true
                ];
            }
        }catch (\Exception $exception){
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }

    public function test()
    {
        $sourceUrl = 'https://d3tx3wg2jy0sui.cloudfront.net/10027279-9916-47ce-b61d-da186349c6b3.jpg';
        $targetUrl = 'https://blog.api.market/wp-content/uploads/2024/06/Shahrukh_khan.png';

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('DEEPFACESWAP_API_TOKEN'),
        ])
            ->attach(
                'swap[source_resource][file]',
                file_get_contents($sourceUrl),
                'source.jpg'
            )
            ->attach(
                'swap[target_resource][file]',
                file_get_contents($targetUrl),
                'target.jpg'
            )
            ->post('https://deepfaceswap.ai/api/v1/swaps');

        if ($response->successful()) {
            $data = $response->json();
            sleep(6);
            if($data['id']){
                if($data['status']!='completed') {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . env('DEEPFACESWAP_API_TOKEN'),
                    ])->get("https://deepfaceswap.ai/api/v1/swaps/{$data['id']}");

                    if ($response->successful()) {
                        $data = $response->json();
                        return response()->json($data);
                    } else {
                        return response()->json([
                            'error' => 'Failed to fetch swap details',
                            'details' => $response->body(),
                        ], $response->status());
                    }
                }
            }
        } else {
        dd($response->body());
        }
    }

    public function getSwapDetails()
    {
        $id=2149373;
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('DEEPFACESWAP_API_TOKEN'),
        ])->get("https://deepfaceswap.ai/api/v1/swaps/{$id}");

        if ($response->successful()) {
            $data = $response->json();
            return response()->json($data);
        } else {
            return response()->json([
                'error' => 'Failed to fetch swap details',
                'details' => $response->body(),
            ], $response->status());
        }
    }

}
