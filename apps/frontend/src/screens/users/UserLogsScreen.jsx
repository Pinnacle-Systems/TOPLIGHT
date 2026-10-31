import React, { useMemo, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useGetLoginLogsQuery } from '../../store/api/UserApi';
import { useAppTheme } from '../../theme';

const formatLogDate = value => {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const isToday = dateValue => {
    if (!dateValue) return false;
    return moment(dateValue).isSame(moment(), 'day');
};

const isYesterday = dateValue => {
    if (!dateValue) return false;
    return moment(dateValue).isSame(moment().subtract(1, 'day'), 'day');
};

const isThisWeek = dateValue => {
    if (!dateValue) return false;
    return moment(dateValue).isSame(moment(), 'week');
};

const isSameDay = (dateValue, targetDate) => {
    if (!dateValue || !targetDate) return false;
    return moment(dateValue).isSame(moment(targetDate), 'day');
};

const LoginLogCard = ({ item, theme, styles }) => {
    const rawUser = item?.user || item?.User || item?.userName || item?.username;
    const idCard = item?.idCard || item?.Idcard || item?.IDCARD;
    const compCode = item?.compCode || item?.COMPCODE;
    const deviceName = item?.mobileName || item?.MobileName;
    const deviceIp = item?.mobileIp || item?.MobileIP;

    const userName = (typeof rawUser === 'string' && rawUser.trim() && rawUser.trim().toLowerCase() !== 'unknown user')
        ? rawUser.trim()
        : (idCard ? `User ${idCard}` : 'Unknown user');

    const eventType = item?.type || 'Login';
    const statusRaw = String(item?.status || '').toLowerCase();
    const isFailed = Boolean(item?.error) || statusRaw === 'failed';
    const isSuccess = !isFailed && (statusRaw === 'success' || statusRaw === 'recorded' || !item?.status);
    const statusLabel = isFailed
        ? 'FAILED'
        : (statusRaw === 'success' ? 'SUCCESS' : (item?.status ? String(item.status).toUpperCase() : 'RECORDED'));

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, isFailed ? styles.dangerIcon : (isSuccess ? styles.successIcon : styles.neutralIcon)]}>
                    <MaterialCommunityIcons
                        name={isFailed ? 'alert-circle-outline' : (isSuccess ? 'check' : 'login')}
                        size={19}
                        color={isFailed ? theme.colors.danger : (isSuccess ? theme.colors.success : theme.colors.brand)}
                    />
                </View>
                <View style={styles.headerText}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                        {!!idCard && String(idCard).trim() !== String(userName).trim() && (
                            <View style={styles.idBadge}>
                                <Text style={styles.idBadgeText}>#{idCard}</Text>
                            </View>
                        )}
                        {!!compCode && (
                            <View style={styles.compBadge}>
                                <Text style={styles.compBadgeText}>{compCode}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.eventType}>{eventType}</Text>
                </View>
                <Text style={[styles.status, isFailed ? styles.dangerStatus : (isSuccess ? styles.successStatus : styles.neutralStatus)]}>
                    {statusLabel}
                </Text>
            </View>

            <View style={styles.logDetail}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.logDetailText}>{formatLogDate(item?.date)}</Text>
            </View>

            {!!deviceName && (
                <View style={styles.logDetail}>
                    <MaterialCommunityIcons name="cellphone" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.logDetailText}>Device: {deviceName}</Text>
                </View>
            )}

            {!!deviceIp && (
                <View style={styles.logDetail}>
                    <MaterialCommunityIcons name="ip-network-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.logDetailText}>IP: {deviceIp}</Text>
                </View>
            )}

            {!!item?.error && <Text style={styles.errorText}>{item.error}</Text>}
        </View>
    );
};

