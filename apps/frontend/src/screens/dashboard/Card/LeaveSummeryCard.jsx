import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveSummaryCard = ({ 
    leaveTaken = 0, 
    availableLeaves = 0, 
    attendanceStatus,
    onPress,
    openReport,
    setopenLeaveModal,
}) => {
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
                                color="#0284C7" 
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
                        <MaterialCommunityIcons name="calendar-search" size={15} color="#0284C7" />
                        <Text style={styles.filterBtnText}>Select Year</Text>
                    </TouchableOpacity>
                </View>

                {/* Two Stats Blocks */}
                <View style={styles.statsRow}>
                    {/* Leaves Taken */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconWrap, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialCommunityIcons name="calendar-remove" size={18} color="#DC2626" />
                        </View>
                        <Text style={styles.statLabel}>Leaves Taken</Text>
                        <Text style={[styles.statValue, { color: '#DC2626' }]}>
                            {typeof leaveTaken === 'number' ? `${leaveTaken} Days` : leaveTaken || '0 Days'}
                        </Text>
                    </View>

                    <View style={styles.statDivider} />

                    {/* Available Leaves */}
                    <View style={styles.statBox}>
                        <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="calendar-check" size={18} color="#16A34A" />
                        </View>
                        <Text style={styles.statLabel}>Available Balance</Text>
                        <Text style={[styles.statValue, { color: '#16A34A' }]}>
                            {typeof availableLeaves === 'number' ? `${availableLeaves} Days` : availableLeaves || '0 Days'}
                        </Text>
                    </View>
                </View>

                {/* Footer Status & Report Link */}
                <View style={styles.footerRow}>
                    <View style={styles.statusCol}>
                        <View style={[styles.statusDot, { backgroundColor: isPresent ? '#16A34A' : '#EAB308' }]} />
                        <Text style={styles.statusText}>
                            Today: <Text style={{ fontWeight: '700', color: isPresent ? '#16A34A' : '#EAB308' }}>
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
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 12,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        flexDirection: 'row',
        alignSelf: 'stretch',
    },
    accentStripe: {
        width: 4,
        backgroundColor: '#0284C7',
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
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    filterBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0284C7',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
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
        color: '#64748B',
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
        backgroundColor: '#E2E8F0',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
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
        color: '#64748B',
    },
    reportLinkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    reportLinkText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#007AFF',
    },
});

export default LeaveSummaryCard;
