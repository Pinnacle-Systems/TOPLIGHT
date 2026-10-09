package com.LIGHT

import android.content.Context
import com.facebook.flipper.android.AndroidFlipperClient
import com.facebook.flipper.android.utils.FlipperUtils
import com.facebook.flipper.plugins.inspector.DescriptorMapping
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin
import com.facebook.react.ReactInstanceManager

object ReactNativeFlipper {
  @JvmStatic
  fun initializeFlipper(context: Context, reactInstanceManager: ReactInstanceManager) {
    if (FlipperUtils.shouldEnableFlipper(context)) {
      val client = AndroidFlipperClient.getInstance(context)
      client.addPlugin(InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()))
      client.addPlugin(NetworkFlipperPlugin())
      client.start()
    }
  }
}
