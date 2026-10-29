import React, { useState, useEffect, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Animated, 
    ActivityIndicator 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Checkbox } from 'react-native-paper';
import moment from 'moment';
import { useAppTheme } from '../../theme';

import DateBanner from './DateBanner';

export default function OndutyActiveTrip({ 
    tripData, 
    onSubmitOut, 
    isSubmitting,
    isKmEntryEnabled,
}) {
    const [isAnotherOnduty, setIsAnotherOnduty] = useState(false);
    const pulseAnim = useState(new Animated.Value(1))[0];
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.35, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [pulseAnim]);

    const formattedTime = tripData?.in_time 
        ? moment(tripData.in_time).isValid()
            ? moment(tripData.in_time).format('DD MMM YYYY, hh:mm A')
            : tripData.in_time
        : '—';

    return (
        <View style={styles.container}>
            {/* Live Tracking Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                    <View style={styles.liveBadge}>
                        <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
                        <Text style={styles.liveText}>LIVE TRACKING ACTIVE</Text>
                    </View>
                    <View style={styles.heroIconBox}>
                        <MaterialCommunityIcons name="navigation-variant" size={24} color={theme.colors.brand} />
                    </View>
                </View>

                <Text style={styles.heroTitle}>Active OnDuty Session</Text>
                <Text style={styles.heroSubtitle}>
                    Continuous location is actively tracking in the background.
                </Text>
            </View>

            {/* Date Banner */}
            <DateBanner />

            {/* Trip Details Card */}
            <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                    <MaterialCommunityIcons name="clipboard-text-clock-outline" size={20} color={theme.colors.brand} />
                    <Text style={styles.detailsHeaderText}>Trip Information</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DOCUMENT ID</Text>
                    <Text style={styles.infoValueMono}>{tripData?.docid || '—'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>OFFICE / BASE LOCATION</Text>
                    <Text style={styles.infoValue}>
                        {(!tripData?.in_location || tripData.in_location === 'Location unavailable') && tripData?.in_latitude && Number(tripData.in_latitude) !== 0
                            ? `Near ${Number(tripData.in_latitude).toFixed(4)}, ${Number(tripData.in_longtiude).toFixed(4)}`
                            : (tripData?.in_location && tripData.in_location !== 'Location unavailable'
                                ? tripData.in_location
                                : (tripData?.in_latitude && Number(tripData.in_latitude) !== 0
                                    ? `Near ${Number(tripData.in_latitude).toFixed(4)}, ${Number(tripData.in_longtiude).toFixed(4)}`
                                    : 'Office / Base Location'))}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>START TIME</Text>
                    <Text style={styles.infoValue}>{formattedTime}</Text>
                </View>

                {/* Show Vehicle & Start KM if enabled & available */}
                {isKmEntryEnabled && tripData?.vechileno ? (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>VEHICLE NO</Text>
                        <Text style={styles.infoValue}>{tripData.vechileno}</Text>
                    </View>
                ) : null}

                {isKmEntryEnabled && tripData?.start_km && tripData.start_km !== '0' ? (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>START ODOMETER</Text>
                        <Text style={styles.infoValue}>{tripData.start_km} KM</Text>
                    </View>
                ) : null}
            </View>

            {/* Going to another onduty toggle */}
            <View style={styles.checkboxCard}>
                <Checkbox.Item
                    label="Going to another OnDuty?"
                    status={isAnotherOnduty ? 'checked' : 'unchecked'}
                    onPress={() => setIsAnotherOnduty(!isAnotherOnduty)}
                    color={theme.colors.brand}
                    position="leading"
                    labelStyle={styles.checkboxLabel}
                    style={styles.checkboxItem}
                />
            </View>

            {/* Check OUT Button */}
            <TouchableOpacity 
                style={[styles.checkoutBtn, isSubmitting && styles.btnDisabled]}
                onPress={() => onSubmitOut({ 
                    docId: tripData?.docid, 
                    toOnduty: isAnotherOnduty,
                })}
                disabled={isSubmitting}
                activeOpacity={0.8}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.brandContrast} />
                ) : (
                    <>
                        <MaterialCommunityIcons name="logout-variant" size={20} color={theme.colors.brandContrast} style={{ marginRight: 8 }} />
                        <Text style={styles.checkoutBtnText}>CHECK OUT NOW</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.brand,
        marginBottom: 14,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.isDark ? 0.3 : 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.brand,
    },
    liveText: {
        ...theme.typography.overline,
        color: theme.colors.brand,
    },
    heroIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.brandSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginTop: 4,
    },
    heroSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        marginTop: 4,
        lineHeight: 18,
    },
    detailsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: 14,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.3 : 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    detailsHeaderText: {
        ...theme.typography.title,
        color: theme.colors.text,
    },
    infoRow: {
        marginBottom: 14,
    },
    infoLabel: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textDisabled,
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    infoValue: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textSecondary,
    },
    infoValueMono: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
        fontFamily: 'monospace',
    },
    kmInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
    },
    singleLineInput: {
        flex: 1,
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        padding: 0,
    },
    kmUnitText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textDisabled,
        marginLeft: 6,
    },
    checkboxCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: 20,
        overflow: 'hidden',
    },
    checkboxItem: {
        paddingVertical: 4,
    },
    checkboxLabel: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textSecondary,
    },
    checkoutBtn: {
        backgroundColor: theme.colors.danger,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: theme.colors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    checkoutBtnText: {
        color: theme.colors.brandContrast,
        ...theme.typography.button,
        letterSpacing: 0.5,
    },
});
