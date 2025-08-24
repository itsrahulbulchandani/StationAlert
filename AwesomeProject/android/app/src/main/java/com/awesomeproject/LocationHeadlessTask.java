package com.awesomeproject;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class LocationHeadlessTask extends HeadlessJsTaskService {
    private static final int SERVICE_NOTIFICATION_ID = 9999;
    private static final String CHANNEL_ID = "location_tracking_channel";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(SERVICE_NOTIFICATION_ID, buildNotification());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Location Tracking Service",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Used for location tracking in the background");
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Station Alert Active")
                .setContentText("Tracking your location for station alerts")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setOngoing(true)
                .setSmallIcon(getResources().getIdentifier("ic_launcher", "mipmap", getPackageName()));

        return builder.build();
    }

    @Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            // Convert extras to a WritableMap that JS can understand
            Bundle taskData = new Bundle();
            
            // Extract the locationData string if it exists
            if (extras.containsKey("locationData")) {
                taskData.putString("locationData", extras.getString("locationData"));
            }
            
            // Extract specific notification data if available
            if (extras.containsKey("nextStationName")) {
                taskData.putString("nextStationName", extras.getString("nextStationName"));
            }
            if (extras.containsKey("distance")) {
                taskData.putDouble("distance", extras.getDouble("distance"));
            }
            
            // Add any other data from the extras
            for (String key : extras.keySet()) {
                Object value = extras.get(key);
                if (value != null && !key.equals("locationData") && !key.equals("nextStationName") && !key.equals("distance")) {
                    taskData.putString(key, String.valueOf(value));
                }
            }
            
            // Log the data being sent to the headless task
            android.util.Log.d("LocationHeadlessTask", "Sending data to JS: " + taskData.toString());
            
            // Create a task that will keep running for 30 minutes (30 * 60 * 1000ms)
            // This ensures the location tracking continues even when the app is in background
            return new HeadlessJsTaskConfig(
                    "LocationTask",
                    Arguments.fromBundle(taskData),
                    30 * 60 * 1000, // 30 minutes timeout
                    true // Allow the task to run while the app is in foreground
            );
        }
        return null;
    }
}