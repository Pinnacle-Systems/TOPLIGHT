import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import { usePunchInMutation, usePunchOutMutation } from '../../store/api/AttendanceApi';
import { useAppTheme } from '../../theme';

const displayTime = value => value || '--:--';

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
    const totalTime = employee?.totalTimeFormatted || '00:00';
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
                        {(employee?.deptname || employee?.DEPTNAME)
                            ? `  ·  ${employee?.deptname || employee?.DEPTNAME}`
                            : ''}
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
    const [search, setSearch] = useState('');
    const [punchingEmployeeId, setPunchingEmployeeId] = useState(null);
    const [punchIn] = usePunchInMutation();
    const [punchOut] = usePunchOutMutation();
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

            const query = search.trim().toLowerCase();
            if (!query) return true;
            return [
                employee?.empname,
                employee?.EMPNAME,
                id,
                employee?.deptname,
                employee?.DEPTNAME,
                employee?.compcode,
                employee?.COMPCODE,
            ].some(value => String(value || '').toLowerCase().includes(query));
        });
    }, [employees, search]);

    const errorText = error?.data?.message || error?.data?.error || error?.error;

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
                location: 'Manually by HOD',
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

            showMessage({
                message: `${empname} punched ${type.toLowerCase()}`,
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

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={21} color={theme.colors.textMuted} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search by name, ID or department"
                    placeholderTextColor={theme.colors.placeholder}
                    style={styles.searchInput}
                    returnKeyType="search"
                    accessibilityLabel="Search employees"
                />
                {!!search && (
                    <TouchableOpacity
                        onPress={() => setSearch('')}
                        accessibilityRole="button"
                        accessibilityLabel="Clear employee search"
                    >
                        <MaterialCommunityIcons name="close-circle" size={19} color={theme.colors.textDisabled} />
                    </TouchableOpacity>
                )}
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
                                name={search ? 'account-search-outline' : 'account-group-outline'}
                                size={48}
                                color={theme.colors.borderStrong}
                            />
                            <Text style={styles.stateTitle}>
                                {search ? 'No matching employees' : 'No allocated employees'}
                            </Text>
                            <Text style={styles.stateText}>
                                {search
                                    ? 'Try another name, ID or department.'
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
    searchBar: {
        minHeight: 46,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
    },
    searchInput: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.sm,
        ...theme.typography.bodySmall,
        color: theme.colors.text,
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
