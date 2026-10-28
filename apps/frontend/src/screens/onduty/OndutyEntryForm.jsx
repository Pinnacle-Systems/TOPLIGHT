import React, { useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Image, 
    ActivityIndicator 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import DropDownPicker from 'react-native-dropdown-picker';

import DateBanner from './DateBanner';
import { useAppTheme } from '../../theme';

export default function OndutyEntryForm({
    docId,
    categoryOptions,
    selectedCategory,
    onSelectCategory,
    categoryDropdownOpen,
    setCategoryDropdownOpen,
    othersText,
    onChangeOthers,
    // KM Entry Props (Conditional)
    isKmEntryEnabled,
    vehicleOptions,
    selectedVehicle,
    startKm,
    lastRecordedKm,
    onOpenKmModal,
    // Photo & Submit
    photoUri,
    onOpenCamera,
    onSubmitIN,
    isSubmitting,
    isAdmin,
    onOpenBrowseModal,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Map categories for DropDownPicker
    const categoryItems = (categoryOptions || []).map(item => ({
        label: item.name || item.value || String(item.id),
        value: item.id,
    }));

    const selectedVehicleName = useMemo(() => {
        if (!selectedVehicle) return '';
        const found = (vehicleOptions || []).find(v => v.vechileno === selectedVehicle);
        return found ? (found.vechilename || found.vechileno) : selectedVehicle;
    }, [selectedVehicle, vehicleOptions]);

    const isKmReady = Boolean(selectedVehicle && startKm && String(startKm).trim() !== '');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.headerTitle}>OnDuty Entry</Text>
                    <Text style={styles.headerSubtitle}>Fill in details to start your trip</Text>
                </View>
                {isAdmin ? (
                    <TouchableOpacity 
                        style={styles.browseBtn} 
                        onPress={onOpenBrowseModal}
                        activeOpacity={0.8}
                    >
                        <Entypo name="browser" size={theme.controlSizes.iconXs} color={theme.colors.brand} />
                        <Text style={styles.browseBtnText}>Browse</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Date Banner */}
            <DateBanner />

            {/* Document ID Pill */}
            {docId ? (
                <View style={styles.docIdPill}>
                    <MaterialCommunityIcons name="file-document-outline" size={theme.controlSizes.iconSm} color={theme.colors.brand} />
                    <Text style={styles.docIdText}>{docId}</Text>
                    <View style={styles.autoTag}>
                        <Text style={styles.autoTagText}>AUTO</Text>
                    </View>
                </View>
            ) : null}

            {/* Trip Details Card */}
            <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="form-textbox" size={theme.controlSizes.iconSm} color={theme.colors.brand} />
                    <Text style={styles.cardHeaderText}>Trip Details</Text>
                </View>

                {/* Reason Category Dropdown */}
                <View style={[styles.inputGroup, { zIndex: 3000 }]}>
                    <Text style={styles.inputLabel}>Reason Category *</Text>
                    <DropDownPicker
                        open={categoryDropdownOpen}
                        value={selectedCategory}
                        items={categoryItems}
                        setOpen={setCategoryDropdownOpen}
                        setValue={onSelectCategory}
                        placeholder="Select Reason"
                        searchable={true}
                        searchPlaceholder="Search categories..."
                        listMode="SCROLLVIEW"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        textStyle={styles.dropdownText}
                    />
                </View>

                {/* Others / Remarks */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Remarks / Details</Text>
                    <TextInput
                        style={styles.multilineInput}
                        placeholder="Provide details about your visit or purpose..."
                        placeholderTextColor={theme.colors.placeholder}
                        multiline
                        numberOfLines={3}
                        value={othersText}
                        onChangeText={onChangeOthers}
                        textAlignVertical="top"
                    />
                </View>
            </View>

            {/* ── Vehicle & KM Entry Card (Shown ONLY when enabled in Settings) ── */}
            {isKmEntryEnabled ? (
                <View style={styles.formCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="speedometer" size={theme.controlSizes.iconSm} color={theme.colors.brand} />
                        <Text style={styles.cardHeaderText}>Vehicle & KM Reading</Text>
                        {isKmReady ? (
                            <View style={styles.readyBadge}>
                                <MaterialCommunityIcons name="check-circle" size={12} color={theme.colors.success} />
                                <Text style={styles.readyBadgeText}>READY</Text>
                            </View>
                        ) : (
                            <View style={styles.requiredBadge}>
                                <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                            </View>
                        )}
                    </View>

                    {isKmReady ? (
                        <View style={styles.kmSummaryContainer}>
                            <View style={styles.kmSummaryRow}>
                                <View style={styles.kmSummaryItem}>
                                    <Text style={styles.kmSummaryLabel}>VEHICLE</Text>
                                    <Text style={styles.kmSummaryValue}>{selectedVehicleName}</Text>
                                </View>
                                <View style={styles.kmSummaryItem}>
                                    <Text style={styles.kmSummaryLabel}>START ODOMETER</Text>
                                    <Text style={styles.kmSummaryValueHighlight}>{startKm} KM</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.editKmBtn}
                                onPress={onOpenKmModal}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.colors.brand} />
                                <Text style={styles.editKmBtnText}>Edit KM Details</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.enterKmBtn}
                            onPress={onOpenKmModal}
                            activeOpacity={0.8}
                        >
                            <View style={styles.enterKmIconCircle}>
                                <MaterialCommunityIcons name="speedometer" size={24} color={theme.colors.brand} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.enterKmTitle}>Enter Vehicle & Starting KM</Text>
                                <Text style={styles.enterKmSubtitle}>
                                    Tap to record odometer reading for today's trip
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textDisabled} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            {/* Photo Capture Section */}
            <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="camera-outline" size={theme.controlSizes.iconSm} color={theme.colors.brand} />
                    <Text style={styles.cardHeaderText}>Location Photo *</Text>
                </View>

                {photoUri ? (
                    <View style={styles.photoPreviewWrapper}>
                        <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                        <View style={styles.photoOverlayBar}>
                            <View style={styles.photoCapturedBadge}>
                                <Feather name="check" size={theme.fontSizes.xs} color={theme.colors.brandContrast} />
                                <Text style={styles.photoCapturedText}>PHOTO READY</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.retakeBtn} 
                                onPress={onOpenCamera}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="camera-retake-outline" size={theme.controlSizes.iconSm} color={theme.colors.brandContrast} />
                                <Text style={styles.retakeBtnText}>Retake</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.cameraPlaceholder} 
                        onPress={onOpenCamera}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cameraCircle}>
                            <Feather name="camera" size={theme.controlSizes.iconLg} color={theme.colors.brand} />
                        </View>
                        <Text style={styles.cameraPromptTitle}>Tap to Capture Photo</Text>
                        <Text style={styles.cameraPromptSubtitle}>A selfie or location photo is required to start</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                    styles.submitBtn,
                    (!photoUri || isSubmitting) && styles.submitBtnDisabled,
                ]}
                onPress={onSubmitIN}
                disabled={!photoUri || isSubmitting}
                activeOpacity={0.8}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.brandContrast} />
                ) : (
                    <>
                        <MaterialCommunityIcons name="car-brake-low-pressure" size={theme.controlSizes.iconMd} color={theme.colors.brandContrast} style={{ marginRight: theme.spacing.sm }} />
                        <Text style={styles.submitBtnText}>START ONDUTY (IN)</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        paddingBottom: theme.spacing.huge,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md + theme.spacing.xxs,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xxs,
    },
    browseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs + theme.spacing.xxs,
        borderRadius: theme.radii.xl,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.brandSoft,
        gap: theme.spacing.xs + theme.spacing.xxs,
    },
    browseBtnText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    docIdPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md + theme.spacing.xxs,
        paddingHorizontal: theme.spacing.md + theme.layout.dividerWidth * 2,
        paddingVertical: theme.spacing.md,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.borderSubtle,
        marginBottom: theme.spacing.md + theme.spacing.xxs,
        gap: theme.spacing.sm,
    },
    docIdText: {
        flex: 1,
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
        fontFamily: theme.fontFamilies.monospace,
    },
    autoTag: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs + theme.layout.dividerWidth,
        borderRadius: theme.radii.sm,
    },
    autoTagText: {
        ...theme.typography.overline,
        fontWeight: theme.fontWeights.extraBold,
        color: theme.colors.brand,
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        padding: theme.spacing.lg,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.borderSubtle,
        marginBottom: theme.spacing.md + theme.spacing.xxs,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: theme.spacing.none, height: theme.spacing.xxs },
        shadowOpacity: 0.04,
        shadowRadius: theme.spacing.sm - theme.spacing.xxs,
        elevation: theme.elevation.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md + theme.spacing.xxs,
        gap: theme.spacing.sm,
    },
    cardHeaderText: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    inputGroup: {
        marginBottom: theme.spacing.md + theme.spacing.xxs,
    },
    inputLabel: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xs + theme.spacing.xxs,
    },
    labelWithBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs + theme.spacing.xxs,
    },
    kmBadge: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radii.xs + theme.layout.dividerWidth,
    },
    kmBadgeText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    readyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successSoft,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.radii.xs + theme.layout.dividerWidth,
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
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.radii.xs + theme.layout.dividerWidth,
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
        padding: theme.spacing.md,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.borderSubtle,
    },
    kmSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
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
    kmSummaryValue: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.text,
    },
    kmSummaryValueHighlight: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    editKmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: theme.spacing.xs,
        gap: 4,
    },
    editKmBtnText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    enterKmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    enterKmIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.brandSoft,
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
    kmInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        height: theme.controlSizes.inputHeightDropdown,
    },
    singleLineInput: {
        flex: 1,
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        padding: theme.spacing.none,
    },
    kmUnitText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textDisabled,
        marginLeft: theme.spacing.xs + theme.layout.dividerWidth,
    },
    dropdown: {
        backgroundColor: theme.colors.inputBackground,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        minHeight: theme.controlSizes.inputHeightDropdown,
    },
    dropdownContainer: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderSubtle,
        borderRadius: theme.radii.md,
        elevation: theme.elevation.md + theme.layout.dividerWidth,
    },
    dropdownText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
    },
    multilineInput: {
        backgroundColor: theme.colors.inputBackground,
        borderWidth: theme.layout.dividerWidth,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md + theme.spacing.xxs,
        paddingVertical: theme.spacing.sm + theme.spacing.xxs,
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        minHeight: theme.controlSizes.inputHeightMultilineCompact,
    },
    photoPreviewWrapper: {
        borderRadius: theme.radii.lg,
        overflow: 'hidden',
        height: theme.controlSizes.photoPreviewHeight,
        position: 'relative',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    photoOverlayBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.overlay,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    photoCapturedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    photoCapturedText: {
        color: theme.colors.brandContrast,
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
    },
    retakeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.scrim,
        paddingHorizontal: theme.spacing.sm + theme.spacing.xxs,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.md,
        gap: theme.spacing.xs,
    },
    retakeBtnText: {
        color: theme.colors.brandContrast,
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
    },
    cameraPlaceholder: {
        borderRadius: theme.radii.lg,
        borderWidth: theme.layout.dividerWidth + theme.layout.dividerWidth / 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.accentSoft,
        backgroundColor: theme.colors.surfaceRaised,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxxl - theme.spacing.xs,
    },
    cameraCircle: {
        width: theme.controlSizes.cameraIconContainer,
        height: theme.controlSizes.cameraIconContainer,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    cameraPromptTitle: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    cameraPromptSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        marginTop: theme.spacing.xxs,
    },
    submitBtn: {
        backgroundColor: theme.colors.brand,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.radii.lg,
        shadowColor: theme.colors.brand,
        shadowOffset: { width: theme.spacing.none, height: theme.spacing.xs },
        shadowOpacity: 0.25,
        shadowRadius: theme.spacing.sm,
        elevation: theme.elevation.md,
        marginTop: theme.spacing.xs + theme.spacing.xxs,
    },
    submitBtnDisabled: {
        backgroundColor: theme.colors.disabledBackground,
        shadowOpacity: 0,
        elevation: theme.elevation.none,
    },
    submitBtnText: {
        color: theme.colors.brandContrast,
        ...theme.typography.button,
        fontWeight: theme.fontWeights.extraBold,
    },
});
