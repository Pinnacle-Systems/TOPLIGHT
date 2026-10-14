import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, Text, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useGet_Change_SettingsQuery } from '../../store/api/userApi';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../../store/slices/userDetailsSlice';
import { useAppTheme } from '../../theme';

const GRADIENT_CONFIG = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const LOADING_TIMEOUT = 10000;
const ANIMATION_DURATION = 2500;

const SplashScreen = React.memo(({ onAuthResolved }) => {
    const dispatch = useDispatch();
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [isLoading, setIsLoading] = useState(true);
    const [verificationFailed, setVerificationFailed] = useState(false);
    const [IDCARD, SETIDCARD] = useState(null);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
    const [authDestination, setAuthDestination] = useState(null); // true for Home, false for Login

    const fadeAnim = useMemo(() => new Animated.Value(1), []);
    const logoScale = useMemo(() => new Animated.Value(0.8), []);
    const textSlide = useMemo(() => new Animated.Value(30), []);

    const lottieRef = useRef(null);
    const timeoutRef = useRef(null);
    const globalFallbackTimeoutRef = useRef(null);

    const { data, isLoading: settings_loading } = useGet_Change_SettingsQuery(
        { params: { Idcard: IDCARD } },
        { skip: !IDCARD }
    );

    const settings_data = useMemo(() => data?.data || {}, [data]);

    // 1. Initial User Data Load
    useEffect(() => {
        let isMounted = true;
        
        // Safety fallback: If EVERYTHING hangs for 10 seconds, force login
        globalFallbackTimeoutRef.current = setTimeout(() => {
            if (isMounted) onAuthResolved(false);
        }, LOADING_TIMEOUT);

        const loadUserData = async () => {
            try {
                const result = await AsyncStorage.getItem("userName");

                if (isMounted) {
                    if (result) {
                        const res = JSON.parse(result);
                        dispatch(setUserDetails({
                            ...res,
                            UserId: res?.UserId || res?.Id,
                            IDCARD: res?.IDCARD || res?.Id,
                            level: res?.level || (res?.isAdmin ? 'top' : 'user'),
                        }));
                        SETIDCARD(res?.UserId || res?.Id);
                        setIsUserDataLoaded(true); // Wait for settings query now
                    } else {
                        setAuthDestination(false); // Mark destination as Login
                        setIsUserDataLoaded(true); 
                    }
                }
            } catch (error) {
                console.error("AsyncStorage Error:", error);
                if (isMounted) {
                    setAuthDestination(false);
                    setIsUserDataLoaded(true);
                }
            }
        };

        loadUserData();

        return () => {
            isMounted = false;
            if (globalFallbackTimeoutRef.current) clearTimeout(globalFallbackTimeoutRef.current);
        };
    }, [dispatch, onAuthResolved]);

    // 2. Biometric Handling
    const handleBiometricVerification = useCallback(async () => {
        try {
            const rnBiometrics = new ReactNativeBiometrics();
            const { available } = await rnBiometrics.isSensorAvailable();

            if (!available) {
                return true; // proceed to home
            }

            const biometricPromise = rnBiometrics.simplePrompt({
                promptMessage: 'Verify your identity',
                cancelButtonText: 'Use Password',
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Biometric timeout')), 3000)
            );

            const { success } = await Promise.race([biometricPromise, timeoutPromise]);
            return success;
        } catch (error) {
            console.error("Biometric error:", error);
            return false;
        }
    }, []);

    // 3. Animation & Handoff Logic
    useEffect(() => {
        // Wait until we have decided the initial auth state, AND (if logged in) the settings query is done
        if (!isUserDataLoaded) return;
        if (authDestination === null && settings_loading) return;

        let isMounted = true;
        
        const animateAndHandoff = async () => {
            try {
                lottieRef.current?.play();
                await Promise.all([
                    new Promise(resolve => {
                        Animated.sequence([
                            Animated.spring(logoScale, { toValue: 1.1, friction: 3, useNativeDriver: true }),
                            Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true })
                        ]).start(resolve);
                    }),
                    new Promise(resolve => {
                        Animated.timing(textSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true }).start(resolve);
                    }),
                    new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION))
                ]);

                if (!isMounted) return;

                // Animation done, fade out
                Animated.timing(fadeAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(async () => {
                    if (!isMounted) return;
                    setIsLoading(false);

                    // Clear the global fallback since we're successfully handing off
                    if (globalFallbackTimeoutRef.current) clearTimeout(globalFallbackTimeoutRef.current);

                    if (authDestination === false) {
                        onAuthResolved(false);
                        return;
                    }

                    if (settings_data?.BioMatrics) {
                        const verified = await handleBiometricVerification();
                        if (verified) {
                            onAuthResolved(true);
                        } else {
                            setVerificationFailed(true);
                            timeoutRef.current = setTimeout(() => {
                                onAuthResolved(false);
                            }, 1500);
                        }
                    } else {
                        onAuthResolved(true);
                    }
                });
            } catch (error) {
                console.error("Splash error:", error);
                if (isMounted) {
                    if (globalFallbackTimeoutRef.current) clearTimeout(globalFallbackTimeoutRef.current);
                    onAuthResolved(false);
                }
            }
        };

        animateAndHandoff();

        return () => {
            isMounted = false;
            fadeAnim.stopAnimation();
            logoScale.stopAnimation();
            textSlide.stopAnimation();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isUserDataLoaded, settings_loading, authDestination, settings_data, onAuthResolved, fadeAnim, logoScale, textSlide, handleBiometricVerification]);

    if (!isLoading && settings_loading) return null;

    if (verificationFailed) {
        return (
            <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container} {...GRADIENT_CONFIG}>
                <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.statusBar} />
                {/* 
                <LottieView
                    ref={lottieRef}
                    source={require('../../assets/images/Error.json')}
                    autoPlay
                    loop={false}
                    style={styles.lottie}
                    cacheStrategy="strong"
                /> 
                */}
                <Text style={styles.errorTitle}>Authentication Failed</Text>
                <Text style={styles.errorText}>Please try again or login manually</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container} {...GRADIENT_CONFIG}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.statusBar} />
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Fallback View if Image is not present */}
                <Animated.Image 
                    source={require('../../assets/images/logo_splash1.png')} 
                    style={[styles.logo, { transform: [{ scale: logoScale }] }]}
                    resizeMode="contain"
                />

                <Animated.View style={{ transform: [{ translateY: textSlide }], alignItems: 'center' }}>
                    <Text style={styles.title}>TopLight</Text>
                    <Text style={styles.subtitle}>Your Gateway to Excellence</Text>
                </Animated.View>
            </Animated.View>
        </LinearGradient>
    );
});

const createStyles = theme => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { width: '100%', alignItems: 'center', padding: 30 },
    logo: { width: 160, height: 160, marginBottom: 30 },
    title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: theme.spacing.sm, letterSpacing: theme.letterSpacing.wide, fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium' },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif' },
    lottie: { width: 150, height: 150, marginBottom: 20 },
    errorTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing.sm },
    errorText: { ...theme.typography.body, color: theme.colors.textMuted, textAlign: 'center', paddingHorizontal: theme.spacing.giant }
});

export default SplashScreen;
