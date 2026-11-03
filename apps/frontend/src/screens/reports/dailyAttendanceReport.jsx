import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetMisDashboardOrdersInHandMonthWiseQuery } from '../../store/api/DashboardApi';
import { DateInput } from '../../components/reusable_components/Inputs';
import { Alert } from 'react-native';
import { exportReportToPdf, exportReportToExcel, ExportReportModal } from '../../utils/ReportExportUtils';
import { screenWidth } from '../../components/utils/Screens';
import { useAppTheme } from '../../theme';

const ATTENDANCE_COLUMNS = [
    { key: '#', label: '#' },
    { key: 'DEPTNAME', label: 'Department', getValue: (item) => item?.DEPTNAME || '-' },
    { key: 'PREMALE', label: 'Present Male', getValue: (item) => Number(item?.PREMALE || 0) },
    { key: 'ABSMALE', label: 'Absent Male', getValue: (item) => Number(item?.ABSMALE || 0) },
    { key: 'TOTMALE', label: 'Total Male', getValue: (item) => Number(item?.PREMALE || 0) + Number(item?.ABSMALE || 0) },
    { key: 'PREFEMALE', label: 'Present Female', getValue: (item) => Number(item?.PREFEMALE || 0) },
    { key: 'ABSFEMALE', label: 'Absent Female', getValue: (item) => Number(item?.ABSFEMALE || 0) },
    { key: 'TOTFEMALE', label: 'Total Female', getValue: (item) => Number(item?.PREFEMALE || 0) + Number(item?.ABSFEMALE || 0) },
    { key: 'TOTSTRENGTH', label: 'Strength', getValue: (item) => Number(item?.PREMALE || 0) + Number(item?.ABSMALE || 0) + Number(item?.PREFEMALE || 0) + Number(item?.ABSFEMALE || 0) },
    { key: 'TOTPRESENT', label: 'Total Present', getValue: (item) => Number(item?.PREMALE || 0) + Number(item?.PREFEMALE || 0) },
    { key: 'TOTABSENT', label: 'Total Absent', getValue: (item) => Number(item?.ABSMALE || 0) + Number(item?.ABSFEMALE || 0) },
];

