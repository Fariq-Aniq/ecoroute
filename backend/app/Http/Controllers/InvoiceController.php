<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function generateInvoice($orderId)
    {
        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['error' => 'Order registry node missing'], 404);
        }

        // Compute pricing mechanics directly based on order data matrix
        $distance = floatval($order->distance_km) ?: 10.0;
        $subtotal = $distance * 1.50;

        $condition = strtolower($order->weather_condition);
        $isRaining = str_contains($condition, 'rain') || str_contains($condition, 'thunder') || str_contains($condition, 'storm');
        $weatherSurcharge = $isRaining ? ($subtotal * 0.25) : 0.00;
        
        $totalCost = $subtotal + $weatherSurcharge;

        // Save entry to the MySQL invoices table
        $invoice = Invoice::create([
            'order_id' => $order->id,
            'tracking_number' => $order->tracking_number,
            'recipient_name' => $order->recipient_name,
            'subtotal' => $subtotal,
            'weather_surcharge' => $weatherSurcharge,
            'total_cost' => $totalCost,
            'status' => 'issued'
        ]);

        return response()->json([
            'status' => 'success',
            'invoice' => $invoice
        ]);
    }
}