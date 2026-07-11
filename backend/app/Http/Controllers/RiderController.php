<?php

namespace App\Http\Controllers;

use App\Models\Rider;
use App\Models\Order;
use Illuminate\Http\Request;

class RiderController extends Controller
{
    // Fetches active riders for the frontend dropdown
    public function getActiveRiders()
    {
        $riders = Rider::where('availability', 'active')->get();
        return response()->json($riders);
    }

    // Handles the "Deploy Rider" action pipeline
    public function assignRider(Request $request)
    {
        $request->validate([
            'rider_id' => 'required',
            'order_id' => 'required'
        ]);

        $rider = Rider::find($request->rider_id);
        if (!$rider) {
            return response()->json(['message' => 'Rider not found'], 404);
        }

        // Update rider status in database
        $rider->update([
            'availability' => 'busy',
            'current_order_id' => $request->order_id
        ]);

        return response()->json([
            'message' => 'Rider deployed and synced successfully!',
            'rider' => $rider
        ]);
    }
}