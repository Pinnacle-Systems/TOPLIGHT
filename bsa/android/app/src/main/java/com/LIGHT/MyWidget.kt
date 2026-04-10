package com.LIGHT
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
class MyWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { appWidgetId ->
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_layout)
        
        // Set title
        views.setTextViewText(R.id.widgetText, "Insurance Report")
        
        // Set up the list
        val intent = Intent(context, InsuranceWidgetService::class.java)
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        views.setRemoteAdapter(R.id.insuranceListView, intent)
        
        // Set empty view
        views.setEmptyView(R.id.insuranceListView, R.id.emptyView)
        
        // Set click template
        val clickIntent = Intent(context, MainActivity::class.java)
        val clickPendingIntent = PendingIntent.getActivity(
            context,
            0,
            clickIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setPendingIntentTemplate(R.id.insuranceListView, clickPendingIntent)
        
        // Update widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    companion object {
        fun updateWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val widgetIds = appWidgetManager.getAppWidgetIds(
                ComponentName(context, MyWidget::class.java)
            )
            appWidgetManager.notifyAppWidgetViewDataChanged(widgetIds, R.id.insuranceListView)
        }
    }
}