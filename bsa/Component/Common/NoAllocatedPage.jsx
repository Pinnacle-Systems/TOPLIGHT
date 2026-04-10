import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native'; // For animations (install via `npm install lottie-react-native`)
import AsyncStorage from '@react-native-async-storage/async-storage';

function NoAllocatedPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Animated Illustration */}
      <LottieView
        source={require('../Utils/assets/Nopage.json')} // Replace with your Lottie file
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Message */}
      <Text style={styles.title}>Oops! No Pages are Allowed</Text>
      <Text style={styles.subtitle}>The page you're looking for doesn't exist or isn't available.</Text>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
AsyncStorage.clear()
     navigation.reset({
            index: 0,
            routes: [{ name: 'LOGIN' }],
          });
            
            


        }


        }
      >
        <Text style={styles.buttonText}>Go Login Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  animation: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default NoAllocatedPage;