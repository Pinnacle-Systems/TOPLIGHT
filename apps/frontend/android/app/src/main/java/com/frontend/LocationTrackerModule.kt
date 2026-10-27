package com.frontend

import android.content.Intent
import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

class LocationTrackerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val sharedPref: SharedPreferences by lazy {
        reactContext.getSharedPreferences("TrackingPrefs", Context.MODE_PRIVATE)
    }
    
    private val handler = Handler(Looper.getMainLooper())

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

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        try {
            val fusedClient = LocationServices.getFusedLocationProviderClient(reactContext)
            
            // 1. Immediately check lastLocation first (returns in < 15ms!)
            fusedClient.lastLocation.addOnSuccessListener { lastLoc ->
                if (lastLoc != null) {
                    val map = Arguments.createMap().apply {
                        putDouble("latitude", lastLoc.latitude)
                        putDouble("longitude", lastLoc.longitude)
                        putDouble("accuracy", lastLoc.accuracy.toDouble())
                    }
                    promise.resolve(map)
                } else {
                    // 2. Fallback to fresh location request
                    val cts = CancellationTokenSource()
                    fusedClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cts.token)
                        .addOnSuccessListener { location ->
                            if (location != null) {
                                val map = Arguments.createMap().apply {
                                    putDouble("latitude", location.latitude)
                                    putDouble("longitude", location.longitude)
                                    putDouble("accuracy", location.accuracy.toDouble())
                                }
                                promise.resolve(map)
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
                            val map = Arguments.createMap().apply {
                                putDouble("latitude", location.latitude)
                                putDouble("longitude", location.longitude)
                                putDouble("accuracy", location.accuracy.toDouble())
                            }
                            promise.resolve(map)
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
