// PermissionUtils.js
import { PermissionsAndroid, Platform } from 'react-native';
import { NativeModules } from 'react-native';

export const requestOverlayPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    // First check if we have permission
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW
    );
    
    if (granted) return true;

    // Request permission if needed - with proper null check
    const permission = PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW;
    if (!permission) {
      console.warn('SYSTEM_ALERT_WINDOW permission not available');
      return false;
    }

    const result = await PermissionsAndroid.request(permission, {
      title: 'Overlay Permission',
      message: 'App needs overlay permission to show bubble',
      buttonPositive: 'OK',
    });

    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

export const openOverlaySettings = async () => {
  if (Platform.OS === 'android') {
    try {
      await NativeModules.PermissionModule.openOverlaySettings();
      return true;
    } catch (error) {
      console.warn('Failed to open settings:', error);
      return false;
    }
  }
  return false;
};