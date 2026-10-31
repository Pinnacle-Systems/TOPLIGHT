package com.frontend

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat
import android.app.NotificationManager
import androidx.work.*
import com.facebook.react.bridge.Arguments
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
        const val ACTION_START = "com.frontend.ACTION_START"
        const val ACTION_STOP = "com.frontend.ACTION_STOP"
        const val ACTION_START_TRACKING = "com.frontend.ACTION_START_TRACKING"
        const val ACTION_STOP_TRACKING = "com.frontend.ACTION_STOP_TRACKING"
        const val ACTION_UPDATE_CONFIG = "com.frontend.ACTION_UPDATE_CONFIG"
        
        private const val CHANNEL_ID = "background_service_channel"
        private const val NOTIFICATION_ID = 101
        private const val WAKE_LOCK_TAG = "com.frontend::BackgroundServiceWakelock"
        private const val HEARTBEAT_INTERVAL = 30 * 60 * 1000L // 30 minutes
        private const val TAG = "BackgroundService"

        // Default values loaded from BuildConfig (which reads .env at build time)
        val DEFAULT_LOCATION_INTERVAL = BuildConfig.LOCATION_INTERVAL.toLongOrNull() ?: 5000L
        val DEFAULT_FASTEST_INTERVAL = BuildConfig.LOCATION_FASTEST_INTERVAL.toLongOrNull() ?: 3000L

        var isTrackingEnabled = false
            private set
        var reactContext: ReactContext? = null
        var trackingConfig = TrackingConfig(
            interval = DEFAULT_LOCATION_INTERVAL,
            fastestInterval = DEFAULT_FASTEST_INTERVAL,
            priority = LocationRequest.PRIORITY_HIGH_ACCURACY,
            apiUrl = BuildConfig.LOCATION_API_URL,
            maxWaitTime = DEFAULT_LOCATION_INTERVAL * 2
        )

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
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Running in background to track your location"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableVibration(false)
                enableLights(false)
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

        val prefs = getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
        val docID = prefs?.getString("docId", null)
        val notifTitle = if (isTrackingEnabled) BuildConfig.LOCATION_NOTIFICATION_TITLE else "TOPLIGHT App"
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(notifTitle)
            .setContentText(if (isTrackingEnabled && docID != null) "Your Onduty ID: $docID" else "Service active")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setAutoCancel(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pendingIntent)
            .setSound(null)
            .build()
    }

    private fun startHeartbeat() {
        handler = Handler(Looper.getMainLooper())
        heartbeatRunnable = object : Runnable {
            override fun run() {
                handler?.postDelayed(this, HEARTBEAT_INTERVAL)
            }
        }
        handler?.post(heartbeatRunnable!!)
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
        prefs.edit().remove("docId").remove("COMPCODE").remove("apiUrl").apply()

        locationCallback?.let {
            fusedLocationClient?.removeLocationUpdates(it)
            isTrackingEnabled = false
            Log.d(TAG, "Location updates stopped")
            updateNotification()
        }
    }

    private fun sendLocationToApi(location: Location) {
        val prefs = getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
        val userId = prefs?.getString("userId", null)
        val docId = prefs?.getString("docId", null)
        val compcode = prefs?.getString("COMPCODE", null)
        val savedApiUrl = prefs?.getString("apiUrl", null)

        // API URL prioritized: 1) SharedPreferences, 2) trackingConfig, 3) BuildConfig (from .env)
        val targetUrl = when {
            !savedApiUrl.isNullOrEmpty() -> savedApiUrl
            !trackingConfig.apiUrl.isNullOrEmpty() -> trackingConfig.apiUrl
            else -> BuildConfig.LOCATION_API_URL
        }

        val json = JSONObject().apply {
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("timestamp", System.currentTimeMillis())
            put("timeStamp", System.currentTimeMillis())
            put("accuracy", location.accuracy)
            put("speed", location.speed)
            put("bearing", location.bearing)
            put("altitude", location.altitude)
            put("provider", location.provider)
            put("userId", userId)
            put("docId", docId)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url(targetUrl)
            .post(requestBody)
            .addHeader("COMPCODE", "" + compcode)
            .build()

        okHttpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: java.io.IOException) {
                Log.e(TAG, "Failed to send location to API: $targetUrl", e)
                sendErrorToJS("API_ERROR", e.message ?: "Failed to send location")
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    Log.e(TAG, "API response not successful: ${response.code}")
                    sendErrorToJS("API_ERROR", "Response code: ${response.code}")
                } else {
                    Log.d(TAG, "Location sent successfully to: $targetUrl")
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

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand with action: ${intent?.action}")
        when (intent?.action) {
            ACTION_START -> {
                startHeartbeat()
                schedulePeriodicRestart()
                scheduleAlarmManagerRestart()
            }
            ACTION_STOP -> stopSelf()
            ACTION_START_TRACKING -> {
                val intentApiUrl = intent?.getStringExtra("apiUrl")
                if (!intentApiUrl.isNullOrEmpty()) {
                    trackingConfig = trackingConfig.copy(apiUrl = intentApiUrl)
                }
                startLocationUpdates()
            }
            ACTION_STOP_TRACKING -> stopLocationUpdates()
            ACTION_UPDATE_CONFIG -> {
                val intentApiUrl = intent?.getStringExtra("apiUrl") ?: trackingConfig.apiUrl
                trackingConfig = trackingConfig.copy(
                    interval = intent?.getLongExtra("interval", DEFAULT_LOCATION_INTERVAL) ?: DEFAULT_LOCATION_INTERVAL,
                    fastestInterval = intent?.getLongExtra("fastestInterval", DEFAULT_FASTEST_INTERVAL) ?: DEFAULT_FASTEST_INTERVAL,
                    priority = intent?.getIntExtra("priority", LocationRequest.PRIORITY_HIGH_ACCURACY) ?: LocationRequest.PRIORITY_HIGH_ACCURACY,
                    apiUrl = intentApiUrl
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
        
        val triggerAtMillis = System.currentTimeMillis() + 15 * 60 * 1000
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
            )
            Log.w(TAG, "Exact alarms unavailable; scheduled an inexact restart")
            return
        }

        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
            )
            Log.d(TAG, "Exact AlarmManager restart scheduled")
        } catch (e: SecurityException) {
            Log.w(TAG, "Exact alarm permission unavailable; scheduling an inexact restart", e)
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
            )
        }
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
