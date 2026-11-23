import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
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

    // Direct 1-tap punch for employee using backend exact system time (IST)
    const handleEmployeePunch = async (employee, type) => {
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
                location: 'By HOD/Admin',
                manual: true,
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

            const recordedTime = result?.data?.inTime || result?.data?.outTime;
            const formattedTime = recordedTime ? formatTimeIST(recordedTime) : 'Recorded';
            showMessage({
                message: `${empname} punched ${type.toLowerCase()}`,
                description: `Time: ${formattedTime} (IST)`,
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
                            onPunch={handleEmployeePunch}
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
});
