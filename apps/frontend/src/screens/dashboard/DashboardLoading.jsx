import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import syncAnimation from '../../components/Utils/assets/Sync.json';
import { useAppTheme } from '../../theme';

export default function DashboardLoading() {
    const { theme } = useAppTheme();
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(width - theme.spacing.xl * 2, 420);
    const trackWidth = cardWidth - theme.spacing.xl * 2;
    const segmentWidth = trackWidth * 0.38;
    const progressPosition = useRef(new Animated.Value(0)).current;
    const styles = useMemo(() => createStyles(theme, cardWidth), [theme, cardWidth]);

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(progressPosition, {
                toValue: 1,
                duration: 1300,
                useNativeDriver: true,
            }),
        );
        animation.start();
        return () => animation.stop();
    }, [progressPosition]);

    const progressTranslate = progressPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [-segmentWidth, trackWidth],
    });

    return (
        <View style={styles.screen}>
            <View style={styles.card}>
                <View style={styles.brandMark}>
                    <MaterialCommunityIcons
                        name="view-dashboard-outline"
                        size={25}
                        color={theme.colors.brand}
                    />
                </View>

                <LottieView
                    source={syncAnimation}
                    autoPlay
                    loop
                    style={styles.animation}
                />

                <Text style={styles.title}>Getting your dashboard ready</Text>
                <Text style={styles.message}>
                    Syncing your latest information. This should only take a moment.
                </Text>

                <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel="Syncing dashboard"
                    accessibilityState={{ busy: true }}
                    style={styles.progressTrack}
                >
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: segmentWidth,
                                transform: [{ translateX: progressTranslate }],
                            },
                        ]}
                    />
                </View>
                <Text style={styles.status}>SYNCING YOUR DATA</Text>
            </View>
        </View>
    );
}

const createStyles = (theme, cardWidth) => StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    card: {
        width: cardWidth,
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xl,
        borderRadius: theme.radii.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        ...theme.styles.shadow,
    },
    brandMark: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brandSoft,
    },
    animation: {
        width: 150,
        height: 130,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    title: {
        ...theme.typography.h4,
        color: theme.colors.text,
        textAlign: 'center',
    },
    message: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: theme.spacing.sm,
        maxWidth: 290,
    },
    progressTrack: {
        width: '100%',
        height: 5,
        overflow: 'hidden',
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.surfaceSunken,
        marginTop: theme.spacing.xl,
    },
    progressFill: {
        width: '38%',
        height: '100%',
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brand,
    },
    status: {
        ...theme.typography.overline,
        color: theme.colors.textMuted,
        letterSpacing: 1.1,
        marginTop: theme.spacing.md,
    },
});
