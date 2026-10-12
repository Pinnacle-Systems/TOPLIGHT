import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import DateBanner from './DateBanner';

export default function OndutyReachedTrip({ 
    reachedData, 
    onConfirmReached, 
    isSubmitting,
    isKmEntryEnabled,
    reachedKm,
    onChangeReachedKm,
}) {
    return (
        <View style={styles.container}>
            {/* Reached Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="flag-checkered" size={14} color="#10B981" />
                        <Text style={styles.badgeText}>TRIP CONCLUDING</Text>
                    </View>
                    <View style={styles.heroIconBox}>
                        <MaterialCommunityIcons name="office-building-marker" size={24} color="#10B981" />
                    </View>
                </View>

                <Text style={styles.heroTitle}>Back at Office!</Text>
                <Text style={styles.heroSubtitle}>
                    Confirm your return to finalize and complete this OnDuty trip.
                </Text>
            </View>

            {/* Date Banner */}
            <DateBanner />

            {/* Trip Summary Card */}
            <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                    <MaterialCommunityIcons name="clipboard-check-outline" size={20} color="#10B981" />
                    <Text style={styles.detailsHeaderText}>Trip Summary</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DOCUMENT ID</Text>
                    <Text style={styles.infoValueMono}>{reachedData?.docid || '—'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DEPARTURE POINT</Text>
                    <Text style={styles.infoValue}>{reachedData?.in_location || '—'}</Text>
                </View>

                {isKmEntryEnabled && reachedData?.vechileno ? (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>VEHICLE</Text>
                        <Text style={styles.infoValue}>{reachedData?.vechileno}</Text>
                    </View>
                ) : null}
            </View>

            {/* Reached KM Entry (Shown ONLY when enabled in Settings) */}
            {isKmEntryEnabled ? (
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <MaterialCommunityIcons name="speedometer" size={20} color="#10B981" />
                        <Text style={styles.detailsHeaderText}>Final Odometer Reading</Text>
                    </View>
                    <View style={styles.kmInputWrapper}>
                        <MaterialCommunityIcons name="counter" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.singleLineInput}
                            placeholder="Enter final reached KM"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={reachedKm}
                            onChangeText={onChangeReachedKm}
                        />
                        <Text style={styles.kmUnitText}>KM</Text>
                    </View>
                </View>
            ) : null}

            {/* Confirm Button */}
            <TouchableOpacity 
                style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
                onPress={() => onConfirmReached({ 
                    docId: reachedData?.docid, 
                    vehicleNo: reachedData?.vechileno,
                    reachedKm: reachedKm,
                })}
                disabled={isSubmitting}
                activeOpacity={0.8}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <>
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.confirmBtnText}>CONFIRM REACHED OFFICE</Text>
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
        borderLeftColor: '#10B981',
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
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#10B981',
        letterSpacing: 0.8,
    },
    heroIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
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
        marginBottom: 16,
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
        color: '#10B981',
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
    confirmBtn: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 6,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
