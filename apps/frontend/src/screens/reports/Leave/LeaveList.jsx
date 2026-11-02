import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { Dropdown } from '../../../components/reusable_components/Inputs';
import { screenWidth } from '../../../components/utils/Screens';
import { useGetEmployeeidsQuery } from '../../../store/api/UserApi';
import { useGet__per_categoryQuery } from '../../../store/api/PermissionApi';
import { useGetHod_showable_dataQuery } from '../../../store/api/LeaveApi';
import FilterModel from '../../../components/filter_modal/FilterModel';
import { useAppTheme } from '../../../theme';

const LeaveList = ({ navigation }) => {
    const { theme } = useAppTheme();
    const [Idcard_filter, setIdCard_Idcard] = useState([]);
    const [category, setCategory] = useState();
    const [selected_item_status, setSelected_item_status] = useState('');
    const [status_filter, set_status_filter] = useState();
    const [showFilters, setShowFilters] = useState(false);
    const [My_permission, set_My_permission] = useState(true);
    const [more_model, setmore_model] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const UserSelect = useSelector((state) => state?.UserDetails);
    const { data: get_per_category, isLoading: get_cayegory_loading } = useGet__per_categoryQuery();
    const { data, isLoading, isFetching } = useGetHod_showable_dataQuery({
        params: My_permission ? { id: UserSelect?.UserId } : { hod: UserSelect?.UserId },
    });
    const { data: employee, isLoading: loading_employee } = useGetEmployeeidsQuery();

    const clearFilters = () => {
        setSearchQuery('');
        setCategory(null);
        setIdCard_Idcard([]);
        set_status_filter(null);
    };

    const getStatusStyle = (status) => {
        const s = String(status || '').toLowerCase();
        if (s === 'approved') {
            return {
                bg: theme.colors.successSoft || '#DCFCE7',
                color: theme.colors.success || '#15803D',
                label: 'APPROVED',
            };
        }
        if (s === 'rejected') {
            return {
                bg: theme.colors.dangerSoft || '#FEE2E2',
                color: theme.colors.danger || '#B91C1C',
                label: 'REJECTED',
            };
        }
        return {
            bg: theme.colors.warningSoft || '#FEF3C7',
            color: theme.colors.warning || '#B45309',
            label: 'PENDING',
        };
    };

    const handleTabSwitch = (tab) => {
        set_My_permission(tab === 'my');
    };

    const Filtered_data = useMemo(() => {
        if (!data?.data?.length) return [];
        return data.data.filter((item) => {
            const matchesId = Idcard_filter?.length === 0 || Idcard_filter.includes(item.userId);
            const matchesStatus = !status_filter || item.approvalStatus === status_filter;
            const matchesCategory = !category || item.category === category;
            const docIdStr = String(item.docid || '').toLowerCase();
            const empStr = String(item.createdBy_user?.username || '').toLowerCase();
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || docIdStr.includes(q) || empStr.includes(q);
            return matchesId && matchesStatus && matchesSearch && matchesCategory;
        });
    }, [data?.data, Idcard_filter, status_filter, category, searchQuery]);

    const activeFilterCount = (Idcard_filter.length > 0 ? 1 : 0) +
        (category ? 1 : 0) +
        (status_filter ? 1 : 0) +
        (searchQuery ? 1 : 0);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const renderItem = ({ item }) => {
        const statusMeta = getStatusStyle(item.approvalStatus);
        const durationDays = moment(item.toDate).diff(moment(item.fromDate), 'days') + 1;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    setSelectedItem(item);
                    setSelected_item_status(item?.approvalStatus);
                    setmore_model(true);
                }}
                activeOpacity={0.8}
            >
                {/* Card Top: Doc ID + Status Badge */}
                <View style={styles.cardHeader}>
                    <View style={styles.docIdBadge}>
                        <MaterialCommunityIcons name="pound" size={12} color={theme.colors.brand} />
                        <Text style={styles.cardId}>{item.docid}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                        <Text style={[styles.statusText, { color: statusMeta.color }]}>
                            {statusMeta.label}
                        </Text>
                    </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                    {/* Employee Row */}
                    <View style={styles.employeeRow}>
                        <View style={styles.avatarCircle}>
                            <MaterialCommunityIcons
                                name="account"
                                size={18}
                                color={theme.colors.brand}
                            />
                        </View>
                        <View style={styles.employeeInfo}>
                            <Text style={styles.employeeName} numberOfLines={1}>
                                {item.createdBy_user?.username || 'Employee'}
                            </Text>
                            <Text style={styles.requestDate}>
                                Requested: {moment(item.docDate).format('DD MMM YYYY')}
                            </Text>
                        </View>
                    </View>

                    {/* Date Range Strip */}
                    <View style={styles.dateRangeBox}>
                        <View style={styles.dateBlock}>
                            <Text style={styles.dateBlockLabel}>FROM</Text>
                            <Text style={styles.dateBlockValue}>
                                {moment(item.fromDate).format('DD MMM YYYY')}
                            </Text>
                        </View>
                        <View style={styles.rangeDivider}>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={16}
                                color={theme.colors.textMuted}
                            />
                            <View style={styles.durationPill}>
                                <Text style={styles.durationText}>
                                    {durationDays} {durationDays === 1 ? 'day' : 'days'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.dateBlock}>
                            <Text style={styles.dateBlockLabel}>TO</Text>
                            <Text style={styles.dateBlockValue}>
                                {moment(item.toDate).format('DD MMM YYYY')}
                            </Text>
                        </View>
                    </View>

                    {/* Reason Snippet */}
                    {!!item.reason && (
                        <View style={styles.reasonRow}>
                            <MaterialCommunityIcons
                                name="text"
                                size={14}
                                color={theme.colors.textMuted}
                            />
                            <Text style={styles.reasonText} numberOfLines={1}>
                                {item.reason}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.moreText}>View full details</Text>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={16}
                        color={theme.colors.brand}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading || isFetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.loadingText}>Fetching leave requests...</Text>
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
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={20}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                )}
                <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Leave Report</Text>
                    <Text style={styles.headerSubtitle}>
                        {Filtered_data.length} {Filtered_data.length === 1 ? 'record' : 'records'} found
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.filterToggleBtn,
                        showFilters && styles.filterToggleBtnActive,
                        activeFilterCount > 0 && styles.filterToggleBtnBadge,
                    ]}
                    onPress={() => setShowFilters(!showFilters)}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={showFilters ? 'filter-remove' : 'filter-variant'}
                        size={18}
                        color={showFilters ? theme.colors.danger : theme.colors.brand}
                    />
                    {activeFilterCount > 0 && (
                        <View style={styles.activeFilterDot}>
                            <Text style={styles.activeFilterDotText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Segmented Control: My Leaves vs Team Leaves */}
            <View style={styles.tabBar}>
                <View style={styles.segmentedControl}>
                    <TouchableOpacity
                        style={[styles.segment, My_permission && styles.segmentActive]}
                        onPress={() => handleTabSwitch('my')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.segmentText, My_permission && styles.segmentTextActive]}>
                            My Leaves
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segment, !My_permission && styles.segmentActive]}
                        onPress={() => handleTabSwitch('all')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.segmentText, !My_permission && styles.segmentTextActive]}>
                            Team Leaves
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Expandable Filter Box */}
            {showFilters && (
                <View style={styles.filterSection}>
                    <View style={styles.searchWrap}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={18}
                            color={theme.colors.textMuted}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            placeholder="Search by Doc ID or employee..."
                            placeholderTextColor={theme.colors.textMuted}
                        />
                        {!!searchQuery && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons
                                    name="close-circle"
                                    size={16}
                                    color={theme.colors.textMuted}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.filterRow}>
                        <Dropdown
                            selected={category}
                            isLoading={get_cayegory_loading}
                            label="Filter by Category"
                            _label="label"
                            _value="value"
                            width={screenWidth * 0.85}
                            setSelected={setCategory}
                            options={get_per_category}
                            zIndex={300}
                            style={styles.dropdown}
                        />
                    </View>

                    <View style={styles.filterRow}>
                        <Dropdown
                            selected={Idcard_filter}
                            isLoading={loading_employee}
                            label="Filter by Employee"
                            multiple
                            width={screenWidth * 0.85}
                            setSelected={setIdCard_Idcard}
                            options={employee}
                            zIndex={300}
                            style={styles.dropdown}
                        />
                    </View>

                    <View style={styles.filterRow}>
                        <Dropdown
                            selected={status_filter}
                            label="Filter by Status"
                            width={screenWidth * 0.85}
                            _label="label"
                            _value="value"
                            setSelected={set_status_filter}
                            options={{
                                data: [
                                    { label: '✔ Approved', value: 'approved' },
                                    { label: '❌ Rejected', value: 'rejected' },
                                    { label: '⏳ Pending', value: 'pending' },
                                ],
                            }}
                            zIndex={299}
                            style={styles.dropdown}
                        />
                    </View>

                    <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.7}>
                        <MaterialCommunityIcons name="refresh" size={14} color={theme.colors.danger} />
                        <Text style={styles.clearBtnText}>Reset Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* List or Empty State */}
            {Filtered_data?.length > 0 ? (
                <FlatList
                    data={Filtered_data}
                    keyExtractor={(item) => String(item.docid)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconCircle}>
                        <MaterialCommunityIcons
                            name="calendar-blank-outline"
                            size={44}
                            color={theme.colors.brand}
                        />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Leave Records Found</Text>
                    <Text style={styles.emptyStateText}>
                        {showFilters
                            ? 'No requests match your current filters. Try resetting filters.'
                            : 'There are no leave records to display at this time.'}
                    </Text>
                    {showFilters && (
                        <TouchableOpacity
                            style={styles.emptyResetBtn}
                            onPress={clearFilters}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Details Modal */}
            <View style={{ position: 'absolute' }}>
                <FilterModel
                    close="direct"
                    modalVisible={more_model}
                    style={{ backgroundColor: getStatusStyle(selected_item_status).color }}
                    setModalVisible={setmore_model}
                    name="Leave Details"
                >
                    {selectedItem && (
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Request Summary</Text>
                                <View
                                    style={[
                                        styles.modalStatus,
                                        { backgroundColor: getStatusStyle(selectedItem.approvalStatus).bg },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.modalStatusText,
                                            { color: getStatusStyle(selectedItem.approvalStatus).color },
                                        ]}
                                    >
                                        {selectedItem.approvalStatus}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Basic Information</Text>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <MaterialCommunityIcons
                                            name="identifier"
                                            size={16}
                                            color={theme.colors.textMuted}
                                        />
                                        <Text style={styles.labelText}>Doc ID</Text>
                                    </View>
                                    <Text style={styles.detailValue}>#{selectedItem.docid}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <MaterialCommunityIcons
                                            name="account"
                                            size={16}
                                            color={theme.colors.textMuted}
                                        />
                                        <Text style={styles.labelText}>Employee</Text>
                                    </View>
                                    <Text style={styles.detailValue}>
                                        {selectedItem.createdBy_user?.username || 'Employee'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <MaterialCommunityIcons
                                            name="calendar-clock"
                                            size={16}
                                            color={theme.colors.textMuted}
                                        />
                                        <Text style={styles.labelText}>Request Date</Text>
                                    </View>
                                    <Text style={styles.detailValue}>
                                        {moment(selectedItem.docDate).format('DD MMM YYYY')}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Leave Period</Text>
                                <View style={styles.dateDetailRow}>
                                    <View style={styles.dateDetailBlock}>
                                        <MaterialCommunityIcons
                                            name="calendar-start"
                                            size={16}
                                            color={theme.colors.brand}
                                        />
                                        <Text style={styles.dateDetailLabel}>From</Text>
                                        <Text style={styles.dateDetailValue}>
                                            {moment(selectedItem.fromDate).format('DD MMM YYYY')}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="arrow-right"
                                        size={20}
                                        color={theme.colors.textMuted}
                                    />
                                    <View style={styles.dateDetailBlock}>
                                        <MaterialCommunityIcons
                                            name="calendar-end"
                                            size={16}
                                            color={theme.colors.brand}
                                        />
                                        <Text style={styles.dateDetailLabel}>To</Text>
                                        <Text style={styles.dateDetailValue}>
                                            {moment(selectedItem.toDate).format('DD MMM YYYY')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <MaterialCommunityIcons
                                            name="clock-outline"
                                            size={16}
                                            color={theme.colors.textMuted}
                                        />
                                        <Text style={styles.labelText}>Total Duration</Text>
                                    </View>
                                    <Text style={styles.detailValue}>
                                        {moment(selectedItem.toDate).diff(moment(selectedItem.fromDate), 'days') + 1} days
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Additional Information</Text>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <MaterialCommunityIcons
                                            name="text-box-outline"
                                            size={16}
                                            color={theme.colors.textMuted}
                                        />
                                        <Text style={styles.labelText}>Reason</Text>
                                    </View>
                                    <Text style={[styles.detailValue, { flex: 2, textAlign: 'right' }]}>
                                        {selectedItem.reason || 'No reason provided'}
                                    </Text>
                                </View>

                                {!!selectedItem.category && (
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLabel}>
                                            <MaterialCommunityIcons
                                                name="tag-outline"
                                                size={16}
                                                color={theme.colors.textMuted}
                                            />
                                            <Text style={styles.labelText}>Category</Text>
                                        </View>
                                        <Text style={styles.detailValue}>{selectedItem.category}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </FilterModel>
            </View>
        </View>
    );
};

const createStyles = (theme) =>
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
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.sm || 14,
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
        tabBar: {
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md || 16,
            paddingVertical: theme.spacing.xs || 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
        },
        segmentedControl: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.pill || 99,
            padding: 3,
        },
        segment: {
            flex: 1,
            paddingVertical: 7,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radii.pill || 99,
        },
        segmentActive: {
            backgroundColor: theme.colors.brand,
            shadowColor: theme.colors.brand,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 2,
        },
        segmentText: {
            fontSize: theme.fontSizes.xs || 13,
            fontWeight: theme.fontWeights.medium || '500',
            color: theme.colors.textSecondary,
        },
        segmentTextActive: {
            color: '#FFFFFF',
            fontWeight: theme.fontWeights.bold || '700',
        },
        filterSection: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md || 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
        },
        searchWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.md || 10,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            paddingHorizontal: 12,
            height: 42,
            marginBottom: 12,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            height: 42,
            fontSize: theme.fontSizes.xs || 13,
            color: theme.colors.text,
            padding: 0,
        },
        filterRow: {
            marginBottom: 10,
        },
        dropdown: {
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.sm || 8,
        },
        clearBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            gap: 6,
        },
        clearBtnText: {
            color: theme.colors.danger,
            fontSize: theme.fontSizes.xs || 12,
            fontWeight: theme.fontWeights.semibold || '600',
        },
        listContent: {
            padding: theme.spacing.md || 16,
            paddingBottom: 36,
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg || 14,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            padding: theme.spacing.md || 16,
            marginBottom: theme.spacing.md || 14,
            shadowColor: theme.colors.shadow || 'rgba(0,0,0,0.05)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
        },
        docIdBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSunken,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: theme.radii.xs || 6,
            gap: 4,
        },
        cardId: {
            fontSize: theme.fontSizes.xs || 12,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: theme.radii.pill || 99,
            gap: 5,
        },
        statusDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
        },
        statusText: {
            fontSize: 10.5,
            fontWeight: theme.fontWeights.bold || '700',
            letterSpacing: 0.3,
        },
        cardBody: {
            marginBottom: 8,
        },
        employeeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        avatarCircle: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
        },
        employeeInfo: {
            flex: 1,
        },
        employeeName: {
            fontSize: theme.fontSizes.sm || 14,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
        },
        requestDate: {
            fontSize: theme.fontSizes.micro || 11,
            color: theme.colors.textSecondary,
            marginTop: 1,
        },
        dateRangeBox: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.md || 10,
            padding: 10,
            marginBottom: 10,
        },
        dateBlock: {
            flex: 1,
        },
        dateBlockLabel: {
            fontSize: 9.5,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.textMuted,
            letterSpacing: 0.5,
        },
        dateBlockValue: {
            fontSize: theme.fontSizes.xs || 12.5,
            fontWeight: theme.fontWeights.semibold || '600',
            color: theme.colors.text,
            marginTop: 2,
        },
        rangeDivider: {
            alignItems: 'center',
            paddingHorizontal: 8,
        },
        durationPill: {
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 6,
            paddingVertical: 1,
            borderRadius: theme.radii.pill || 99,
            marginTop: 2,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
        },
        durationText: {
            fontSize: 10,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.brand,
        },
        reasonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 2,
        },
        reasonText: {
            fontSize: theme.fontSizes.xs || 12,
            color: theme.colors.textSecondary,
            flex: 1,
        },
        cardFooter: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSubtle,
        },
        moreText: {
            fontSize: theme.fontSizes.xs || 12,
            fontWeight: theme.fontWeights.semibold || '600',
            color: theme.colors.brand,
        },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            marginTop: 60,
        },
        emptyIconCircle: {
            width: 76,
            height: 76,
            borderRadius: 38,
            backgroundColor: theme.colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        emptyStateTitle: {
            fontSize: theme.fontSizes.md || 16,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
            marginBottom: 6,
        },
        emptyStateText: {
            fontSize: theme.fontSizes.xs || 12.5,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 18,
            marginBottom: 20,
        },
        emptyResetBtn: {
            backgroundColor: theme.colors.brand,
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: theme.radii.md || 8,
        },
        emptyResetBtnText: {
            color: '#FFFFFF',
            fontSize: theme.fontSizes.xs || 12.5,
            fontWeight: theme.fontWeights.bold || '700',
        },
        modalContent: {
            padding: theme.spacing.md || 16,
            width: '100%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: theme.fontSizes.md || 17,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
        },
        modalStatus: {
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: theme.radii.pill || 99,
        },
        modalStatusText: {
            fontSize: 11,
            fontWeight: theme.fontWeights.bold || '700',
            textTransform: 'uppercase',
        },
        detailSection: {
            marginBottom: 16,
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.md || 10,
            padding: 12,
        },
        sectionTitle: {
            fontSize: theme.fontSizes.xs || 12.5,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
            marginBottom: 10,
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        detailLabel: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: 6,
        },
        labelText: {
            fontSize: theme.fontSizes.xs || 12,
            color: theme.colors.textSecondary,
        },
        detailValue: {
            fontSize: theme.fontSizes.xs || 12.5,
            fontWeight: theme.fontWeights.semibold || '600',
            color: theme.colors.text,
        },
        dateDetailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            padding: 8,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.sm || 8,
        },
        dateDetailBlock: {
            alignItems: 'center',
            flex: 1,
        },
        dateDetailLabel: {
            fontSize: 10,
            color: theme.colors.textMuted,
            marginTop: 2,
        },
        dateDetailValue: {
            fontSize: theme.fontSizes.xs || 12.5,
            fontWeight: theme.fontWeights.bold || '700',
            color: theme.colors.text,
        },
    });

export default LeaveList;
