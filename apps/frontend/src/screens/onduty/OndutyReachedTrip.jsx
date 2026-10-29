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
    onOpenEndKmModal,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const startKmVal = reachedData?.start_km ?? reachedData?.Svechilekm;
    const distanceTraveled = useMemo(() => {
        if (!reachedKm || !startKmVal) return null;
        const diff = Number(reachedKm) - Number(startKmVal);
        return (!isNaN(diff) && diff >= 0) ? diff : null;
    }, [reachedKm, startKmVal]);

    const handlePressConfirm = () => {
        if (isKmEntryEnabled && (!reachedKm || String(reachedKm).trim() === '')) {
            onOpenEndKmModal?.();
            return;
        }
        onConfirmReached({ 
            docId: reachedData?.docid, 
            vehicleNo: reachedData?.vechileno,
            reachedKm: reachedKm,
        });
    };

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
                    <Text style={styles.infoLabel}>LOCATION</Text>
                    <Text style={styles.infoValue}>
                        {(!reachedData?.in_location || reachedData.in_location === 'Location unavailable') && reachedData?.in_latitude && Number(reachedData.in_latitude) !== 0
                            ? `Near ${Number(reachedData.in_latitude).toFixed(4)}, ${Number(reachedData.in_longtiude).toFixed(4)}`
                            : (reachedData?.in_location && reachedData.in_location !== 'Location unavailable'
                                ? reachedData.in_location
                                : (reachedData?.in_latitude && Number(reachedData.in_latitude) !== 0
                                    ? `Near ${Number(reachedData.in_latitude).toFixed(4)}, ${Number(reachedData.in_longtiude).toFixed(4)}`
                                    : (reachedData?.out_location && reachedData.out_location !== 'Location unavailable'
                                        ? reachedData.out_location
                                        : 'Location unavailable')))}
                    </Text>
                </View>

                {isKmEntryEnabled && reachedData?.vechileno ? (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>VEHICLE</Text>
                        <Text style={styles.infoValue}>{reachedData?.vechileno}</Text>
                    </View>
                ) : null}
                {isKmEntryEnabled && startKmVal && startKmVal !== '0' ? (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>START ODOMETER</Text>
                        <Text style={styles.infoValue}>{startKmVal} KM</Text>
                    </View>
                ) : null}
            </View>

            {/* Reached KM Entry (Shown ONLY when enabled in Settings) */}
            {isKmEntryEnabled ? (
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <MaterialCommunityIcons name="speedometer" size={20} color={theme.colors.success} />
                        <Text style={styles.detailsHeaderText}>Final Odometer Reading</Text>
                        {reachedKm ? (
                            <View style={styles.readyBadge}>
                                <MaterialCommunityIcons name="check-circle" size={12} color={theme.colors.success} />
                                <Text style={styles.readyBadgeText}>RECORDED</Text>
                            </View>
                        ) : (
                            <View style={styles.requiredBadge}>
                                <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                            </View>
                        )}
                    </View>

                    {reachedKm ? (
                        <View style={styles.kmSummaryContainer}>
                            <View style={styles.kmSummaryRow}>
                                <View style={styles.kmSummaryItem}>
                                    <Text style={styles.kmSummaryLabel}>FINAL ODOMETER</Text>
                                    <Text style={styles.kmSummaryValueHighlight}>{reachedKm} KM</Text>
                                </View>
                                {distanceTraveled !== null ? (
                                    <View style={styles.kmSummaryItem}>
                                        <Text style={styles.kmSummaryLabel}>DISTANCE TRAVELED</Text>
                                        <Text style={styles.kmSummaryDistance}>{distanceTraveled} KM</Text>
                                    </View>
                                ) : null}
                            </View>
                            <TouchableOpacity
                                style={styles.editKmBtn}
                                onPress={onOpenEndKmModal}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.colors.success} />
                                <Text style={styles.editKmBtnText}>Edit Final KM</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.enterKmBtn}
                            onPress={onOpenEndKmModal}
                            activeOpacity={0.8}
                        >
                            <View style={styles.enterKmIconCircle}>
                                <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.success} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.enterKmTitle}>Enter Final Odometer Reading</Text>
                                <Text style={styles.enterKmSubtitle}>
                                    Record your ending KM before concluding the trip
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textDisabled} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            {/* Confirm Button */}
            <TouchableOpacity 
                style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
                onPress={handlePressConfirm}
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
        flex: 1,
    },
    readyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successSoft,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        gap: 4,
    },
    readyBadgeText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.success,
        fontSize: 10,
    },
    requiredBadge: {
        backgroundColor: theme.colors.warningSoft,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    requiredBadgeText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.warning,
        fontSize: 10,
    },
    kmSummaryContainer: {
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    kmSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    kmSummaryItem: {
        flex: 1,
    },
    kmSummaryLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    kmSummaryValueHighlight: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.success,
    },
    kmSummaryDistance: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    editKmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 4,
        gap: 4,
    },
    editKmBtnText: {
        ...theme.typography.caption,
        color: theme.colors.success,
        fontWeight: theme.fontWeights.bold,
    },
    enterKmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    enterKmIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.successSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enterKmTitle: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    enterKmSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 2,
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
