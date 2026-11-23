package com.frontend

import android.content.Intent
import android.content.Context
import android.content.SharedPreferences
import android.location.Geocoder
import android.location.Location
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.Locale
import java.util.concurrent.Executors

class LocationTrackerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val sharedPref: SharedPreferences by lazy {
        reactContext.getSharedPreferences("TrackingPrefs", Context.MODE_PRIVATE)
    }
    
    private val handler = Handler(Looper.getMainLooper())
    private val executor = Executors.newFixedThreadPool(2)

    override fun getName(): String = "LocationTracker"

    @ReactMethod
    fun startService(promise: Promise) {
        try {
            BackgroundService.reactContext = reactContext
            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_START
            }
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Failed to start service: ${e.message}")
        }
    }

    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            handler.removeCallbacksAndMessages(null)
            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_STOP
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Failed to stop service: ${e.message}")
        }
    }

    @ReactMethod
    fun startTracking(options: ReadableMap, promise: Promise) {
        try {
            val userId = options.getString("userId") ?: throw Exception("userId is required")
            val docId = options.getString("docId") ?: throw Exception("docId is required")
            val compcode = options.getString("COMPCODE") ?: ""
            val apiUrl = if (options.hasKey("apiUrl")) options.getString("apiUrl") else null

            // Store tracking configuration
            sharedPref.edit().apply {
                putString("userId", userId)
                putString("docId", docId)
                putString("COMPCODE", compcode)
                if (apiUrl != null) putString("apiUrl", apiUrl)
                apply()
            }

            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_START_TRACKING
                putExtra("userId", userId)
                putExtra("docId", docId)
                putExtra("COMPCODE", compcode)
                if (apiUrl != null) putExtra("apiUrl", apiUrl)
            }
            
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TRACKING_ERROR", "Failed to start tracking: ${e.message}")
        }
    }

    @ReactMethod
    fun stopTracking(promise: Promise) {
        try {
            handler.removeCallbacksAndMessages(null)
            sharedPref.edit().remove("userId").remove("docId").remove("COMPCODE").remove("apiUrl").apply()
            
            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_STOP_TRACKING
            }
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TRACKING_ERROR", "Failed to stop tracking: ${e.message}")
        }
    }

    @ReactMethod
    fun restartTrackingIfNeeded(promise: Promise) {
        try {
            val docId = sharedPref.getString("docId", null)
            val userId = sharedPref.getString("userId", null)
            val compcode = sharedPref.getString("COMPCODE", null)
            val apiUrl = sharedPref.getString("apiUrl", null)
            
            if (docId != null && userId != null) {
                val intent = Intent(reactContext, BackgroundService::class.java).apply {
                    action = BackgroundService.ACTION_START_TRACKING
                    putExtra("userId", userId)
                    putExtra("docId", docId)
                    putExtra("COMPCODE", compcode)
                    if (apiUrl != null) putExtra("apiUrl", apiUrl)
                }
                ContextCompat.startForegroundService(reactContext, intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("RESTART_ERROR", "Failed to restart tracking: ${e.message}")
        }
    }

    @ReactMethod
    fun updateTrackingConfig(config: ReadableMap, promise: Promise) {
        try {
            sharedPref.edit().apply {
                if (config.hasKey("userId")) putString("userId", config.getString("userId"))
                if (config.hasKey("docId"))  putString("docId",  config.getString("docId"))
                if (config.hasKey("COMPCODE")) putString("COMPCODE", config.getString("COMPCODE"))
                if (config.hasKey("apiUrl")) putString("apiUrl", config.getString("apiUrl"))
                apply()
            }

            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_UPDATE_CONFIG
                if (config.hasKey("interval")) putExtra("interval", config.getInt("interval").toLong())
                if (config.hasKey("fastestInterval")) putExtra("fastestInterval", config.getInt("fastestInterval").toLong())
                if (config.hasKey("priority")) putExtra("priority", config.getInt("priority"))
                if (config.hasKey("apiUrl")) putExtra("apiUrl", config.getString("apiUrl"))
            }
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Failed to update config: ${e.message}")
        }
    }

    private fun getHumanReadableAddress(lat: Double, lon: Double): String {
        return try {
            if (!Geocoder.isPresent()) {
                return String.format(Locale.US, "Near %.4f, %.4f", lat, lon)
            }
            val geocoder = Geocoder(reactContext, Locale.getDefault())
            val addresses = geocoder.getFromLocation(lat, lon, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                val sb = StringBuilder()
                for (i in 0..addr.maxAddressLineIndex) {
                    if (i > 0) sb.append(", ")
                    sb.append(addr.getAddressLine(i))
                }
                val res = sb.toString().trim()
                if (res.isNotEmpty()) res else String.format(Locale.US, "Near %.4f, %.4f", lat, lon)
            } else {
                String.format(Locale.US, "Near %.4f, %.4f", lat, lon)
            }
        } catch (e: Exception) {
            Log.w("LocationTracker", "Geocoder lookup failed: ${e.message}")
            String.format(Locale.US, "Near %.4f, %.4f", lat, lon)
        }
    }

    private fun resolveLocationWithAddress(location: Location, promise: Promise) {
        executor.execute {
            try {
                val addressStr = getHumanReadableAddress(location.latitude, location.longitude)
                val map = Arguments.createMap().apply {
                    putDouble("latitude", location.latitude)
                    putDouble("longitude", location.longitude)
                    putDouble("accuracy", location.accuracy.toDouble())
                    putString("address", addressStr)
                    putString("locationName", addressStr)
                }
                promise.resolve(map)
            } catch (e: Exception) {
                val fallbackMap = Arguments.createMap().apply {
                    putDouble("latitude", location.latitude)
                    putDouble("longitude", location.longitude)
                    putDouble("accuracy", location.accuracy.toDouble())
                    putString("address", String.format(Locale.US, "Near %.4f, %.4f", location.latitude, location.longitude))
                }
                promise.resolve(fallbackMap)
            }
        }
    }

    @ReactMethod
    fun getAddressFromCoords(latitude: Double, longitude: Double, promise: Promise) {
        executor.execute {
            try {
                val addressStr = getHumanReadableAddress(latitude, longitude)
                promise.resolve(addressStr)
            } catch (e: Exception) {
                promise.reject("GEOCODE_ERROR", e.message ?: "Failed to resolve address")
            }
        }
    }

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        try {
            val fusedClient = LocationServices.getFusedLocationProviderClient(reactContext)
            
            // 1. Immediately check lastLocation first (returns in < 15ms!)
            fusedClient.lastLocation.addOnSuccessListener { lastLoc ->
                if (lastLoc != null) {
                    resolveLocationWithAddress(lastLoc, promise)
                } else {
                    // 2. Fallback to fresh location request
                    val cts = CancellationTokenSource()
                    fusedClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cts.token)
                        .addOnSuccessListener { location ->
                            if (location != null) {
                                resolveLocationWithAddress(location, promise)
                            } else {
                                promise.reject("LOCATION_NULL", "Unable to get location")
                            }
                        }
                        .addOnFailureListener { e ->
                            promise.reject("LOCATION_ERROR", e.message ?: "Failed current location")
                        }
                }
            }.addOnFailureListener {
                val cts = CancellationTokenSource()
                fusedClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cts.token)
                    .addOnSuccessListener { location ->
                        if (location != null) {
                            resolveLocationWithAddress(location, promise)
                        } else {
                            promise.reject("LOCATION_NULL", "Unable to get location")
                        }
                    }
                    .addOnFailureListener { e ->
                        promise.reject("LOCATION_ERROR", e.message ?: "Failed current location")
                    }
            }
        } catch (e: SecurityException) {
            promise.reject("PERMISSION_DENIED", "Location permission denied: ${e.message}")
        } catch (e: Exception) {
            promise.reject("LOCATION_ERROR", "Error: ${e.message}")
        }
    }

    @ReactMethod
    fun isTrackingEnabled(promise: Promise) {
        promise.resolve(BackgroundService.isTrackingEnabled)
    }

    @ReactMethod
    fun hasActiveTracking(promise: Promise) {
        promise.resolve(sharedPref.getString("docId", null) != null)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    companion object {
        fun scheduleRestart(context: Context, delayMillis: Long = 2000) {
            val handler = Handler(Looper.getMainLooper())
            handler.postDelayed({
                val sharedPref = context.getSharedPreferences("TrackingPrefs", Context.MODE_PRIVATE)
                val docId = sharedPref.getString("docId", null)
                val userId = sharedPref.getString("userId", null)
                val compcode = sharedPref.getString("COMPCODE", null)
                val apiUrl = sharedPref.getString("apiUrl", null)
                
                if (docId != null && userId != null) {
                    val intent = Intent(context, BackgroundService::class.java).apply {
                        action = BackgroundService.ACTION_START_TRACKING
                        putExtra("userId", userId)
                        putExtra("docId", docId)
                        putExtra("COMPCODE", compcode)
                        if (apiUrl != null) putExtra("apiUrl", apiUrl)
                    }
                    ContextCompat.startForegroundService(context, intent)
                }
            }, delayMillis)
        }
    }
}
