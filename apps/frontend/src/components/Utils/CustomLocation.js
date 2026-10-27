import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, NativeModules } from 'react-native';

const { LocationTracker } = NativeModules;

/**
 * Request location permissions.
 * Checks if permission is already granted before requesting.
 * Returns true if FINE or COARSE location permission is granted.
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
            // First check if FINE or COARSE location is already granted
            const fineGranted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (fineGranted) return true;

            const coarseGranted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            );
            if (coarseGranted) return true;

            // On Android 12+ (API 31+ / targetSdkVersion 36), requesting ONLY ACCESS_FINE_LOCATION
            // is rejected by the OS. Must request BOTH fine and coarse simultaneously.
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);

            return (
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (e) {
            console.warn('[CustomLocation] Permission error:', e);
            return false;
        }
    }

    return true;
}

/**
 * Returns a Promise<{ latitude, longitude, address }>.
 * Prioritizes fast cached OS locations and our native module.
 */
export function getCurrentLocationAsync(timeout = 10000) {
    return new Promise(async (resolve) => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                resolve({ latitude: 0, longitude: 0, address: 'Location permission not granted' });
                return;
            }

            // Helper to attach address if available (fast 1.2s OSM timeout - ALWAYS returns lat/long even if reverse geocode times out)
            const finishWithCoords = async (latitude, longitude) => {
                const numLat = Number(latitude) || 0;
                const numLon = Number(longitude) || 0;
                if (numLat !== 0 || numLon !== 0) {
                    try {
                        const osmPromise = getAddressFromOSM(numLat, numLon);
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('OSM timeout')), 1200));
                        const osm = await Promise.race([osmPromise, timeoutPromise]);
                        if (osm?.formatted) {
                            resolve({ latitude: numLat, longitude: numLon, address: osm.formatted });
                            return;
                        }
                    } catch {}
                    // OSM timed out or failed — ALWAYS preserve real GPS coordinates!
                    resolve({
                        latitude: numLat,
                        longitude: numLon,
                        address: `Near ${numLat.toFixed(4)}, ${numLon.toFixed(4)}`,
                    });
                    return;
                }
                resolve({ latitude: 0, longitude: 0, address: 'Location unavailable' });
            };

            // 1. Instant check: Geolocation.getLastKnownPosition (< 50ms)
            try {
                const lastKnown = await new Promise((res) => {
                    Geolocation.getLastKnownPosition(
                        (pos) => {
                            if (pos?.coords?.latitude || pos?.coords?.longitude) {
                                res(pos.coords);
                            } else {
                                res(null);
                            }
                        },
                        () => res(null),
                        { maxAge: 3600000 }
                    );
                });
                if (lastKnown && (Number(lastKnown.latitude) !== 0 || Number(lastKnown.longitude) !== 0)) {
                    await finishWithCoords(lastKnown.latitude, lastKnown.longitude);
                    return;
                }
            } catch (lkErr) {
                console.log('[CustomLocation] getLastKnownPosition fallback:', lkErr);
            }

            // 2. Native LocationTracker module (direct Play Services - max 3s wait)
            if (LocationTracker?.getCurrentLocation) {
                try {
                    const nativePromise = LocationTracker.getCurrentLocation();
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Native location timeout')), 3000));
                    const loc = await Promise.race([nativePromise, timeoutPromise]);
                    if (loc && (Number(loc.latitude) !== 0 || Number(loc.longitude) !== 0)) {
                        await finishWithCoords(loc.latitude, loc.longitude);
                        return;
                    }
                } catch (nativeErr) {
                    console.log('[CustomLocation] Native module getCurrentLocation error/timeout, trying fallback:', nativeErr);
                }
            }

            // 3. Geolocation library fallback (high accuracy first)
            Geolocation.getCurrentPosition(
                async (position) => {
                    await finishWithCoords(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn('[CustomLocation] Geolocation high accuracy failed, trying low accuracy fallback:', error?.message);
                    // 4. Fallback to network/cell tower location if GPS satellite timed out
                    Geolocation.getCurrentPosition(
                        async (lowPos) => {
                            await finishWithCoords(lowPos.coords.latitude, lowPos.coords.longitude);
                        },
                        (lowErr) => {
                            console.warn('[CustomLocation] Geolocation low accuracy also failed:', lowErr?.message);
                            resolve({ latitude: 0, longitude: 0, address: 'Location unavailable' });
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 6000,
                            maximumAge: 60000,
                            forceRequestLocation: true,
                            showLocationDialog: true,
                        }
                    );
                },
                {
                    enableHighAccuracy: true,
                    timeout: Math.min(timeout, 8000),
                    maximumAge: 30000,
                    forceRequestLocation: true,
                    showLocationDialog: true,
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



// reverseGeocode.js
/**
 * Get address information from OSM coordinates.
 * @param {number} latitude - The latitude.
 * @param {number} longitude - The longitude.
 * @returns {Promise<Object|null>} - The address information or null if not found.
 * formatted: Full address string
 * street: Street name
 * area: Area or locality
 * city: City or town
 * state: State or province
 * country: Country name
 * pincode: Postal code
 */
export async function getAddressFromOSM(latitude, longitude) {
    try {
        console.log(`[getAddressFromOSM] Fetching address for lat: ${latitude}, lon: ${longitude}`);
        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

        const res = await fetch(url, {
            headers: {
               'User-Agent': 'PinnacleOnDuty/1.0 (PinnacleSystems@gmail.com)',
                'Accept-Language': 'en',
            },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!data?.display_name) throw new Error('No address found');

        const a = data.address || {};
        return {
            formatted: data.display_name,
            street: a.road || '',
            area: a.suburb || a.neighbourhood || a.village || '',
            city: a.city || a.town || a.village || a.county || '',
            state: a.state || '',
            country: a.country || '',
            pincode: a.postcode || '',
        };
    } catch (e) {
        console.warn('[getAddressFromOSM]', e.message);
        return null;
    }
}
