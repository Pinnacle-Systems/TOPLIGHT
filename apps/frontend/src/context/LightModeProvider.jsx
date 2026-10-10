import React, { useEffect } from 'react';
import { Appearance, Platform, StatusBar, NativeModules } from 'react-native';

export default function LightModeProvider({ children }) {
  useEffect(() => {
    // Permanent dark mode disabler
    const disableDarkModeCompletely = () => {
      // 1. System-level light mode enforcement
      Appearance.setColorScheme('light');
      
      // 2. Platform-specific overrides
      if (Platform.OS === 'android') {
        try {
          if (NativeModules.UIManager?.setOverrideNativeStyle) {
            NativeModules.UIManager.setOverrideNativeStyle({
              view: { forceDarkAllowed: false },
              text: { forceDarkAllowed: false },
              all: { forceDarkAllowed: false }
            });
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
    
    return () => {
      appearanceSubscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffffff" 
        translucent={false} 
      />
      {children}
    </>
  );
}
