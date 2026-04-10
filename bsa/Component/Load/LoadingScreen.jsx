import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, ActivityIndicator } from 'react-native';

const LoadingScreen = ({
  text = "Loading...",
  backgroundColor = '#ffffff',
  loaderColor = '#007bff',
  textColor = '#555',
  loaderSize = 'medium', // 'small', 'medium', or 'large'
  animationType = 'pulse', // 'pulse', 'rotate', or 'none'
  customLoader = null, // Custom React component
  textStyle = {},
  containerStyle = {},
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation;
    
    if (animationType === 'pulse') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    } else if (animationType === 'rotate') {
      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
    }

    if (animation) animation.start();
    
    return () => {
      if (animation) animation.stop();
    };
  }, [scaleAnim, rotateAnim, animationType]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getLoaderSize = () => {
    switch (loaderSize) {
      case 'small': return 20;
      case 'large': return 60;
      default: return 40; // medium
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }, containerStyle]}>
      {customLoader ? (
        <Animated.View 
          style={[
            animationType === 'rotate' && { transform: [{ rotate: rotateInterpolate }] },
            animationType === 'pulse' && { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {customLoader}
        </Animated.View>
      ) : (
        <Animated.View 
          style={[
            styles.loader, 
            { 
              backgroundColor: loaderColor,
              width: getLoaderSize(),
              height: getLoaderSize(),
              borderRadius: getLoaderSize() / 2,
              shadowColor: loaderColor,
            },
            animationType === 'rotate' && { transform: [{ rotate: rotateInterpolate }] },
            animationType === 'pulse' && { transform: [{ scale: scaleAnim }] }
          ]}
        />
      )}
      
      <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingScreen;