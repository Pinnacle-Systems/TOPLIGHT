import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import { usePunchInMutation, usePunchOutMutation } from '../../store/api/AttendanceApi';
import { useAppTheme } from '../../theme';

const formatTimeIST = (val) => {
    if (!val || val === '--:--' || val === '-' || val === 'null' || val === 'undefined') return '--:--';
    const str = String(val).trim();
    if (/am|pm/i.test(str)) return str.toUpperCase();
    const parts = str.split(':');
    if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        const m = String(parts[1]).padStart(2, '0');
        if (isNaN(h)) return str;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }
    return str;
};

const formatHumanDuration = (val, totalPunches = 1) => {
    if (!val || val === '--:--' || val === '-' || val === 'null' || val === 'undefined') {
        return totalPunches === 0 ? '--' : '0m';
    }
    let totalSec = 0;
    if (typeof val === 'number') {
        totalSec = val;
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (/[hm]/i.test(trimmed) && !trimmed.includes(':')) return trimmed;
        const parts = trimmed.split(':').map(Number);
        if (parts.length === 3) {
            totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        } else if (parts.length === 2) {
            totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60;
        } else {
            const num = Number(trimmed);
            if (!isNaN(num)) totalSec = num;
        }
    }
    if (totalSec <= 0) return totalPunches === 0 ? '--' : '0m';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0 && m === 0) return `${h}h 0m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
};


const parseTimeToMinutes = (val) => {
    if (!val || val === '--:--' || val === '-' || val === 'null' || val === 'undefined') {
        return null;
    }
    const str = String(val).trim();
    const m = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const mins = parseInt(m[2], 10);
    const ampm = m[4];
    if (ampm) {
        const isPM = ampm.toLowerCase() === 'pm';
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
    }
    return h * 60 + mins;
};

const displayTime = value => formatTimeIST(value);

function EmployeeCard({ employee, onPunch, isPunching, isPunchBusy, theme, styles }) {
    const [expanded, setExpanded] = useState(false);
    const punches = Array.isArray(employee?.punches) ? employee.punches : [];
    const lastInout = employee?.lastInout == null ? null : String(employee.lastInout);
    const nextPunch = lastInout === '1' ? 'OUT' : 'IN';
    const status = lastInout === '1'
        ? 'Punched in'
        : lastInout === '0'
            ? 'Punched out'
            : 'No punches yet';
    const statusColor = lastInout === '1' ? theme.colors.success : theme.colors.textMuted;
    const totalTime = formatHumanDuration(employee?.totalTimeFormatted || '00:00', Number(employee?.totalPunches ?? employee?.TOTALPUNCHES ?? punches.length));
    const totalPunches = Number(employee?.totalPunches ?? employee?.TOTALPUNCHES ?? punches.length);
    const totalMinutes = Number(employee?.totalMinutesWorked ?? employee?.TOTALMINUTESWORKED ?? 0);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account-outline" size={23} color={theme.colors.brand} />
                </View>
                <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName} numberOfLines={1}>
                        {employee?.empname || employee?.EMPNAME || 'Employee'}
                    </Text>
                    <Text style={styles.employeeId}>
                        {employee?.idcard || employee?.IDCARD || '—'}
                    </Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                </View>
            </View>

            <View style={styles.metricsRow}>
                <View style={styles.timeMetric}>
                    <MaterialCommunityIcons name="login" size={16} color={theme.colors.success} />
                    <Text style={styles.metricLabel}>In</Text>
                    <Text style={styles.metricValue}>
                        {displayTime(employee?.punchIn || employee?.PUNCHIN)}
                    </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.timeMetric}>
                    <MaterialCommunityIcons name="logout" size={16} color={theme.colors.danger} />
                    <Text style={styles.metricLabel}>Out</Text>
                    <Text style={styles.metricValue}>
                        {displayTime(employee?.punchOut || employee?.PUNCHOUT)}
                    </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.timeMetric}>
                    <MaterialCommunityIcons name="timer-outline" size={16} color={theme.colors.brand} />
                    <Text style={styles.metricLabel}>Worked</Text>
                    <Text style={styles.metricValue}>{totalTime}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.employeePunchButton,
                    nextPunch === 'OUT' ? styles.punchOutButton : styles.punchInButton,
                    isPunching && styles.employeePunchButtonDisabled,
                ]}
                onPress={() => onPunch(employee, nextPunch)}
                disabled={isPunchBusy}
                accessibilityRole="button"
                accessibilityLabel={`${nextPunch === 'IN' ? 'Punch in' : 'Punch out'} ${employee?.empname || employee?.EMPNAME || 'employee'}`}
            >
                {isPunching ? (
                    <ActivityIndicator size="small" color={theme.colors.brandContrast} />
                ) : (
                    <>
                        <MaterialCommunityIcons
                            name={nextPunch === 'IN' ? 'login' : 'logout'}
                            size={17}
                            color={theme.colors.brandContrast}
                        />
                        <Text style={styles.employeePunchButtonText}>
                            PUNCH {nextPunch}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.punchLogToggle}
                onPress={() => setExpanded(value => !value)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
            >
                <Text style={styles.punchLogToggleText}>
                    {expanded ? 'Hide' : 'View'} punch log ({totalPunches})
                </Text>
                <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.textMuted}
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.punchLog}>
                    {punches.length === 0 ? (
                        <Text style={styles.noPunchesText}>No punch records</Text>
                    ) : (
                        punches.map((punch, index) => {
                            const inTime = punch?.inTime || punch?.INTIME;
                            const outTime = punch?.outTime || punch?.OUTTIME;
                            return (
                                <View
                                    key={`${employee?.idcard || employee?.IDCARD || 'employee'}-${index}`}
                                    style={styles.punchRow}
                                >
                                    <Text style={styles.punchIndex}>{index + 1}</Text>
                                    <Text style={styles.punchTime}>{displayTime(inTime)}</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.textDisabled} />
                                    <Text style={styles.punchTime}>
                                        {outTime ? displayTime(outTime) : 'Active'}
                                    </Text>
                                    <Text style={styles.punchDuration}>
                                        {punch?.durationFormatted || punch?.DURATIONFORMATTED || ''}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                    {punches.length > 0 && (
                        <Text style={styles.totalPunchText}>
                            Total: {totalTime} ({totalMinutes} min) · {totalPunches} punches
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

export default function EmployeeAttendanceList({
    employees,
    isFetching,
    isLoading,
    isError,
    onRefresh,
    error,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [selectedEmployeeKey, setSelectedEmployeeKey] = useState(null);
    const [isDropdownFocus, setIsDropdownFocus] = useState(false);
    const [punchingEmployeeId, setPunchingEmployeeId] = useState(null);
    const [punchIn] = usePunchInMutation();
    const [punchOut] = usePunchOutMutation();

    // ── Dropdown Options ───────────────────────────────────────────────────
    const dropdownOptions = useMemo(() => {
        if (!Array.isArray(employees)) return [];

        const seen = new Set();
        const list = [];
        employees.forEach(employee => {
            const id = String(employee?.idcard || employee?.IDCARD || '').trim();
            const company = String(employee?.compcode || employee?.COMPCODE || '').trim().toUpperCase();
            if (!id) return;

            const key = `${company}:${id.toUpperCase()}`;
            if (seen.has(key)) return;
            seen.add(key);

            const name = employee?.empname || employee?.EMPNAME || 'Employee';
            const dept = employee?.deptname || employee?.DEPTNAME || '';
            const comp = employee?.compcode || employee?.COMPCODE || '';
            const label = dept ? `${name} (${id}) - ${dept}` : `${name} (${id})`;

            list.push({
                label,
                value: key,
                id,
                name,
                dept,
                comp,
            });
        });

        return [
            {
                label: 'Select Employee',
                value: 'ALL',
                isAll: true,
                count: list.length,
            },
            ...list,
        ];
    }, [employees]);

    // ── Punch Modal State ──────────────────────────────────────────────────
    const [punchModalVisible, setPunchModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [punchType, setPunchType] = useState('IN'); // 'IN' or 'OUT'
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const employeeList = useMemo(() => {
        if (!Array.isArray(employees)) return [];

        const seen = new Set();
        return employees.filter(employee => {
            const id = String(employee?.idcard || employee?.IDCARD || '').trim();
            const company = String(employee?.compcode || employee?.COMPCODE || '').trim().toUpperCase();
            if (!id) return false;

            const key = `${company}:${id.toUpperCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);

            if (!selectedEmployeeKey || selectedEmployeeKey === 'ALL') {
                return true;
            }

            return key === selectedEmployeeKey;
        });
    }, [employees, selectedEmployeeKey]);

    const errorText = error?.data?.message || error?.data?.error || error?.error;

    // Triggered when HOD taps PUNCH IN or PUNCH OUT on an employee card
    const handleInitiatePunch = (employee, type) => {
        setSelectedEmployee(employee);
        setPunchType(type);
        setSelectedTime(new Date());
        setShowTimePicker(false);
        setPunchModalVisible(true);
    };

    // Find in-time of current active punch session for validation when punching out
    const activePunch = useMemo(() => {
        const punches = Array.isArray(selectedEmployee?.punches) ? selectedEmployee.punches : [];
        return punches.length > 0 ? punches[punches.length - 1] : null;
    }, [selectedEmployee]);

    const activeInTimeStr = useMemo(() => {
        return (
            activePunch?.inTime ||
            activePunch?.INTIME ||
            activePunch?.atttime ||
            activePunch?.ATTTIME ||
            activePunch?.atttimeFormatted ||
            selectedEmployee?.punchIn ||
            selectedEmployee?.PUNCHIN ||
            null
        );
    }, [activePunch, selectedEmployee]);

    const inMinutes = useMemo(() => {
        return parseTimeToMinutes(activeInTimeStr);
    }, [activeInTimeStr]);

    // Validation rules:
    // 1. Future time NOT allowed (cannot select time above current time)
    // 2. Punch Out time must be after Punch In time
    const validation = useMemo(() => {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const selMinutes = selectedTime.getHours() * 60 + selectedTime.getMinutes();

        if (selMinutes > nowMinutes) {
            return {
                isValid: false,
                message: `Future time is not allowed. Time cannot be after current time (${moment().format('hh:mm A')}).`,
            };
        }

        if (punchType === 'OUT' && inMinutes != null && selMinutes <= inMinutes) {
            return {
                isValid: false,
                message: `Punch-out time must be after punch-in time (${formatTimeIST(activeInTimeStr)}).`,
            };
        }

        return { isValid: true, message: null };
    }, [selectedTime, punchType, inMinutes, activeInTimeStr]);

    const handleEmployeePunch = async (employee, type, customTime) => {
        const idcard = String(employee?.idcard || employee?.IDCARD || '').trim();
        const compcode = String(employee?.compcode || employee?.COMPCODE || '').trim();
        const empname = employee?.empname || employee?.EMPNAME || 'Employee';

        if (!idcard || !compcode) {
            showMessage({
                message: 'Cannot record attendance',
                description: 'Employee ID or company code is missing.',
                type: 'danger',
            });
            return;
        }

        setPunchingEmployeeId(idcard);
        try {
            const payload = {
                idcard,
                compcode,
                empname,
                latitude: '0',
                longitude: '0',
                location: 'Manually by HOD',
                manual: true,
                time: customTime,
            };
            const result = type === 'IN'
                ? await punchIn(payload).unwrap()
                : await punchOut(payload).unwrap();

            if (Number(result?.status) !== 1) {
                showMessage({
                    message: 'Could not record attendance',
                    description: result?.message || 'Action failed. Please try again.',
                    type: 'danger',
                });
                return;
            }

            const formattedTime = customTime ? formatTimeIST(customTime) : 'Recorded';
            showMessage({
                message: `${empname} punched ${type.toLowerCase()}`,
                description: `Time: ${formattedTime}`,
                type: 'success',
            });
            try {
                const refreshRequest = onRefresh?.();
                await refreshRequest?.unwrap?.();
            } catch (refreshError) {
                showMessage({
                    message: 'Punch recorded, but the employee list could not refresh',
                    description:
                        refreshError?.data?.message ||
                        refreshError?.data?.error ||
                        refreshError?.error ||
                        refreshError?.message ||
                        'Pull down to refresh the list.',
                    type: 'warning',
                });
            }
        } catch (punchError) {
            showMessage({
                message: 'Could not record attendance',
                description:
                    punchError?.data?.message ||
                    punchError?.data?.error ||
                    punchError?.error ||
                    punchError?.message ||
                    'Please try again.',
                type: 'danger',
            });
        } finally {
            setPunchingEmployeeId(null);
        }
    };

    const handleConfirmPunch = async () => {
        if (!validation.isValid || !selectedEmployee) return;

        const hh = String(selectedTime.getHours()).padStart(2, '0');
        const mm = String(selectedTime.getMinutes()).padStart(2, '0');
        const timeStr = `${hh}:${mm}:00`;

        const emp = selectedEmployee;
        const type = punchType;

        setPunchModalVisible(false);
        await handleEmployeePunch(emp, type, timeStr);
    };

    const hasFilter = Boolean(selectedEmployeeKey && selectedEmployeeKey !== 'ALL');

    return (
        <View style={styles.container}>
            {/* ── Employee Selectable Dropdown ── */}
            <View style={styles.dropdownWrapper}>
                <Dropdown
                    style={[
                        styles.dropdownControl,
                        isDropdownFocus && styles.dropdownControlFocus,
                    ]}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    inputSearchStyle={styles.dropdownSearchInput}
                    iconStyle={styles.dropdownIcon}
                    data={dropdownOptions}
                    search
                    maxHeight={350}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Employee"
                    searchPlaceholder="Search by name, ID or department..."
                    value={selectedEmployeeKey}
                    onFocus={() => setIsDropdownFocus(true)}
                    onBlur={() => setIsDropdownFocus(false)}
                    onChange={item => {
                        setSelectedEmployeeKey(item.isAll ? null : item.value);
                        setIsDropdownFocus(false);
                    }}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                            name={hasFilter ? 'account' : 'account-search-outline'}
                            size={21}
                            color={isDropdownFocus ? theme.colors.brand : theme.colors.textMuted}
                            style={styles.dropdownLeftIcon}
                        />
                    )}
                    renderRightIcon={() => (
                        <View style={styles.dropdownRightRow}>
                            {hasFilter && (
                                <TouchableOpacity
                                    onPress={() => setSelectedEmployeeKey(null)}
                                    style={styles.dropdownClearBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Reset to Select Employee"
                                >
                                    <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textDisabled} />
                                </TouchableOpacity>
                            )}
                            <MaterialCommunityIcons
                                name={isDropdownFocus ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={theme.colors.textMuted}
                            />
                        </View>
                    )}
                    renderItem={(item) => {
                        const isSelected = item.value === selectedEmployeeKey || (!selectedEmployeeKey && item.isAll);
                        if (item.isAll) {
                            return (
                                <View style={[styles.dropdownItemRow, isSelected && styles.dropdownItemRowSelected]}>
                                    <View style={[styles.dropdownItemAvatar, styles.dropdownItemAvatarAll]}>
                                        <MaterialCommunityIcons name="account-group-outline" size={18} color={theme.colors.brand} />
                                    </View>
                                    <View style={styles.dropdownItemContent}>
                                        <Text style={[styles.dropdownItemTitle, isSelected && styles.dropdownItemTitleSelected]}>
                                            Select Employee
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <MaterialCommunityIcons name="check" size={18} color={theme.colors.brand} />
                                    )}
                                </View>
                            );
                        }
                        return (
                            <View style={[styles.dropdownItemRow, isSelected && styles.dropdownItemRowSelected]}>
                                <View style={styles.dropdownItemAvatar}>
                                    <MaterialCommunityIcons name="account-outline" size={18} color={theme.colors.brand} />
                                </View>
                                <View style={styles.dropdownItemContent}>
                                    <Text style={[styles.dropdownItemTitle, isSelected && styles.dropdownItemTitleSelected]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.dropdownItemSubtitle} numberOfLines={1}>
                                        ID: {item.id}{item.dept ? ` · ${item.dept}` : ''}{item.comp ? ` · ${item.comp}` : ''}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <MaterialCommunityIcons name="check" size={18} color={theme.colors.brand} />
                                )}
                            </View>
                        );
                    }}
                    containerStyle={styles.dropdownMenuContainer}
                    activeColor={theme.colors.surfaceSelected || '#EFF6FF'}
                    selectedTextProps={{ numberOfLines: 1 }}
                    flatListProps={{
                        keyboardShouldPersistTaps: 'always',
                    }}
                />
            </View>

            {isLoading && !employees ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={theme.colors.brand} />
                    <Text style={styles.stateText}>Loading allocated employees…</Text>
                </View>
            ) : isError && !employees ? (
                <View style={styles.centerState}>
                    <MaterialCommunityIcons name="cloud-alert-outline" size={42} color={theme.colors.danger} />
                    <Text style={styles.stateTitle}>Couldn’t load employees</Text>
                    <Text style={styles.stateText}>
                        {errorText || 'Check your connection and try again.'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRefresh} accessibilityRole="button">
                        <Text style={styles.retryText}>Try again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={employeeList}
                    renderItem={({ item }) => (
                        <EmployeeCard
                            employee={item}
                            onPunch={handleInitiatePunch}
                            isPunching={punchingEmployeeId === String(item?.idcard || item?.IDCARD || '').trim()}
                            isPunchBusy={Boolean(punchingEmployeeId)}
                            theme={theme}
                            styles={styles}
                        />
                    )}
                    keyExtractor={(item, index) => (
                        `${item?.compcode || item?.COMPCODE || 'company'}-${item?.idcard || item?.IDCARD || index}`
                    )}
                    contentContainerStyle={employeeList.length ? styles.listContent : styles.emptyList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={(
                        <RefreshControl
                            refreshing={isFetching && !isLoading}
                            onRefresh={onRefresh}
                            colors={[theme.colors.brand]}
                            tintColor={theme.colors.brand}
                        />
                    )}
                    ListHeaderComponent={employeeList.length > 0 ? (
                        <Text style={styles.resultCount}>
                            {employeeList.length} {employeeList.length === 1 ? 'employee' : 'employees'}
                        </Text>
                    ) : null}
                    ListEmptyComponent={(
                        <View style={styles.centerState}>
                            <MaterialCommunityIcons
                                name={hasFilter ? 'account-search-outline' : 'account-group-outline'}
                                size={48}
                                color={theme.colors.borderStrong}
                            />
                            <Text style={styles.stateTitle}>
                                {hasFilter ? 'No matching employee' : 'No allocated employees'}
                            </Text>
                            <Text style={styles.stateText}>
                                {hasFilter
                                    ? 'Select another employee from the dropdown or tap (X) to clear.'
                                    : 'Employees assigned to you will appear here.'}
                            </Text>
                        </View>
                    )}
                />
            )}
            {/* ── Manual Punch Time Selection Modal ── */}
            <Modal
                visible={punchModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (!punchingEmployeeId) setPunchModalVisible(false);
                }}
            >
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (!punchingEmployeeId) setPunchModalVisible(false);
                    }}
                >
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalCard}>
                                {/* Header Badge & Title */}
                                <View style={styles.modalHeader}>
                                    <View
                                        style={[
                                            styles.modalHeaderIconWrap,
                                            punchType === 'OUT'
                                                ? styles.modalHeaderIconWrapOut
                                                : styles.modalHeaderIconWrapIn,
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={punchType === 'OUT' ? 'logout' : 'login'}
                                            size={22}
                                            color={punchType === 'OUT' ? theme.colors.danger : theme.colors.success}
                                        />
                                    </View>
                                    <View style={styles.modalHeaderTextWrap}>
                                        <Text style={styles.modalTitle}>
                                            Manual Punch {punchType}
                                        </Text>
                                        <Text style={styles.modalSubtitle}>
                                            Select attendance time for employee
                                        </Text>
                                    </View>
                                </View>

                                {/* Employee Info Card */}
                                <View style={styles.modalEmployeeCard}>
                                    <View style={styles.modalAvatar}>
                                        <MaterialCommunityIcons
                                            name="account-outline"
                                            size={20}
                                            color={theme.colors.brand}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalEmployeeName} numberOfLines={1}>
                                            {selectedEmployee?.empname || selectedEmployee?.EMPNAME || 'Employee'}
                                        </Text>
                                        <Text style={styles.modalEmployeeId}>
                                            ID: {selectedEmployee?.idcard || selectedEmployee?.IDCARD || '—'}
                                            {selectedEmployee?.compcode || selectedEmployee?.COMPCODE
                                                ? ` · ${selectedEmployee?.compcode || selectedEmployee?.COMPCODE}`
                                                : ''}
                                        </Text>
                                    </View>
                                </View>

                                {/* Punch-In Time Reference (for Punch Out) */}
                                {punchType === 'OUT' && activeInTimeStr && (
                                    <View style={styles.modalInTimeInfo}>
                                        <MaterialCommunityIcons
                                            name="information-outline"
                                            size={16}
                                            color={theme.colors.brand}
                                        />
                                        <Text style={styles.modalInTimeText}>
                                            Punched In at: <Text style={styles.modalInTimeBold}>{formatTimeIST(activeInTimeStr)}</Text>
                                        </Text>
                                    </View>
                                )}

                                {/* Time Selection Input */}
                                <Text style={styles.modalFieldLabel}>SELECT PUNCH TIME *</Text>
                                <TouchableOpacity
                                    style={styles.timePickerCard}
                                    onPress={() => setShowTimePicker(true)}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select punch time, currently ${moment(selectedTime).format('hh:mm A')}`}
                                >
                                    <View style={styles.timePickerLeft}>
                                        <MaterialCommunityIcons
                                            name="clock-time-four-outline"
                                            size={24}
                                            color={punchType === 'OUT' ? theme.colors.danger : theme.colors.success}
                                        />
                                        <Text style={styles.timePickerValue}>
                                            {moment(selectedTime).format('hh:mm A')}
                                        </Text>
                                    </View>
                                    <View style={styles.timePickerBadge}>
                                        <MaterialCommunityIcons
                                            name="pencil-outline"
                                            size={13}
                                            color={theme.colors.brand}
                                        />
                                        <Text style={styles.timePickerBadgeText}>Change</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Set to Current Time Shortcut */}
                                <TouchableOpacity
                                    style={styles.nowShortcut}
                                    onPress={() => setSelectedTime(new Date())}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="clock-fast" size={14} color={theme.colors.brand} />
                                    <Text style={styles.nowShortcutText}>
                                        Set to Current Time ({moment().format('hh:mm A')})
                                    </Text>
                                </TouchableOpacity>

                                {/* Real-time Validation Error Banner */}
                                {validation.message && (
                                    <View style={styles.modalWarningBox}>
                                        <MaterialCommunityIcons
                                            name="alert-circle-outline"
                                            size={17}
                                            color="#DC2626"
                                        />
                                        <Text style={styles.modalWarningText}>
                                            {validation.message}
                                        </Text>
                                    </View>
                                )}

                                {/* DateTimePicker on Android / iOS */}
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={selectedTime}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        maximumDate={new Date()}
                                        onChange={(event, date) => {
                                            setShowTimePicker(false);
                                            if (event?.type === 'set' && date) {
                                                setSelectedTime(date);
                                            }
                                        }}
                                    />
                                )}

                                {/* Modal Actions */}
                                <View style={styles.modalActionsRow}>
                                    <TouchableOpacity
                                        style={styles.modalCancelBtn}
                                        onPress={() => setPunchModalVisible(false)}
                                        disabled={Boolean(punchingEmployeeId)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.modalConfirmBtn,
                                            punchType === 'OUT'
                                                ? styles.modalConfirmBtnOut
                                                : styles.modalConfirmBtnIn,
                                            (!validation.isValid || Boolean(punchingEmployeeId)) &&
                                                styles.modalConfirmBtnDisabled,
                                        ]}
                                        onPress={handleConfirmPunch}
                                        disabled={!validation.isValid || Boolean(punchingEmployeeId)}
                                        activeOpacity={0.7}
                                    >
                                        {punchingEmployeeId ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons
                                                    name={punchType === 'OUT' ? 'logout' : 'login'}
                                                    size={16}
                                                    color="#FFFFFF"
                                                />
                                                <Text style={styles.modalConfirmText}>
                                                    Confirm Punch {punchType}
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    dropdownWrapper: {
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    dropdownControl: {
        height: 48,
        backgroundColor: theme.colors.inputBackground,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.sm + 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownControlFocus: {
        borderColor: theme.colors.brand,
    },
    dropdownPlaceholder: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary || theme.colors.placeholder,
        fontWeight: theme.fontWeights.medium,
    },
    dropdownSelectedText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.medium,
        flex: 1,
    },
    dropdownLeftIcon: {
        marginRight: theme.spacing.sm,
    },
    dropdownRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dropdownClearBtn: {
        padding: 2,
    },
    dropdownIcon: {
        width: 20,
        height: 20,
    },
    dropdownSearchInput: {
        height: 44,
        borderRadius: theme.radii.sm,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.backgroundSubtle || '#F9FAFB',
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.sm,
        marginHorizontal: theme.spacing.xs,
        marginTop: theme.spacing.xs,
    },
    dropdownMenuContainer: {
        borderRadius: theme.radii.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    dropdownItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm + 4,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
    },
    dropdownItemRowSelected: {
        backgroundColor: theme.colors.surfaceSelected || '#EFF6FF',
    },
    dropdownItemAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    dropdownItemAvatarAll: {
        backgroundColor: '#E0E7FF',
    },
    dropdownItemContent: {
        flex: 1,
    },
    dropdownItemTitle: {
        ...theme.typography.label,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.semiBold,
    },
    dropdownItemTitleSelected: {
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    dropdownItemSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },
    emptyList: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingBottom: theme.spacing.xxxl,
    },
    resultCount: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.semiBold,
        marginBottom: theme.spacing.sm,
    },
    card: {
        ...theme.styles.card,
        ...theme.styles.shadow,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: theme.controlSizes.avatarMd,
        height: theme.controlSizes.avatarMd,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    employeeInfo: {
        flex: 1,
        marginRight: theme.spacing.xs + 2,
    },
    employeeName: {
        ...theme.typography.label,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    employeeId: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xxs + 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs + 2,
    },
    statusDot: {
        width: theme.spacing.xs + 3,
        height: theme.spacing.xs + 3,
        borderRadius: theme.radii.circle,
        marginRight: theme.spacing.xs,
    },
    statusText: {
        ...theme.typography.overline,
        letterSpacing: 0,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.sm + 2,
        backgroundColor: theme.colors.backgroundSubtle,
        borderRadius: theme.radii.md,
    },
    timeMetric: {
        flex: 1,
        alignItems: 'center',
        gap: theme.spacing.xxs + 1,
    },
    metricLabel: {
        ...theme.typography.overline,
        color: theme.colors.textMuted,
        letterSpacing: 0,
    },
    metricValue: {
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    metricDivider: {
        width: StyleSheet.hairlineWidth,
        height: 32,
        backgroundColor: theme.colors.border,
    },
    employeePunchButton: {
        minHeight: theme.controlSizes.minTouchTarget,
        marginTop: theme.spacing.sm + 3,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    punchInButton: {
        backgroundColor: theme.colors.success,
    },
    punchOutButton: {
        backgroundColor: theme.colors.danger,
    },
    employeePunchButtonDisabled: {
        opacity: 0.7,
    },
    employeePunchButtonText: {
        ...theme.typography.overline,
        color: theme.colors.brandContrast,
        letterSpacing: 0,
    },
    punchLogToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: theme.spacing.sm + 2,
    },
    punchLogToggleText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
    punchLog: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.xs + 2,
    },
    punchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs + 3,
        paddingVertical: theme.spacing.xs + 3,
    },
    punchIndex: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        width: 16,
    },
    punchTime: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeights.semiBold,
    },
    punchDuration: {
        ...theme.typography.overline,
        color: theme.colors.textMuted,
        marginLeft: 'auto',
    },
    noPunchesText: {
        ...theme.typography.caption,
        color: theme.colors.textDisabled,
        textAlign: 'center',
        paddingVertical: theme.spacing.sm + 2,
    },
    totalPunchText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        marginTop: theme.spacing.xs + 2,
        paddingTop: theme.spacing.sm,
    },
    centerState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xxl + theme.spacing.xs,
        paddingVertical: theme.spacing.huge,
    },
    stateTitle: {
        ...theme.typography.title,
        color: theme.colors.text,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
    stateText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        lineHeight: theme.lineHeights.sm,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
    },
    retryButton: {
        marginTop: theme.spacing.md,
        borderRadius: theme.radii.sm,
        backgroundColor: theme.colors.brand,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
    },
    retryText: {
        ...theme.typography.label,
        color: theme.colors.brandContrast,
    },
    // ── Modal Styles ────────────────────────────────────────────────────────
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    modalCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
        ...theme.styles.shadow,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    modalHeaderIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm + 2,
    },
    modalHeaderIconWrapIn: {
        backgroundColor: '#DCFCE7',
    },
    modalHeaderIconWrapOut: {
        backgroundColor: '#FEE2E2',
    },
    modalHeaderTextWrap: {
        flex: 1,
    },
    modalTitle: {
        ...theme.typography.title,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    modalSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    modalEmployeeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundSubtle,
        borderRadius: theme.radii.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    modalAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    modalEmployeeName: {
        ...theme.typography.label,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    modalEmployeeId: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    modalInTimeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.surfaceSelected || '#EFF6FF',
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 6,
        marginBottom: theme.spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.brand,
    },
    modalInTimeText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    modalInTimeBold: {
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    modalFieldLabel: {
        ...theme.typography.overline,
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
        marginBottom: 6,
        marginTop: 4,
    },
    timePickerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.inputBackground,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    timePickerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    timePickerValue: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: 0.5,
    },
    timePickerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.brandSoft || '#E0F2FE',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radii.pill,
    },
    timePickerBadgeText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    nowShortcut: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        marginTop: 6,
        paddingVertical: 2,
    },
    nowShortcutText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
    modalWarningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: theme.radii.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 7,
        marginTop: theme.spacing.sm,
    },
    modalWarningText: {
        ...theme.typography.caption,
        color: '#B91C1C',
        flex: 1,
        fontWeight: theme.fontWeights.medium,
    },
    modalActionsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },
    modalCancelBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    modalCancelText: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
    },
    modalConfirmBtn: {
        flex: 1.6,
        minHeight: 44,
        borderRadius: theme.radii.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: theme.spacing.sm,
    },
    modalConfirmBtnIn: {
        backgroundColor: theme.colors.success,
    },
    modalConfirmBtnOut: {
        backgroundColor: theme.colors.danger,
    },
    modalConfirmBtnDisabled: {
        opacity: 0.45,
    },
    modalConfirmText: {
        ...theme.typography.label,
        color: '#FFFFFF',
        fontWeight: theme.fontWeights.bold,
    },
});
