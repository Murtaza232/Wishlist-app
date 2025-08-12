<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'installed_at' => 'datetime',
    ];

    public function wishlistConfigurations()
    {
        return $this->hasMany(WishlistConfiguration::class);
    }

    public function wishlistFeatures()
    {
        return $this->hasMany(WishlistFeature::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class, 'shop_id');
    }

    /**
     * Set the installation timestamp
     */
    public function markAsInstalled(): void
    {
        if (!$this->installed_at) {
            $this->update(['installed_at' => now()]);
        }
    }

    /**
     * Get the installation date in a readable format
     */
    public function getInstallationDateAttribute(): string
    {
        return $this->installed_at ? $this->installed_at->format('M j, Y \a\t g:i A') : 'Unknown';
    }
}
