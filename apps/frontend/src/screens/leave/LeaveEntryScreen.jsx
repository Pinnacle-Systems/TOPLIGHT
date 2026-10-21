import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { showMessage } from 'react-native-flash-message';
import { useSelector } from 'react-redux';
import { Dropdown } from '../../components/ReusableComponents/inputs';
import { useGet__per_categoryQuery } from '../../store/api/permissionApi';
import {
    useAdd_requestLeaveMutation,
    useGetCurrent_FinYearQuery,
    useGet_LcodeQuery,
    useGetDocIDQuery,
    useLazyGet_lcode_leave_availableQuery,
} from '../../store/api/LeaveApi';
import { useGet_hod_tokenQuery, useGet_refresh_tokenQuery } from '../../store/api/userApi';
import { _FCM_SENDER } from '../../components/Utils/FCM';
import socket from '../../utils/Socket';
import { useAppTheme } from '../../theme';
import { formatUserFriendlyError } from '../../utils/userFriendlyError';

const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_DAY_OPTIONS = [
    { label: 'Full Day', value: 'Full Day' },
    { label: '1st Half', value: '1st Half' },
    { label: '2nd Half', value: '2nd Half' },
];

const formatFinancialYearLabel = value => {
    const year = String(value ?? '').trim();
    return /^\d{4}$/.test(year)
        ? `${year.slice(-2)}-${String((Number(year) + 1) % 100).padStart(2, '0')}`
        : year;
};

const toDateKey = date => (
    date ? Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) : null
);

const displayDate = date => (
    date
        ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
        : ''
);

const serializeDate = date => (
    date
        ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)).toISOString()
        : null
);

const calculateRequestedDays = (fromDate, toDate, firstDayType, lastDayType) => {
    if (!fromDate || !toDate) return 0;
    const difference = (toDateKey(toDate) - toDateKey(fromDate)) / DAY_MS;
    if (difference < 0) return 0;

    if (difference === 0) {
        return firstDayType === 'Full Day' && lastDayType === 'Full Day' ? 1 : 0.5;
    }

    return Math.max(
        0,
        difference + 1
            - (firstDayType === 'Full Day' ? 0 : 0.5)
            - (lastDayType === 'Full Day' ? 0 : 0.5),
    );
};

function DateField({ label, value, onPress, error, styles, theme }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}<Text style={styles.required}> *</Text></Text>
            <TouchableOpacity
                style={[styles.dateControl, error && styles.invalidControl]}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`${label}${value ? `, ${displayDate(value)}` : ''}`}
            >
                <Text style={[styles.dateText, !value && styles.placeholderText]}>
                    {value ? displayDate(value) : 'Select date'}
                </Text>
                <MaterialCommunityIcons name="calendar-month-outline" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

function SelectField({ label, value, onChange, options, placeholder, error, loading, styles }) {
    return (
        <View style={styles.field}>
            <Dropdown
                label={`${label} *`}
                selected={value}
                setSelected={onChange}
                options={{ data: options }}
                _label="label"
                _value="value"
                placeholder={placeholder}
                isLoading={loading}
                disabled={loading}
                width="100%"
                zIndex={error ? 20 : 10}
            />
        </View>
    );
}

