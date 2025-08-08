<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LanguageSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'language_name',
        'language_data',
        'is_active',
        'is_custom'
    ];

    protected $casts = [
        'language_data' => 'array',
        'is_active' => 'boolean',
        'is_custom' => 'boolean'
    ];

    /**
     * Get the active language for a shop
     */
    public static function getActiveLanguage($shopId)
    {
        return self::where('shop_id', $shopId)
                   ->where('is_active', true)
                   ->first();
    }

    /**
     * Get all languages for a shop
     */
    public static function getLanguagesForShop($shopId)
    {
        return self::where('shop_id', $shopId)->get();
    }

    /**
     * Set a language as active for a shop
     */
    public static function setActiveLanguage($shopId, $languageName)
    {
        // Deactivate all languages for this shop
        self::where('shop_id', $shopId)
            ->update(['is_active' => false]);

        // Activate the specified language
        return self::where('shop_id', $shopId)
                   ->where('language_name', $languageName)
                   ->update(['is_active' => true]);
    }

    /**
     * Create or update language data
     */
    public static function createOrUpdateLanguage($shopId, $languageName, $languageData, $isCustom = false, $isActive = false)
    {
        $language = self::updateOrCreate(
            [
                'shop_id' => $shopId,
                'language_name' => $languageName
            ],
            [
                'language_data' => $languageData,
                'is_custom' => $isCustom,
                'is_active' => $isActive
            ]
        );
    
        // If this language is being set as active, deactivate all other languages
        if ($isActive) {
            self::where('shop_id', $shopId)
                ->where('language_name', '!=', $languageName)
                ->update(['is_active' => false]);
        }
    
        return $language;
    }
} 