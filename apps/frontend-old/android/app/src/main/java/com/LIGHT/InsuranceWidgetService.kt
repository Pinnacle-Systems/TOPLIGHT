package com.LIGHT

import android.content.Intent
import android.widget.RemoteViewsService

class InsuranceWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return InsuranceRemoteViewsFactory(applicationContext, intent)
    }
}