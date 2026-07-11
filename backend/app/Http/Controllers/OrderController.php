<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Order; // Ensure you have an Order model or create one using 'php artisan make:model Order'

class OrderController extends Controller
{
    public function storeAndOptimize(Request $request)
    {
        // 1. Validate form data from React UI
        $request->validate([
            'recipient_name' => 'required|string',
            'destination_address' => 'required|string',
        ]);

        $address = $request->destination_address;

        // 2. Call Google Geocoding/Maps API to get Lat/Lng coordinates
        $googleResponse = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $address,
            'key' => env('GOOGLE_MAPS_API_KEY'),
        ]);

        $lat = $googleResponse->json()['results'][0]['geometry']['location']['lat'] ?? 3.4735; // Fallback to Arau lat
        $lng = $googleResponse->json()['results'][0]['geometry']['location']['lng'] ?? 101.2721;

        // 3. Call OpenWeatherMap API using coordinates to check active conditions
        $weatherResponse = Http::get('https://api.openweathermap.org/data/2.5/weather', [
            'lat' => $lat,
            'lon' => $lng,
            'appid' => env('OPENWEATHER_API_KEY'),
            'units' => 'metric'
        ]);

        $weather = $weatherResponse->json()['weather'][0]['main'] ?? 'Clear';

        // 4. Save everything locally inside XAMPP MySQL
        $order = new Order();
        $order->tracking_number = 'ECO-' . strtoupper(uniqid());
        $order->recipient_name = $request->recipient_name;
        $order->destination_address = $address;
        $order->latitude = $lat;
        $order->longitude = $lng;
        $order->weather_condition = $weather;
        $order->distance_km = rand(5, 25); // Simulated route matrix calculation
        $order->save();

        return response()->json([
            'message' => 'Order created and integrated successfully!',
            'order' => $order
        ], 201);
    }
}