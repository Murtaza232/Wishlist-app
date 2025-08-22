<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FrequentlyWishlistedService;
use App\Models\FrequentlyWishlistedAlert;

class FrequentlyWishlistedController extends HelperController
{
    public function getConfig(Request $request)
    {
        $session = $this->getShop($request);
        if (!$session) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);
        $config = app(FrequentlyWishlistedService::class)->ensureConfig($session);
        return response()->json(['success' => true, 'data' => $config]);
    }

    public function saveConfig(Request $request)
    {
        $session = $this->getShop($request);
        if (!$session) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);
        $request->validate([
            'active_status' => 'boolean',
            'threshold' => 'integer|min:1|max:1000',
        ]);
        $config = FrequentlyWishlistedAlert::firstOrCreate(['session_id' => $session->id]);
        if ($request->has('active_status')) $config->active_status = (bool)$request->input('active_status');
        if ($request->has('threshold')) $config->threshold = (int)$request->input('threshold');
        $config->save();
        return response()->json(['success' => true, 'data' => $config]);
    }

    public function runNow(Request $request)
    {
        $session = $this->getShop($request);
        if (!$session) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);
        $result = app(FrequentlyWishlistedService::class)->run($session);
        return response()->json($result);
    }
}


