package com.LIGHT

import android.content.Intent
import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

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
            // Clear any pending restart
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

            // Store tracking configuration
            sharedPref.edit().apply {
                putString("userId", userId)
                putString("docId", docId)
                putString("COMPCODE", compcode)
                apply()
            }

            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_START_TRACKING
                putExtra("userId", userId)
                putExtra("docId", docId)
                putExtra("COMPCODE", compcode)
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
            // Clear any pending restart
            handler.removeCallbacksAndMessages(null)
            
            // Clear tracking configuration
            sharedPref.edit().remove("userId").remove("docId").remove("COMPCODE").apply()
            
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
            
            if (docId != null && userId != null) {
                val intent = Intent(reactContext, BackgroundService::class.java).apply {
                    action = BackgroundService.ACTION_START_TRACKING
                    putExtra("userId", userId)
                    putExtra("docId", docId)
                    putExtra("COMPCODE", compcode)
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
            // ✅ Sync with SharedPreferences so Notification shows current ID
            sharedPref.edit().apply {
                if (config.hasKey("userId")) putString("userId", config.getString("userId"))
                if (config.hasKey("docId"))  putString("docId",  config.getString("docId"))
                if (config.hasKey("COMPCODE")) putString("COMPCODE", config.getString("COMPCODE"))
                apply()
            }

            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_UPDATE_CONFIG
                putExtra("interval", config.getInt("interval").toLong())
                putExtra("fastestInterval", config.getInt("fastestInterval").toLong())
                putExtra("priority", config.getInt("priority"))
                putExtra("apiUrl", config.getString("apiUrl"))
            }
            ContextCompat.startForegroundService(reactContext, intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Failed to update config: ${e.message}")
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
    fun addListener(eventName: String) {
        // Required for RN built-in Event Emitter Calls
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built-in Event Emitter Calls
    }

    // Helper function to send events to JavaScript
    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    companion object {
        // Schedule a restart of the tracking service
        fun scheduleRestart(context: Context, delayMillis: Long = 2000) {
            val handler = Handler(Looper.getMainLooper())
            handler.postDelayed({
                val sharedPref = context.getSharedPreferences("TrackingPrefs", Context.MODE_PRIVATE)
                val docId = sharedPref.getString("docId", null)
                val userId = sharedPref.getString("userId", null)
                val compcode = sharedPref.getString("COMPCODE", null)
                
                if (docId != null && userId != null) {
                    val intent = Intent(context, BackgroundService::class.java).apply {
                        action = BackgroundService.ACTION_START_TRACKING
                        putExtra("userId", userId)
                        putExtra("docId", docId)
                        putExtra("COMPCODE", compcode)
                    }
                    ContextCompat.startForegroundService(context, intent)
                }
            }, delayMillis)
        }
    }
}