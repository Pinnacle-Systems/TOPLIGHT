import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SalarySummaryCard = ({
    grossSalary = '₹0.00',
    netSalary = '₹0.00',
    period,
    onPress,
}) => {
    return (
        <TouchableOpacity 
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {/* Left Accent Stripe */}
            <View style={styles.accentStripe} />

            <View style={styles.contentWrap}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="wallet-outline" size={22} color="#16A34A" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Last Month Salary</Text>
                            <Text style={styles.cardSubtitle}>
                                {period ? `Pay Period: ${period}` : 'Previous payroll settlement'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.viewMoreRow}>
                        <Text style={styles.viewMoreText}>Details</Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color="#16A34A" />
                    </View>
                </View>

                {/* Salary Amounts 2-Column Row */}
                <View style={styles.amountsRow}>
                    <View style={styles.amountCol}>
                        <Text style={styles.amountLabel}>Gross Salary</Text>
                        <Text style={styles.grossValue}>{grossSalary}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={[styles.amountCol, { alignItems: 'flex-end' }]}>
                        <Text style={styles.amountLabel}>Net Received</Text>
                        <Text style={styles.netValue}>{netSalary}</Text>
                    </View>
                </View>

                {/* Footer hint */}
                <View style={styles.footerRow}>
                    <View style={styles.badgePill}>
                        <MaterialCommunityIcons name="check-decagram" size={12} color="#16A34A" />
                        <Text style={styles.badgeText}>Settled & Credited</Text>
                    </View>
                    <Text style={styles.tapHint}>Tap to view payslip breakdown →</Text>
                </View>
            </View>
        </TouchableOpacity>
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
    },
    accentStripe: {
        width: 4,
        backgroundColor: '#16A34A',
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
        backgroundColor: '#DCFCE7',
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
    viewMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 2,
    },
    viewMoreText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#16A34A',
    },
    amountsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 10,
    },
    amountCol: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    grossValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#334155',
        marginTop: 3,
    },
    netValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#16A34A',
        marginTop: 3,
    },
    divider: {
        width: 1,
        height: 38,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 12,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16A34A',
    },
    tapHint: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
});

export default SalarySummaryCard;
