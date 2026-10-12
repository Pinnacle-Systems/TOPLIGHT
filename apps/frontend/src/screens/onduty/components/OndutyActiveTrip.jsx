import React, { useState, useEffect } from 'react';
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

import DateBanner from './DateBanner';

export default function OndutyActiveTrip({ 
    tripData, 
    onSubmitOut, 
    isSubmitting,
    isKmEntryEnabled,
    endKm,
    onChangeEndKm,
}) {
    const [isAnotherOnduty, setIsAnotherOnduty] = useState(false);
    const pulseAnim = useState(new Animated.Value(1))[0];

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
                        <MaterialCommunityIcons name="navigation-variant" size={24} color="#007AFF" />
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
                    <MaterialCommunityIcons name="clipboard-text-clock-outline" size={20} color="#007AFF" />
                    <Text style={styles.detailsHeaderText}>Trip Information</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DOCUMENT ID</Text>
                    <Text style={styles.infoValueMono}>{tripData?.docid || '—'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DEPARTURE LOCATION</Text>
                    <Text style={styles.infoValue}>{tripData?.in_location || '—'}</Text>
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

            {/* End KM Entry (Shown ONLY when enabled in Settings) */}
            {isKmEntryEnabled ? (
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <MaterialCommunityIcons name="speedometer" size={20} color="#007AFF" />
                        <Text style={styles.detailsHeaderText}>Check-Out Odometer Reading</Text>
                    </View>
                    <View style={styles.kmInputWrapper}>
                        <MaterialCommunityIcons name="counter" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.singleLineInput}
                            placeholder="Enter ending KM (optional)"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={endKm}
                            onChangeText={onChangeEndKm}
                        />
                        <Text style={styles.kmUnitText}>KM</Text>
                    </View>
                </View>
            ) : null}

            {/* Going to another onduty toggle */}
            <View style={styles.checkboxCard}>
                <Checkbox.Item
                    label="Going to another OnDuty?"
                    status={isAnotherOnduty ? 'checked' : 'unchecked'}
                    onPress={() => setIsAnotherOnduty(!isAnotherOnduty)}
                    color="#007AFF"
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
                    endKm: endKm,
                })}
                disabled={isSubmitting}
                activeOpacity={0.8}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <>
                        <MaterialCommunityIcons name="logout-variant" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.checkoutBtnText}>CHECK OUT NOW</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
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
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
    },
    liveText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#007AFF',
        letterSpacing: 0.8,
    },
    heroIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 4,
    },
    heroSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
        lineHeight: 18,
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    infoRow: {
        marginBottom: 14,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    infoValueMono: {
        fontSize: 14,
        fontWeight: '700',
        color: '#007AFF',
        fontFamily: 'monospace',
    },
    kmInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
    },
    singleLineInput: {
        flex: 1,
        fontSize: 14,
        color: '#1E293B',
        padding: 0,
    },
    kmUnitText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginLeft: 6,
    },
    checkboxCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
        overflow: 'hidden',
    },
    checkboxItem: {
        paddingVertical: 4,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    checkoutBtn: {
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    checkoutBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
