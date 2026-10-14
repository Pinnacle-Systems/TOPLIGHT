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
import { useAppTheme } from '../../../theme';

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
    onSelectVehicle,
    vehicleDropdownOpen,
    setVehicleDropdownOpen,
    startKm,
    onChangeStartKm,
    lastRecordedKm,
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

    // Map vehicles for DropDownPicker
    const vehicleItems = (vehicleOptions || []).map(item => ({
        label: item.vechilename || item.vechileno,
        value: item.vechileno,
    }));

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
                        <Entypo name="browser" size={14} color={theme.colors.brand} />
                        <Text style={styles.browseBtnText}>Browse</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Date Banner */}
            <DateBanner />

            {/* Document ID Pill */}
            {docId ? (
                <View style={styles.docIdPill}>
                    <MaterialCommunityIcons name="file-document-outline" size={18} color={theme.colors.brand} />
                    <Text style={styles.docIdText}>{docId}</Text>
                    <View style={styles.autoTag}>
                        <Text style={styles.autoTagText}>AUTO</Text>
                    </View>
                </View>
            ) : null}

            {/* Trip Details Card */}
            <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="form-textbox" size={18} color={theme.colors.brand} />
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
                        <MaterialCommunityIcons name="speedometer" size={18} color={theme.colors.brand} />
                        <Text style={styles.cardHeaderText}>Vehicle & KM Reading</Text>
                    </View>

                    {/* Vehicle Dropdown */}
                    <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                        <Text style={styles.inputLabel}>Select Vehicle</Text>
                        <DropDownPicker
                            open={vehicleDropdownOpen}
                            value={selectedVehicle}
                            items={vehicleItems}
                            setOpen={setVehicleDropdownOpen}
                            setValue={onSelectVehicle}
                            placeholder="Select Vehicle"
                            listMode="SCROLLVIEW"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            textStyle={styles.dropdownText}
                        />
                    </View>

                    {/* Starting KM Reading */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelWithBadgeRow}>
                            <Text style={styles.inputLabel}>Starting Odometer (KM)</Text>
                            {lastRecordedKm !== undefined && lastRecordedKm !== null ? (
                                <View style={styles.kmBadge}>
                                    <Text style={styles.kmBadgeText}>Last: {lastRecordedKm} KM</Text>
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.kmInputWrapper}>
                            <MaterialCommunityIcons name="counter" size={20} color={theme.colors.textDisabled} style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.singleLineInput}
                                placeholder="e.g. 12540"
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="numeric"
                                value={startKm}
                                onChangeText={onChangeStartKm}
                            />
                            <Text style={styles.kmUnitText}>KM</Text>
                        </View>
                    </View>
                </View>
            ) : null}

            {/* Photo Capture Section */}
            <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="camera-outline" size={18} color={theme.colors.accent} />
                    <Text style={styles.cardHeaderText}>Location Photo *</Text>
                </View>

                {photoUri ? (
                    <View style={styles.photoPreviewWrapper}>
                        <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                        <View style={styles.photoOverlayBar}>
                            <View style={styles.photoCapturedBadge}>
                                <Feather name="check" size={12} color={theme.colors.brandContrast} />
                                <Text style={styles.photoCapturedText}>PHOTO READY</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.retakeBtn} 
                                onPress={onOpenCamera}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="camera-retake-outline" size={16} color={theme.colors.brandContrast} />
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
                            <Feather name="camera" size={26} color={theme.colors.accent} />
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
                        <MaterialCommunityIcons name="car-brake-low-pressure" size={20} color={theme.colors.brandContrast} style={{ marginRight: 8 }} />
                        <Text style={styles.submitBtnText}>START ONDUTY (IN)</Text>
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    browseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.brandSoft,
        gap: 5,
    },
    browseBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.brand,
    },
    docIdPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: 14,
        gap: 8,
    },
    docIdText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.brand,
        fontFamily: 'monospace',
    },
    autoTag: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    autoTagText: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.brand,
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: 14,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    cardHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textMuted,
        marginBottom: 6,
    },
    labelWithBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    kmBadge: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    kmBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.brand,
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
        fontSize: 14,
        color: theme.colors.text,
        padding: 0,
    },
    kmUnitText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.textDisabled,
        marginLeft: 6,
    },
    dropdown: {
        backgroundColor: theme.colors.inputBackground,
        borderColor: theme.colors.inputBorder,
        borderRadius: 12,
        minHeight: 46,
    },
    dropdownContainer: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 12,
        elevation: 5,
    },
    dropdownText: {
        fontSize: 14,
        color: theme.colors.text,
    },
    multilineInput: {
        backgroundColor: theme.colors.inputBackground,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: theme.colors.text,
        minHeight: 80,
    },
    photoPreviewWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        height: 200,
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
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    photoCapturedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    photoCapturedText: {
        color: theme.colors.brandContrast,
        fontSize: 11,
        fontWeight: '700',
    },
    retakeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.scrim,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    retakeBtnText: {
        color: theme.colors.brandContrast,
        fontSize: 12,
        fontWeight: '700',
    },
    cameraPlaceholder: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: theme.colors.accentSoft,
        backgroundColor: theme.colors.surfaceRaised,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 28,
    },
    cameraCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    cameraPromptTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.accent,
    },
    cameraPromptSubtitle: {
        fontSize: 11,
        color: theme.colors.accent,
        marginTop: 2,
    },
    submitBtn: {
        backgroundColor: theme.colors.brand,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: theme.colors.brand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 6,
    },
    submitBtnDisabled: {
        backgroundColor: theme.colors.disabledBackground,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        color: theme.colors.brandContrast,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
