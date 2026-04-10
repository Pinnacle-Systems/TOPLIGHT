import React, { useEffect } from 'react';
import { Appearance, Platform, StatusBar, NativeModules } from 'react-native';

export default function LightModeProvider({ children }) {
  useEffect(() => {
    // Permanent dark mode disabler
    const disableDarkModeCompletely = () => {
      // 1. System-level light mode enforcement
      Appearance.setColorScheme('light');
      
      // 2. Status bar configuration
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#ffffff');
        StatusBar.setTranslucent(false);
      }

      // 3. Platform-specific overrides
      if (Platform.OS === 'android') {
        try {
          // 3a. Standard Android force dark mode disable
          if (NativeModules.UIManager?.setOverrideNativeStyle) {
            NativeModules.UIManager.setOverrideNativeStyle({
              view: { forceDarkAllowed: false },
              text: { forceDarkAllowed: false },
              all: { forceDarkAllowed: false }
            });
          }

          // 3b. Manufacturer-specific overrides
          // Xiaomi/MIUI devices
          if (NativeModules.MIUIForceDark) {
            NativeModules.MIUIForceDark.disableForceDark();
          }
          // Samsung devices
          if (NativeModules.SamsungDarkMode) {
            NativeModules.SamsungDarkMode.setForceDarkMode(false);
          }
          // Huawei devices
          if (NativeModules.HuaweiDarkMode) {
            NativeModules.HuaweiDarkMode.disableDarkMode();
          }
          
          // 3c. Alternative appearance modules
          if (NativeModules.RNAppearance) {
            NativeModules.RNAppearance.set('light');
          } else if (NativeModules.NativeAppearance) {
            NativeModules.NativeAppearance.set('light');
          }
          
          // 3d. Legacy support
          if (NativeModules.I18nManager) {
            NativeModules.I18nManager.allowRTL(false);
          }
        } catch (e) {
          console.warn('Dark mode disable failed:', e);
        }
      }
    };

    // Apply immediately
    disableDarkModeCompletely();
    
    // Continuous protection against system changes
    const appearanceSubscription = Appearance.addChangeListener(disableDarkModeCompletely);
    
    // Additional safety checks every 2 seconds
    const interval = setInterval(disableDarkModeCompletely, 2000);

    return () => {
      appearanceSubscription.remove();
      clearInterval(interval);
    };
  }, []);

  return children;
}