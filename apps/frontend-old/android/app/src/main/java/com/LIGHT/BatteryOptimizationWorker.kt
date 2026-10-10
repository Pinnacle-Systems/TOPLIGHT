package com.LIGHT



import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.work.Worker
import androidx.work.WorkerParameters

class BatteryOptimizationWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        createNotification()
        return Result.success()
    }

    private fun createNotification() {
        val channelId = "battery_optimization_channel"
        val notificationId = 102
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Battery Optimization",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Battery optimization notifications"
            }
            (applicationContext.getSystemService(NotificationManager::class.java))
                ?.createNotificationChannel(channel)
        }

        val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(applicationContext, channelId)
            .setContentTitle("Battery Optimization")
            .setContentText("Please disable battery optimization for this app")
            .setSmallIcon(R.drawable.ic_battery)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        (applicationContext.getSystemService(NotificationManager::class.java))
            ?.notify(notificationId, notification)
    }
}