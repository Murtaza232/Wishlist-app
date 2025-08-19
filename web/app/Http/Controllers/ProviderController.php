<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificationProvider;

class ProviderController extends HelperController
{
    public function get(Request $request)
    {
        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['error' => 'Shop domain is required.'], 400);
        }
        $provider = NotificationProvider::where('session_id', $session->id)->first();
        return response()->json([
            'email_provider' => $provider->email_provider ?? null,
            'sms_provider' => $provider->sms_provider ?? null,
            'provider_settings' => $provider && $provider->provider_settings ? json_decode($provider->provider_settings, true) : null,
        ]);
    }

    public function save(Request $request)
    {
        $session = $this->getShop($request);
        if (!$session) {
            return response()->json(['error' => 'Shop domain is required.'], 400);
        }
        $data = $request->validate([
            'email_provider' => 'nullable|string|max:100',
            'sms_provider' => 'nullable|string|max:100',
            'provider_settings' => 'nullable|array',
        ]);
        if (isset($data['provider_settings'])) {
            $data['provider_settings'] = json_encode($data['provider_settings']);
        }
        $provider = NotificationProvider::firstOrCreate(['session_id' => $session->id]);
        $provider->update($data);
        return response()->json(['success' => true]);
    }
} 