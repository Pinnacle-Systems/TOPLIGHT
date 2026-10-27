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
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAppTheme } from '../../theme';

export default function OndutyStartKmModal({
    visible,
    onClose,
    vehicleOptions = [],
    selectedVehicle,
    onSelectVehicle,
    startKm,
    onChangeStartKm,
    lastRecordedKm,
    onConfirm,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
    const [localVehicle, setLocalVehicle] = useState(selectedVehicle || '');
    const [localStartKm, setLocalStartKm] = useState(startKm ? String(startKm) : '');
    const [errorMessage, setErrorMessage] = useState('');

    // Sync with parent props when modal opens
    useEffect(() => {
        if (visible) {
            setLocalVehicle(selectedVehicle || (vehicleOptions.length === 1 ? vehicleOptions[0]?.vechileno : ''));
            setLocalStartKm(startKm ? String(startKm) : '');
            setErrorMessage('');
            setVehicleDropdownOpen(false);
        }
    }, [visible, selectedVehicle, startKm, vehicleOptions]);

    const vehicleItems = useMemo(() => {
        return (vehicleOptions || []).map(v => ({
            label: v.vechilename || v.vechileno || String(v),
            value: v.vechileno || String(v),
        }));
    }, [vehicleOptions]);

    const handleUseLastKm = () => {
        if (lastRecordedKm !== undefined && lastRecordedKm !== null) {
            setLocalStartKm(String(lastRecordedKm));
            setErrorMessage('');
        }
    };

    const handleConfirm = () => {
        setErrorMessage('');

        if (vehicleOptions.length > 0 && !localVehicle) {
            setErrorMessage('Please select a vehicle.');
            return;
        }

        const trimmedKm = String(localStartKm || '').trim();
        if (!trimmedKm) {
            setErrorMessage('Please enter the starting odometer reading.');
            return;
        }

        const numericKm = Number(trimmedKm);
        if (isNaN(numericKm) || numericKm < 0) {
            setErrorMessage('Please enter a valid numeric KM reading.');
            return;
        }

        // Warning if entered KM is less than last recorded
        const numericLast = Number(lastRecordedKm);
        if (!isNaN(numericLast) && numericLast > 0 && numericKm < numericLast) {
            Alert.alert(
                'Low Odometer Warning',
                `Entered KM (${numericKm}) is less than the last recorded reading (${numericLast} KM). Do you want to proceed anyway?`,
                [
                    { text: 'Review', style: 'cancel' },
                    {
                        text: 'Proceed Anyway',
                        onPress: () => {
                            if (localVehicle) onSelectVehicle(localVehicle);
                            onChangeStartKm(trimmedKm);
                            onConfirm?.({ vehicle: localVehicle, startKm: trimmedKm });
                            onClose();
                        },
                    },
                ]
            );
            return;
        }

        if (localVehicle) onSelectVehicle(localVehicle);
        onChangeStartKm(trimmedKm);
        onConfirm?.({ vehicle: localVehicle, startKm: trimmedKm });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </View>

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIconCircle}>
                                <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.brand} />
                            </View>
                            <View style={styles.headerTextWrap}>
                                <Text style={styles.headerTitle}>Start Day KM Entry</Text>
                                <Text style={styles.headerSubtitle}>
                                    Vehicle and odometer details for today's duty
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <MaterialCommunityIcons name="close" size={22} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        {/* Error Banner */}
                        {errorMessage ? (
                            <View style={styles.errorBanner}>
                                <MaterialCommunityIcons name="alert-circle" size={18} color={theme.colors.danger} />
                                <Text style={styles.errorBannerText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        {/* Vehicle Selection */}
                        <View style={[styles.inputGroup, { zIndex: 3000 }]}>
                            <Text style={styles.inputLabel}>Vehicle *</Text>
                            {vehicleItems.length > 0 ? (
                                <DropDownPicker
                                    open={vehicleDropdownOpen}
                                    value={localVehicle}
                                    items={vehicleItems}
                                    setOpen={setVehicleDropdownOpen}
                                    setValue={setLocalVehicle}
                                    placeholder="Select Vehicle"
                                    listMode="SCROLLVIEW"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    textStyle={styles.dropdownText}
                                />
                            ) : (
                                <View style={styles.noVehicleBox}>
                                    <MaterialCommunityIcons name="car-info" size={20} color={theme.colors.textMuted} />
                                    <Text style={styles.noVehicleText}>No assigned vehicles found.</Text>
                                </View>
                            )}
                        </View>

                        {/* Starting KM Reading */}
                        <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                            <View style={styles.labelWithBadgeRow}>
                                <Text style={styles.inputLabel}>Starting Odometer (KM) *</Text>
                                {lastRecordedKm !== undefined && lastRecordedKm !== null ? (
                                    <View style={styles.kmBadge}>
                                        <Text style={styles.kmBadgeText}>Last: {lastRecordedKm} KM</Text>
                                    </View>
                                ) : null}
                            </View>

                            <View style={styles.kmInputWrapper}>
                                <MaterialCommunityIcons
                                    name="counter"
                                    size={22}
                                    color={theme.colors.textDisabled}
                                    style={{ marginRight: theme.spacing.sm }}
                                />
                                <TextInput
                                    style={styles.singleLineInput}
                                    placeholder="e.g. 12540"
                                    placeholderTextColor={theme.colors.placeholder}
                                    keyboardType="numeric"
                                    value={localStartKm}
                                    onChangeText={(val) => {
                                        setLocalStartKm(val);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                />
                                <Text style={styles.kmUnitText}>KM</Text>
                            </View>

                            {/* Quick fill last KM button */}
                            {lastRecordedKm !== undefined && lastRecordedKm !== null && String(lastRecordedKm) !== String(localStartKm) ? (
                                <TouchableOpacity
                                    style={styles.quickFillBtn}
                                    onPress={handleUseLastKm}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="history" size={15} color={theme.colors.brand} />
                                    <Text style={styles.quickFillText}>Use last recorded reading ({lastRecordedKm} KM)</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleConfirm}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="check" size={18} color={theme.colors.brandContrast} style={{ marginRight: 6 }} />
                            <Text style={styles.confirmBtnText}>Save KM Details</Text>
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
        backgroundColor: theme.colors.brandSoft,
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
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    inputLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        fontWeight: theme.fontWeights.semiBold,
    },
    labelWithBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    kmBadge: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radii.xs,
    },
    kmBadgeText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
        fontSize: 11,
    },
    dropdown: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        minHeight: 48,
    },
    dropdownContainer: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        elevation: 4,
    },
    dropdownText: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    noVehicleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        gap: theme.spacing.sm,
    },
    noVehicleText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
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
    quickFillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: theme.spacing.xs + 2,
        paddingVertical: 4,
        paddingHorizontal: theme.spacing.xs,
        gap: 4,
    },
    quickFillText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.medium,
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
        backgroundColor: theme.colors.brand,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md - 2,
        borderRadius: theme.radii.md,
        elevation: 2,
    },
    confirmBtnText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
        fontWeight: theme.fontWeights.bold,
    },
});

