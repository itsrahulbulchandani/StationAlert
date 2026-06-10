package com.awesomeproject.rbc

import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native native module that lets JS start/stop StationAlertService and
 * receive events back (station approached, tracking stopped).
 */
class StationAlertModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx) {

    override fun getName() = "StationAlert"

    companion object {
        const val EVENT_APPROACHING = "onApproachingStation"
        const val EVENT_STOPPED     = "onAlertStopped"

        // Called by StationAlertService to relay events to JS.
        fun sendEvent(context: Context, event: String, stationName: String?) {
            // Reach the module instance through the React context stored on the
            // application object (safe: both live on the main process).
            val app = context.applicationContext as? MainApplication ?: return
            val reactHost = app.reactHost
            val jsContext = try {
                reactHost.currentReactContext
            } catch (e: Exception) { null } ?: return

            val params = Arguments.createMap().apply {
                if (stationName != null) putString("stationName", stationName)
            }
            jsContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(event, params)
        }
    }

    @ReactMethod
    fun startAlert(stations: ReadableArray) {
        val names = ArrayList<String>()
        val lats  = ArrayList<Double>()
        val lons  = ArrayList<Double>()

        for (i in 0 until stations.size()) {
            val s = stations.getMap(i) ?: continue
            names.add(s.getString("name") ?: "")
            lats.add(s.getDouble("lat"))
            lons.add(s.getDouble("lon"))
        }
        if (names.isEmpty()) return

        val intent = Intent(ctx, StationAlertService::class.java).apply {
            action = StationAlertService.ACTION_START
            putExtra(StationAlertService.EXTRA_STATION_NAMES, names.toTypedArray())
            putExtra(StationAlertService.EXTRA_STATION_LATS,  lats.toDoubleArray())
            putExtra(StationAlertService.EXTRA_STATION_LONS,  lons.toDoubleArray())
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent)
        } else {
            ctx.startService(intent)
        }
    }

    @ReactMethod
    fun stopAlert() {
        val intent = Intent(ctx, StationAlertService::class.java).apply {
            action = StationAlertService.ACTION_STOP
        }
        ctx.startService(intent)
    }

    // Required boilerplate for RN NativeEventEmitter on the JS side.
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
