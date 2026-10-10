package com.LIGHT

import android.app.*
import android.content.Context
import android.content.ComponentName
import android.content.Intent
import android.location.Location
import android.net.Uri
import android.os.*
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import android.app.NotificationManager
import androidx.work.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import android.content.SharedPreferences
import java.util.concurrent.TimeUnit

class BackgroundService : Service() {

    companion object {
        const val ACTION_START = "${BuildConfig.APPLICATION_ID}.ACTION_START"
        const val ACTION_STOP = "${BuildConfig.APPLICATION_ID}.ACTION_STOP"
        const val ACTION_START_TRACKING = "${BuildConfig.APPLICATION_ID}.ACTION_START_TRACKING"
        const val ACTION_STOP_TRACKING = "${BuildConfig.APPLICATION_ID}.ACTION_STOP_TRACKING"
        const val ACTION_UPDATE_CONFIG = "${BuildConfig.APPLICATION_ID}.ACTION_UPDATE_CONFIG"
        
        private const val CHANNEL_ID = "background_service_channel"
        private const val NOTIFICATION_ID = 101
        private const val WAKE_LOCK_TAG = "${BuildConfig.APPLICATION_ID}::BackgroundServiceWakelock"
        private const val HEARTBEAT_INTERVAL = 30 * 60 * 1000L // 30 minutes
        private const val DEFAULT_LOCATION_INTERVAL = 5000L // 5 seconds
        private const val DEFAULT_FASTEST_INTERVAL = 3000L // 3 seconds
        private const val TAG = "BackgroundService"
        private const val LOCATION_PERMISSION_REQUEST_CODE = 1001

        var isTrackingEnabled = false
            private set
        var reactContext: ReactContext? = null
        var trackingConfig = TrackingConfig(
            interval = DEFAULT_LOCATION_INTERVAL,
            fastestInterval = DEFAULT_FASTEST_INTERVAL,
            priority = LocationRequest.PRIORITY_HIGH_ACCURACY,
            apiUrl = "https://spikemobapi.pinnaclesystems.co.in/onduty/send_location",
            maxWaitTime = DEFAULT_LOCATION_INTERVAL * 2
        )
        //https://bharanipriya.pinnaclesystems.co.in
        //http://192.168.1.57:8025



          private const val SHARED_PREFS_NAME = "TrackingPrefs"
    
          fun getAppPreferences(context: Context): SharedPreferences {
            return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
         }
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private var handler: Handler? = null
    private var heartbeatRunnable: Runnable? = null
    private var fusedLocationClient: FusedLocationProviderClient? = null
    private var locationCallback: LocationCallback? = null
    private var locationRequest: LocationRequest? = null
    private val okHttpClient = OkHttpClient()

    data class TrackingConfig(
        val interval: Long,
        val fastestInterval: Long,
        val priority: Int,
        val apiUrl: String,
        val maxWaitTime: Long,
        val minUpdateDistance: Float = 3f
    )

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate")
        initializeWakeLock()
        startForegroundService()
        startHeartbeat()
        checkBatteryOptimization()
        checkManufacturerSpecificOptimizations()
    }

