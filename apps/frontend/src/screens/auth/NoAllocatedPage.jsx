import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setClearAll } from '../../store/slices/userDetailsSlice';
// If we have a global logout function or need to restart
import { NativeModules } from 'react-native';
import { useAppTheme } from '../../theme';

export default function NoAllocatedPage() {
    const dispatch = useDispatch();
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    animation: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xxxl,
        paddingHorizontal: theme.spacing.xl,
    },
    button: {
        backgroundColor: theme.colors.brand,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xxxl,
        borderRadius: theme.radii.pill,
        ...theme.styles.shadow,
    },
    buttonText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
    },
});
