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
import { Dropdown } from '../../components/reusable_components/Inputs';
import {
    useGet__per_categoryQuery,
    useGetDocIDQuery,
    useRequestPermissionMutation,
} from '../../store/api/PermissionApi';
import { useGet_hod_tokenQuery, useGet_refresh_tokenQuery } from '../../store/api/UserApi';
import { _FCM_SENDER } from '../../components/utils/Fcm';
import socket from '../../utils/Socket';
import { useAppTheme } from '../../theme';
import { formatUserFriendlyError } from '../../utils/UserFriendlyError';

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
                <MaterialCommunityIcons name="clock-outline" size={theme.controlSizes.iconMd} color={theme.colors.textMuted} />
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
    const hr = String(user?.hr || '').trim();
    const approvalType = String(user?.approval || 'HOD').toUpperCase();
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
    const shouldFetchHod = (approvalType === 'HOD' || approvalType === 'BOTH') && Boolean(hod && hod !== 'null');
    const shouldFetchHr = (approvalType === 'HR' || approvalType === 'BOTH') && Boolean(hr && hr !== 'null');
    const { data: hodTokenData } = useGet_hod_tokenQuery(
        { params: { hod } },
        { skip: !shouldFetchHod },
    );
    const { data: hrTokenData } = useGet_hod_tokenQuery(
        { params: { hod: hr } },
        { skip: !shouldFetchHr },
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

    const isHodMissing = (approvalType === 'HOD' || approvalType === 'BOTH') && (!hod || hod === 'null' || hod === 'undefined' || hod === '0');
    const isHrMissing = (approvalType === 'HR' || approvalType === 'BOTH') && (!hr || hr === 'null' || hr === 'undefined' || hr === '0');

    const authorityWarning = useMemo(() => {
        if (approvalType === 'BOTH' && isHodMissing && isHrMissing) {
            return {
                title: 'Reporting HOD and HR Not Assigned',
                desc: 'Your profile is configured for dual HOD and HR approval in User Control, but neither an HOD nor an HR is assigned. Please ask your administrator to assign your reporting authorities.',
            };
        }
        if (isHodMissing) {
            return {
                title: 'Reporting HOD Not Assigned',
                desc: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HOD is assigned. Please ask your administrator to assign an HOD in User Control.'
                    : 'Your profile is configured for HOD approval, but no reporting HOD is assigned. Permission requests require an HOD for approval. Please ask your administrator to assign an HOD in User Control.',
            };
        }
        if (isHrMissing) {
            return {
                title: 'Reporting HR Not Assigned',
                desc: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HR is assigned. Please ask your administrator to assign an HR in User Control.'
                    : 'Your profile is configured for HR approval, but no reporting HR is assigned. Permission requests require an HR for approval. Please ask your administrator to assign an HR in User Control.',
            };
        }
        return null;
    }, [approvalType, isHodMissing, isHrMissing]);

    const hasAuthority = !isHodMissing && !isHrMissing;
    const canSubmit = Boolean(
        userId && companyCode && hasAuthority && hasCategory && duration && reason.trim() && documentId
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

        // Specific, user-friendly intimation for each missing requirement
        if (!userId) {
            showMessage({
                message: 'Employee ID Missing',
                description: 'Your employee ID is missing from your profile. Please log out and sign in again, or contact your administrator.',
                type: 'danger',
                duration: 4500,
            });
            return;
        }

        if (!companyCode) {
            showMessage({
                message: 'Company Not Selected',
                description: 'No company is selected for this session. Please select your company on the login screen.',
                type: 'danger',
                duration: 4500,
            });
            return;
        }

        if (authorityWarning) {
            showMessage({
                message: authorityWarning.title,
                description: authorityWarning.desc,
                type: 'danger',
                duration: 5000,
            });
            return;
        }

        if (!hasCategory) {
            showMessage({
                message: 'Select Category',
                description: 'Please select a permission category from the dropdown before submitting.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!duration) {
            showMessage({
                message: 'Invalid Time Range',
                description: 'Please select a valid time range where To Time is later than From Time.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!reason.trim()) {
            showMessage({
                message: 'Reason Required',
                description: 'Please enter a brief explanation for your permission request.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!documentId) {
            showMessage({
                message: 'Document ID Loading',
                description: 'Permission document numbering is loading. Please wait a moment and try again.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (categoriesError || documentError) {
            showMessage({
                message: 'Service Data Unavailable',
                description: 'Unable to load categories or document numbering from the server. Please check your connection and tap retry.',
                type: 'danger',
                duration: 4000,
            });
            return;
        }

        submittingRef.current = true;
        try {
            const latestDocument = await refetchDocument();
            if (latestDocument?.isError) {
                throw new Error('Unable to generate the latest permission document number. Please check connection and try again.');
            }
            const latestCount = Number(latestDocument?.data?.data?.count ?? count);
            const latestDocId = Number.isFinite(latestCount) && latestCount > 0
                ? `PER-${String(latestCount).padStart(6, '0')}`
                : '';
            const effectiveHod = hod || (approvalType === 'HR' ? hr : '');
            const response = await requestPermission({
                data: {
                    userId,
                    docDate: serializeDate(docDate),
                    hod: effectiveHod,
                    hr: hr || null,
                    approval: approvalType,
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
                const rawMsg = response?.message || (typeof response?.error === 'string' ? response.error : response?.error?.message);
                const friendly = formatUserFriendlyError(rawMsg, 'The permission request could not be saved.');
                throw new Error(friendly);
            }

            showMessage({
                message: 'Permission Request Sent',
                description: 'Your request was submitted successfully for approval.',
                type: 'success',
            });

            try {
                socket.emit('permission_request', {
                    hod: effectiveHod,
                    hr: hr || '',
                    approval: approvalType,
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

            if (refreshTokenData?.data?.token) {
                const senderToken = refreshTokenData.data.token;
                const noteTitle = `Permission request from ${employeeName || userId}`;
                if ((approvalType === 'HOD' || approvalType === 'BOTH') && hodTokenData?.data?.fcm) {
                    try {
                        await _FCM_SENDER(senderToken, hodTokenData.data.fcm, noteTitle, 'Permission Request');
                    } catch (notificationError) {
                        console.warn('[PermissionEntryScreen] HOD FCM notification error:', notificationError);
                    }
                }
                if ((approvalType === 'HR' || approvalType === 'BOTH') && hrTokenData?.data?.fcm) {
                    try {
                        await _FCM_SENDER(senderToken, hrTokenData.data.fcm, noteTitle, 'Permission Request');
                    } catch (notificationError) {
                        console.warn('[PermissionEntryScreen] HR FCM notification error:', notificationError);
                    }
                }
            }

            setCategory(null);
            setReason('');
            refetchDocument();
        } catch (error) {
            const friendlyDesc = formatUserFriendlyError(error, 'The permission request could not be saved. Please check connection and try again.');
            showMessage({
                message: 'Permission Request Failed',
                description: friendlyDesc,
                type: 'danger',
                duration: 5000,
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
                    <MaterialCommunityIcons name="account-clock-outline" size={theme.controlSizes.iconMd} color={theme.colors.brand} />
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
                        <MaterialCommunityIcons name="account-outline" size={theme.controlSizes.iconMd} color={theme.colors.brand} />
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
                            <MaterialCommunityIcons name="calendar-month-outline" size={theme.controlSizes.iconMd} color={theme.colors.textMuted} />
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
                            style={{backgroundColor: theme.colors.brand}}
                            onChange={handlePickerChange}
                        />
                    )}

                    <View style={styles.durationCard}>
                        <MaterialCommunityIcons name="timer-outline" size={theme.controlSizes.iconMd} color={theme.colors.brand} />
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
                    style={[styles.submitButton, (!canSubmit && !isSubmitting) && styles.submitButtonInactive, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    accessibilityRole="button"
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={theme.colors.brandContrast} />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="send-outline" size={theme.controlSizes.iconSm} color={theme.colors.brandContrast} />
                            <Text style={styles.submitButtonText}>Submit</Text>
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
        minHeight: theme.layout.screenHeaderMinHeight,
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
    subtitle: { ...theme.typography.caption, color: theme.colors.brandContrast, opacity: 0.75, marginTop: theme.spacing.xs },
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
        backgroundColor: theme.colors.brandSoft,
        marginRight: theme.spacing.md,
    },
    profileText: { flex: 1 },
    employeeName: { ...theme.typography.subtitle, color: theme.colors.text, fontWeight: theme.fontWeights.bold },
    employeeId: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: theme.spacing.xs },
    formCard: {
        ...theme.styles.card,
    },
    sectionTitle: { ...theme.typography.title, color: theme.colors.text, marginBottom: theme.spacing.xs },
    field: { marginTop: theme.spacing.lg },
    label: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: theme.fontWeights.semiBold, marginBottom: theme.spacing.sm },
    required: { color: theme.colors.danger },
    input: {
        minHeight: theme.controlSizes.inputHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: theme.layout.dividerWidth,
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
        backgroundColor: theme.colors.brandSoft,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    durationLabel: { flex: 1, ...theme.typography.caption, color: theme.colors.brand, fontWeight: theme.fontWeights.semiBold },
    durationValue: { ...theme.typography.caption, color: theme.colors.brand, fontWeight: theme.fontWeights.bold },
    reasonInput: {
        minHeight: theme.controlSizes.inputHeightMultiline,
        borderWidth: theme.layout.dividerWidth,
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
        backgroundColor: theme.colors.brand,
        borderRadius: theme.radii.md,
        marginTop: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    submitButtonDisabled: { backgroundColor: theme.colors.disabledText },
    submitButtonInactive: { opacity: 0.88 },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.warningSoft,
        borderColor: theme.colors.warning,
        borderWidth: theme.layout.dividerWidth,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    warningBannerTextGroup: {
        flex: 1,
    },
    warningBannerTitle: {
        ...theme.typography.subtitle,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.warning,
        marginBottom: theme.spacing.xxs,
    },
    warningBannerDesc: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    submitButtonText: { ...theme.typography.button, color: theme.colors.brandContrast },
});
