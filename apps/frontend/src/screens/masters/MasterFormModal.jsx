import React, { useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PTYPE_OPTIONS } from './MasterConfig';
import { useAppTheme } from '../../theme';

export default function MasterFormModal({
    visible,
    onClose,
    isEdit = false,
    name,
    setName,
    active,
    setActive,
    ptype,
    setPtype,
    hasPtype = false,
    isLoading = false,
    onSubmit,
    accentColor,
    title = 'Add Master Entry',
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const accent = accentColor || theme.colors.brand;
    const slideAnim = useRef(new Animated.Value(400)).current;

    useEffect(() => {
        if (visible) {
            Keyboard.dismiss();
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 400,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const STATUS_OPTIONS = [
        { label: 'Active', value: 'Yes', icon: 'check-circle-outline', color: theme.colors.success, backgroundColor: theme.colors.successSoft },
        { label: 'Inactive', value: 'No', icon: 'close-circle-outline', color: theme.colors.textMuted, backgroundColor: theme.colors.surfaceSunken },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdropArea} activeOpacity={1} onPress={onClose} />
                <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Handle Bar */}
                    <View style={styles.handleWrap}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.headerIcon, { backgroundColor: theme.colors.surfaceSelected }]}>
                            <MaterialCommunityIcons
                                name={isEdit ? 'pencil-box-outline' : 'plus-box-outline'}
                                size={22}
                                color={accent}
                            />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>{isEdit ? 'Update Entry' : title}</Text>
                            <Text style={styles.headerSub}>{isEdit ? 'Edit and save changes below' : 'Fill in the details below'}</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="close" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.body}
                    >
                        {/* Name Input */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>
                                <Text style={styles.required}>* </Text>
                                Name / Description
                            </Text>
                            <View style={styles.textInputWrap}>
                                <MaterialCommunityIcons name="form-textbox" size={18} color={theme.colors.textDisabled} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter descriptive name..."
                                    placeholderTextColor={theme.colors.placeholder}
                                    autoCapitalize="sentences"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Ptype Selector (if hasPtype) */}
                        {hasPtype && setPtype ? (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>
                                    <Text style={styles.required}>* </Text>
                                    Category Type
                                </Text>
                                <View style={styles.optionsRow}>
                                    {PTYPE_OPTIONS.map((option) => {
                                        const isSelected = ptype === option.value;
                                        const optionColor = option.value === 'permission'
                                            ? theme.colors.accent
                                            : theme.colors.warning;
                                        return (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.optionChip,
                                                    isSelected && { backgroundColor: theme.colors.surfaceSelected, borderColor: optionColor },
                                                ]}
                                                onPress={() => setPtype(option.value)}
                                                activeOpacity={0.7}
                                            >
                                                {isSelected ? (
                                                    <MaterialCommunityIcons name="check-circle" size={14} color={optionColor} />
                                                ) : null}
                                                <Text style={[
                                                    styles.optionChipText,
                                                    isSelected && { color: optionColor, fontWeight: theme.fontWeights.semiBold },
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ) : null}

                        {/* Status Selector */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>
                                <Text style={styles.required}>* </Text>
                                Status
                            </Text>
                            <View style={styles.optionsRow}>
                                {STATUS_OPTIONS.map((option) => {
                                    const isSelected = active === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.statusOption,
                                                isSelected && {
                                                    backgroundColor: option.backgroundColor,
                                                    borderColor: option.color,
                                                },
                                            ]}
                                            onPress={() => setActive(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons 
                                                name={option.icon} 
                                                size={20} 
                                                color={isSelected ? option.color : theme.colors.borderStrong}
                                            />
                                            <Text style={[
                                                styles.statusOptionText,
                                                isSelected && { color: option.color, fontWeight: theme.fontWeights.semiBold },
                                            ]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Submit Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: accent },
                                (isLoading || !name?.trim()) && styles.submitBtnDisabled,
                            ]}
                            onPress={onSubmit}
                            activeOpacity={0.8}
                            disabled={isLoading || !name?.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.brandContrast} size="small" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons
                                        name={isEdit ? 'check-circle-outline' : 'plus-circle-outline'}
                                        size={18}
                                        color={theme.colors.brandContrast}
                                    />
                                    <Text style={styles.submitBtnText}>
                                        {isEdit ? 'Save Changes' : 'Add Entry'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const createStyles = theme => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.scrim,
        justifyContent: 'flex-end',
    },
    backdropArea: {
        flex: 1,
    },
    sheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radii.xl,
        borderTopRightRadius: theme.radii.xl,
        paddingBottom: theme.spacing.xxl,
        maxHeight: '88%',
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        paddingBottom: 4,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.borderSubtle,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md + 2,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        gap: theme.spacing.md,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.text,
    },
    headerSub: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceSunken,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.lg + 2,
        paddingBottom: theme.spacing.md - 2,
    },
    fieldGroup: {
        marginBottom: theme.spacing.xl,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    required: {
        color: theme.colors.danger,
    },
    textInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.radii.md,
        borderWidth: 1.5,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: theme.spacing.md,
        height: 48,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        paddingVertical: 0,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md + 2,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1.5,
        borderColor: theme.colors.borderSubtle,
        gap: theme.spacing.xs + 2,
    },
    optionChipText: {
        fontSize: 13,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.medium,
    },
    statusOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: theme.colors.borderSubtle,
        backgroundColor: theme.colors.surfaceSunken,
        gap: theme.spacing.sm,
    },
    statusOptionText: {
        fontSize: 14,
        color: theme.colors.textDisabled,
        fontWeight: theme.fontWeights.medium,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.md + 2,
        gap: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: theme.spacing.md + 1,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surfaceSunken,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        ...theme.typography.button,
        color: theme.colors.textSecondary,
    },
    submitBtn: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: theme.spacing.md + 1,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.35 : 0.15,
        shadowRadius: 4,
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
    },
});
