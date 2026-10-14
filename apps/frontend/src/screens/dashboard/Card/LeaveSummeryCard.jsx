import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const LeaveSummaryCard = ({ 
    leaveTaken = 0, 
    availableLeaves = 0, 
    attendanceStatus,
    onPress,
    openReport,
    setopenLeaveModal,
}) => {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const isPresent = attendanceStatus === 'Present';

    return (
        <View style={styles.card}>
            {/* Left Accent Stripe */}
            <View style={styles.accentStripe} />

            <View style={styles.contentWrap}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons 
                                name="calendar-month-outline" 
                                size={22} 
                                color={theme.colors.info}
                            />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Leave Summary</Text>
                            <Text style={styles.cardSubtitle}>Current leave balance & deductions</Text>
                        </View>
                    </View>

                    {/* Filter Year Button */}
                    <TouchableOpacity 
                        style={styles.filterBtn}
                        onPress={() => setopenLeaveModal?.(true)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="calendar-search" size={15} color={theme.colors.info} />
                        <Text style={styles.filterBtnText}>Select Year</Text>
                    </TouchableOpacity>
                </View>

                {/* Two Stats Blocks */}
                <View style={styles.statsRow}>
                    {/* Leaves Taken */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconWrap, { backgroundColor: theme.colors.dangerSoft }]}>
                            <MaterialCommunityIcons name="calendar-remove" size={18} color={theme.colors.danger} />
                        </View>
                        <Text style={styles.statLabel}>Leaves Taken</Text>
                        <Text style={[styles.statValue, { color: theme.colors.danger }]}>
                            {typeof leaveTaken === 'number' ? `${leaveTaken} Days` : leaveTaken || '0 Days'}
                        </Text>
                    </View>

                    <View style={styles.statDivider} />

                    {/* Available Leaves */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconWrap, { backgroundColor: theme.colors.successSoft }]}>
                            <MaterialCommunityIcons name="calendar-check" size={18} color={theme.colors.success} />
                        </View>
                        <Text style={styles.statLabel}>Available Balance</Text>
                        <Text style={[styles.statValue, { color: theme.colors.success }]}>
                            {typeof availableLeaves === 'number' ? `${availableLeaves} Days` : availableLeaves || '0 Days'}
                        </Text>
                    </View>
                </View>

                {/* Footer Status & Report Link */}
                <View style={styles.footerRow}>
                    <View style={styles.statusCol}>
                        <View style={[styles.statusDot, { backgroundColor: isPresent ? theme.colors.success : theme.colors.warning }]} />
                        <Text style={styles.statusText}>
                            Today: <Text style={{ fontWeight: '700', color: isPresent ? theme.colors.success : theme.colors.warning }}>
                                {attendanceStatus || 'Not Recorded'}
                            </Text>
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.reportLinkBtn}
                        onPress={() => openReport?.(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.reportLinkText}>Full Report</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color={theme.colors.brand} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const createStyles = theme => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        marginHorizontal: 12,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        flexDirection: 'row',
        alignSelf: 'stretch',
    },
    accentStripe: {
        width: 4,
        backgroundColor: theme.colors.info,
        alignSelf: 'stretch',
    },
    contentWrap: {
        flex: 1,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: theme.colors.infoSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.2,
    },
    cardSubtitle: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.infoSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    filterBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.info,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    statValue: {
        fontSize: 17,
        fontWeight: '800',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 44,
        backgroundColor: theme.colors.divider,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    statusCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    reportLinkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    reportLinkText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.brand,
    },
});

export default LeaveSummaryCard;
