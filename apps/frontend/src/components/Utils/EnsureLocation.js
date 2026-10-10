import { Alert } from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

export async function ensureLocationEnabled() {
  try {
    const result = await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    });
    // Location is enabled, continue
    return result === 'enabled' || result === 'already-enabled';
  } catch (err) {
    // User denied enabling location or there was an error
    return false;
  }
}