export default function LeaveEntryScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const user = useSelector(state => state.UserDetails);
    const idcard = String(user?.UserId || user?.IDCARD || user?.Id || '').trim();
    const compCode = String(user?.GCOMPCODE || '').trim();
    const hod = String(user?.hod || '').trim();
    const hr = String(user?.hr || '').trim();
    const approvalType = String(user?.approval || 'HOD').toUpperCase();
    const employeeName = String(user?.EMPNAME || user?.userName || '').trim();

    const [category, setCategory] = useState('');
    const [docDate, setDocDate] = useState(new Date());
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [firstDayType, setFirstDayType] = useState('Full Day');
    const [lastDayType, setLastDayType] = useState('Full Day');
    const [leaveCode, setLeaveCode] = useState('');
    const [financialYear, setFinancialYear] = useState('');
    const [reason, setReason] = useState('');
    const [datePicker, setDatePicker] = useState(null);
    const isSubmittingRef = useRef(false);

    const { data: categoryData, isLoading: categoriesLoading, isError: categoriesError } =
        useGet__per_categoryQuery({ type: 'leave' });
    const { data: financialYearData, isLoading: financialYearsLoading, isError: financialYearsError } =
        useGetCurrent_FinYearQuery();
    const { data: leaveCodeData, isLoading: leaveCodesLoading, isError: leaveCodesError } =
        useGet_LcodeQuery();
    const { data: documentData, refetch: refetchDocument } = useGetDocIDQuery();
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
    const [fetchLeaveBalance, {
        currentData: leaveBalanceData,
        isFetching: balanceLoading,
        isError: balanceError,
    }] = useLazyGet_lcode_leave_availableQuery();
    const [addRequestLeave, { isLoading: submitting }] = useAdd_requestLeaveMutation();

    const categories = useMemo(
        () => (Array.isArray(categoryData?.data) ? categoryData.data : []),
        [categoryData],
    );
    const financialYears = useMemo(
        () => (Array.isArray(financialYearData?.data) ? financialYearData.data : []),
        [financialYearData],
    );
    const leaveCodes = useMemo(
        () => (Array.isArray(leaveCodeData?.data) ? leaveCodeData.data : []),
        [leaveCodeData],
    );
    const categoryOptions = useMemo(
        () => categories.map(item => ({ label: item.label || item.name, value: item.value ?? item.id })),
        [categories],
    );
    const leaveCodeOptions = useMemo(
        () => leaveCodes.map(item => ({ label: item.label || item.value, value: item.value })),
        [leaveCodes],
    );
    const financialYearOptions = useMemo(
        () => financialYears.map(item => ({
            label: formatFinancialYearLabel(item.label || item.value),
            value: item.value,
        })),
        [financialYears],
    );
    const selectedBalance = useMemo(() => {
        const rows = Array.isArray(leaveBalanceData?.data) ? leaveBalanceData.data : [];
        const selectedCode = String(leaveCode).toUpperCase();
        return rows.find(row => String(row?.LCODE || '').toUpperCase() === selectedCode) || null;
    }, [leaveBalanceData, leaveCode]);

    const requestedDays = calculateRequestedDays(fromDate, toDate, firstDayType, lastDayType);
    const availableBalance = Number(selectedBalance?.LBAL ?? 0);
    const balance = Number.isFinite(availableBalance) ? availableBalance : 0;

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
                    : 'Your profile is configured for HOD approval, but no reporting HOD is assigned. Leave requests require an HOD for approval. Please ask your administrator to assign an HOD in User Control.',
            };
        }
        if (isHrMissing) {
            return {
                title: 'Reporting HR Not Assigned',
                desc: approvalType === 'BOTH'
                    ? 'Your profile requires dual HOD and HR approval, but no reporting HR is assigned. Please ask your administrator to assign an HR in User Control.'
                    : 'Your profile is configured for HR approval, but no reporting HR is assigned. Leave requests require an HR for approval. Please ask your administrator to assign an HR in User Control.',
            };
        }
        return null;
    }, [approvalType, isHodMissing, isHrMissing]);

    const hasAuthority = !isHodMissing && !isHrMissing;
    const hasRequiredIdentity = Boolean(idcard && compCode && hasAuthority);
    const dateRangeValid = Boolean(
        fromDate && toDate && toDateKey(toDate) >= toDateKey(fromDate),
    );
    const balanceLookupComplete = Boolean(leaveCode && leaveBalanceData && !balanceLoading && !balanceError);
    const balanceResolved = Boolean(balanceLookupComplete && selectedBalance);
    const canSubmit = Boolean(
        hasRequiredIdentity &&
        category &&
        leaveCode &&
        financialYear &&
        dateRangeValid &&
        requestedDays > 0 &&
        reason.trim() &&
        balanceResolved &&
        requestedDays <= balance &&
        !submitting,
    );

    useEffect(() => {
        if (!financialYear && financialYears.length) {
            setFinancialYear(String(financialYears[0]?.value ?? ''));
        }
    }, [financialYear, financialYears]);

    useEffect(() => {
        if (!idcard || !leaveCode) return;
        fetchLeaveBalance({ Idcard: idcard, LCODE: leaveCode });
    }, [fetchLeaveBalance, idcard, leaveCode]);

    const onDateSelected = (event, selectedDate) => {
        const target = datePicker;
        setDatePicker(null);
        if (event?.type !== 'set' || !selectedDate || !target) return;

        if (target === 'from') {
            setFromDate(selectedDate);
            if (toDate && toDateKey(toDate) < toDateKey(selectedDate)) {
                setToDate(selectedDate);
            }
        } else if (target === 'doc') {
            setDocDate(selectedDate);
        } else {
            setToDate(selectedDate);
        }
    };

    const handleSubmit = async () => {
        if (isSubmittingRef.current) return;

        // Specific, user-friendly intimation for each missing requirement
        if (!idcard) {
            showMessage({
                message: 'Employee ID Missing',
                description: 'Your employee ID is missing from your profile. Please log out and sign in again, or contact your administrator.',
                type: 'danger',
                duration: 4500,
            });
            return;
        }

        if (!compCode) {
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

        if (!category) {
            showMessage({
                message: 'Select Leave Category',
                description: 'Please select a leave category from the dropdown before submitting.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!leaveCode) {
            showMessage({
                message: 'Select Leave Code',
                description: 'Please select a leave code (e.g., Casual Leave, Sick Leave) to apply.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!fromDate || !toDate) {
            showMessage({
                message: 'Select Leave Dates',
                description: 'Please choose both From Date and To Date for your leave period.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!dateRangeValid) {
            showMessage({
                message: 'Invalid Date Range',
                description: 'The To Date must be the same as or later than the From Date.',
                type: 'danger',
                duration: 3500,
            });
            return;
        }

        if (balanceLoading) {
            showMessage({
                message: 'Leave Balance Loading',
                description: 'Your leave balance is currently loading. Please wait a moment.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        if (!balanceResolved) {
            showMessage({
                message: 'Leave Balance Unavailable',
                description: 'Could not load your leave balance for the selected leave code. Please retry or pick another leave code.',
                type: 'warning',
                duration: 4000,
            });
            return;
        }

        if (requestedDays > balance) {
            showMessage({
                message: 'Insufficient Leave Balance',
                description: `You requested ${requestedDays} days, but your available balance for ${leaveCode} is ${balance} days.`,
                type: 'danger',
                duration: 4500,
            });
            return;
        }

        if (!reason.trim()) {
            showMessage({
                message: 'Reason Required',
                description: 'Please enter a brief explanation for your leave request.',
                type: 'warning',
                duration: 3500,
            });
            return;
        }

        isSubmittingRef.current = true;
        try {
            const latestDocQuery = await refetchDocument();
            const count = Number(latestDocQuery?.data?.data?.count ?? documentData?.data?.count ?? 0);
            const previewDocId = count
                ? `${compCode}/LEV-${String(count).padStart(6, '0')}`
                : `${compCode}/LEV-PENDING`;

            const effectiveHod = hod || (approvalType === 'HR' ? hr : '');
            const response = await addRequestLeave({
                data: {
                    userId: idcard,
                    docDate: serializeDate(docDate),
                    fromDate: serializeDate(fromDate),
                    toDate: serializeDate(toDate),
                    totalDays: requestedDays,
                    reason: reason.trim(),
                    docid: previewDocId,
                    compCode,
                    createdBy: idcard,
                    modified_By: idcard,
                    hod: effectiveHod,
                    hr: hr || null,
                    approval: approvalType,
                    mobile: user?.MOBNO == null ? null : String(user.MOBNO),
                    fltype: firstDayType,
                    tltype: lastDayType,
                    ltype: leaveCode,
                    finyear: financialYear,
                    empname: employeeName,
                    category: Number(category),
                },
                params: {
                    docCount: count,
                    PAYCAT: user?.PAYCAT,
                },
            }).unwrap();

            if (Number(response?.status) !== 1) {
                const rawMsg = response?.message || (typeof response?.error === 'string' ? response.error : response?.error?.message);
                const friendly = formatUserFriendlyError(rawMsg, 'The leave request could not be saved.');
                throw new Error(friendly);
            }

            showMessage({
                message: 'Leave Request Sent',
                description: 'Your leave request was submitted successfully for approval.',
                type: 'success',
            });

            try {
                socket.emit('leave_request', {
                    hod: effectiveHod,
                    hr: hr || '',
                    approval: approvalType,
                    compcode: compCode,
                    userdata: {
                        email: '',
                        username: user?.userName || employeeName,
                        Idcard: idcard,
                        mobile: user?.MOBNO,
                    },
                    ...response.data,
                });
            } catch (notificationError) {
                console.warn('Leave request socket notification failed:', notificationError);
            }

            if (refreshTokenData?.data?.token) {
                const senderToken = refreshTokenData.data.token;
                const noteTitle = `Leave request from ${employeeName || idcard}`;
                if ((approvalType === 'HOD' || approvalType === 'BOTH') && hodTokenData?.data?.fcm) {
                    try {
                        await _FCM_SENDER(senderToken, hodTokenData.data.fcm, noteTitle, 'Leave Request');
                    } catch (notificationError) {
                        console.warn('[LeaveEntryScreen] HOD FCM notification error:', notificationError);
                    }
                }
                if ((approvalType === 'HR' || approvalType === 'BOTH') && hrTokenData?.data?.fcm) {
                    try {
                        await _FCM_SENDER(senderToken, hrTokenData.data.fcm, noteTitle, 'Leave Request');
                    } catch (notificationError) {
                        console.warn('[LeaveEntryScreen] HR FCM notification error:', notificationError);
                    }
                }
            }

            setCategory('');
            setFromDate(null);
            setToDate(null);
            setFirstDayType('Full Day');
            setLastDayType('Full Day');
            setLeaveCode('');
            setReason('');
            refetchDocument();
        } catch (error) {
            const friendlyDesc = formatUserFriendlyError(error, 'The leave request could not be saved. Please check connection and try again.');
            showMessage({
                message: 'Leave Request Failed',
                description: friendlyDesc,
                type: 'danger',
                duration: 5000,
            });
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const submitLabel = !dateRangeValid
        ? 'Select valid leave dates'
        : !financialYear
            ? 'Select financial year'
            : !category || !leaveCode || !reason.trim()
            ? 'Complete required fields'
            : balanceLoading
                ? 'Loading leave balance'
                : balanceLookupComplete && !selectedBalance
                    ? 'No leave balance available'
                    : !balanceResolved
                        ? 'Load leave balance'
                : requestedDays > balance
                    ? `Exceeds balance (${balance} days)`
                    : 'Submit leave request';

    return (
        <View style={styles.screen}>
            <StatusBar
                barStyle={theme.isDark ? 'dark-content' : 'light-content'}
                backgroundColor={theme.colors.brand}
            />
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="calendar-account-outline" size={23} color={theme.colors.brandContrast} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Leave Request</Text>
                    <Text style={styles.subtitle}>Apply for time away from work</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <MaterialCommunityIcons name="account-outline" size={22} color={theme.colors.brand} />
                    </View>
                    <View style={styles.profileText}>
                        <Text style={styles.employeeName}>{employeeName || 'Employee'}</Text>
                        <Text style={styles.employeeId}>
                            {idcard || 'Employee ID unavailable'}{compCode ? ` · ${compCode}` : ''}
                        </Text>
                    </View>
                </View>

                {authorityWarning && (
                    <View style={styles.warningBanner}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.colors.warning} />
                        <View style={styles.warningBannerTextGroup}>
                            <Text style={styles.warningBannerTitle}>{authorityWarning.title}</Text>
                            <Text style={styles.warningBannerDesc}>{authorityWarning.desc}</Text>
                        </View>
                    </View>
                )}
                {(!idcard || !compCode) && (
                    <View style={styles.errorCard}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={19} color={theme.colors.danger} />
                        <Text style={styles.errorCardText}>
                            Your profile is missing employee or company details. Please log out and sign in again.
                        </Text>
                    </View>
                )}

                <View style={styles.formCard}>
                    <View style={styles.sectionHeading}>
                        <MaterialCommunityIcons name="file-document-outline" size={19} color={theme.colors.brand} />
                        <Text style={styles.sectionTitle}>Request details</Text>
                    </View>

                    <SelectField
                        styles={styles}
                        label="Category"
                        value={category}
                        onChange={value => setCategory(value)}
                        options={categoryOptions}
                        placeholder={categoriesLoading ? 'Loading categories...' : 'Select category'}
                        loading={categoriesLoading}
                        error={categoriesError}
                    />
                    {categoriesError && <Text style={styles.inlineError}>Could not load leave categories.</Text>}

                    <SelectField
                        styles={styles}
                        label="Leave type"
                        value={leaveCode}
                        onChange={value => setLeaveCode(value)}
                        options={leaveCodeOptions}
                        placeholder={leaveCodesLoading ? 'Loading leave types...' : 'Select leave type'}
                        loading={leaveCodesLoading}
                        error={leaveCodesError}
                    />
                    {leaveCodesError && <Text style={styles.inlineError}>Could not load leave types.</Text>}

                    <SelectField
                        styles={styles}
                        label="Financial year"
                        value={financialYear}
                        onChange={value => setFinancialYear(value)}
                        options={financialYearOptions}
                        placeholder={financialYearsLoading ? 'Loading financial years...' : 'Select financial year'}
                        loading={financialYearsLoading}
                        error={financialYearsError}
                    />
                    {financialYearsError && <Text style={styles.inlineError}>Could not load the current financial year.</Text>}

                    <DateField
                        styles={styles}
                        theme={theme}
                        label="Document date"
                        value={docDate}
                        onPress={() => setDatePicker('doc')}
                    />
                    <View style={styles.dateRow}>
                        <DateField
                            styles={styles}
                            theme={theme}
                            label="From date"
                            value={fromDate}
                            onPress={() => setDatePicker('from')}
                            error={Boolean(fromDate && toDate && !dateRangeValid)}
                        />
                        <DateField
                            styles={styles}
                            theme={theme}
                            label="To date"
                            value={toDate}
                            onPress={() => setDatePicker('to')}
                            error={Boolean(fromDate && toDate && !dateRangeValid)}
                        />
                    </View>
                    {datePicker && (
                        <DateTimePicker
                            value={datePicker === 'doc'
                                ? docDate
                                : datePicker === 'from'
                                    ? fromDate || new Date()
                                    : toDate || fromDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            minimumDate={datePicker === 'to' ? fromDate || undefined : undefined}
                            onChange={onDateSelected}
                        />
                    )}

                    <View style={styles.dateRow}>
                        <SelectField
                            styles={styles}
                            label="First day"
                            value={firstDayType}
                            onChange={setFirstDayType}
                            options={HALF_DAY_OPTIONS}
                            placeholder="Select duration"
                        />
                        <SelectField
                            styles={styles}
                            label="Last day"
                            value={lastDayType}
                            onChange={setLastDayType}
                            options={HALF_DAY_OPTIONS}
                            placeholder="Select duration"
                        />
                    </View>

                    <View style={styles.summaryRow}>
                        <View>
                            <Text style={styles.summaryLabel}>Requested</Text>
                            <Text style={styles.summaryValue}>{requestedDays.toFixed(1)} days</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View>
                            <Text style={styles.summaryLabel}>Available balance</Text>
                            <Text style={styles.summaryValue}>
                                {balanceLoading ? 'Loading…' : selectedBalance ? `${balance} days` : '—'}
                            </Text>
                        </View>
                        {balanceLoading && <ActivityIndicator size="small" color={theme.colors.brand} />}
                    </View>
                    {balanceError && (
                        <TouchableOpacity
                            style={styles.balanceRetry}
                            onPress={() => fetchLeaveBalance({ Idcard: idcard, LCODE: leaveCode })}
                            accessibilityRole="button"
                        >
                            <Text style={styles.inlineError}>Could not load leave balance. Tap to retry.</Text>
                        </TouchableOpacity>
                    )}
                    {!balanceLoading && selectedBalance && requestedDays > balance && (
                        <Text style={styles.inlineError}>
                            Requested leave exceeds the available {balance} day balance.
                        </Text>
                    )}
                    {balanceLookupComplete && !selectedBalance && (
                        <Text style={styles.inlineError}>
                            No balance was found for the selected leave type.
                        </Text>
                    )}

                    <View style={styles.field}>
                        <Text style={styles.label}>Reason<Text style={styles.required}> *</Text></Text>
                        <TextInput
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Describe the reason for your leave"
                            placeholderTextColor={theme.colors.placeholder}
                            style={styles.reasonInput}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                            accessibilityLabel="Leave reason"
                        />
                        <Text style={styles.characterCount}>{reason.length}/500</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, (!canSubmit && !submitting) && styles.submitButtonInactive, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    accessibilityRole="button"
                >
                    {submitting ? (
                        <ActivityIndicator color={theme.colors.brandContrast} />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="send-outline" size={18} color={theme.colors.brandContrast} />
                            <Text style={styles.submitButtonText}>{canSubmit ? 'Submit leave request' : submitLabel}</Text>
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
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    profileText: { flex: 1 },
    employeeName: { ...theme.typography.label, color: theme.colors.text },
    employeeId: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: theme.spacing.xxs + 1 },
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.dangerSoft,
        borderColor: theme.colors.danger,
        borderWidth: 1,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    errorCardText: { ...theme.typography.caption, color: theme.colors.danger, flex: 1, lineHeight: theme.lineHeights.sm },
    formCard: {
        ...theme.styles.card,
    },
    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: { ...theme.typography.subtitle, color: theme.colors.text },
    field: { flex: 1, marginBottom: theme.spacing.md },
    label: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: theme.fontWeights.semiBold, marginBottom: theme.spacing.xs + 2 },
    required: { color: theme.colors.danger },
    invalidControl: { borderColor: theme.colors.danger },
    dateRow: { flexDirection: 'row', gap: theme.spacing.sm + 2 },
    dateControl: {
        minHeight: theme.controlSizes.inputHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.inputBackground,
    },
    dateText: { ...theme.typography.caption, color: theme.colors.text },
    placeholderText: { color: theme.colors.placeholder },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.brandSoft,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    summaryLabel: { ...theme.typography.overline, color: theme.colors.textMuted, letterSpacing: 0 },
    summaryValue: { ...theme.typography.label, color: theme.colors.text, fontWeight: theme.fontWeights.bold, marginTop: theme.spacing.xxs + 1 },
    summaryDivider: { width: 1, height: 32, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.sm + 2 },
    reasonInput: {
        minHeight: 100,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        ...theme.typography.caption,
        backgroundColor: theme.colors.inputBackground,
    },
    characterCount: { ...theme.typography.overline, color: theme.colors.textDisabled, textAlign: 'right', marginTop: theme.spacing.xs, letterSpacing: 0 },
    inlineError: { ...theme.typography.caption, color: theme.colors.danger, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md },
    balanceRetry: { alignSelf: 'flex-start' },
    submitButton: {
        minHeight: theme.controlSizes.buttonHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.brand,
        borderRadius: theme.radii.md,
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    submitButtonDisabled: { backgroundColor: theme.colors.disabledText },
    submitButtonInactive: { opacity: 0.88 },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.warningSoft,
        borderColor: theme.colors.warning,
        borderWidth: 1,
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
        fontSize: 13,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.warning,
        marginBottom: 2,
    },
    warningBannerDesc: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.textSecondary,
        lineHeight: 16,
    },
    submitButtonText: { ...theme.typography.button, color: theme.colors.brandContrast, textAlign: 'center' },
});
