/**
 * useLocationTracker.js
 * 
 * Wraps the native LocationTracker NativeModule with a clean JS API.
 * Handles: start, stop, restart-on-mount, event listeners.
 * Works even when app is force-closed (native Android service is persistent).
 * All URLs and intervals are loaded dynamically from .env!
 */
import { useEffect, useRef, useCallback } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { 
    LOCATION_API_URL, 
    API_URL, 
    LOCATION_INTERVAL, 
    LOCATION_FASTEST_INTERVAL 
} from '@env';

const { LocationTracker } = NativeModules;

const LOCATION_CONFIG = {
    interval: Number(LOCATION_INTERVAL) || 5000,
    fastestInterval: Number(LOCATION_FASTEST_INTERVAL) || 3000,
    priority: 100,  // PRIORITY_HIGH_ACCURACY
    apiUrl: LOCATION_API_URL || `${API_URL}/onduty/send_location`,
};

/**
 * @param {object} options
 * @param {boolean} options.autoRestartOnMount - If true, restarts tracking if SharedPrefs has active docId (e.g. after app kill)
 * @param {function} options.onLocationUpdate - Called with { latitude, longitude, accuracy, ... }
 * @param {function} options.onError - Called with error info
 */
export function useLocationTracker({ autoRestartOnMount = false, onLocationUpdate, onError } = {}) {
    const emitterRef = useRef(null);
    const locationSubRef = useRef(null);
    const errorSubRef = useRef(null);

    // Set up native event listeners
    useEffect(() => {
        if (!LocationTracker || Platform.OS !== 'android') return;

        emitterRef.current = new NativeEventEmitter(LocationTracker);

        if (onLocationUpdate) {
            locationSubRef.current = emitterRef.current.addListener(
                'onLocationUpdate',
                onLocationUpdate,
            );
        }

        if (onError) {
            errorSubRef.current = emitterRef.current.addListener(
                'onLocationError',
                onError,
            );
        }

        return () => {
            locationSubRef.current?.remove();
            errorSubRef.current?.remove();
        };
    }, [onLocationUpdate, onError]);

    // Auto-restart tracking if app was killed mid-trip
    useEffect(() => {
        if (!autoRestartOnMount || !LocationTracker || Platform.OS !== 'android') return;
        LocationTracker.restartTrackingIfNeeded?.()
            .then((restarted) => {
                if (restarted) {
                    console.log('[LocationTracker] Tracking resumed after app restart');
                }
            })
            .catch((e) => console.warn('[LocationTracker] restartTrackingIfNeeded error:', e));
    }, [autoRestartOnMount]);

    /**
     * Start the foreground service and begin GPS updates.
     * @param {string} userId
     * @param {string} docId
     * @param {string} compCode
     */
    const startTracking = useCallback(async (userId, docId, compCode) => {
        if (!LocationTracker || Platform.OS !== 'android') return;
        try {
            await LocationTracker.startService();
            await LocationTracker.updateTrackingConfig({
                ...LOCATION_CONFIG,
                userId,
                docId,
                COMPCODE: compCode,
            });
            await LocationTracker.startTracking({ 
                userId, 
                docId, 
                COMPCODE: compCode,
                apiUrl: LOCATION_CONFIG.apiUrl,
            });
            console.log('[LocationTracker] Tracking started for docId:', docId);
        } catch (e) {
            console.error('[LocationTracker] startTracking error:', e);
        }
    }, []);

    /**
     * Stop GPS updates and stop the foreground service.
     */
    const stopTracking = useCallback(async () => {
        if (!LocationTracker || Platform.OS !== 'android') return;
        try {
            await LocationTracker.stopTracking();
            await LocationTracker.stopService();
            console.log('[LocationTracker] Tracking stopped');
        } catch (e) {
            console.error('[LocationTracker] stopTracking error:', e);
        }
    }, []);

    /**
     * Check if there is an active tracking session persisted in SharedPreferences.
     */
    const hasActiveTracking = useCallback(async () => {
        if (!LocationTracker || Platform.OS !== 'android') return false;
        try {
            return await LocationTracker.hasActiveTracking();
        } catch {
            return false;
        }
    }, []);

    return { startTracking, stopTracking, hasActiveTracking };
}
