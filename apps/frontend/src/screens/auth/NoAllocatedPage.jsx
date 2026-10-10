import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setClearAll } from '../../store/slices/userDetailsSlice';
// If we have a global logout function or need to restart
import { NativeModules } from 'react-native';

export default function NoAllocatedPage() {
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await AsyncStorage.clear();
        dispatch(setClearAll());
        // In dev mode, we can use DevSettings to trigger a reload. 
        // In production, you'd typically tie isAuthenticated to Redux state directly.
        if (__DEV__) {
            NativeModules.DevSettings.reload();
        } else {
            // For production without a dedicated restart package, updating Redux 
            // state (like we did above) should be caught by an Auth provider hook if implemented.
            // As a fallback, throw a controlled exception or alert if no hook exists yet.
            alert("Logged out. Please restart the app.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Animated Illustration */}
            <LottieView
                source={require('../../assets/animations/Nopage.json')}
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
                onPress={handleLogout}
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
