import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { CustomNavigation } from '../utils/NavigationRef';
import { useAppTheme } from '../../theme';

const formatTimeAgo = (dateValue) => {
    if (!dateValue) return 'Just now';
    const parsed = moment(dateValue);
    if (!parsed.isValid()) return 'Just now';

    const diffMinutes = moment().diff(parsed, 'minutes');
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (moment().isSame(parsed, 'day')) return parsed.format('hh:mm A');
    if (moment().subtract(1, 'day').isSame(parsed, 'day')) return `Yesterday, ${parsed.format('hh:mm A')}`;
    return parsed.format('DD MMM, hh:mm A');
};

export default function NotificationModal({
    refresh,
    close_modal,
    livedata = {},
    data,
    modalVisible,
    setModalVisible,
}) {
    const { theme } = useAppTheme();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const [livedata_man, setlivedata_man] = useState([]);
    const [selectedTab, setSelectedTab] = useState('all'); // 'all' | 'onduty' | 'leave' | 'permission'

    useEffect(() => {
        const liveDocId = livedata?.data?.docid || livedata?.data?.docId;
        if (liveDocId) {
            setlivedata_man(prev => {
                const exists = prev.some(item => (item.docid || item.docId) === liveDocId);
                if (!exists) return [...prev, livedata.data];
                return prev;
            });
        }
    }, [livedata?.data?.docid, livedata?.data?.docId]);

    // Deduplicated merged notifications list
    const mergedData = useMemo(() => {
        const all = [...(data?.data || []), ...livedata_man];
        const seen = new Set();
        return all
            .filter(item => {
                const docid = String(item?.docid || item?.docId || item?.id || '').trim();
                if (!docid) return true;
                if (seen.has(docid)) return false;
                seen.add(docid);
                return true;
            })
            .sort((a, b) => {
                const dateA = moment(a.createdAt || a.docdate || a.docDate || 0);
                const dateB = moment(b.createdAt || b.docdate || b.docDate || 0);
                return dateB.valueOf() - dateA.valueOf();
            });
    }, [data?.data, livedata_man]);

    // Counts per type for filter tabs
    const counts = useMemo(() => {
        const c = { all: mergedData.length, onduty: 0, leave: 0, permission: 0 };
        mergedData.forEach(item => {
            const grp = String(item?.group || '').toLowerCase();
            if (c[grp] != null) c[grp] += 1;
        });
        return c;
    }, [mergedData]);

    const filteredData = useMemo(() => {
        if (selectedTab === 'all') return mergedData;
        return mergedData.filter(item => String(item?.group || '').toLowerCase() === selectedTab);
    }, [mergedData, selectedTab]);

    const hideModal = () => {
        setModalVisible(false);
    };

    const handlePress = (item) => {
        const grp = String(item?.group || '').toLowerCase();
        switch (grp) {
            case 'leave':
                CustomNavigation('l_approval', { ...item, refresh, all: mergedData });
                break;
            case 'permission':
                CustomNavigation('p_approval', { ...item, refresh, all: mergedData });
                break;
            case 'onduty':
                CustomNavigation('onduty_approval', { ...item, refresh, all: mergedData });
                break;
            default:
                break;
        }
        close_modal?.(false);
    };

    const styles = useMemo(
        () => createStyles(isLandscape, width, height, theme),
        [isLandscape, width, height, theme],
    );

    const renderNotificationItem = ({ item }) => {
        const grp = String(item?.group || '').toLowerCase();
        const isOnduty = grp === 'onduty';
        const isLeave = grp === 'leave';
        const isPermission = grp === 'permission';

        const employeeName =
            item?.userdata?.username ||
            item?.userdata?.userName ||
            item?.userData?.userName ||
            item?.userData?.username ||
            item?.empName ||
            item?.empname ||
            item?.userName ||
            item?.username ||
            item?.userdata?.Employee ||
            item?.Employee ||
            'Employee';

        const employeeId =
            item?.userdata?.Idcard ||
            item?.userdata?.idCard ||
            item?.userData?.idCard ||
            item?.idCard ||
            item?.idcard ||
            item?.userId ||
            item?.IDCARD ||
            '';

        const docid = item?.docid || item?.docId;
        const timeAgo = formatTimeAgo(item?.createdAt || item?.docdate || item?.docDate);

        // Type-specific icon and theme colors
        let typeIcon = 'bell-outline';
        let typeBadgeLabel = 'REQUEST';
        let typeBgColor = theme.colors.brandSoft;
        let typeTextColor = theme.colors.brand;
        let detailText = item?.reason || item?.description || 'Pending approval request';
        let detailIcon = 'information-outline';

        if (isOnduty) {
            typeIcon = 'briefcase-outline';
            typeBadgeLabel = 'ON-DUTY';
            typeBgColor = theme.colors.warningSoft;
            typeTextColor = theme.colors.warning;
            const rawLat = item?.in_latitude ?? item?.inLatitude;
            const rawLng = item?.in_longtiude ?? item?.inLongtiude ?? item?.in_longitude ?? item?.inLongitude;
            const locName = item?.in_location || item?.inLocation;
            if (locName) {
                detailText = locName;
            } else if (rawLat && rawLng) {
                detailText = `Near ${Number(rawLat).toFixed(4)}, ${Number(rawLng).toFixed(4)}`;
            } else if (item?.others && item.others !== 'ONDUTY') {
                detailText = item.others;
            } else {
                detailText = 'Location submitted for review';
            }
            detailIcon = 'map-marker-outline';
        } else if (isLeave) {
            typeIcon = 'calendar-remove-outline';
            typeBadgeLabel = 'LEAVE';
            typeBgColor = theme.colors.dangerSoft;
            typeTextColor = theme.colors.danger;
            const leaveType = item?.ltype || item?.lType || item?.leaveType || item?.leavetype;
            const totalDays = item?.totalDays ?? item?.totaldays;
            const daysText = totalDays != null ? `${totalDays} ${totalDays == 1 ? 'day' : 'days'}` : '';
            detailText = [leaveType, daysText, item?.reason].filter(Boolean).join(' • ') || 'Leave request';
            detailIcon = 'calendar-outline';
        } else if (isPermission) {
            typeIcon = 'clock-time-four-outline';
            typeBadgeLabel = 'PERMISSION';
            typeBgColor = theme.colors.infoSoft;
            typeTextColor = theme.colors.info;
            const fTime = item?.fTime || item?.ftime;
            const tTime = item?.tTime || item?.ttime;
            const duration = item?.thrs || item?.totalHours || item?.totalHrs;
            const timeWindow = fTime && tTime ? `${fTime} - ${tTime}` : '';
            detailText = [timeWindow, duration ? `(${duration})` : '', item?.reason].filter(Boolean).join(' ') || 'Permission request';
            detailIcon = 'clock-outline';
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
            >
                {/* Left Type Icon Circle */}
                <View style={[styles.avatarCircle, { backgroundColor: typeBgColor }]}>
                    <MaterialCommunityIcons name={typeIcon} size={theme.controlSizes?.iconSm || 18} color={typeTextColor} />
                </View>

                {/* Center Content */}
                <View style={styles.cardContent}>
                    {/* Top Row: Type Pill + Doc ID + Time */}
                    <View style={styles.cardHeaderRow}>
                        <View style={[styles.typePill, { backgroundColor: typeBgColor }]}>
                            <Text style={[styles.typePillText, { color: typeTextColor }]}>
                                {typeBadgeLabel}
                            </Text>
                        </View>
                        {!!docid && (
                            <Text style={styles.docIdText} numberOfLines={1}>
                                {docid}
                            </Text>
                        )}
                        <Text style={styles.timeText}>{timeAgo}</Text>
                    </View>

                    {/* Middle Row: Employee Name & ID */}
                    <View style={styles.employeeRow}>
                        <Text style={styles.employeeName} numberOfLines={1}>
                            {employeeName}
                        </Text>
                        {!!employeeId && (
                            <Text style={styles.employeeId}>({employeeId})</Text>
                        )}
                    </View>

                    {/* Bottom Row: Detail Snippet */}
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons
                            name={detailIcon}
                            size={theme.controlSizes?.iconXs || 14}
                            color={theme.colors.textMuted}
                            style={{ marginRight: theme.spacing.xxs }}
                        />
                        <Text style={styles.detailText} numberOfLines={1}>
                            {detailText}
                        </Text>
                    </View>
                </View>

                {/* Right Chevron */}
                <View style={styles.chevronWrapper}>
                    <View style={styles.newDot} />
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={theme.controlSizes?.iconMd || 20}
                        color={theme.colors.textMuted}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={hideModal}
        >
            <TouchableWithoutFeedback onPress={hideModal}>
                <View style={styles.modalBackdrop}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalCard}>
                            {/* 1. Header Bar */}
                            <View style={styles.header}>
                                <View style={styles.headerTitleRow}>
                                    <View style={styles.headerIconCircle}>
                                        <MaterialCommunityIcons
                                            name="bell-ring-outline"
                                            size={theme.controlSizes?.iconSm || 18}
                                            color={theme.colors.brand}
                                        />
                                    </View>
                                    <Text style={styles.headerTitle}>Notifications</Text>
                                    {mergedData.length > 0 && (
                                        <View style={styles.totalBadge}>
                                            <Text style={styles.totalBadgeText}>
                                                {mergedData.length}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={hideModal}
                                    style={styles.closeBtn}
                                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                    accessibilityLabel="Close notifications"
                                >
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={theme.controlSizes?.iconSm || 18}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* 2. Filter Tabs (Only show if notifications exist) */}
                            {mergedData.length > 0 && (
                                <View style={styles.tabsRow}>
                                    <TouchableOpacity
                                        style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
                                        onPress={() => setSelectedTab('all')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
                                            All ({counts.all})
                                        </Text>
                                    </TouchableOpacity>

                                    {counts.onduty > 0 && (
                                        <TouchableOpacity
                                            style={[styles.tab, selectedTab === 'onduty' && styles.tabActive]}
                                            onPress={() => setSelectedTab('onduty')}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.tabText, selectedTab === 'onduty' && styles.tabTextActive]}>
                                                On-Duty ({counts.onduty})
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {counts.leave > 0 && (
                                        <TouchableOpacity
                                            style={[styles.tab, selectedTab === 'leave' && styles.tabActive]}
                                            onPress={() => setSelectedTab('leave')}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.tabText, selectedTab === 'leave' && styles.tabTextActive]}>
                                                Leave ({counts.leave})
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {counts.permission > 0 && (
                                        <TouchableOpacity
                                            style={[styles.tab, selectedTab === 'permission' && styles.tabActive]}
                                            onPress={() => setSelectedTab('permission')}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.tabText, selectedTab === 'permission' && styles.tabTextActive]}>
                                                Permission ({counts.permission})
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* 3. Notification List or Empty State */}
                            {filteredData.length > 0 ? (
                                <FlatList
                                    data={filteredData}
                                    renderItem={renderNotificationItem}
                                    keyExtractor={(item, index) =>
                                        String(item?.docid || item?.docId || item?.id || index)
                                    }
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyIconCircle}>
                                        <MaterialCommunityIcons
                                            name={counts.all === 0 ? 'bell-check-outline' : 'filter-variant'}
                                            size={theme.controlSizes?.iconXl || 36}
                                            color={theme.colors.brand}
                                        />
                                    </View>
                                    <Text style={styles.emptyTitle}>
                                        {counts.all === 0 ? 'All caught up!' : 'No matching notifications'}
                                    </Text>
                                    <Text style={styles.emptySubtitle}>
                                        {counts.all === 0
                                            ? 'You have no pending approval requests at this time.'
                                            : 'No requests found under this category filter.'}
                                    </Text>
                                </View>
                            )}

                            {/* 4. Footer Hint */}
                            {filteredData.length > 0 && (
                                <View style={styles.footerHint}>
                                    <MaterialCommunityIcons
                                        name="gesture-tap"
                                        size={theme.controlSizes?.iconXs || 14}
                                        color={theme.colors.textMuted}
                                        style={{ marginRight: theme.spacing.xs }}
                                    />
                                    <Text style={styles.footerHintText}>
                                        Tap request to view details & approve
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const createStyles = (isLandscape, width, height, theme) =>
    StyleSheet.create({
        modalBackdrop: {
            flex: 1,
            backgroundColor: theme.colors.scrim || 'rgba(15, 23, 42, 0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.layout?.screenGutter || 16,
            paddingVertical: isLandscape ? theme.spacing.md : theme.spacing.xl,
        },
        modalCard: {
            width: isLandscape ? Math.min(width * 0.72, 540) : Math.min(width - 32, 440),
            maxHeight: isLandscape ? height * 0.88 : height * 0.76,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.xl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: theme.isDark ? 0.35 : 0.16,
            shadowRadius: 20,
            elevation: theme.elevation.xl,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
            backgroundColor: theme.colors.surface,
        },
        headerTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        headerIconCircle: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            ...theme.typography.title,
            fontSize: theme.fontSizes.lg,
            lineHeight: theme.lineHeights.lg,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.text,
        },
        totalBadge: {
            backgroundColor: theme.colors.brand,
            borderRadius: theme.radii.pill,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xxs,
        },
        totalBadgeText: {
            ...theme.typography.caption,
            color: theme.colors.brandContrast,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
        },
        closeBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Filter Tabs
        tabsRow: {
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.colors.surfaceSunken,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
            gap: theme.spacing.xs + 2,
            flexWrap: 'wrap',
        },
        tab: {
            paddingHorizontal: theme.spacing.md - 2,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
        },
        tabActive: {
            backgroundColor: theme.colors.brand,
            borderColor: theme.colors.brand,
        },
        tabText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            fontFamily: theme.fontFamilies.medium,
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.textSecondary,
        },
        tabTextActive: {
            color: theme.colors.brandContrast,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
        },

        // List
        listContent: {
            padding: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1.5 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: theme.elevation.xs,
        },
        avatarCircle: {
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.sm,
        },
        cardContent: {
            flex: 1,
            justifyContent: 'center',
        },
        cardHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xxs,
        },
        typePill: {
            paddingHorizontal: theme.spacing.xs + 2,
            paddingVertical: 1.5,
            borderRadius: theme.radii.xs,
            marginRight: theme.spacing.xs + 2,
        },
        typePillText: {
            ...theme.typography.overline,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.extraBold,
            letterSpacing: theme.letterSpacing.wider,
        },
        docIdText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            fontFamily: theme.fontFamilies.medium,
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.textMuted,
            flex: 1,
        },
        timeText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.medium,
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.textMuted,
        },
        employeeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.xxs,
        },
        employeeName: {
            ...theme.typography.subtitle,
            fontSize: theme.fontSizes.sm,
            lineHeight: theme.lineHeights.sm,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.text,
        },
        employeeId: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            fontFamily: theme.fontFamilies.regular,
            fontWeight: theme.fontWeights.regular,
            color: theme.colors.textMuted,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        detailText: {
            ...theme.typography.bodySmall,
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.xs,
            fontFamily: theme.fontFamilies.regular,
            fontWeight: theme.fontWeights.regular,
            color: theme.colors.textSecondary,
            flex: 1,
        },
        chevronWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: theme.spacing.xs,
            flexDirection: 'row',
            gap: theme.spacing.xs,
        },
        newDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.colors.brand,
        },

        // Empty state
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.xxxl,
            paddingHorizontal: theme.spacing.xxl,
        },
        emptyIconCircle: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
        },
        emptyTitle: {
            ...theme.typography.title,
            fontSize: theme.fontSizes.md,
            lineHeight: theme.lineHeights.md,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        emptySubtitle: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.sm,
            fontFamily: theme.fontFamilies.regular,
            fontWeight: theme.fontWeights.regular,
            color: theme.colors.textMuted,
            textAlign: 'center',
            maxWidth: 240,
        },

        // Footer hint
        footerHint: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSubtle,
            backgroundColor: theme.colors.surfaceSunken,
        },
        footerHintText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.medium,
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.textMuted,
        },
    });
