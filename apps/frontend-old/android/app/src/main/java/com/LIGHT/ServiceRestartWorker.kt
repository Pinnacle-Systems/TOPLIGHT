package com.LIGHT


import android.content.Context
import android.content.Intent
import androidx.work.Worker
import androidx.work.WorkerParameters

class ServiceRestartWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        applicationContext.startService(
            Intent(applicationContext, BackgroundService::class.java).apply {
                action = BackgroundService.ACTION_START
            }
        )
        return Result.success()
    }
}