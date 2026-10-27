import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../theme';

export default function OndutyEndKmModal({
    visible,
    onClose,
    reachedData,
    reachedKm,
    onChangeReachedKm,
    onConfirmReached,
    isSubmitting,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [localEndKm, setLocalEndKm] = useState(reachedKm ? String(reachedKm) : '');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (visible) {
            setLocalEndKm(reachedKm ? String(reachedKm) : '');
            setErrorMessage('');
        }
    }, [visible, reachedKm]);

    const startKmNum = useMemo(() => {
        const val = reachedData?.start_km ?? reachedData?.Svechilekm;
        const num = Number(val);
        return (!isNaN(num) && num > 0) ? num : null;
    }, [reachedData]);

    const distanceTraveled = useMemo(() => {
        const endNum = Number(localEndKm);
        if (startKmNum !== null && !isNaN(endNum) && endNum > 0) {
            return endNum - startKmNum;
        }
        return null;
    }, [localEndKm, startKmNum]);

    const handleConfirm = () => {
        setErrorMessage('');

        const trimmed = String(localEndKm || '').trim();
        if (!trimmed) {
            setErrorMessage('Please enter the final odometer KM.');
            return;
        }

        const numericEnd = Number(trimmed);
        if (isNaN(numericEnd) || numericEnd <= 0) {
            setErrorMessage('Please enter a valid numeric KM reading.');
            return;
        }

        if (startKmNum !== null && numericEnd < startKmNum) {
            Alert.alert(
                'Invalid KM Reading',
                `Final KM (${numericEnd}) cannot be less than starting KM (${startKmNum} KM). Please check and re-enter.`,
                [{ text: 'OK' }]
            );
            return;
        }

        onChangeReachedKm(trimmed);
        onConfirmReached?.({
            docId: reachedData?.docid,
            vehicleNo: reachedData?.vechileno,
            reachedKm: trimmed,
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={isSubmitting ? undefined : onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        activeOpacity={1}
                        onPress={isSubmitting ? undefined : onClose}
                    />
                </View>

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIconCircle}>
                                <MaterialCommunityIcons name="flag-checkered" size={24} color={theme.colors.success} />
                            </View>
                            <View style={styles.headerTextWrap}>
                                <Text style={styles.headerTitle}>Final KM Reading</Text>
                                <Text style={styles.headerSubtitle}>
                                    Record odometer upon reaching office
                                </Text>
                            </View>
                        </View>
                        {!isSubmitting ? (
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <MaterialCommunityIcons name="close" size={22} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Error Banner */}
                        {errorMessage ? (
                            <View style={styles.errorBanner}>
                                <MaterialCommunityIcons name="alert-circle" size={18} color={theme.colors.danger} />
                                <Text style={styles.errorBannerText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        {/* Trip Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>DEPARTURE POINT</Text>
                                <Text style={styles.summaryValue} numberOfLines={2}>
                                    {reachedData?.in_location || '—'}
                                </Text>
                            </View>

                            <View style={styles.summaryDivider} />

                            <View style={styles.summaryCols}>
                                <View style={styles.summaryColItem}>
                                    <Text style={styles.summaryLabel}>VEHICLE</Text>
                                    <Text style={styles.summaryValueMono}>{reachedData?.vechileno || '—'}</Text>
                                </View>
                                <View style={styles.summaryColItem}>
                                    <Text style={styles.summaryLabel}>START ODOMETER</Text>
                                    <Text style={styles.summaryValueMono}>
                                        {startKmNum !== null ? `${startKmNum} KM` : '—'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* End KM Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Final Odometer Reading (KM) *</Text>
                            <View style={styles.kmInputWrapper}>
                                <MaterialCommunityIcons
                                    name="counter"
                                    size={22}
                                    color={theme.colors.textDisabled}
                                    style={{ marginRight: theme.spacing.sm }}
                                />
                                <TextInput
                                    style={styles.singleLineInput}
                                    placeholder={startKmNum ? `e.g. ${startKmNum + 20}` : 'e.g. 12560'}
                                    placeholderTextColor={theme.colors.placeholder}
                                    keyboardType="numeric"
                                    value={localEndKm}
                                    onChangeText={(val) => {
                                        setLocalEndKm(val);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    editable={!isSubmitting}
                                />
                                <Text style={styles.kmUnitText}>KM</Text>
                            </View>
                        </View>

                        {/* Calculated Distance Traveled Preview */}
                        {distanceTraveled !== null ? (
                            <View style={[
                                styles.distanceCard,
                                distanceTraveled >= 0 ? styles.distanceCardSuccess : styles.distanceCardWarning
                            ]}>
                                <MaterialCommunityIcons
                                    name={distanceTraveled >= 0 ? 'map-marker-distance' : 'alert-circle-outline'}
                                    size={22}
                                    color={distanceTraveled >= 0 ? theme.colors.success : theme.colors.danger}
                                />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[
                                        styles.distanceTitle,
                                        { color: distanceTraveled >= 0 ? theme.colors.success : theme.colors.danger }
                                    ]}>
                                        {distanceTraveled >= 0 ? 'Total Distance Traveled' : 'Invalid Odometer Reading'}
                                    </Text>
                                    <Text style={styles.distanceSubtitle}>
                                        {distanceTraveled >= 0
                                            ? `${distanceTraveled} KM (${startKmNum} KM → ${localEndKm} KM)`
                                            : `Final KM cannot be less than start KM (${startKmNum} KM)`}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
                            onPress={handleConfirm}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={theme.colors.brandContrast} />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.brandContrast} style={{ marginRight: 6 }} />
                                    <Text style={styles.confirmBtnText}>Confirm Reached Office</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const createStyles = theme => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    modalContainer: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        overflow: 'hidden',
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: theme.isDark ? 0.45 : 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    headerIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.successSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.dangerSoft || '#fee2e2',
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.xs,
    },
    errorBannerText: {
        ...theme.typography.caption,
        color: theme.colors.danger,
        fontWeight: theme.fontWeights.medium,
        flex: 1,
    },
    summaryCard: {
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    summaryRow: {
        marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    summaryValue: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.text,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: theme.colors.borderSubtle,
        marginVertical: theme.spacing.sm,
    },
    summaryCols: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryColItem: {
        flex: 1,
    },
    summaryValueMono: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    inputLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        fontWeight: theme.fontWeights.semiBold,
    },
    kmInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.md,
        height: 50,
    },
    singleLineInput: {
        flex: 1,
        ...theme.typography.body,
        fontSize: 16,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
        paddingVertical: 0,
    },
    kmUnitText: {
        ...theme.typography.label,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
    },
    distanceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        borderWidth: 1,
    },
    distanceCardSuccess: {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.success,
    },
    distanceCardWarning: {
        backgroundColor: theme.colors.dangerSoft || '#fee2e2',
        borderColor: theme.colors.danger,
    },
    distanceTitle: {
        ...theme.typography.label,
        fontWeight: theme.fontWeights.bold,
        marginBottom: 2,
    },
    distanceSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSubtle,
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
    },
    cancelBtn: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md - 2,
        borderRadius: theme.radii.md,
    },
    cancelBtnText: {
        ...theme.typography.button,
        color: theme.colors.textMuted,
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md - 2,
        borderRadius: theme.radii.md,
        elevation: 2,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    confirmBtnText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
        fontWeight: theme.fontWeights.bold,
    },
});

