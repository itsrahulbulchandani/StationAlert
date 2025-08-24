package com.awesomeproject;

import android.content.Intent;
import android.os.Build;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Promise;

public class LocationModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "LocationModule";
    }

    @ReactMethod
    public void startLocationService(ReadableMap data, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, LocationHeadlessTask.class);
            
            // Add data to the intent if provided
            if (data != null) {
                // Log what we're sending to help with debugging
                android.util.Log.d("LocationModule", "Starting service with data: " + data.toString());
                
                // Extract specific fields if they exist
                if (data.hasKey("location") && data.hasKey("nextStationName") && data.hasKey("distance")) {
                    // Extract these fields to make them directly accessible in the headless task
                    serviceIntent.putExtra("locationData", data.toString());
                    serviceIntent.putExtra("nextStationName", data.getString("nextStationName"));
                    serviceIntent.putExtra("distance", data.getDouble("distance"));
                    
                    android.util.Log.d("LocationModule", "Added nextStationName: " + data.getString("nextStationName") + 
                                      ", distance: " + data.getDouble("distance"));
                } else {
                    // Just pass the whole object if we don't have the expected structure
                    serviceIntent.putExtra("locationData", data.toString());
                }
            }
            
            // Start the service based on Android version
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            promise.resolve("Location service started successfully");
        } catch (Exception e) {
            android.util.Log.e("LocationModule", "Failed to start service: " + e.getMessage(), e);
            promise.reject("ERROR", "Failed to start location service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopLocationService(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, LocationHeadlessTask.class);
            reactContext.stopService(serviceIntent);
            promise.resolve("Location service stopped successfully");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to stop location service: " + e.getMessage());
        }
    }
}