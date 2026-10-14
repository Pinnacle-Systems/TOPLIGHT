import React, { useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import { Dropdown } from '../../components/ReusableComponents/inputs';
import {
    useGet__per_categoryQuery,
    useGetDocIDQuery,
    useRequestPermissionMutation,
} from '../../store/api/permissionApi';
import { useGet_hod_tokenQuery, useGet_refresh_tokenQuery } from '../../store/api/userApi';
import { _FCM_SENDER } from '../../components/Utils/FCM';
import socket from '../../utils/Socket';
import { useAppTheme } from '../../theme';

const formatTime = value => moment(value).format('hh:mm A');

const serializeDate = date => (
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)).toISOString()
);

const getDuration = (fromTime, toTime) => {
    const fromMinutes = fromTime.getHours() * 60 + fromTime.getMinutes();
    const toMinutes = toTime.getHours() * 60 + toTime.getMinutes();
    const duration = (toMinutes - fromMinutes + 1440) % 1440;
    if (!duration) return null;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return { label: `${hours}h ${minutes}m`, minutes };
};

function FormField({ label, children, styles }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}<Text style={styles.required}> *</Text></Text>
            {children}
        </View>
    );
}

function TimeField({ label, value, onPress, styles, theme }) {
    return (
        <FormField label={label} styles={styles}>
            <TouchableOpacity
                style={styles.input}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${formatTime(value)}`}
            >
                <Text style={styles.inputText}>{formatTime(value)}</Text>
                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
        </FormField>
    );
}

export default function PermissionEntryScreen() {
    const { theme } = useAppTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const user = useSelector(state => state.UserDetails);
    const userId = String(user?.UserId || user?.IDCARD || user?.Id || '').trim();
    const companyCode = String(user?.GCOMPCODE || '').trim();
    const hod = String(user?.hod || '').trim();
    const employeeName = String(user?.EMPNAME || user?.userName || '').trim();

    const [docDate, setDocDate] = useState(new Date());
    const [fromTime, setFromTime] = useState(() => {
        const date = new Date();
        date.setHours(9, 0, 0, 0);
        return date;
    });
    const [toTime, setToTime] = useState(() => {
        const date = new Date();
        date.setHours(10, 0, 0, 0);
        return date;
    });
    const [category, setCategory] = useState(null);
    const [reason, setReason] = useState('');
    const [activePicker, setActivePicker] = useState(null);
    const submittingRef = useRef(false);

    const {
        data: categoriesData,
        isLoading: categoriesLoading,
        isError: categoriesError,
        refetch: refetchCategories,
    } = useGet__per_categoryQuery({ type: 'permission' });
    const {
        data: documentData,
        isLoading: documentLoading,
        isError: documentError,
        refetch: refetchDocument,
    } = useGetDocIDQuery();
    const { data: refreshTokenData } = useGet_refresh_tokenQuery();
    const { data: hodTokenData } = useGet_hod_tokenQuery(
        { params: { hod } },
        { skip: !hod },
    );
    const [requestPermission, { isLoading: isSubmitting }] = useRequestPermissionMutation();

    const categories = useMemo(
        () => (Array.isArray(categoriesData?.data) ? categoriesData.data : []),
        [categoriesData],
    );
    const duration = getDuration(fromTime, toTime);
    const count = Number(documentData?.data?.count);
    const documentId = Number.isFinite(count) && count > 0
        ? `PER-${String(count).padStart(6, '0')}`
        : '';
    const hasCategory = category !== null && category !== undefined && String(category).trim() !== '';
    const canSubmit = Boolean(
        userId && companyCode && hod && hasCategory && duration && reason.trim() && documentId
        && !categoriesLoading && !categoriesError && !documentLoading && !documentError && !isSubmitting,
    );

    const handlePickerChange = (event, selectedValue) => {
        const picker = activePicker;
        setActivePicker(null);
        if (event?.type !== 'set' || !selectedValue || !picker) return;

        if (picker === 'date') setDocDate(selectedValue);
        if (picker === 'from') setFromTime(selectedValue);
        if (picker === 'to') setToTime(selectedValue);
    };

    const handleSubmit = async () => {
        if (submittingRef.current) return;
        if (!userId || !companyCode || !hod) {
            showMessage({
                message: 'Permission request unavailable',
                description: 'Your employee, company, or HOD details are missing from your profile.',
                type: 'danger',
            });
            return;
        }
        if (!hasCategory || !duration || !reason.trim()) {
            showMessage({
                message: 'Complete the required fields',
                description: 'Choose a category and valid time range, then enter a reason.',
                type: 'warning',
            });
            return;
        }
        if (categoriesError || documentError) {
            showMessage({
                message: 'Permission data is unavailable',
                description: 'Retry loading permission categories and document numbering before submitting.',
                type: 'danger',
            });
            return;
        }

        submittingRef.current = true;
        try {
            const latestDocument = await refetchDocument();
            if (latestDocument?.isError) {
                throw new Error('Unable to load the latest permission document number.');
            }
            const latestCount = Number(latestDocument?.data?.data?.count ?? count);
            const latestDocId = Number.isFinite(latestCount) && latestCount > 0
                ? `PER-${String(latestCount).padStart(6, '0')}`
                : '';
            const response = await requestPermission({
                data: {
                    userId,
                    docDate: serializeDate(docDate),
                    hod,
                    createdBy: userId,
                    compCode: companyCode,
                    username: employeeName,
                    fTime: formatTime(fromTime),
                    tTime: formatTime(toTime),
                    modified_By: userId,
                    docid: latestDocId,
                    reason: reason.trim(),
                    mobile: user?.MOBNO == null ? null : String(user.MOBNO),
                    thrs: duration.label,
                    category,
                },
                params: { docCount: latestCount },
            }).unwrap();

            if (Number(response?.status) !== 1) {
                throw new Error(response?.message || 'The permission request could not be saved.');
            }

            showMessage({
                message: 'Permission request sent',
                description: 'Your request was submitted successfully.',
                type: 'success',
            });

            try {
                socket.emit('permission_request', {
                    hod,
                    hr: user?.hr == null ? '' : String(user.hr),
                    compcode: companyCode,
                    userdata: {
                        email: '',
                        username: user?.userName || employeeName,
                        Idcard: userId,
                        mobile: user?.MOBNO,
                    },
                    ...response.data,
                });
            } catch (socketError) {
                console.warn('[PermissionEntryScreen] Unable to emit request notification:', socketError);
            }

            if (refreshTokenData?.data?.token && hodTokenData?.data?.fcm) {
                try {
                    await _FCM_SENDER(
                        refreshTokenData.data.token,
                        hodTokenData.data.fcm,
                        `Permission request from ${employeeName || userId}`,
                        'Permission Request',
                    );
                } catch (notificationError) {
                    console.warn('[PermissionEntryScreen] Unable to send request notification:', notificationError);
                }
            }

            setCategory(null);
            setReason('');
            refetchDocument();
        } catch (error) {
            showMessage({
                message: 'Permission request failed',
                description: error?.data?.message || error?.data?.error || error?.message
                    || 'Please check your connection and try again.',
                type: 'danger',
            });
        } finally {
            submittingRef.current = false;
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar
                barStyle={theme.isDark ? 'dark-content' : 'light-content'}
                backgroundColor={theme.colors.brand}
            />
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="account-clock-outline" size={23} color={theme.colors.brandContrast} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Permission Request</Text>
                    <Text style={styles.subtitle}>Request time away during your workday</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <MaterialCommunityIcons name="account-outline" size={22} color={theme.colors.accent} />
                    </View>
                    <View style={styles.profileText}>
                        <Text style={styles.employeeName}>{employeeName || 'Employee'}</Text>
                        <Text style={styles.employeeId}>
                            {userId || 'Employee ID unavailable'}{companyCode ? ` · ${companyCode}` : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Request details</Text>
                    <FormField label="Document ID" styles={styles}>
                        <View style={[styles.input, styles.readOnlyInput]}>
                            {documentLoading
                                ? <ActivityIndicator size="small" color={theme.colors.accent} />
                                : <Text style={styles.inputText}>{documentId || 'Unavailable'}</Text>}
                        </View>
                    </FormField>
                    {documentError && (
                        <TouchableOpacity onPress={refetchDocument} accessibilityRole="button">
                            <Text style={styles.errorText}>Could not load the document number. Tap to retry.</Text>
                        </TouchableOpacity>
                    )}

                    <FormField label="Document date" styles={styles}>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setActivePicker('date')}
                            accessibilityRole="button"
                            accessibilityLabel={`Document date: ${moment(docDate).format('DD MMM YYYY')}`}
                        >
                            <Text style={styles.inputText}>{moment(docDate).format('DD MMM YYYY')}</Text>
                            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </FormField>

                    <View style={styles.timeRow}>
                        <View style={styles.timeField}>
                            <TimeField styles={styles} theme={theme} label="From time" value={fromTime} onPress={() => setActivePicker('from')} />
                        </View>
                        <View style={styles.timeField}>
                            <TimeField styles={styles} theme={theme} label="To time" value={toTime} onPress={() => setActivePicker('to')} />
                        </View>
                    </View>
                    {activePicker && (
                        <DateTimePicker
                            value={activePicker === 'date' ? docDate : activePicker === 'from' ? fromTime : toTime}
                            mode={activePicker === 'date' ? 'date' : 'time'}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handlePickerChange}
                        />
                    )}

                    <View style={styles.durationCard}>
                        <MaterialCommunityIcons name="timer-outline" size={20} color={theme.colors.accent} />
                        <Text style={styles.durationLabel}>Total duration</Text>
                        <Text style={styles.durationValue}>{duration?.label || 'Choose a valid time range'}</Text>
                    </View>

                    <View style={styles.field}>
                        <Dropdown
                            label="Category *"
                            selected={category}
                            setSelected={setCategory}
                            options={{ data: categories }}
                            _label="label"
                            _value="value"
                            placeholder={categoriesLoading ? 'Loading categories...' : 'Select category'}
                            isLoading={categoriesLoading}
                            disabled={categoriesLoading || categoriesError}
                            width="100%"
                        />
                        {categoriesError && (
                            <TouchableOpacity onPress={refetchCategories} accessibilityRole="button">
                                <Text style={styles.errorText}>Could not load categories. Tap to retry.</Text>
                            </TouchableOpacity>
                        )}
                        {!categoriesLoading && !categoriesError && categories.length === 0 && (
                            <Text style={styles.helperText}>No active permission categories are available.</Text>
                        )}
                    </View>

                    <FormField label="Reason" styles={styles}>
                        <TextInput
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Describe why you need permission"
                            placeholderTextColor={theme.colors.placeholder}
                            style={styles.reasonInput}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                            accessibilityLabel="Permission request reason"
                        />
                        <Text style={styles.characterCount}>{reason.length}/500</Text>
                    </FormField>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    accessibilityRole="button"
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={theme.colors.brandContrast} />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="send-outline" size={18} color={theme.colors.brandContrast} />
                            <Text style={styles.submitButtonText}>Submit permission request</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.backgroundSubtle },
    header: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.brand,
    },
    headerIcon: {
        width: theme.controlSizes.avatarMd,
        height: theme.controlSizes.avatarMd,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.brandSoft,
        marginRight: theme.spacing.md,
    },
    headerText: { flex: 1 },
    title: { ...theme.typography.h4, color: theme.colors.brandContrast },
    subtitle: { ...theme.typography.caption, color: theme.colors.brandContrast, opacity: 0.75, marginTop: theme.spacing.xxs + 1 },
    content: { padding: theme.layout.screenGutter, paddingBottom: theme.spacing.xxxl },
    profileCard: {
        ...theme.styles.card,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    profileAvatar: {
        width: theme.controlSizes.avatarMd,
        height: theme.controlSizes.avatarMd,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accentSoft,
        marginRight: theme.spacing.md,
    },
    profileText: { flex: 1 },
    employeeName: { ...theme.typography.subtitle, color: theme.colors.text, fontWeight: theme.fontWeights.bold },
    employeeId: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: theme.spacing.xxs + 1 },
    formCard: {
        ...theme.styles.card,
    },
    sectionTitle: { ...theme.typography.title, color: theme.colors.text, marginBottom: theme.spacing.xs },
    field: { marginTop: theme.spacing.lg },
    label: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: theme.fontWeights.semiBold, marginBottom: theme.spacing.xs + 3 },
    required: { color: theme.colors.danger },
    input: {
        minHeight: theme.controlSizes.inputHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.inputBackground,
    },
    readOnlyInput: { backgroundColor: theme.colors.surfaceSunken },
    inputText: { ...theme.typography.bodySmall, color: theme.colors.text },
    timeRow: { flexDirection: 'row', gap: theme.spacing.md },
    timeField: { flex: 1 },
    durationCard: {
        minHeight: theme.controlSizes.inputHeight,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accentSoft,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    durationLabel: { flex: 1, ...theme.typography.caption, color: theme.colors.accent, fontWeight: theme.fontWeights.semiBold },
    durationValue: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: theme.fontWeights.bold },
    reasonInput: {
        minHeight: 112,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        backgroundColor: theme.colors.inputBackground,
    },
    characterCount: { ...theme.typography.caption, color: theme.colors.textDisabled, textAlign: 'right', marginTop: theme.spacing.xs },
    helperText: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: theme.spacing.sm },
    errorText: { ...theme.typography.caption, color: theme.colors.danger, marginTop: theme.spacing.sm },
    submitButton: {
        minHeight: theme.controlSizes.buttonHeight + theme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radii.md,
        marginTop: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    submitButtonDisabled: { backgroundColor: theme.colors.disabledText },
    submitButtonText: { ...theme.typography.button, color: theme.colors.brandContrast },
});
