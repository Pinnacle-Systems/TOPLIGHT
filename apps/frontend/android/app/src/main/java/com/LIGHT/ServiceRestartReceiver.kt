package com.LIGHT

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat

class ServiceRestartReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("ServiceRestartReceiver", "Restarting service via AlarmManager")
        
        // Get stored tracking data
        val sharedPref = context.getSharedPreferences("TrackingPrefs", Context.MODE_PRIVATE)
        val userId = sharedPref.getString("userId", null)
        val docId = sharedPref.getString("docId", null)
        val compcode = sharedPref.getString("COMPCODE", null)
        
        if (userId != null && docId != null) {
            val serviceIntent = Intent(context, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_START_TRACKING
                putExtra("userId", userId)
                putExtra("docId", docId)
                putExtra("COMPCODE", compcode)
            }
            
            // Start as foreground service
            ContextCompat.startForegroundService(context, serviceIntent)
        } else {
            Log.d("ServiceRestartReceiver", "No tracking config found, not restarting")
        }
    }
}