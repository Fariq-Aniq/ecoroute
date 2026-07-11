<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\RiderController;
use App\Http\Controllers\InvoiceController;

/*
|--------------------------------------------------------------------------
| EcoRoute Application API Pipelines
|--------------------------------------------------------------------------
*/

// Route 1: Dispatch Order using Strict Single Pipeline Framework
Route::post('/orders/create', function(Request $request) {
    $address = $request->input('destination_address');
    $recipient = $request->input('recipient_name');

    // Default Fallback Coordinates (Kuala Lumpur)
    $lat = 3.1390; 
    $lng = 101.6869;

    // --- PIPELINE 1: STRICT GOOGLE MAPS GEOCODING ---
    if (env('GOOGLE_MAPS_API_KEY')) {
        $googleResponse = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $address,
            'region'  => 'my', // Keep tracking locked to Malaysia
            'key'     => env('GOOGLE_MAPS_API_KEY'),
        ]);

        $data = $googleResponse->json();

        if (!empty($data['status']) && $data['status'] === 'OK') {
            // Google API Call Succeeded perfectly! Use the real coordinates
            $lat = $data['results'][0]['geometry']['location']['lat'];
            $lng = $data['results'][0]['geometry']['location']['lng'];
        } else {
            // Log Google's exact error code to storage/logs/laravel.log for testing
            $errorMsg = $data['error_message'] ?? 'No error details provided by Google';
            Log::warning("Google API Failed. Status: " . ($data['status'] ?? 'UNKNOWN') . " | Reason: " . $errorMsg);
        }
    }

    // --- PIPELINE 2: LIVE OPENWEATHER TELEMETRY ---
    $weatherCondition = 'Clear'; // Baseline default

    if (env('OPENWEATHER_API_KEY')) {
        // Fetch weather data for whichever coordinates were resolved above
        $weatherResponse = Http::get('https://api.openweathermap.org/data/2.5/weather', [
            'lat'   => $lat,
            'lon'   => $lng,
            'appid' => env('OPENWEATHER_API_KEY'),
            'units' => 'metric'
        ]);

        if ($weatherResponse->successful()) {
            $weatherData = $weatherResponse->json();
            if (!empty($weatherData['weather'])) {
                // Extracts real condition words: 'Rain', 'Clouds', 'Clear', 'Thunderstorm'
                $weatherCondition = $weatherData['weather'][0]['main'];
            }
        } else {
            Log::error('OpenWeather Request Failed: ' . $weatherResponse->body());
        }
    }

    // Dynamic Route Calculation Weighting Script
    $baseDistance = rand(5, 30); 
    $distanceKm = ($weatherCondition === 'Rain' || $weatherCondition === 'Thunderstorm') 
        ? $baseDistance * 1.25 
        : $baseDistance;

    // Commit completely parsed variables into XAMPP Database
    $order = Order::create([
        'tracking_number' => 'ECO-' . strtoupper(uniqid()),
        'recipient_name' => $recipient,
        'destination_address' => $address,
        'latitude' => $lat,
        'longitude' => $lng,
        'weather_condition' => $weatherCondition,
        'distance_km' => $distanceKm,
        'status' => 'Pending'
    ]);

    return response()->json([
        'message' => 'Dispatched using clean single-pipeline cloud variables!',
        'order' => $order
    ]);
});

// Route 2: Fetch All Active System Registries
Route::get('/orders/all', function() {
    return response()->json(Order::orderBy('created_at', 'desc')->get());
});

// Route 3: Purge / Delete Entry Node from XAMPP Registry
Route::delete('/orders/{id}', function($id) {
    $order = Order::find($id);
    if ($order) {
        $order->delete();
        return response()->json(['message' => 'Node purged successfully.']);
    }
    return response()->json(['message' => 'Order not found.'], 404);
});


// Rider Telemetry Routes
Route::get('/riders/active', [RiderController::class, 'getActiveRiders']);
Route::post('/riders/assign', [RiderController::class, 'assignRider']);

// Financial Billing Surcharge Routes
Route::post('/invoices/generate/{orderId}', [InvoiceController::class, 'generateInvoice']);