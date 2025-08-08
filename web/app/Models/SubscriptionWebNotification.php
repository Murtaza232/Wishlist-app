<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionWebNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'notification_id',
        'notification_type',
        'email_type',
        'title',
        'description',
        'allowSectionData',
        'data',
        'logo',
        'active_status',
        'priority',
        'reminder_value',
        'reminder_time_unit',
        'saved_for_later_value',
        'saved_for_later_time_unit',
        'low_stock_value',
        'price_drop_value'
    ];
}
