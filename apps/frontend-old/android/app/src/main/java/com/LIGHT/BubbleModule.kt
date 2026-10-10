package com.LIGHT

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BubbleModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "BubbleModule"

    @ReactMethod
    fun startBubbleService() {
        val intent = Intent(reactContext, BubbleService::class.java).apply {
            // Add any extras if needed
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
        } catch (e: Exception) {
            // Handle potential SecurityException or other issues
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun stopBubbleService() {
        try {
            reactContext.stopService(Intent(reactContext, BubbleService::class.java))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun isBubbleRunning(promise: Promise) {
        try {
            promise.resolve(isServiceRunning(BubbleService::class.java))
        } catch (e: Exception) {
            promise.reject("SERVICE_CHECK_ERROR", e.message)
        }
    }

    private fun isServiceRunning(serviceClass: Class<*>): Boolean {
        val manager = reactContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.getRunningServices(Int.MAX_VALUE)
                .any { it.service.className == serviceClass.name }
        } else {
            @Suppress("DEPRECATION")
            manager.getRunningServices(Integer.MAX_VALUE)
                .any { it.service.className == serviceClass.name }
        }
    }
}