    private fun initializeWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ON_AFTER_RELEASE,
            WAKE_LOCK_TAG
        ).apply {
            setReferenceCounted(false)
            acquire(HEARTBEAT_INTERVAL * 2)
        }
    }

    private fun startForegroundService() {
        createNotificationChannel()
        val notification = buildPersistentNotification()
        try {
            startForeground(NOTIFICATION_ID, notification)
            Log.d(TAG, "Foreground service started")
        } catch (e: Exception) {
            Log.e(TAG, "Foreground service start failed", e)
            stopSelf()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Live Tracking Service",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Running in background to track your location"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableVibration(true)
                enableLights(true)
                lightColor = android.graphics.Color.GREEN
            }
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    private fun buildPersistentNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Tracking toggle intent
        val trackingIntent = Intent(this, BackgroundService::class.java).apply {
            action = if (isTrackingEnabled) ACTION_STOP_TRACKING else ACTION_START_TRACKING
        }
        val trackingPendingIntent = PendingIntent.getService(
            this,
            0,
            trackingIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )


           val prefs = getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
          val  docID=prefs?.getString("docId",null)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(if (isTrackingEnabled) "OnDuty" else "TOPLIGHT App")
            .setContentText(if (isTrackingEnabled) "Your Onduty ID is:"+docID     else  "-")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationManager.IMPORTANCE_LOW)
            .setOngoing(true)
            .setAutoCancel(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setContentIntent(pendingIntent)
            .setSound(null)
            .build()

            //  .addAction(
            //     if (isTrackingEnabled) R.drawable.ic_launcher_foreground else R.drawable.ic_refresh ,
            //     if (isTrackingEnabled) "Pause" else "Resume",
            //     trackingPendingIntent
            // )
    }

    private fun startHeartbeat() {
        handler = Handler(Looper.getMainLooper())
        heartbeatRunnable = object : Runnable {
            override fun run() {
                performBackgroundTasks()
                handler?.postDelayed(this, HEARTBEAT_INTERVAL)
            }
        }
        handler?.post(heartbeatRunnable!!)
    }

    private fun performBackgroundTasks() {
       // Log.d(TAG, "Performing background tasks at ${System.currentTimeMillis()}")
       // updateNotification()
    }

    private fun updateNotification() {
        val notification = buildPersistentNotification()
        (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(NOTIFICATION_ID, notification)
    }

    private fun startLocationUpdates() {
        if (isTrackingEnabled) return

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        locationRequest = LocationRequest.create().apply {
            interval = trackingConfig.interval
            fastestInterval = trackingConfig.fastestInterval
            priority = trackingConfig.priority
            maxWaitTime = trackingConfig.maxWaitTime
            smallestDisplacement = trackingConfig.minUpdateDistance
        }

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                super.onLocationResult(locationResult)
                locationResult.lastLocation?.let { location ->
                    Log.d(TAG, "New location: ${location.latitude}, ${location.longitude}")
                    sendLocationToApi(location)
                    sendLocationToJS(location)
                }
            }

            override fun onLocationAvailability(availability: LocationAvailability) {
                super.onLocationAvailability(availability)
                if (!availability.isLocationAvailable) {
                    Log.w(TAG, "Location not available")
                    sendErrorToJS("LOCATION_UNAVAILABLE", "Location services not available")
                }
            }
        }

        try {
            fusedLocationClient?.requestLocationUpdates(
                locationRequest!!,
                locationCallback!!,
                Looper.getMainLooper()
            )
            isTrackingEnabled = true
            Log.d(TAG, "Location updates started")
            updateNotification()
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permission not granted", e)
            sendErrorToJS("LOCATION_PERMISSION_REQUIRED", "Location permission not granted")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start location updates", e)
            sendErrorToJS("LOCATION_ERROR", e.message ?: "Unknown error")
        }
    }

    private fun stopLocationUpdates() {
        if (!isTrackingEnabled) return
        val prefs = getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove("docId")
         prefs.edit().remove("COMPCODE")

        locationCallback?.let {
            fusedLocationClient?.removeLocationUpdates(it)
            isTrackingEnabled = false
            Log.d(TAG, "Location updates stopped")
           // updateNotification()
        }
    }

    private fun sendLocationToApi(location: Location) {

        val prefs = getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
        val  UserID=prefs?.getString("userId",null)
        val  docID=prefs?.getString("docId",null)
        val  compcode=prefs?.getString("COMPCODE",null)
        val json = JSONObject().apply {
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("timestamp", System.currentTimeMillis())
            put("accuracy", location.accuracy)
            put("speed", location.speed)
            put("bearing", location.bearing)
            put("altitude", location.altitude)
            put("provider", location.provider)
            put("userId",UserID)
            put("docId",docID)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url(trackingConfig.apiUrl)
            .post(requestBody)
            .addHeader("COMPCODE", ""+compcode)
            .build()

        okHttpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: java.io.IOException) {
                Log.e(TAG, "Failed to send location to API", e)
                sendErrorToJS("API_ERROR", e.message ?: "Failed to send location")
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    Log.e(TAG, "API response not successful: ${response.code}")
                    sendErrorToJS("API_ERROR", "Response code: ${response.code}")
                } else {
                    Log.d(TAG, "Location sent successfully")
                }
                response.close()
            }
        })
    }

    private fun sendLocationToJS(location: Location) {
        reactContext?.let { ctx ->
            val params: WritableMap = Arguments.createMap().apply {
                putDouble("latitude", location.latitude)
                putDouble("longitude", location.longitude)
                putDouble("accuracy", location.accuracy.toDouble())
                putDouble("timestamp", location.time.toDouble())
                putDouble("speed", location.speed.toDouble())
                putDouble("bearing", location.bearing.toDouble())
                putDouble("altitude", location.altitude)
                putString("provider", location.provider)
            }
            
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onLocationUpdate", params)
        }
    }




    private fun checkAutoStartPermission() {
    when (Build.MANUFACTURER.lowercase()) {
        "xiaomi" -> {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
            }
            try {
                startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to open Xiaomi auto-start settings", e)
            }
        }
        "oppo" -> {
            try {
                val intent = Intent().apply {
                    setClassName(
                        "com.coloros.safecenter",
                        "com.coloros.safecenter.permission.startup.StartupAppListActivity"
                    )
                }
                startActivity(intent)
            } catch (e: Exception) {
                try {
                    val intent = Intent().apply {
                        setClassName(
                            "com.oppo.safe",
                            "com.oppo.safe.permission.startup.StartupAppListActivity"
                        )
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to open OPPO auto-start settings", e)
                }
            }
        }
        "vivo" -> {
            try {
                val intent = Intent().apply {
                    component = ComponentName(
                        "com.vivo.abe",
                        "com.vivo.applicationbehaviorengine.ui.ExcessivePowerManagerActivity"
                    )
                }
                startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to open Vivo auto-start settings", e)
            }
        }
        "huawei" -> {
            try {
                val intent = Intent().apply {
                    component = ComponentName(
                        "com.huawei.systemmanager",
                        "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
                    )
                }
                startActivity(intent)
            } catch (e: Exception) {
                try {
                    val intent = Intent().apply {
                        component = ComponentName(
                            "com.huawei.systemmanager",
                            "com.huawei.systemmanager.appcontrol.activity.StartupAppControlActivity"
                        )
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to open Huawei auto-start settings", e)
                }
            }
        }
    }
}

    private fun sendErrorToJS(errorCode: String, errorMessage: String) {
        reactContext?.let { ctx ->
            val params: WritableMap = Arguments.createMap().apply {
                putString("code", errorCode)
                putString("message", errorMessage)
            }
            
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onLocationError", params)
        }
    }

    private fun checkBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = getSystemService(POWER_SERVICE) as PowerManager
            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                Log.d(TAG, "Battery optimization not disabled")
                sendEventToJS("onBatteryOptimizationRequired", true)
            }
        }
    }

    private fun checkManufacturerSpecificOptimizations() {
        when (Build.MANUFACTURER.lowercase()) {
            "xiaomi" -> sendEventToJS("onManufacturerOptimization", "xiaomi")
            "huawei" -> sendEventToJS("onManufacturerOptimization", "huawei")
            "oppo" -> sendEventToJS("onManufacturerOptimization", "oppo")
            "vivo" -> sendEventToJS("onManufacturerOptimization", "vivo")
            "samsung" -> sendEventToJS("onManufacturerOptimization", "samsung")
        }
    }

    private fun sendEventToJS(eventName: String, value: Any) {
        reactContext?.let { ctx ->
            val params = Arguments.createMap().apply {
                when (value) {
                    is Boolean -> putBoolean("value", value)
                    is String -> putString("value", value)
                    is Int -> putInt("value", value)
                    is Double -> putDouble("value", value)
                }
            }
            
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand with action: ${intent?.action}")
        when (intent?.action) {
            ACTION_START -> {
                if (shouldRunInBackground()) {
                    checkAutoStartPermission()
                    startHeartbeat()
                    schedulePeriodicRestart()
                    scheduleAlarmManagerRestart()
                } else {
                    stopSelf()
                }
            }
            ACTION_STOP -> stopSelf()
            ACTION_START_TRACKING -> startLocationUpdates()
            ACTION_STOP_TRACKING -> stopLocationUpdates()
            ACTION_UPDATE_CONFIG -> {
                trackingConfig = trackingConfig.copy(
                    interval = intent.getLongExtra("interval", DEFAULT_LOCATION_INTERVAL),
                    fastestInterval = intent.getLongExtra("fastestInterval", DEFAULT_FASTEST_INTERVAL),
                    priority = intent.getIntExtra("priority", LocationRequest.PRIORITY_HIGH_ACCURACY),
                    apiUrl = intent.getStringExtra("apiUrl") ?: trackingConfig.apiUrl
                )
                if (isTrackingEnabled) {
                    stopLocationUpdates()
                    startLocationUpdates()
                } else {
                    updateNotification()
                }
            }
        }
        return START_STICKY
    }

    private fun shouldRunInBackground(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val activityManager = getSystemService(ACTIVITY_SERVICE) as ActivityManager
            activityManager.appTasks?.isNotEmpty() == true
        } else {
            true
        }
    }

    private fun schedulePeriodicRestart() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<ServiceRestartWorker>(
            15, TimeUnit.MINUTES
        ).setConstraints(constraints).build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "ServiceRestartWork",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
        Log.d(TAG, "Periodic restart scheduled with WorkManager")
    }

    private fun scheduleAlarmManagerRestart() {
        val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, ServiceRestartReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            System.currentTimeMillis() + 15 * 60 * 1000,
            pendingIntent
        )
        Log.d(TAG, "AlarmManager restart scheduled")
    }

    override fun onDestroy() {
        Log.d(TAG, "Service onDestroy")
        cleanupResources()
        super.onDestroy()
        if (!isAppInForeground()) {
            val restartIntent = Intent(this, BackgroundService::class.java).apply {
                action = ACTION_START
            }
            startService(restartIntent)
        }
    }

    private fun isAppInForeground(): Boolean {
        val activityManager = getSystemService(ACTIVITY_SERVICE) as ActivityManager
        val runningProcesses = activityManager.runningAppProcesses ?: return false
        val packageName = this.packageName
        for (processInfo in runningProcesses) {
            if (processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
                processInfo.processName == packageName) {
                return true
            }
        }
        return false
    }

    private fun cleanupResources() {
        heartbeatRunnable?.let { handler?.removeCallbacks(it) }
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
        stopLocationUpdates()
        Log.d(TAG, "Resources cleaned up")
    }
}