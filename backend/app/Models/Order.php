<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    // Allows fields to accept incoming form data safely
    protected $fillable = [
        'tracking_number', 
        'recipient_name', 
        'destination_address', 
        'status',
        'latitude',
        'longitude',
        'weather_condition',
        'distance_km'
    ];
}