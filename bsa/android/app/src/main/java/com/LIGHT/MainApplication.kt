package com.LIGHT

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager



class MainApplication : Application(), ReactApplication {

    private val mReactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.toMutableList().apply {
                // Add your custom packages here
                add(OverlayPermissionPackage())
                add(BubblePackage())
                add(BackgroundActionsPackage())
                add(PermissionPackage())
                add(LocationTrackerPackage())
               
                
               

                
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
    }

    override val reactNativeHost: ReactNativeHost = mReactNativeHost
    
    private lateinit var _reactHost: ReactHost
    
    override val reactHost: ReactHost
        get() = _reactHost

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping)
        
        _reactHost = getDefaultReactHost(applicationContext, reactNativeHost)
        
        createNotificationChannels()
        
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)
            
            val locationChannel = NotificationChannel(
                "live_location_channel",
                "Live Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background location tracking"
            }
            
            val bubbleChannel = NotificationChannel(
                "bubble_channel",
                "Bubble Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Floating bubble service"
            }
            
            val highPriorityChannel = NotificationChannel(
                "high_priority_channel",
                "Important Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Urgent notifications"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
            }

            notificationManager.createNotificationChannels(
                listOf(locationChannel, bubbleChannel, highPriorityChannel)
            )
        }
    }
}

// Proper implementation of ReactPackage interfaces
class BubblePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
       // return emptyList() // Return your BubbleModule if you have one
         return listOf(BubbleModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}

class BackgroundActionsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
       // return emptyList() // Return your BackgroundActionsModule if you have one
         return listOf(BackgroundActionsModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}

class OverlayPermissionPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
       // return emptyList() // Return your PermissionModule if you have one
         return listOf(OverlayPermissionModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}