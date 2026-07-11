<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'tracking_number',
        'recipient_name',
        'subtotal',
        'weather_surcharge',
        'total_cost',
        'status'
    ];
}