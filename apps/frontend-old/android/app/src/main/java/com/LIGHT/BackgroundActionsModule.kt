package com.LIGHT

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.app.AppOpsManager
import android.os.Process


class BackgroundActionsModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "BackgroundActionsModule"

    @ReactMethod
    fun checkBatteryOptimizationStatus(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
                val isIgnoring = powerManager.isIgnoringBatteryOptimizations(reactContext.packageName)
                promise.resolve(isIgnoring)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("BATTERY_CHECK_ERROR", "Failed to check battery optimization", e)
        }
    }

    @ReactMethod
    fun openBatteryOptimizationSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", "Failed to open battery settings", e)
        }
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimization(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("BATTERY_OPTIMIZATION_ERROR", "Failed to request ignore battery optimization", e)
        }
    }

    @ReactMethod
    fun startBackgroundService(promise: Promise) {
        try {
            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_START
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Failed to start background service", e)
        }
    }

    @ReactMethod
fun canStartForegroundService(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.unsafeCheckOpNoThrow(
            "android:start_foreground",
            Process.myUid(),
            reactApplicationContext.packageName
        )
        promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
    } else {
        promise.resolve(true)
    }
}

    @ReactMethod
    fun stopBackgroundService(promise: Promise) {
        try {
            val intent = Intent(reactContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_STOP
            }
            val stopped = reactContext.stopService(intent)
            promise.resolve(stopped)
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Failed to stop background service", e)
        }
    }


      @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        try {
            promise.resolve(if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactContext)
            } else {
                true // Permission not needed before Android 6.0
            })
        } catch (e: Exception) {
            promise.reject("OVERLAY_PERMISSION_ERROR", "Failed to check overlay permission", e)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                
                // Add a result listener if you need to know when the user returns
                val activity = currentActivity
                if (activity != null) {
                    activity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE)
                    promise.resolve(true)
                } else {
                    reactContext.startActivity(intent)
                    promise.resolve(true)
                }
            } else {
                promise.resolve(true) // No permission needed before Android 6.0
            }
        } catch (e: Exception) {
            promise.reject("OVERLAY_PERMISSION_ERROR", "Failed to request overlay permission", e)
        }
    }

    companion object {
        const val OVERLAY_PERMISSION_REQUEST_CODE = 1235
    }

}