export default function UserLogsScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { data, isLoading, isError, refetch, isFetching } = useGetLoginLogsQuery();
    const logs = Array.isArray(data?.data) ? data.data : [];

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week' | 'device' | 'failed' | 'custom_date'
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Compute dynamic chip counts
    const counts = useMemo(() => {
        let today = 0;
        let yesterday = 0;
        let thisWeek = 0;
        let withDevice = 0;
        let failed = 0;

        logs.forEach(item => {
            const d = item?.date;
            if (isToday(d)) today++;
            if (isYesterday(d)) yesterday++;
            if (isThisWeek(d)) thisWeek++;
            if (item?.mobileName || item?.MobileName || item?.mobileIp || item?.MobileIP) withDevice++;
            const status = String(item?.status || '').toLowerCase();
            if (item?.error || status === 'failed') failed++;
        });

        return {
            all: logs.length,
            today,
            yesterday,
            thisWeek,
            withDevice,
            failed,
        };
    }, [logs]);

    // Filter logs according to active filters and search query
    const filteredLogs = useMemo(() => {
        return logs.filter(item => {
            if (filterType === 'today' && !isToday(item?.date)) return false;
            if (filterType === 'yesterday' && !isYesterday(item?.date)) return false;
            if (filterType === 'week' && !isThisWeek(item?.date)) return false;
            if (filterType === 'device') {
                const hasDev = !!(item?.mobileName || item?.MobileName || item?.mobileIp || item?.MobileIP);
                if (!hasDev) return false;
            }
            if (filterType === 'failed') {
                const status = String(item?.status || '').toLowerCase();
                const isFailed = Boolean(item?.error) || status === 'failed';
                if (!isFailed) return false;
            }
            if (filterType === 'custom_date') {
                if (!selectedDate || !isSameDay(item?.date, selectedDate)) return false;
            }

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();

            const rawUser = String(item?.user || item?.User || item?.userName || item?.username || '').toLowerCase();
            const idCard = String(item?.idCard || item?.Idcard || item?.IDCARD || '').toLowerCase();
            const compCode = String(item?.compCode || item?.COMPCODE || '').toLowerCase();
            const device = String(item?.mobileName || item?.MobileName || '').toLowerCase();
            const ip = String(item?.mobileIp || item?.MobileIP || '').toLowerCase();
            const type = String(item?.type || '').toLowerCase();

            return (
                rawUser.includes(q) ||
                idCard.includes(q) ||
                compCode.includes(q) ||
                device.includes(q) ||
                ip.includes(q) ||
                type.includes(q)
            );
        });
    }, [logs, filterType, selectedDate, searchQuery]);

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (event?.type === 'set' && date) {
            setSelectedDate(date);
            setFilterType('custom_date');
        }
    };

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setFilterType('all');
        setSelectedDate(null);
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.statusText}>Loading login activity...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centered}>
                <MaterialCommunityIcons name="alert-circle-outline" size={36} color={theme.colors.danger} />
                <Text style={styles.statusTitle}>Could not load login activity</Text>
                <Text style={styles.statusText}>Check your connection and try again.</Text>
                <Text accessibilityRole="button" onPress={refetch} style={styles.retry}>Try again</Text>
            </View>
        );
    }

    const hasActiveFilters = searchQuery.trim().length > 0 || filterType !== 'all';

    return (
        <View style={styles.screen}>
            {/* Header Banner */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="history" size={22} color={theme.colors.brand} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Login Activity</Text>
                    <Text style={styles.subtitle}>
                        {filteredLogs.length} of {logs.length} {logs.length === 1 ? 'record' : 'records'}
                        {hasActiveFilters ? ' (filtered)' : ''}
                    </Text>
                </View>
            </View>

            {/* Filter Section: Search bar + Chip filters */}
            <View style={styles.filterSection}>
                <View style={styles.searchBox}>
                    <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search user, ID, device, IP..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {!!searchQuery && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={styles.clearBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips Horizontal Scroll */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsRow}
                >
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'all' && styles.chipActive]}
                        onPress={() => setFilterType('all')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>
                            All ({counts.all})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, filterType === 'today' && styles.chipActive]}
                        onPress={() => setFilterType('today')}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="calendar-today"
                            size={12}
                            color={filterType === 'today' ? theme.colors.brandContrast : theme.colors.textSecondary}
                            style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.chipText, filterType === 'today' && styles.chipTextActive]}>
                            Today ({counts.today})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, filterType === 'yesterday' && styles.chipActive]}
                        onPress={() => setFilterType('yesterday')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, filterType === 'yesterday' && styles.chipTextActive]}>
                            Yesterday ({counts.yesterday})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, filterType === 'week' && styles.chipActive]}
                        onPress={() => setFilterType('week')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, filterType === 'week' && styles.chipTextActive]}>
                            This Week ({counts.thisWeek})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, filterType === 'device' && styles.chipActive]}
                        onPress={() => setFilterType('device')}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="cellphone"
                            size={12}
                            color={filterType === 'device' ? theme.colors.brandContrast : theme.colors.textSecondary}
                            style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.chipText, filterType === 'device' && styles.chipTextActive]}>
                            Device ({counts.withDevice})
                        </Text>
                    </TouchableOpacity>

                    {counts.failed > 0 && (
                        <TouchableOpacity
                            style={[styles.chip, filterType === 'failed' && styles.chipActive]}
                            onPress={() => setFilterType('failed')}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={12}
                                color={filterType === 'failed' ? theme.colors.brandContrast : theme.colors.danger}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.chipText, filterType === 'failed' && styles.chipTextActive]}>
                                Failed ({counts.failed})
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Custom Date Filter Chip */}
                    {filterType === 'custom_date' && selectedDate ? (
                        <TouchableOpacity
                            style={[styles.chip, styles.chipActive]}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="calendar"
                                size={12}
                                color={theme.colors.brandContrast}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.chipText, styles.chipTextActive]}>
                                {moment(selectedDate).format('DD MMM')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedDate(null);
                                    setFilterType('all');
                                }}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                style={{ marginLeft: 5 }}
                            >
                                <MaterialCommunityIcons name="close-circle" size={13} color={theme.colors.brandContrast} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.chip}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="calendar-outline"
                                size={12}
                                color={theme.colors.textSecondary}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={styles.chipText}>Pick Date</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            {/* Date Picker Dialog */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                />
            )}

            {/* Logs List */}
            <FlatList
                style={styles.list}
                contentContainerStyle={[
                    styles.listContent,
                    filteredLogs.length === 0 && styles.emptyList,
                ]}
                data={filteredLogs}
                keyExtractor={item => String(item?.id)}
                renderItem={({ item }) => <LoginLogCard item={item} theme={theme} styles={styles} />}
                refreshControl={
                    <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name={hasActiveFilters ? "filter-remove-outline" : "text-box-search-outline"}
                            size={42}
                            color={theme.colors.textDisabled}
                        />
                        <Text style={styles.statusTitle}>
                            {hasActiveFilters ? "No matching activity" : "No login activity found"}
                        </Text>
                        <Text style={styles.statusText}>
                            {hasActiveFilters
                                ? "Try adjusting your search query or selected filter."
                                : "No recorded logins yet."}
                        </Text>
                        {hasActiveFilters && (
                            <TouchableOpacity
                                style={styles.clearFilterButton}
                                onPress={clearFilters}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.clearFilterButtonText}>Clear filters</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSubtle,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.layout?.screenGutter || 16,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
    },
    headerIcon: {
        width: 38,
        height: 38,
        borderRadius: theme.radii.sm,
        backgroundColor: theme.colors.brandSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        ...theme.typography.title,
        fontSize: theme.fontSizes.lg,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.regular,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    filterSection: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.layout?.screenGutter || 16,
        paddingTop: theme.spacing.xs,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
        gap: theme.spacing.sm,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.sm + 2,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        paddingHorizontal: theme.spacing.sm + 2,
        height: 36,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        ...theme.typography.bodySmall,
        flex: 1,
        paddingVertical: 0,
        fontSize: theme.fontSizes.sm,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.text,
    },
    clearBtn: {
        padding: 4,
    },
    filterChipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs + 2,
        paddingVertical: 2,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    chipActive: {
        backgroundColor: theme.colors.brand,
        borderColor: theme.colors.brand,
    },
    chipText: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamilies.medium,
        fontWeight: theme.fontWeights.medium,
    },
    chipTextActive: {
        color: theme.colors.brandContrast,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },
    list: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSubtle,
    },
    listContent: {
        flexGrow: 1,
        padding: theme.layout?.screenGutter || 16,
        paddingBottom: theme.spacing.xxl,
        gap: theme.spacing.sm + 2,
    },
    card: {
        ...theme.styles.card,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 1.5,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    successIcon: {
        backgroundColor: theme.colors.successSoft,
    },
    neutralIcon: {
        backgroundColor: theme.colors.brandSoft,
    },
    dangerIcon: {
        backgroundColor: theme.colors.dangerSoft,
    },
    headerText: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
    },
    userName: {
        ...theme.typography.title,
        fontSize: theme.fontSizes.sm + 1,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        color: theme.colors.text,
    },
    idBadge: {
        paddingHorizontal: theme.spacing.xs + 2,
        paddingVertical: 1,
        borderRadius: theme.radii.xs,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    idBadgeText: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.micro + 1,
        fontWeight: theme.fontWeights.medium,
        fontFamily: theme.fontFamilies.medium,
        color: theme.colors.textSecondary,
    },
    compBadge: {
        paddingHorizontal: theme.spacing.xs + 2,
        paddingVertical: 1,
        borderRadius: theme.radii.xs,
        backgroundColor: theme.colors.brandSoft,
    },
    compBadgeText: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.micro + 1,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        color: theme.colors.brandStrong,
    },
    eventType: {
        marginTop: 1,
        ...theme.typography.caption,
        fontSize: theme.fontSizes.micro + 1,
        fontWeight: theme.fontWeights.regular,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textMuted,
    },
    status: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radii.pill,
        overflow: 'hidden',
        ...theme.typography.overline,
        fontSize: theme.fontSizes.micro,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        letterSpacing: 0.5,
    },
    successStatus: {
        color: theme.colors.success,
        backgroundColor: theme.colors.successSoft,
    },
    neutralStatus: {
        color: theme.colors.brandStrong,
        backgroundColor: theme.colors.brandSoft,
    },
    dangerStatus: {
        color: theme.colors.danger,
        backgroundColor: theme.colors.dangerSoft,
    },
    logDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: theme.spacing.sm,
    },
    logDetailText: {
        flex: 1,
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.regular,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textSecondary,
    },
    errorText: {
        marginTop: theme.spacing.sm,
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.danger,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.huge,
        paddingHorizontal: theme.spacing.xxl,
    },
    centered: {
        flex: 1,
        padding: theme.spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
    statusTitle: {
        ...theme.typography.title,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        marginTop: theme.spacing.md,
        color: theme.colors.text,
        textAlign: 'center',
    },
    statusText: {
        ...theme.typography.bodySmall,
        fontSize: theme.fontSizes.sm,
        fontFamily: theme.fontFamilies.regular,
        marginTop: theme.spacing.xs,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    retry: {
        marginTop: theme.spacing.lg,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        fontSize: theme.fontSizes.sm,
    },
    clearFilterButton: {
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs + 2,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.brandSoft,
    },
    clearFilterButtonText: {
        ...theme.typography.button,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.brandStrong,
        fontFamily: theme.fontFamilies.semiBold,
        fontWeight: theme.fontWeights.semiBold,
    },
});
