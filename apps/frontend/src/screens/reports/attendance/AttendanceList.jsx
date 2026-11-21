import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGetEmployeeIdsWithAttQuery } from '../../../store/api/UserApi';
import { useAppTheme } from '../../../theme';
import { exportReportToPdf, exportReportToExcel, ExportReportModal } from '../../../utils/ReportExportUtils';

const formatTimeIST = (val) => {
    if (!val || val === '--:--' || val === '-' || val === 'null' || val === 'undefined') return '--:--';
    const str = String(val).trim();
    if (/am|pm/i.test(str)) return str.toUpperCase();
    const m = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
        let h = parseInt(m[1], 10);
        const mins = m[2];
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${String(h).padStart(2, '0')}:${mins} ${ampm}`;
    }
    return str;
};

const formatHumanDuration = (val, totalPunches = 1) => {
    if (!val || val === '--:--' || val === '00:00:00' || val === '00:00' || val === '-') {
        return totalPunches > 0 ? '0s' : '--';
    }
    const str = String(val).trim();
    const parts = str.split(':').map(Number);
    if (parts.length === 3) {
        const [h, m, s] = parts;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }
    if (parts.length === 2) {
        const [h, m] = parts;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }
    return str;
};

const ATTENDANCE_COLUMNS = [
    { key: '#', label: '#' },
    { key: 'idcard', label: 'Emp ID', getValue: (item) => item?.idcard || item?.IDCARD || '-' },
    { key: 'employee', label: 'Employee Name', getValue: (item) => item?.empname || item?.EMPNAME || 'Employee' },
    { key: 'compcode', label: 'Company', getValue: (item) => item?.compcode || item?.COMPCODE || '-' },
    { key: 'deptname', label: 'Department', getValue: (item) => item?.deptname || item?.DEPTNAME || '-' },
    { key: 'punchIn', label: 'In Time', getValue: (item) => formatTimeIST(item?.punchIn || item?.PUNCHIN) },
    { key: 'punchOut', label: 'Out Time', getValue: (item) => formatTimeIST(item?.punchOut || item?.PUNCHOUT) },
    { key: 'totalPunches', label: 'Punches', getValue: (item) => Number(item?.totalPunches ?? item?.TOTALPUNCHES ?? item?.punches?.length ?? 0) },
    { key: 'totalTime', label: 'Worked', getValue: (item) => formatHumanDuration(item?.totalTimeFormatted || item?.humanWorked || '00:00') },
    { key: 'status', label: 'Status', getValue: (item) => {
        const inout = item?.lastInout != null ? String(item.lastInout) : null;
        if (inout === '1') return 'PUNCHED IN';
        if (inout === '0') return 'PUNCHED OUT';
        return 'NO PUNCH';
    }},
    { key: 'date', label: 'Date', getValue: (item, extra) => extra?.reportDate || moment().format('DD MMM YYYY') },
];

export default function AttendanceList({ navigation }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const user = useSelector((state) => state.UserDetails);

    const userIdcard = user?.IDCARD || user?.UserId || user?.Id;
    const normalizedUserId = String(userIdcard || '').trim().toUpperCase();
    const isAdmin = Boolean(user?.isAdmin || user?.admin === 1 || user?.admin === true || String(user?.admin) === '1');
    const isHOD =
        String(user?.level || '').toUpperCase() === 'HOD' ||
        (normalizedUserId && normalizedUserId === String(user?.hod || '').trim().toUpperCase()) ||
        isAdmin;
    const isHR =
        String(user?.level || '').toUpperCase() === 'HR' ||
        (normalizedUserId && normalizedUserId === String(user?.hr || '').trim().toUpperCase());

    const [activeTab, setActiveTab] = useState('TEAM'); // 'TEAM' or 'MY'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'IN', 'OUT', 'NONE'
    const [expandedCardId, setExpandedCardId] = useState(null);

    // Export Modal State
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [singleItemToExport, setSingleItemToExport] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportingType, setExportingType] = useState(null);

    const formattedDateParam = useMemo(() => moment(selectedDate).format('YYYY-MM-DD'), [selectedDate]);

    const {
        data: attendanceRes,
        isLoading,
        isFetching,
        refetch,
    } = useGetEmployeeIdsWithAttQuery(
        {
            hod: userIdcard,
            hr: userIdcard,
            date: formattedDateParam,
            admin: isAdmin,
            includeSelf: true,
        },
        { skip: !userIdcard }
    );

    const rawList = useMemo(() => {
        if (!Array.isArray(attendanceRes?.data)) return [];
        return attendanceRes.data;
    }, [attendanceRes]);

    // Filter by Tab (My vs Team)
    const tabFilteredList = useMemo(() => {
        if (activeTab === 'MY') {
            return rawList.filter(emp => String(emp.idcard || emp.IDCARD).trim() === String(userIdcard).trim());
        }
        return rawList;
    }, [rawList, activeTab, userIdcard]);

    // KPI Counts
    const kpiStats = useMemo(() => {
        let inCount = 0;
        let outCount = 0;
        let noneCount = 0;

        tabFilteredList.forEach(item => {
            const inout = item?.lastInout != null ? String(item.lastInout) : null;
            if (inout === '1') inCount++;
            else if (inout === '0') outCount++;
            else noneCount++;
        });

        return {
            total: tabFilteredList.length,
            inCount,
            outCount,
            noneCount,
        };
    }, [tabFilteredList]);

    // Search and Status Filters
    const filteredList = useMemo(() => {
        return tabFilteredList.filter(item => {
            const inout = item?.lastInout != null ? String(item.lastInout) : null;
            if (statusFilter === 'IN' && inout !== '1') return false;
            if (statusFilter === 'OUT' && inout !== '0') return false;
            if (statusFilter === 'NONE' && (inout === '1' || inout === '0')) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const matchName = String(item?.empname || item?.EMPNAME || '').toLowerCase().includes(q);
                const matchId = String(item?.idcard || item?.IDCARD || '').toLowerCase().includes(q);
                const matchDept = String(item?.deptname || item?.DEPTNAME || '').toLowerCase().includes(q);
                const matchComp = String(item?.compcode || item?.COMPCODE || '').toLowerCase().includes(q);
                if (!matchName && !matchId && !matchDept && !matchComp) return false;
            }

            return true;
        });
    }, [tabFilteredList, statusFilter, searchQuery]);

    // Export Handlers
    const currentExportData = useMemo(() => {
        return singleItemToExport ? [singleItemToExport] : filteredList;
    }, [singleItemToExport, filteredList]);

    const handleExportPdf = async () => {
        try {
            setIsExporting(true);
            setExportingType('pdf');
            const isSingle = Boolean(singleItemToExport);
            const dateStr = moment(selectedDate).format('DD MMM YYYY');
            const title = isSingle
                ? `Attendance Entry (${singleItemToExport?.empname || 'Employee'})`
                : 'Attendance Register Report';
            const subtitle = `Date: ${dateStr} | Records: ${currentExportData.length}`;

            await exportReportToPdf({
                title,
                subtitle,
                columns: ATTENDANCE_COLUMNS,
                data: currentExportData,
                extra: { reportDate: dateStr },
                fileName: `Attendance_Report_${moment(selectedDate).format('YYYYMMDD')}`,
            });
            setExportModalVisible(false);
            setSingleItemToExport(null);
        } catch (err) {
            Alert.alert('Export Error', err?.message || 'Failed to export PDF');
        } finally {
            setIsExporting(false);
            setExportingType(null);
        }
    };

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            setExportingType('excel');
            const isSingle = Boolean(singleItemToExport);
            const dateStr = moment(selectedDate).format('DD MMM YYYY');
            const title = isSingle
                ? `Attendance Entry (${singleItemToExport?.empname || 'Employee'})`
                : 'Attendance Register Report';
            const subtitle = `Date: ${dateStr} | Records: ${currentExportData.length}`;

            await exportReportToExcel({
                title,
                subtitle,
                columns: ATTENDANCE_COLUMNS,
                data: currentExportData,
                extra: { reportDate: dateStr },
                fileName: `Attendance_Report_${moment(selectedDate).format('YYYYMMDD')}`,
                sheetName: 'Attendance Register',
            });
            setExportModalVisible(false);
            setSingleItemToExport(null);
        } catch (err) {
            Alert.alert('Export Error', err?.message || 'Failed to export Excel');
        } finally {
            setIsExporting(false);
            setExportingType(null);
        }
    };

    const handleInitiateExportSingle = (item) => {
        setSingleItemToExport(item);
        setExportModalVisible(true);
    };

    const toggleCardExpand = (id) => {
        setExpandedCardId(prev => (prev === id ? null : id));
    };

    return (
        <View style={styles.container}>
            {/* ── Top Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack?.()}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>Attendance Report</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredList.length} {filteredList.length === 1 ? 'record found' : 'records found'}
                    </Text>
                </View>

                {/* Export All Button */}
                <TouchableOpacity
                    style={styles.headerIconBtn}
                    onPress={() => {
                        setSingleItemToExport(null);
                        setExportModalVisible(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Export Attendance Report"
                >
                    <MaterialCommunityIcons name="download-outline" size={22} color={theme.colors.brand} />
                </TouchableOpacity>

                {/* Refresh Button */}
                <TouchableOpacity
                    style={styles.headerIconBtn}
                    onPress={() => refetch?.()}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh attendance data"
                >
                    <MaterialCommunityIcons name="refresh" size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
            </View>

            {/* ── Tabs (Team vs My) ── */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'TEAM' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('TEAM')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'TEAM' }}
                >
                    <MaterialCommunityIcons
                        name="account-group-outline"
                        size={18}
                        color={activeTab === 'TEAM' ? '#FFFFFF' : theme.colors.textMuted}
                    />
                    <Text style={[styles.tabText, activeTab === 'TEAM' && styles.tabTextActive]}>
                        Team Attendance
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'MY' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('MY')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTab === 'MY' }}
                >
                    <MaterialCommunityIcons
                        name="account-outline"
                        size={18}
                        color={activeTab === 'MY' ? '#FFFFFF' : theme.colors.textMuted}
                    />
                    <Text style={[styles.tabText, activeTab === 'MY' && styles.tabTextActive]}>
                        My Attendance
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── Date Picker Bar ── */}
            <View style={styles.dateBar}>
                <TouchableOpacity
                    style={styles.dateSelectorCard}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Selected date ${moment(selectedDate).format('DD MMM YYYY')}`}
                >
                    <MaterialCommunityIcons name="calendar-month-outline" size={20} color={theme.colors.brand} />
                    <Text style={styles.dateSelectorText}>
                        {moment(selectedDate).format('DD MMM YYYY')}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>

                {/* Today shortcut */}
                {moment(selectedDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD') && (
                    <TouchableOpacity
                        style={styles.todayBtn}
                        onPress={() => setSelectedDate(new Date())}
                        accessibilityRole="button"
                    >
                        <Text style={styles.todayBtnText}>Today</Text>
                    </TouchableOpacity>
                )}
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (event?.type === 'set' && date) {
                            setSelectedDate(date);
                        }
                    }}
                />
            )}

            {/* ── Search Input ── */}
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textMuted} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search employee name, ID or department..."
                    placeholderTextColor={theme.colors.placeholder}
                    style={styles.searchInput}
                    returnKeyType="search"
                />
                {!!searchQuery && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button">
                        <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textDisabled} />
                    </TouchableOpacity>
                )}
            </View>

            {/* ── KPI Summary Badges ── */}
            <View style={styles.kpiRow}>
                <TouchableOpacity
                    style={[styles.kpiCard, statusFilter === 'ALL' && styles.kpiCardActive]}
                    onPress={() => setStatusFilter('ALL')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.kpiValue}>{kpiStats.total}</Text>
                    <Text style={styles.kpiLabel}>Total</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.kpiCard, statusFilter === 'IN' && styles.kpiCardActive]}
                    onPress={() => setStatusFilter(statusFilter === 'IN' ? 'ALL' : 'IN')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.kpiValue, { color: theme.colors.success }]}>{kpiStats.inCount}</Text>
                    <Text style={styles.kpiLabel}>Punched In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.kpiCard, statusFilter === 'OUT' && styles.kpiCardActive]}
                    onPress={() => setStatusFilter(statusFilter === 'OUT' ? 'ALL' : 'OUT')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.kpiValue, { color: '#D97706' }]}>{kpiStats.outCount}</Text>
                    <Text style={styles.kpiLabel}>Punched Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.kpiCard, statusFilter === 'NONE' && styles.kpiCardActive]}
                    onPress={() => setStatusFilter(statusFilter === 'NONE' ? 'ALL' : 'NONE')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.kpiValue, { color: theme.colors.textMuted }]}>{kpiStats.noneCount}</Text>
                    <Text style={styles.kpiLabel}>No Punches</Text>
                </TouchableOpacity>
            </View>

            {/* ── Employee Attendance Cards List ── */}
            {isLoading && !rawList.length ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={theme.colors.brand} />
                    <Text style={styles.stateText}>Loading attendance register…</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item, index) => `${item?.compcode || 'comp'}-${item?.idcard || index}`}
                    contentContainerStyle={filteredList.length ? styles.listContent : styles.emptyList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={(
                        <RefreshControl
                            refreshing={isFetching && !isLoading}
                            onRefresh={() => refetch?.()}
                            colors={[theme.colors.brand]}
                            tintColor={theme.colors.brand}
                        />
                    )}
                    renderItem={({ item }) => {
                        const inout = item?.lastInout != null ? String(item.lastInout) : null;
                        const isPunchedIn = inout === '1';
                        const isPunchedOut = inout === '0';
                        const statusLabel = isPunchedIn ? 'PUNCHED IN' : isPunchedOut ? 'PUNCHED OUT' : 'NO PUNCH';
                        const statusColor = isPunchedIn
                            ? theme.colors.success
                            : isPunchedOut
                                ? '#D97706'
                                : theme.colors.textMuted;
                        const statusBg = isPunchedIn
                            ? '#DCFCE7'
                            : isPunchedOut
                                ? '#FEF3C7'
                                : '#F1F5F9';

                        const punches = Array.isArray(item?.punches) ? item.punches : [];
                        const cardId = `${item?.compcode}-${item?.idcard}`;
                        const isExpanded = expandedCardId === cardId;

                        return (
                            <View style={styles.card}>
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <MaterialCommunityIcons name="account-outline" size={22} color={theme.colors.brand} />
                                    </View>
                                    <View style={styles.employeeInfo}>
                                        <Text style={styles.employeeName} numberOfLines={1}>
                                            {item?.empname || item?.EMPNAME || 'Employee'}
                                        </Text>
                                        <Text style={styles.employeeSub}>
                                            ID: {item?.idcard || item?.IDCARD || '—'}
                                            {item?.compcode ? ` · ${item.compcode}` : ''}
                                            {item?.deptname ? ` · ${item.deptname}` : ''}
                                        </Text>
                                    </View>

                                    {/* Status Badge */}
                                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                        <Text style={[styles.statusText, { color: statusColor }]}>
                                            {statusLabel}
                                        </Text>
                                    </View>
                                </View>

                                {/* Metrics Row */}
                                <View style={styles.metricsRow}>
                                    <View style={styles.metricCol}>
                                        <Text style={styles.metricLabel}>IN</Text>
                                        <Text style={styles.metricVal}>
                                            {formatTimeIST(item?.punchIn || item?.PUNCHIN)}
                                        </Text>
                                    </View>
                                    <View style={styles.metricDivider} />
                                    <View style={styles.metricCol}>
                                        <Text style={styles.metricLabel}>OUT</Text>
                                        <Text style={styles.metricVal}>
                                            {formatTimeIST(item?.punchOut || item?.PUNCHOUT)}
                                        </Text>
                                    </View>
                                    <View style={styles.metricDivider} />
                                    <View style={styles.metricCol}>
                                        <Text style={styles.metricLabel}>PUNCHES</Text>
                                        <Text style={styles.metricVal}>
                                            {item?.totalPunches ?? item?.TOTALPUNCHES ?? punches.length ?? 0}
                                        </Text>
                                    </View>
                                    <View style={styles.metricDivider} />
                                    <View style={styles.metricCol}>
                                        <Text style={styles.metricLabel}>WORKED</Text>
                                        <Text style={[styles.metricVal, { color: theme.colors.brand }]}>
                                            {formatHumanDuration(item?.totalTimeFormatted || item?.humanWorked || '00:00')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Card Footer Actions */}
                                <View style={styles.cardFooter}>
                                    <TouchableOpacity
                                        style={styles.expandLogBtn}
                                        onPress={() => toggleCardExpand(cardId)}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.expandLogBtnText}>
                                            {isExpanded ? 'Hide' : 'View'} punch log ({item?.totalPunches ?? punches.length})
                                        </Text>
                                        <MaterialCommunityIcons
                                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                            size={18}
                                            color={theme.colors.brand}
                                        />
                                    </TouchableOpacity>

                                    {/* Individual Download Action */}
                                    <TouchableOpacity
                                        style={styles.singleDownloadBtn}
                                        onPress={() => handleInitiateExportSingle(item)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Download attendance for ${item?.empname}`}
                                    >
                                        <MaterialCommunityIcons name="download" size={17} color={theme.colors.brand} />
                                        <Text style={styles.singleDownloadText}>Download</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Expandable Punch Log */}
                                {isExpanded && (
                                    <View style={styles.punchLogSection}>
                                        {punches.length === 0 ? (
                                            <Text style={styles.noPunchesText}>No punch sessions recorded</Text>
                                        ) : (
                                            <>
                                                <Text style={styles.punchLogSubheading}>
                                                    WORK SESSIONS ({punches.length})
                                                </Text>
                                                {punches.map((p, pIdx) => {
                                                    const inTime = p?.inTime || p?.INTIME || p?.atttime;
                                                    const outTime = p?.outTime || p?.OUTTIME;
                                                    const duration = p?.durationFormatted || formatHumanDuration(p?.duration);

                                                    return (
                                                        <View key={`punch-${pIdx}`} style={styles.punchRow}>
                                                            <Text style={styles.punchIndex}>#{pIdx + 1}</Text>
                                                            <Text style={styles.punchTimeText}>{formatTimeIST(inTime)}</Text>
                                                            <MaterialCommunityIcons name="arrow-right" size={14} color={theme.colors.textDisabled} />
                                                            <Text style={styles.punchTimeText}>
                                                                {outTime ? formatTimeIST(outTime) : 'Active'}
                                                            </Text>
                                                            <Text style={styles.punchDurationText}>{duration}</Text>
                                                        </View>
                                                    );
                                                })}

                                                {/* Raw Individual Punch Chips */}
                                                {Array.isArray(item?.allPunches) && item.allPunches.length > 0 && (
                                                    <View style={styles.rawPunchesWrapper}>
                                                        <Text style={styles.punchLogSubheading}>
                                                            INDIVIDUAL PUNCHES ({item.allPunches.length})
                                                        </Text>
                                                        <View style={styles.rawPunchesList}>
                                                            {item.allPunches.map((rp, rIdx) => {
                                                                const isIN = Number(rp?.inout) === 1;
                                                                return (
                                                                    <View key={`rp-${rIdx}`} style={styles.rawPunchChip}>
                                                                        <Text style={styles.rawPunchNum}>#{rIdx + 1}</Text>
                                                                        <Text style={[styles.rawPunchType, { color: isIN ? theme.colors.success : '#DC2626' }]}>
                                                                            {isIN ? 'IN' : 'OUT'}
                                                                        </Text>
                                                                        <Text style={styles.rawPunchTime}>{formatTimeIST(rp?.atttime)}</Text>
                                                                    </View>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                )}

                                                <Text style={styles.totalPunchSummaryText}>
                                                    Total: {formatHumanDuration(item?.totalTimeFormatted || '00:00')} · {punches.length} sessions{item?.allPunches?.length ? ` · ${item.allPunches.length} punches` : ''}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    }}
                    ListEmptyComponent={(
                        <View style={styles.centerState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={theme.colors.borderStrong} />
                            <Text style={styles.stateTitle}>No attendance records</Text>
                            <Text style={styles.stateText}>
                                No attendance entries found for {moment(selectedDate).format('DD MMM YYYY')}.
                            </Text>
                        </View>
                    )}
                />
            )}

            {/* ── Export Modal ── */}
            <ExportReportModal
                visible={exportModalVisible}
                onClose={() => {
                    if (!isExporting) {
                        setExportModalVisible(false);
                        setSingleItemToExport(null);
                    }
                }}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportExcel}
                isExporting={isExporting}
                exportingType={exportingType}
                recordCount={currentExportData.length}
                reportTitle={singleItemToExport ? `Attendance (${singleItemToExport?.empname || 'Employee'})` : 'Attendance Register'}
                theme={theme}
            />
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingTop: Platform.OS === 'android' ? 12 : 8,
        paddingBottom: 10,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
    },
    backButton: {
        padding: 4,
        marginRight: theme.spacing.sm,
    },
    headerTitleWrap: {
        flex: 1,
    },
    headerTitle: {
        ...theme.typography.titleMedium,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: theme.colors.backgroundSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.xs,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs + 2,
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 9,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.backgroundSubtle,
    },
    tabButtonActive: {
        backgroundColor: theme.colors.brand,
    },
    tabText: {
        ...theme.typography.label,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.medium,
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: theme.fontWeights.bold,
    },
    dateBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: 4,
    },
    dateSelectorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.sm + 4,
        paddingVertical: 7,
    },
    dateSelectorText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    todayBtn: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
    },
    todayBtnText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: theme.radii.md,
        marginHorizontal: theme.spacing.md,
        marginTop: 6,
        marginBottom: 6,
        paddingHorizontal: theme.spacing.sm + 4,
        height: 42,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: theme.spacing.sm,
        ...theme.typography.bodySmall,
        color: theme.colors.text,
    },
    kpiRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        gap: 8,
        marginBottom: theme.spacing.sm,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: theme.radii.md,
        paddingVertical: 8,
        alignItems: 'center',
    },
    kpiCardActive: {
        borderColor: theme.colors.brand,
        backgroundColor: theme.colors.surfaceSelected || '#EFF6FF',
    },
    kpiValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    kpiLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.xxxl,
    },
    emptyList: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xxl,
        paddingBottom: theme.spacing.xxxl,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        ...theme.typography.titleSmall,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    employeeSub: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radii.pill,
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.bold,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.backgroundSubtle,
        borderRadius: theme.radii.md,
        paddingVertical: 8,
        paddingHorizontal: 6,
        marginTop: theme.spacing.sm,
    },
    metricCol: {
        flex: 1,
        alignItems: 'center',
    },
    metricLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.semiBold,
    },
    metricVal: {
        ...theme.typography.label,
        fontSize: 12,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
        marginTop: 2,
    },
    metricDivider: {
        width: 1,
        height: 22,
        backgroundColor: theme.colors.borderSubtle,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.xs + 2,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSubtle,
    },
    expandLogBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
    },
    expandLogBtnText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
    singleDownloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radii.pill,
    },
    singleDownloadText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    punchLogSection: {
        backgroundColor: theme.colors.backgroundSubtle,
        borderRadius: theme.radii.md,
        padding: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    noPunchesText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    punchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
    },
    punchIndex: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        width: 18,
    },
    punchTimeText: {
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.medium,
    },
    punchDurationText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
    punchLogSubheading: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginTop: 4,
    },
    rawPunchesWrapper: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSubtle,
    },
    rawPunchesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    rawPunchChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: theme.radii.sm,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    rawPunchNum: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
    },
    rawPunchType: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.bold,
    },
    rawPunchTime: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
    },
    totalPunchSummaryText: {
        ...theme.typography.caption,
        fontSize: 11,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
        textAlign: 'right',
        marginTop: 8,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSubtle,
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    stateTitle: {
        ...theme.typography.titleMedium,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
        marginTop: 12,
    },
    stateText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
});
