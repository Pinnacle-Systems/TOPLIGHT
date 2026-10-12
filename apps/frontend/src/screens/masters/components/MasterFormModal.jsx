import React, { useEffect, useRef } from 'react';
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
import { PTYPE_OPTIONS } from '../constants/masterConfig';

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
    accentColor = '#2563EB',
    title = 'Add Master Entry',
}) {
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
    }, [visible]);

    const STATUS_OPTIONS = [
        { label: 'Active', value: 'Yes', icon: 'check-circle-outline', color: '#16A34A' },
        { label: 'Inactive', value: 'No', icon: 'close-circle-outline', color: '#64748B' },
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
                        <View style={[styles.headerIcon, { backgroundColor: accentColor + '15' }]}>
                            <MaterialCommunityIcons
                                name={isEdit ? 'pencil-box-outline' : 'plus-box-outline'}
                                size={22}
                                color={accentColor}
                            />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>{isEdit ? 'Update Entry' : title}</Text>
                            <Text style={styles.headerSub}>{isEdit ? 'Edit and save changes below' : 'Fill in the details below'}</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="close" size={20} color="#64748B" />
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
                                <MaterialCommunityIcons name="form-textbox" size={18} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter descriptive name..."
                                    placeholderTextColor="#94A3B8"
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
                                        return (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.optionChip,
                                                    isSelected && { backgroundColor: option.color + '15', borderColor: option.color },
                                                ]}
                                                onPress={() => setPtype(option.value)}
                                                activeOpacity={0.7}
                                            >
                                                {isSelected ? (
                                                    <MaterialCommunityIcons name="check-circle" size={14} color={option.color} />
                                                ) : null}
                                                <Text style={[
                                                    styles.optionChipText,
                                                    isSelected && { color: option.color, fontWeight: '600' },
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
                                                    backgroundColor: option.color === '#16A34A' ? '#DCFCE7' : '#F1F5F9',
                                                    borderColor: option.color 
                                                },
                                            ]}
                                            onPress={() => setActive(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons 
                                                name={option.icon} 
                                                size={20} 
                                                color={isSelected ? option.color : '#CBD5E1'} 
                                            />
                                            <Text style={[
                                                styles.statusOptionText,
                                                isSelected && { color: option.color, fontWeight: '600' },
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
                                { backgroundColor: accentColor },
                                (isLoading || !name?.trim()) && styles.submitBtnDisabled,
                            ]}
                            onPress={onSubmit}
                            activeOpacity={0.8}
                            disabled={isLoading || !name?.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons
                                        name={isEdit ? 'check-circle-outline' : 'plus-circle-outline'}
                                        size={18}
                                        color="#FFFFFF"
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    backdropArea: {
        flex: 1,
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 24,
        maxHeight: '88%',
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 4,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 12,
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
        color: '#0F172A',
    },
    headerSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 10,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    textInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
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
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    optionChipText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    statusOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        gap: 8,
    },
    statusOptionText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 14,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748B',
    },
    submitBtn: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
