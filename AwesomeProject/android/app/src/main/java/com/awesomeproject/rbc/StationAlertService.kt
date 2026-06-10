package com.awesomeproject.rbc

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import kotlin.math.*

/**
 * Foreground service that tracks the user's GPS position and fires a system
 * notification when they are within ALERT_RADIUS_M of each upcoming station.
 *
 * Runs independently of the JS thread, so alerts work when the app is
 * backgrounded or the screen is off — which watchPosition callbacks cannot do.
 */
class StationAlertService : Service() {

    companion object {
        const val ACTION_START = "com.awesomeproject.rbc.START_ALERT"
        const val ACTION_STOP  = "com.awesomeproject.rbc.STOP_ALERT"

        const val EXTRA_STATION_NAMES = "station_names"
        const val EXTRA_STATION_LATS  = "station_lats"
        const val EXTRA_STATION_LONS  = "station_lons"

        const val FOREGROUND_NOTIF_ID  = 7001
        private const val ALERT_NOTIF_BASE_ID = 7100
        private const val CHANNEL_ONGOING = "station-tracking"
        private const val CHANNEL_ALERTS  = "station-alerts"
        private const val ALERT_RADIUS_M  = 400.0
    }

    private lateinit var fusedClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    private var stationNames: Array<String> = emptyArray()
    private var stationLats:  DoubleArray   = DoubleArray(0)
    private var stationLons:  DoubleArray   = DoubleArray(0)
    private var currentIdx: Int = 0

    // -------------------------------------------------------------------------

    override fun onCreate() {
        super.onCreate()
        fusedClient = LocationServices.getFusedLocationProviderClient(this)
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { checkProximity(it.latitude, it.longitude) }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }

        stationNames = intent?.getStringArrayExtra(EXTRA_STATION_NAMES) ?: emptyArray()
        stationLats  = intent?.getDoubleArrayExtra(EXTRA_STATION_LATS)  ?: DoubleArray(0)
        stationLons  = intent?.getDoubleArrayExtra(EXTRA_STATION_LONS)  ?: DoubleArray(0)
        currentIdx   = 0

        if (stationNames.isEmpty()) { stopSelf(); return START_NOT_STICKY }

        createChannels()
        startForeground(FOREGROUND_NOTIF_ID, buildForegroundNotification())
        startLocationUpdates()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        fusedClient.removeLocationUpdates(locationCallback)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        // Notify JS that tracking stopped (destination reached or manually stopped).
        StationAlertModule.sendEvent(this, StationAlertModule.EVENT_STOPPED, null)
        super.onDestroy()
    }

    // -------------------------------------------------------------------------

    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(10_000L)
            .setPriority(Priority.PRIORITY_BALANCED_POWER_ACCURACY)
            .setMinUpdateDistanceMeters(30f)
            .build()
        try {
            fusedClient.requestLocationUpdates(request, locationCallback, mainLooper)
        } catch (e: SecurityException) {
            stopSelf()
        }
    }

    private fun checkProximity(userLat: Double, userLon: Double) {
        if (currentIdx >= stationNames.size) { stopSelf(); return }

        val dist = haversine(userLat, userLon, stationLats[currentIdx], stationLons[currentIdx])
        if (dist < ALERT_RADIUS_M) {
            val name = stationNames[currentIdx]
            postAlertNotification(name)
            StationAlertModule.sendEvent(this, StationAlertModule.EVENT_APPROACHING, name)
            currentIdx++
            if (currentIdx >= stationNames.size) stopSelf()
        }
    }

    // -------------------------------------------------------------------------

    private fun buildForegroundNotification(): Notification {
        val dest = stationNames.lastOrNull() ?: "destination"
        return NotificationCompat.Builder(this, CHANNEL_ONGOING)
            .setContentTitle("Next Stop: Delhi Metro")
            .setContentText("Tracking journey · next station: ${stationNames.getOrNull(0) ?: dest}")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun postAlertNotification(stationName: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notif = NotificationCompat.Builder(this, CHANNEL_ALERTS)
            .setContentTitle("Next Stop: Delhi Metro")
            .setContentText("You are approaching $stationName!")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(0, 300, 100, 300))
            .build()
        nm.notify(ALERT_NOTIF_BASE_ID + currentIdx, notif)
    }

    private fun createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (nm.getNotificationChannel(CHANNEL_ONGOING) == null) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ONGOING, "Journey Tracking",
                    NotificationManager.IMPORTANCE_LOW).apply {
                    description = "Shown while station-alert tracking is active"
                }
            )
        }
        if (nm.getNotificationChannel(CHANNEL_ALERTS) == null) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ALERTS, "Station Alerts",
                    NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Alerts as you approach your station"
                    enableVibration(true)
                }
            )
        }
    }

    // -------------------------------------------------------------------------

    private fun haversine(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val R = 6_371_000.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
        return R * 2 * asin(sqrt(a))
    }
}
