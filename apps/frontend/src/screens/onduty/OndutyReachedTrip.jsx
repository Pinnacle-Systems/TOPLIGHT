import React, { useMemo } from 'react';
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
import { useAppTheme } from '../../theme';

export default function OndutyReachedTrip({ 
    reachedData, 
    onConfirmReached, 
    isSubmitting,
    isKmEntryEnabled,
    reachedKm,
    onChangeReachedKm,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.container}>
            {/* Reached Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="flag-checkered" size={14} color={theme.colors.success} />
                        <Text style={styles.badgeText}>TRIP CONCLUDING</Text>
                    </View>
                    <View style={styles.heroIconBox}>
                        <MaterialCommunityIcons name="office-building-marker" size={24} color={theme.colors.success} />
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
                    <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={theme.colors.success} />
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
                        <MaterialCommunityIcons name="speedometer" size={20} color={theme.colors.success} />
                        <Text style={styles.detailsHeaderText}>Final Odometer Reading</Text>
                    </View>
                    <View style={styles.kmInputWrapper}>
                        <MaterialCommunityIcons name="counter" size={20} color={theme.colors.textDisabled} style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.singleLineInput}
                            placeholder="Enter final reached KM"
                            placeholderTextColor={theme.colors.placeholder}
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
                    <ActivityIndicator size="small" color={theme.colors.brandContrast} />
                ) : (
                    <>
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.brandContrast} style={{ marginRight: 8 }} />
                        <Text style={styles.confirmBtnText}>CONFIRM REACHED OFFICE</Text>
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
        borderLeftColor: theme.colors.success,
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
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    badgeText: {
        ...theme.typography.overline,
        color: theme.colors.success,
    },
    heroIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.successSoft,
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
        marginBottom: 16,
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
        color: theme.colors.success,
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
    confirmBtn: {
        backgroundColor: theme.colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: theme.colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.isDark ? 0.3 : 0.25,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 6,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    confirmBtnText: {
        color: theme.colors.brandContrast,
        ...theme.typography.button,
    },
});
