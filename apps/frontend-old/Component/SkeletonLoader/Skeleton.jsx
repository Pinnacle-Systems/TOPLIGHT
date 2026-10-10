import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import CustomText from '../Text/CustomText';

const SkeletonLoader = ({
  width = '100%',
  height = 60,
  borderRadius = 8,
  role = 'card', // 'card', 'text', 'image', 'button'
  variant = 'default', // 'default', 'subtle', 'strong'
  animationType = 'shimmer', // 'shimmer', 'pulse', 'wave'
  style,
  showIcon = true,
  showText = false
}) => {
  // Design role configurations
  const roleConfig = {
    card: {
      color: '#F3F4F6',
      highlight: '#F9FAFB',
      borderRadius: 12,
      iconSize: 24,
      shadow: true
    },
    text: {
      color: '#E5E7EB',
      highlight: '#F3F4F6',
      borderRadius: 4,
      iconSize: 0,
      shadow: false
    },
    image: {
      color: '#E5E7EB',
      highlight: '#F3F4F6',
      borderRadius: 0,
      iconSize: 32,
      shadow: false
    },
    button: {
      color: '#E5E7EB',
      highlight: '#F3F4F6',
      borderRadius: 6,
      iconSize: 20,
      shadow: true
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      duration: 1200,
      opacityRange: [0.2, 0.6]
    },
    subtle: {
      duration: 1500,
      opacityRange: [0.1, 0.4]
    },
    strong: {
      duration: 1000,
      opacityRange: [0.3, 0.8]
    }
  };

  const config = roleConfig[role] || roleConfig.card;
  const variantSettings = variantConfig[variant] || variantConfig.default;
  
  const fadeAnim = useRef(new Animated.Value(variantSettings.opacityRange[0])).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: variantSettings.opacityRange[1],
          duration: variantSettings.duration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: variantSettings.opacityRange[0],
          duration: variantSettings.duration,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [fadeAnim, variantSettings]);

  // Animation style based on type
  const getAnimationStyle = () => {
    switch(animationType) {
      case 'pulse':
        return { opacity: fadeAnim };
      case 'wave':
        return {
          transform: [
            {
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 100]
              })
            }
          ]
        };
      case 'shimmer':
      default:
        return { opacity: fadeAnim };
    }
  };

  return (
    <View
      style={[
        styles.container,
        { 
          width,
          height,
          borderRadius: config.borderRadius || borderRadius,
          backgroundColor: config.color,
          shadowColor: config.shadow ? '#000' : undefined,
          shadowOffset: config.shadow ? { width: 0, height: 1 } : undefined,
          shadowOpacity: config.shadow ? 0.1 : 0,
          shadowRadius: config.shadow ? 3 : 0,
          elevation: config.shadow ? 2 : 0
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.highlight,
          {
            backgroundColor: config.highlight,
            ...getAnimationStyle(),
          },
        ]}
      >
        {showIcon && config.iconSize > 0 && (
          <ActivityIndicator
            size={config.iconSize}
            color="#9CA3AF"
            style={styles.icon}
          />
        )}
        {showText && (
          <CustomText style={[
            styles.loadingText,
            { color: role === 'card' ? '#6B7280' : '#9CA3AF' }
          ]}>
            Loading...
          </CustomText>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SkeletonLoader;