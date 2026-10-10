import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import tailwind from 'twrnc';
import { LinearGradient } from "react-native-linear-gradient"
import { Colors } from '../../../constants/Colors';

const EmptyEmployeeCard = ({ onSelectEmployee }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade-in animation
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    fadeIn.start();
    pulse.start();

    return () => {
      pulse.stop();
    };
  }, []);

  return (
    <Animated.View style={[tailwind`flex-1 justify-center items-center`, { opacity: fadeAnim }]}>
      <View style={tailwind`w-full px-8 items-center`}>
        {/* Animated Card */}
        <Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#f8fafc', '#e2e8f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={tailwind`items-center justify-center p-6`}>
              <LottieView
                source={require('../../../components/Utils/assets/employeeanim.json')}
                autoPlay
                loop
                style={styles.animation}
              />
              
              <Text style={styles.title}>Employee Dashboard</Text>
              
              <Text style={styles.subtitle}>
                No employee selected yet
              </Text>
              
              <TouchableOpacity 
                onPress={onSelectEmployee}
                style={styles.button}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primary]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Select Employee</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Guidance Text */}
        <View style={tailwind`mt-6 px-4`}>
          <Text style={styles.hintText}>
            Tap the button above to select an employee and view their details
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  gradient: {
    width: '100%',
    borderRadius: 24,
  },
  animation: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.grayDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grayDark,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  hintText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyEmployeeCard;