export default function AttendanceReport({ navigation }) {
    const { theme } = useAppTheme();
    const [date, setDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [uniqueDepartments, setUniqueDepartments] = useState([]);
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [filter_enable, set_filter_enable] = useState(false);
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportingType, setExportingType] = useState(null);

    const handleExportPdf = async () => {
        try {
            setIsExporting(true);
            setExportingType('pdf');
            await exportReportToPdf({
                title: 'Attendance Report',
                subtitle: `Date: ${moment(date).format('DD MMM YYYY')}`,
                columns: ATTENDANCE_COLUMNS,
                data: tableData,
                fileName: `Attendance_Report_${moment(date).format('YYYYMMDD')}`,
            });
            setExportModalVisible(false);
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
            await exportReportToExcel({
                title: 'Attendance Report',
                subtitle: `Date: ${moment(date).format('DD MMM YYYY')}`,
                columns: ATTENDANCE_COLUMNS,
                data: tableData,
                fileName: `Attendance_Report_${moment(date).format('YYYYMMDD')}`,
                sheetName: 'Attendance Report',
            });
            setExportModalVisible(false);
        } catch (err) {
            Alert.alert('Export Error', err?.message || 'Failed to export Excel');
        } finally {
            setIsExporting(false);
            setExportingType(null);
        }
    };
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const styles = useMemo(() => createStyles(theme, isTablet), [theme, isTablet]);

    const serializedDate = date instanceof Date 
      ? date.toISOString() 
      : (date ? String(date) : new Date().toISOString());

    const { 
      data, 
      isLoading, 
      isFetching, 
      refetch 
    } = useGetMisDashboardOrdersInHandMonthWiseQuery({ params: { date: serializedDate } });
    
    const rawTableData = data?.data || [];
    
    // Extract unique departments and categories when data changes
    useEffect(() => {
        if (rawTableData.length > 0) {
            const departments = [...new Set(rawTableData.map(item => item.DEPTNAME).filter(Boolean))];
            const categories = [...new Set(rawTableData.map(item => item.BANDID).filter(Boolean))];
            
            setUniqueDepartments(['all', ...departments]);
            setUniqueCategories(['all', ...categories]);
        }
    }, [rawTableData]);

    // Filter data based on selected filters
    const tableData = useMemo(() => {
        return rawTableData.filter(item => {
            const departmentMatch = departmentFilter === 'all' || item.DEPTNAME === departmentFilter;
            const categoryMatch = categoryFilter === 'all' || item.BANDID === categoryFilter;
            return departmentMatch && categoryMatch;
        });
    }, [rawTableData, departmentFilter, categoryFilter]);

    // Aggregate summary KPI totals
    const totals = useMemo(() => {
        return tableData.reduce((acc, item) => {
            const preMale = Number(item?.PREMALE || 0);
            const absMale = Number(item?.ABSMALE || 0);
            const preFemale = Number(item?.PREFEMALE || 0);
            const absFemale = Number(item?.ABSFEMALE || 0);

            const totMale = preMale + absMale;
            const totFemale = preFemale + absFemale;

            acc.totMale += totMale;
            acc.preMale += preMale;
            acc.absMale += absMale;

            acc.totFemale += totFemale;
            acc.preFemale += preFemale;
            acc.absFemale += absFemale;

            acc.totalStaff += (totMale + totFemale);
            acc.totalPresent += (preMale + preFemale);
            acc.totalAbsent += (absMale + absFemale);
            return acc;
        }, {
            totMale: 0, preMale: 0, absMale: 0,
            totFemale: 0, preFemale: 0, absFemale: 0,
            totalStaff: 0, totalPresent: 0, totalAbsent: 0,
        });
    }, [tableData]);

    const attendanceRate = totals.totalStaff > 0
        ? Math.round((totals.totalPresent / totals.totalStaff) * 100)
        : 0;

    const hasActiveFilter = departmentFilter !== 'all' || categoryFilter !== 'all';

    // Column widths adjusted for responsiveness
    const columnWidths = useMemo(() => ({
        sno: isTablet ? 60 : 46,
        category: isTablet ? 180 : 140,
        department: isTablet ? 200 : 150,
        genderGroup: isTablet ? 240 : 210,
        subColumn: isTablet ? 80 : 70
    }), [isTablet]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.loadingText}>Loading attendance report...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Common Header Bar */}
            <View style={styles.header}>
                {navigation?.canGoBack?.() && (
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                )}
                <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Attendance Report</Text>
                    <Text style={styles.headerSubtitle}>
                        {tableData.length} records · {moment(date).format('DD MMM YYYY')}
                    </Text>
                </View>
                <View style={styles.headerRightActions}>
                    <TouchableOpacity
                        style={styles.exportToggleBtn}
                        onPress={() => setExportModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="tray-arrow-down"
                            size={18}
                            color={theme.colors.brand}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterToggleBtn,
                            filter_enable && styles.filterToggleBtnActive,
                            hasActiveFilter && styles.filterToggleBtnBadge,
                        ]}
                        onPress={() => set_filter_enable(!filter_enable)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={filter_enable ? "filter-remove" : "filter-variant"}
                            size={18}
                            color={filter_enable ? theme.colors.danger : theme.colors.brand}
                        />
                        {hasActiveFilter && !filter_enable && (
                            <View style={styles.activeFilterDot}>
                                <Text style={styles.activeFilterDotText}>!</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date Navigation Bar */}
            <View style={styles.dateBar}>
                <TouchableOpacity
                    style={styles.dateNavBtn}
                    onPress={() => setDate(d => moment(d).subtract(1, 'day').toDate())}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={styles.datePickerWrap}>
                    <DateInput 
                        date={date} 
                        setDate={setDate} 
                        style={styles.datePicker}
                    />
                </View>

                <TouchableOpacity
                    style={styles.dateNavBtn}
                    onPress={() => setDate(d => moment(d).add(1, 'day').toDate())}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.text} />
                </TouchableOpacity>

                {!moment(date).isSame(moment(), 'day') && (
                    <TouchableOpacity
                        style={styles.todayBtn}
                        onPress={() => setDate(new Date())}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="calendar-today" size={12} color={theme.colors.brand} />
                        <Text style={styles.todayBtnText}>Today</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Collapsible Filter Panel */}
            {filter_enable && (
                <View style={styles.filterSection}>
                    <View style={styles.filterRow}>
                        <View style={styles.filterField}>
                            <Text style={styles.filterLabel}>Department</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={departmentFilter}
                                    style={styles.picker}
                                    dropdownIconColor={theme.colors.text}
                                    onValueChange={(itemValue) => setDepartmentFilter(itemValue)}
                                >
                                    {uniqueDepartments.map((dept, index) => (
                                        <Picker.Item 
                                            key={`dept-${index}`} 
                                            label={dept === 'all' ? 'All Departments' : dept} 
                                            value={dept} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.filterField}>
                            <Text style={styles.filterLabel}>Category</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={categoryFilter}
                                    style={styles.picker}
                                    dropdownIconColor={theme.colors.text}
                                    onValueChange={(itemValue) => setCategoryFilter(itemValue)}
                                >
                                    {uniqueCategories.map((cat, index) => (
                                        <Picker.Item 
                                            key={`cat-${index}`} 
                                            label={cat === 'all' ? 'All Categories' : cat} 
                                            value={cat} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {hasActiveFilter && (
                        <TouchableOpacity 
                            style={styles.clearFilterBtn}
                            onPress={() => {
                                setDepartmentFilter('all');
                                setCategoryFilter('all');
                            }}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="refresh" size={14} color={theme.colors.danger} />
                            <Text style={styles.clearFilterText}>Reset Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Main Content Area */}
            <ScrollView 
                style={styles.outerScroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.brand]}
                        tintColor={theme.colors.brand}
                    />
                }
            >
                {/* KPI Summary Cards */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderLeftColor: theme.colors.success }]}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Present</Text>
                            <View style={[styles.statBadge, { backgroundColor: theme.colors.successSoft }]}>
                                <Text style={[styles.statBadgeText, { color: theme.colors.success }]}>{attendanceRate}%</Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>
                            {totals.totalPresent} <Text style={styles.statTotal}>/ {totals.totalStaff}</Text>
                        </Text>
                    </View>

                    <View style={[styles.statCard, { borderLeftColor: theme.colors.danger }]}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Absent</Text>
                            <View style={[styles.statBadge, { backgroundColor: theme.colors.dangerSoft }]}>
                                <MaterialCommunityIcons name="account-remove" size={12} color={theme.colors.danger} />
                            </View>
                        </View>
                        <Text style={[styles.statValue, { color: theme.colors.danger }]}>
                            {totals.totalAbsent}
                        </Text>
                    </View>

                    <View style={[styles.statCard, { borderLeftColor: theme.colors.brand }]}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Male</Text>
                            <View style={[styles.statBadge, { backgroundColor: theme.colors.brandSoft }]}>
                                <Text style={[styles.statBadgeText, { color: theme.colors.brand }]}>
                                    {totals.totMale > 0 ? Math.round((totals.preMale / totals.totMale) * 100) : 0}%
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>
                            {totals.preMale} <Text style={styles.statTotal}>/ {totals.totMale}</Text>
                        </Text>
                    </View>

                    <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Female</Text>
                            <View style={[styles.statBadge, { backgroundColor: '#EDE9FE' }]}>
                                <Text style={[styles.statBadgeText, { color: '#8B5CF6' }]}>
                                    {totals.totFemale > 0 ? Math.round((totals.preFemale / totals.totFemale) * 100) : 0}%
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.statValue}>
                            {totals.preFemale} <Text style={styles.statTotal}>/ {totals.totFemale}</Text>
                        </Text>
                    </View>
                </View>

                {/* Table Section */}
                <View style={styles.tableCard}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={true}
                    >
                        <View>
                            {/* Table Header Row */}
                            <View style={styles.headerRow}>
                                <View style={[styles.headerCell, { width: columnWidths.sno }]}>
                                    <Text style={styles.headerText}>#</Text>
                                </View>
                                <View style={[styles.headerCell, { width: columnWidths.category }]}>
                                    <Text style={styles.headerText}>Category</Text>
                                </View>
                                <View style={[styles.headerCell, { width: columnWidths.department }]}>
                                    <Text style={styles.headerText}>Department</Text>
                                </View>

                                {/* Male Group */}
                                <View style={[styles.genderGroupHeader, { width: columnWidths.genderGroup }]}>
                                    <View style={styles.genderTitleRow}>
                                        <MaterialCommunityIcons name="gender-male" size={14} color="#FFFFFF" />
                                        <Text style={styles.genderTitleText}>Male</Text>
                                    </View>
                                    <View style={styles.subHeaderRow}>
                                        <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                            <Text style={styles.subHeaderText}>Total</Text>
                                        </View>
                                        <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                            <Text style={styles.subHeaderText}>Present</Text>
                                        </View>
                                        <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                            <Text style={styles.subHeaderText}>Absent</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Female Group */}
                                <View style={[styles.genderGroupHeader, { width: columnWidths.genderGroup }]}>
                                    <View style={styles.genderTitleRow}>
                                        <MaterialCommunityIcons name="gender-female" size={14} color="#FFFFFF" />
                                        <Text style={styles.genderTitleText}>Female</Text>
                                    </View>
                                    <View style={styles.subHeaderRow}>
                                        <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                            <Text style={styles.subHeaderText}>Total</Text>
                                        </View>
                                        <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                            <Text style={styles.subHeaderText}>Present</Text>
                                        </View>
                                        <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                            <Text style={styles.subHeaderText}>Absent</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Table Data Rows */}
                            {tableData.length > 0 ? (
                                tableData.map((item, index) => {
                                    const preM = Number(item?.PREMALE || 0);
                                    const absM = Number(item?.ABSMALE || 0);
                                    const totM = preM + absM;

                                    const preF = Number(item?.PREFEMALE || 0);
                                    const absF = Number(item?.ABSFEMALE || 0);
                                    const totF = preF + absF;

                                    return (
                                        <View 
                                            key={index}
                                            style={[
                                                styles.dataRow,
                                                index % 2 === 0 ? styles.evenRow : styles.oddRow
                                            ]}
                                        >
                                            <View style={[styles.cell, { width: columnWidths.sno }]}>
                                                <Text style={styles.cellMuted}>{index + 1}</Text>
                                            </View>
                                            <View style={[styles.cell, styles.cellLeft, { width: columnWidths.category }]}>
                                                <Text style={styles.cellBold} numberOfLines={1}>{item.BANDID || '—'}</Text>
                                            </View>
                                            <View style={[styles.cell, styles.cellLeft, { width: columnWidths.department }]}>
                                                <Text style={styles.cellText} numberOfLines={1}>{item.DEPTNAME || '—'}</Text>
                                            </View>

                                            {/* Male Numbers */}
                                            <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                                <Text style={styles.cellText}>{totM}</Text>
                                            </View>
                                            <View style={[styles.cell, { width: columnWidths.subColumn, backgroundColor: preM > 0 ? theme.colors.successSoft : 'transparent' }]}>
                                                <Text style={[styles.cellText, { color: preM > 0 ? theme.colors.success : theme.colors.textSecondary, fontWeight: '600' }]}>{preM}</Text>
                                            </View>
                                            <View style={[styles.cell, { width: columnWidths.subColumn, backgroundColor: absM > 0 ? theme.colors.dangerSoft : 'transparent' }]}>
                                                <Text style={[styles.cellText, { color: absM > 0 ? theme.colors.danger : theme.colors.textSecondary, fontWeight: absM > 0 ? '700' : '400' }]}>{absM}</Text>
                                            </View>

                                            {/* Female Numbers */}
                                            <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                                <Text style={styles.cellText}>{totF}</Text>
                                            </View>
                                            <View style={[styles.cell, { width: columnWidths.subColumn, backgroundColor: preF > 0 ? theme.colors.successSoft : 'transparent' }]}>
                                                <Text style={[styles.cellText, { color: preF > 0 ? theme.colors.success : theme.colors.textSecondary, fontWeight: '600' }]}>{preF}</Text>
                                            </View>
                                            <View style={[styles.cell, { width: columnWidths.subColumn, backgroundColor: absF > 0 ? theme.colors.dangerSoft : 'transparent' }]}>
                                                <Text style={[styles.cellText, { color: absF > 0 ? theme.colors.danger : theme.colors.textSecondary, fontWeight: absF > 0 ? '700' : '400' }]}>{absF}</Text>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="clipboard-text-search-outline" size={40} color={theme.colors.borderStrong || '#CBD5E1'} />
                                    <Text style={styles.emptyTitle}>No attendance data found</Text>
                                    <Text style={styles.emptySubtitle}>Try changing the date or clearing active filters</Text>
                                </View>
                            )}

                            {/* Summary / Totals Row */}
                            {tableData.length > 0 && (
                                <View style={[styles.dataRow, styles.totalsRow]}>
                                    <View style={[styles.cell, { width: columnWidths.sno }]}>
                                        <MaterialCommunityIcons name="sigma" size={15} color={theme.colors.brand} />
                                    </View>
                                    <View style={[styles.cell, styles.cellLeft, { width: columnWidths.category + columnWidths.department }]}>
                                        <Text style={styles.totalsLabel}>TOTAL ({tableData.length} records)</Text>
                                    </View>

                                    {/* Male Totals */}
                                    <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.totalsValue}>{totals.totMale}</Text>
                                    </View>
                                    <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                        <Text style={[styles.totalsValue, { color: theme.colors.success }]}>{totals.preMale}</Text>
                                    </View>
                                    <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                        <Text style={[styles.totalsValue, { color: totals.absMale > 0 ? theme.colors.danger : theme.colors.text }]}>{totals.absMale}</Text>
                                    </View>

                                    {/* Female Totals */}
                                    <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.totalsValue}>{totals.totFemale}</Text>
                                    </View>
                                    <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                        <Text style={[styles.totalsValue, { color: theme.colors.success }]}>{totals.preFemale}</Text>
                                    </View>
                                    <View style={[styles.cell, { width: columnWidths.subColumn }]}>
                                        <Text style={[styles.totalsValue, { color: totals.absFemale > 0 ? theme.colors.danger : theme.colors.text }]}>{totals.absFemale}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
            <ExportReportModal
                visible={exportModalVisible}
                onClose={() => setExportModalVisible(false)}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportExcel}
                isExporting={isExporting}
                exportingType={exportingType}
                recordCount={tableData.length}
                reportTitle="Attendance Report"
                theme={theme}
            />
        </View>
    );
}

const createStyles = (theme, isTablet) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        loadingText: {
            marginTop: 14,
            fontSize: theme.fontSizes.sm || 14,
            color: theme.colors.textSecondary,
            fontWeight: theme.fontWeights.medium || '500',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md || 16,
            paddingVertical: theme.spacing.sm || 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.sm || 12,
        },
        headerTextWrap: {
            flex: 1,
        },
        headerTitle: {
            fontSize: theme.fontSizes.md || 17,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
        },
        headerSubtitle: {
            fontSize: theme.fontSizes.xs || 11.5,
            color: theme.colors.textSecondary,
            marginTop: 1,
        },
        headerRightActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        exportToggleBtn: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
        },
        filterToggleBtn: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        filterToggleBtnActive: {
            backgroundColor: theme.colors.dangerSoft,
        },
        filterToggleBtnBadge: {
            backgroundColor: theme.colors.brandSoft,
        },
        activeFilterDot: {
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: theme.colors.brand,
            borderRadius: 9,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
        },
        activeFilterDotText: {
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: 'bold',
        },
        dateBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md || 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
            gap: 8,
        },
        dateNavBtn: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
        },
        datePickerWrap: {
            flex: 1,
        },
        datePicker: {
            width: '100%',
        },
        todayBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.brandSoft,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
            gap: 4,
        },
        todayBtnText: {
            fontSize: 11.5,
            fontWeight: '600',
            color: theme.colors.brand,
        },
        filterSection: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md || 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
        },
        filterRow: {
            flexDirection: isTablet ? 'row' : 'column',
            gap: 12,
        },
        filterField: {
            flex: 1,
        },
        filterLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: theme.radii.md || 8,
            backgroundColor: theme.colors.surfaceSunken,
            overflow: 'hidden',
        },
        picker: {
            height: 44,
            width: '100%',
            color: theme.colors.text,
        },
        clearFilterBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            marginTop: 10,
            gap: 6,
        },
        clearFilterText: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.danger,
        },
        outerScroll: {
            flex: 1,
        },
        scrollContent: {
            padding: theme.spacing.md || 16,
            paddingBottom: 40,
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 14,
        },
        statCard: {
            flex: 1,
            minWidth: isTablet ? 160 : '47%',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.md || 10,
            borderLeftWidth: 3.5,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            shadowColor: theme.colors.shadow || 'rgba(0,0,0,0.03)',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
        },
        statTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 11,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
        },
        statBadge: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
        },
        statBadgeText: {
            fontSize: 10.5,
            fontWeight: '700',
        },
        statValue: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text,
        },
        statTotal: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.colors.textSecondary,
        },
        tableCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg || 12,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            overflow: 'hidden',
            shadowColor: theme.colors.shadow || 'rgba(0,0,0,0.05)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
        headerRow: {
            flexDirection: 'row',
            backgroundColor: theme.colors.brand,
        },
        headerCell: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.15)',
        },
        headerText: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 12,
            textAlign: 'center',
        },
        genderGroupHeader: {
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.15)',
        },
        genderTitleRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.15)',
            gap: 4,
        },
        genderTitleText: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 12,
        },
        subHeaderRow: {
            flexDirection: 'row',
        },
        subHeaderCell: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 6,
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.15)',
        },
        subHeaderText: {
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 11,
            opacity: 0.9,
        },
        dataRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
            minHeight: 44,
        },
        evenRow: {
            backgroundColor: theme.colors.surface,
        },
        oddRow: {
            backgroundColor: theme.colors.surfaceSunken,
        },
        cell: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderRightWidth: 1,
            borderRightColor: theme.colors.borderSubtle,
        },
        cellLeft: {
            alignItems: 'flex-start',
        },
        cellText: {
            fontSize: 12,
            color: theme.colors.text,
        },
        cellBold: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.text,
        },
        cellMuted: {
            fontSize: 11.5,
            color: theme.colors.textSecondary,
        },
        totalsRow: {
            backgroundColor: theme.colors.brandSoft,
            borderTopWidth: 2,
            borderTopColor: theme.colors.brand,
            borderBottomWidth: 0,
        },
        totalsLabel: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.colors.brand,
        },
        totalsValue: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.colors.text,
        },
        emptyContainer: {
            padding: 36,
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: screenWidth - 32,
        },
        emptyTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.colors.text,
            marginTop: 10,
            marginBottom: 2,
        },
        emptySubtitle: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    });
