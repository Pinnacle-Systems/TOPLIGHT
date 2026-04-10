import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  NativeModules, 
  Platform, 
  Alert, 
  Linking, 
  PermissionsAndroid, 
  NativeEventEmitter 
} from 'react-native';


const { BackgroundActionsModule, BubbleModule, LocationTrackerModule } = NativeModules;

const locationTrackerEmitter = new NativeEventEmitter(LocationTrackerModule);

// Start listening for events
const subscription = locationTrackerEmitter.addListener('onLocationUpdate', (location) => {
  // Handle location updates
});

locationTrackerEmitter.addListener('onLocationError', (error) => {
  subscription.remove();
});

// Permission request tracking keys
const PERMISSION_KEYS = {
  OVERLAY: 'OVERLAY_PERMISSION_REQUESTED',
  NOTIFICATION: 'NOTIFICATION_PERMISSION_REQUESTED',
  BATTERY: 'BATTERY_OPTIMIZATION_REQUESTED'
};

// Clear permission flags (optional - for testing or resetting)
const clearPermissionFlags = async () => {
  try {
    await AsyncStorage.multiRemove([
      PERMISSION_KEYS.OVERLAY,
      PERMISSION_KEYS.NOTIFICATION,
      PERMISSION_KEYS.BATTERY
    ]);
    console.log('Permission flags cleared');
  } catch (error) {
    console.error('Error clearing permission flags:', error);
  }
};

const checkBatteryOptimization = async () => {
  try {
    if (!BackgroundActionsModule?.checkBatteryOptimizationStatus) {
      console.warn('Battery optimization check not available');
      return true;
    }

    // Check if we've already asked about battery optimization
    const alreadyAsked = await AsyncStorage.getItem(PERMISSION_KEYS.BATTERY);
    const isIgnoringOptimization = await BackgroundActionsModule.checkBatteryOptimizationStatus();
    
    if (alreadyAsked === 'true' || isIgnoringOptimization) {
      return isIgnoringOptimization;
    }

    // Mark that we've asked about battery optimization
    await AsyncStorage?.setItem(PERMISSION_KEYS.BATTERY, 'true');
    
    return new Promise((resolve) => {
      Alert.alert(
        'Battery Optimization',
        'For best performance, please disable battery optimization for this app',
        [
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                await BackgroundActionsModule.openBatteryOptimizationSettings();
                // Check status again after opening settings
                const newStatus = await BackgroundActionsModule.checkBatteryOptimizationStatus();
                resolve(newStatus);
              } catch (e) {
                console.error('Failed to open settings:', e);
                resolve(false);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false)
          }
        ],
        { cancelable: false }
      );
    });
  } catch (error) {
    console.error('Battery optimization check failed:', error);
    return false;
  }
};

const checkAndRequestOverlayPermission = async () => {
  if (Platform.OS !== 'android') return true;
  
  try {
    // Check if we've already asked for this permission
    const alreadyAsked = await AsyncStorage.getItem(PERMISSION_KEYS.OVERLAY);
    if (alreadyAsked === 'true') {
      // Just check current status without prompting again
      return BackgroundActionsModule.hasOverlayPermission();
    }

    if (!BackgroundActionsModule?.hasOverlayPermission) {
      console.warn('Overlay permission check not available');
      return true;
    }

    const hasPermission = await BackgroundActionsModule.hasOverlayPermission();
    if (hasPermission) return true;

    // Mark that we've asked for this permission
    await AsyncStorage.setItem(PERMISSION_KEYS.OVERLAY, 'true');
    
    return new Promise((resolve) => {
      Alert.alert(
        'Display Over Other Apps',
        'This app needs permission to display over other apps to function properly',
        [
          {
            text: 'Grant Permission',
            onPress: async () => {
              try {
                const result = await BackgroundActionsModule.requestOverlayPermission();
                resolve(result);
              } catch (e) {
                console.error('Failed to request overlay permission:', e);
                Linking.openSettings();
                resolve(false);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false)
          }
        ],
        { cancelable: false }
      );
    });
  } catch (error) {
    console.error('Overlay permission error:', error);
    return false;
  }
};

const checkNotificationPermission = async () => {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 33) return true;

  try {
    // Check if we've already asked for this permission
    const alreadyAsked = await AsyncStorage.getItem(PERMISSION_KEYS.NOTIFICATION);
    if (alreadyAsked === 'true') {
      // Just check current status without prompting again
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return status;
    }

    // Mark that we've asked for this permission
    await AsyncStorage.setItem(PERMISSION_KEYS.NOTIFICATION, 'true');
    
    const notificationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return notificationGranted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

const startBubbleService = async () => {
  try {
    // Check and request necessary permissions
    const [
      overlayPermissionGranted,
      notificationPermissionGranted,
      batteryOptimized
    ] = await Promise.all([
      checkAndRequestOverlayPermission(),
      checkNotificationPermission(),
      checkBatteryOptimization()
    ]);

    if (!overlayPermissionGranted) {
      throw new Error('Overlay permission not granted - bubble functionality will not work');
    }

    if (!notificationPermissionGranted) {
      console.warn('Notification permission not granted - service may not work properly');
    }

    if (!batteryOptimized) {
      console.warn('Battery optimization not disabled - service may be terminated');
    }

    // Start services
    const servicePromises = [];
    
    if (BubbleModule?.startBubbleService) {
      servicePromises.push(BubbleModule.startBubbleService());
    }

    if (BackgroundActionsModule?.startBackgroundService) {
      servicePromises.push(BackgroundActionsModule.startBackgroundService());
    }

    await Promise.all(servicePromises);
    console.log('All services started successfully');
    return true;
  } catch (error) {
    console.error('Service start failed:', error);
    // Alert.alert(
    //   'Service Error',
    //   error.message || 'Failed to start services',
    //   [
    //     { text: 'OK' },
    //     { text: 'Open Settings', onPress: () => Linking.openSettings() }
    //   ],
    //   { cancelable: false }
    // );
    return false;
  }
};

const stopBubbleService = async () => {
  try {
    const servicePromises = [];
    
    if (BackgroundActionsModule?.stopBackgroundService) {
      servicePromises.push(BackgroundActionsModule.stopBackgroundService());
    }

    if (BubbleModule?.stopBubbleService) {
      servicePromises.push(BubbleModule.stopBubbleService());
    }

    await Promise.all(servicePromises);
    console.log('All services stopped successfully');
    return true;
  } catch (error) {
    console.error('Service stop failed:', error);
    Alert.alert(
      'Service Error',
      error.message || 'Failed to stop services',
      [{ text: 'OK' }],
      { cancelable: false }
    );
    return false;
  }
};

export { 
  startBubbleService, 
  stopBubbleService,
  clearPermissionFlags // Optional - export if you want to allow resetting permissions
};