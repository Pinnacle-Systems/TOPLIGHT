import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, NativeModules } from 'react-native';

const { LocationTracker } = NativeModules;

/**
 * Request both FINE and (on Android 10+) BACKGROUND location permissions.
 * Returns true if all required permissions are granted.
 */
export async function requestLocationPermission() {
    if (Platform.OS === 'ios') {
        try {
            Geolocation.requestAuthorization('whenInUse');
            return true;
        } catch {
            return false;
        }
    }

    if (Platform.OS === 'android') {
        try {
            const fineGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs your location for OnDuty tracking.',
                    buttonPositive: 'Allow',
                },
            );

            if (fineGranted !== PermissionsAndroid.RESULTS.GRANTED) {
                return false;
            }

            // Background location required for tracking when app is in background / killed
            if (Platform.Version >= 29) {
                const bgGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                        title: 'Background Location Permission',
                        message: 'Allow background location so OnDuty tracking continues when app is minimised.',
                        buttonPositive: 'Allow Always',
                    },
                );
                return bgGranted === PermissionsAndroid.RESULTS.GRANTED;
            }

            return true;
        } catch (e) {
            console.warn('[CustomLocation] Permission error:', e);
            return false;
        }
    }

    return true;
}

/**
 * Returns a Promise<{ latitude, longitude }>.
 * Prioritizes our native LocationTracker module to avoid third-party library crashes.
 */
export function getCurrentLocationAsync(timeout = 15000) {
    return new Promise(async (resolve) => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                resolve({ latitude: 0, longitude: 0, address: 'Location permission not granted' });
                return;
            }

            // 1. Native LocationTracker module (direct Play Services - 100% crash free)
            if (LocationTracker?.getCurrentLocation) {
                try {
                    const loc = await LocationTracker.getCurrentLocation();
                    if (loc && (loc.latitude || loc.longitude)) {
                        resolve({
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                            address: 'GPS coordinates ready',
                        });
                        return;
                    }
                } catch (nativeErr) {
                    console.log('[CustomLocation] Native module getCurrentLocation error, trying fallback:', nativeErr);
                }
            }

            // 2. Geolocation library fallback
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: 'GPS coordinates ready',
                    });
                },
                (error) => {
                    console.warn('[CustomLocation] Geolocation error:', error?.message);
                    resolve({ latitude: 0, longitude: 0, address: 'Location unavailable' });
                },
                {
                    enableHighAccuracy: true,
                    timeout,
                    maximumAge: 10000,
                    forceRequestLocation: false,
                    showLocationDialog: false,
                },
            );
        } catch (e) {
            console.warn('[CustomLocation] Exception in getCurrentLocationAsync:', e);
            resolve({ latitude: 0, longitude: 0, address: 'Location unavailable' });
        }
    });
}

/**
 * Legacy callback-based wrapper kept for backward compatibility.
 */
export async function getCurrentLocation(callback) {
    try {
        const coords = await getCurrentLocationAsync();
        callback?.({ coords });
    } catch {
        callback?.({ coords: { latitude: 0, longitude: 0 } });
    }
}

/**
 * Start watching position changes.
 */
export async function startWatchingLocation(onLocation, onError) {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            onError?.('Location permission denied');
            return null;
        }

        return Geolocation.watchPosition(
            (position) => onLocation(position),
            (error) => onError?.(error.message),
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 3000,
            },
        );
    } catch (e) {
        onError?.(e.message);
        return null;
    }
}

/**
 * Stop watching location.
 */
export function stopWatchingLocation(watchId) {
    try {
        if (watchId !== null && watchId !== undefined) {
            Geolocation.clearWatch(watchId);
        }
    } catch (e) {
        console.warn('[CustomLocation] stopWatchingLocation error:', e);
    }
}
