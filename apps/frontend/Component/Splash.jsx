import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {View, Image, StyleSheet, Animated, Easing, Text, Platform, StatusBar} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useGet_Change_SettingsQuery } from '../redux/service/user';

// Constants
const GRADIENT_COLORS = ['#FFF','#FFF'];
const GRADIENT_CONFIG = {start: {x: 0, y: 0}, end: {x: 1, y: 1}};
const LOADING_TIMEOUT = 10000; // 10 seconds max for all operations
const ANIMATION_DURATION = 2500; // Total animation time

const Splash = React.memo(({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [IDCARD, SETIDCARD] = useState(null);
  
  // Animation refs
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const logoScale = useMemo(() => new Animated.Value(0.8), []);
  const textSlide = useMemo(() => new Animated.Value(30), []);
  
  const lottieRef = useRef(null);
  const timeoutRef = useRef(null);
  const {data, isLoading: settings_loading} = useGet_Change_SettingsQuery({params: {Idcard: IDCARD}});
  
  // Memoize settings data
  const settings_data = useMemo(() => data?.data || {}, [data]);

  // Load user data
  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        navigation.reset({ routes: [{ name: 'LOGIN' }] });
      }
    }, LOADING_TIMEOUT);

    const loadUserData = async () => {
      try {
        const result = await Promise.race([
          AsyncStorage.getItem("userName"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        
        if (isMounted) {
          if (result) {
            const res = JSON.parse(result);
            SETIDCARD(res?.Id);
          } else {
            clearTimeout(timeoutId);
            navigation.reset({ routes: [{ name: 'LOGIN' }] });
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (isMounted) {
          navigation.reset({ routes: [{ name: 'LOGIN' }] });
        }
      }
    };
    
    loadUserData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigation]);

  // Handle biometric verification
  const handleBiometricVerification = useCallback(async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        navigation.reset({ routes: [{ name: 'DashBoard' }] });
        return;
      }

      const biometricPromise = rnBiometrics.simplePrompt({
        promptMessage: 'Verify your identity',
        cancelButtonText: 'Use Password',
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Biometric timeout')), 3000
      ))

      const { success } = await Promise.race([biometricPromise, timeoutPromise]);

      if (success) {
        navigation.reset({ routes: [{ name: 'DashBoard' }] });
      } else {
        setVerificationFailed(true);
        timeoutRef.current = setTimeout(() => {
          navigation.reset({ routes: [{ name: 'LOGIN' }] });
        }, 1500);
      }
    } catch (error) {
      console.error("Biometric error:", error);
      navigation.reset({ routes: [{ name: 'LOGIN' }] });
    }
  }, [navigation]);

  // Main animation and navigation logic
  useEffect(() => {
    if (settings_loading || IDCARD === null) return;

    let isMounted = true;
    const animate = async () => {
      try {
        // Start animations
        lottieRef.current?.play();
        
        // Run animations in parallel
        await Promise.all([
          new Promise(resolve => {
            Animated.sequence([
              Animated.spring(logoScale, {
                toValue: 1.1,
                friction: 3,
                useNativeDriver: true,
              }),
              Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              })
            ]).start(resolve);
          }),
          new Promise(resolve => {
            Animated.timing(textSlide, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.exp),
              useNativeDriver: true,
            }).start(resolve);
          }),
          new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION))
        ]);

        if (!isMounted) return;

        // Fade out and navigate
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(async () => {
          if (!isMounted) return;
          
          setIsLoading(false);
          const userName = await AsyncStorage.getItem("userName");
          
          if (!userName) {
            navigation.reset({ routes: [{ name: 'LOGIN' }] });
            return;
          }

          if (settings_data?.BioMatrics) {
            await handleBiometricVerification();
          } else {
            navigation.reset({ routes: [{ name: 'DashBoard' }] });
          }
        });
      } catch (error) {
        console.error("Splash error:", error);
        if (isMounted) {
          navigation.reset({ routes: [{ name: 'LOGIN' }] });
        }
      }
    };

    animate();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      fadeAnim.stopAnimation();
      logoScale.stopAnimation();
      textSlide.stopAnimation();
      if (lottieRef.current) lottieRef.current.reset();
    };
  }, [settings_loading, IDCARD, settings_data, navigation, fadeAnim, logoScale, textSlide, handleBiometricVerification]);

  if (!isLoading && settings_loading) return null;

  if (verificationFailed) {
    return (
      <LinearGradient 
        colors={GRADIENT_COLORS} 
        style={styles.container}
        {...GRADIENT_CONFIG}
      >
        <StatusBar barStyle="light-content" />
        <LottieView
          ref={lottieRef}
          source={require('./Utils/assets/Error.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
          cacheStrategy="strong"
        />
        <Text style={styles.errorTitle}>Authentication Failed</Text>
        <Text style={styles.errorText}>Please try again or login manually</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={GRADIENT_COLORS} 
      style={styles.container}
      {...GRADIENT_CONFIG}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        <Animated.Image 
          source={require('./img/logo_splash1.png')} 
          style={[styles.logo, { transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
        
        <Animated.View style={{ 
          transform: [{ translateY: textSlide }],
          alignItems: 'center'
        }}>
          <Text style={styles.title}>Pinnacle World</Text>
          <Text style={styles.subtitle}>Your Gateway to Excellence</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    padding: 30,
  },
  logo: {
    width: Platform.select({ ios: 180, android: 160 }),
    height: Platform.select({ ios: 180, android: 160 }),
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: "black",
    marginBottom: 8,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  lottie: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default Splash;