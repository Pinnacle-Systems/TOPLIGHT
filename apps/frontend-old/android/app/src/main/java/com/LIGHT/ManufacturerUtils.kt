package com.LIGHT

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings

object ManufacturerUtils {

    fun checkManufacturerSpecificSettings(context: Context) {
        when {
            isXiaomi() -> openXiaomiAutostart(context)
            isHuawei() -> openHuaweiProtectedApps(context)
            isOppo() -> openOppoAutoStart(context)
            isVivo() -> openVivoBackgroundManager(context)
            isSamsung() -> openSamsungBatteryOptimization(context)
            isOnePlus() -> openOnePlusAutoStart(context)
            else -> openDefaultBatterySettings(context)
        }
    }

    private fun isXiaomi(): Boolean {
        return Build.MANUFACTURER.equals("xiaomi", ignoreCase = true)
    }

    private fun isHuawei(): Boolean {
        return Build.MANUFACTURER.equals("huawei", ignoreCase = true) ||
                Build.MANUFACTURER.equals("honor", ignoreCase = true)
    }

    private fun isOppo(): Boolean {
        return Build.MANUFACTURER.equals("oppo", ignoreCase = true) ||
                Build.MANUFACTURER.equals("realme", ignoreCase = true) ||
                Build.MANUFACTURER.equals("oneplus", ignoreCase = true)
    }

    private fun isVivo(): Boolean {
        return Build.MANUFACTURER.equals("vivo", ignoreCase = true)
    }

    private fun isSamsung(): Boolean {
        return Build.MANUFACTURER.equals("samsung", ignoreCase = true)
    }

    private fun isOnePlus(): Boolean {
        return Build.MANUFACTURER.equals("oneplus", ignoreCase = true)
    }

    private fun openXiaomiAutostart(context: Context) {
        try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openDefaultBatterySettings(context)
        }
    }

    private fun openHuaweiProtectedApps(context: Context) {
        try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.huawei.systemmanager",
                    "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
                )
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            try {
                val intent = Intent().apply {
                    component = ComponentName(
                        "com.huawei.systemmanager",
                        "com.huawei.systemmanager.optimize.process.ProtectActivity"
                    )
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                openDefaultBatterySettings(context)
            }
        }
    }

    private fun openOppoAutoStart(context: Context) {
        try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.coloros.safecenter",
                    "com.coloros.safecenter.permission.startup.StartupAppListActivity"
                )
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            try {
                val intent = Intent().apply {
                    component = ComponentName(
                        "com.oppo.safe",
                        "com.oppo.safe.permission.startup.StartupAppListActivity"
                    )
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                openDefaultBatterySettings(context)
            }
        }
    }

    private fun openVivoBackgroundManager(context: Context) {
        try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.vivo.permissionmanager",
                    "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"
                )
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            try {
                val intent = Intent().apply {
                    component = ComponentName(
                        "com.iqoo.secure",
                        "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"
                    )
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                openDefaultBatterySettings(context)
            }
        }
    }

    private fun openSamsungBatteryOptimization(context: Context) {
        try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.samsung.android.lool",
                    "com.samsung.android.sm.ui.battery.BatteryActivity"
                )
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openDefaultBatterySettings(context)
        }
    }

    private fun openOnePlusAutoStart(context: Context) {
        try {
            val intent = Intent().apply {
                component = ComponentName(
                    "com.oneplus.security",
                    "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity"
                )
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openDefaultBatterySettings(context)
        }
    }

    private fun openDefaultBatterySettings(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
            context.startActivity(intent)
        } catch (e: Exception) {
            // Fallback to general settings if battery optimization settings can't be opened
            val intent = Intent(Settings.ACTION_SETTINGS)
            context.startActivity(intent)
        }
    }
}