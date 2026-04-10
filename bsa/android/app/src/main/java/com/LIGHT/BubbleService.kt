package com.LIGHT

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.*
import android.provider.Settings
import android.util.DisplayMetrics
import android.util.Log
import android.net.Uri
import android.view.*
import android.widget.ImageView
import androidx.core.app.NotificationCompat

class BubbleService : Service() {

    companion object {
        private const val TAG = "BubbleService"
        private const val NOTIFICATION_ID = 101
        private const val CHANNEL_ID = "bubble_channel"
        private const val BUBBLE_WIDTH_DP = 60
        private const val BUBBLE_HEIGHT_DP = 60
        
        fun start(context: Context) {
            val intent = Intent(context, BubbleService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    private lateinit var windowManager: WindowManager
    private lateinit var bubbleView: View
    private lateinit var layoutParams: WindowManager.LayoutParams
    private val displayMetrics = DisplayMetrics()
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate")
        acquireWakeLock()
        initializeBubble()
        startForegroundService()
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "$packageName::BubbleServiceWakelock"
        ).apply {
            acquire(10 * 60 * 1000L /*10 minutes*/)
        }
    }


private fun restartService() {
    val restartIntent = Intent(applicationContext, BubbleService::class.java).also {
        it.setPackage(packageName)
    }

    val pendingIntent = PendingIntent.getService(
        this,
        1,
        restartIntent,
        PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
    )

    val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
    alarmManager.set(
        AlarmManager.ELAPSED_REALTIME,
        SystemClock.elapsedRealtime() + 1000, // 1 second delay
        pendingIntent
    )
}


    private fun initializeBubble() {
        if (!canDrawOverlays()) {
            requestOverlayPermission()
            return
        }
        
        createNotificationChannel()
        setupWindowManager()
        createBubbleView()
        setupTouchListener()
    }

    private fun canDrawOverlays(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }

    private fun startForegroundService() {
        startForeground(NOTIFICATION_ID, createNotification())
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Bubble Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Floating bubble service"
                setShowBadge(false)
            }
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val openAppIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Bubble Service")
            .setContentText("Tap to open app")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }

    private fun setupWindowManager() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        windowManager.defaultDisplay.getMetrics(displayMetrics)

        layoutParams = WindowManager.LayoutParams(
            (BUBBLE_WIDTH_DP * displayMetrics.density).toInt(),
            (BUBBLE_HEIGHT_DP * displayMetrics.density).toInt(),
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
                    WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 0
            y = 100
        }
    }

    private fun createBubbleView() {
        bubbleView = LayoutInflater.from(this).inflate(R.layout.bubble_layout, null)
        windowManager.addView(bubbleView, layoutParams)
    }

    private fun setupTouchListener() {
        bubbleView.findViewById<ImageView>(R.id.bubble_icon).setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = layoutParams.x
                        initialY = layoutParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        layoutParams.x = initialX + (event.rawX - initialTouchX).toInt()
                        layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(bubbleView, layoutParams)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (isClick(event)) {
                            onBubbleClick()
                        }
                        return true
                    }
                }
                return false
            }

            private fun isClick(event: MotionEvent): Boolean {
                val dx = (event.rawX - initialTouchX).toInt()
                val dy = (event.rawY - initialTouchY).toInt()
                return dx * dx + dy * dy < 100 // 10px threshold
            }
        })
    }

    private fun onBubbleClick() {
        try {
            packageManager.getLaunchIntentForPackage(packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                startActivity(this)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open app", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service onDestroy")
        try {
            if (::windowManager.isInitialized && ::bubbleView.isInitialized) {
                windowManager.removeView(bubbleView)
            }
            restartService()
        } catch (e: Exception) {
            Log.e(TAG, "Error removing bubble view", e)
        }
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }
}