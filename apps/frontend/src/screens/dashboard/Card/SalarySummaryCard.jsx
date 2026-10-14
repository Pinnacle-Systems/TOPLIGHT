import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const SalarySummaryCard = ({
    grossSalary = '₹0.00',
    netSalary = '₹0.00',
    period,
    onPress,
}) => {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                            <MaterialCommunityIcons name="wallet-outline" size={22} color={theme.colors.success} />
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
                        <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.success} />
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
                        <MaterialCommunityIcons name="check-decagram" size={12} color={theme.colors.success} />
                        <Text style={styles.badgeText}>Settled & Credited</Text>
                    </View>
                    <Text style={styles.tapHint}>Tap to view payslip breakdown →</Text>
                </View>
            </View>
        </TouchableOpacity>
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
    },
    accentStripe: {
        width: 4,
        backgroundColor: theme.colors.success,
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
        backgroundColor: theme.colors.successSoft,
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
    viewMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successSoft,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 2,
    },
    viewMoreText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.success,
    },
    amountsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginBottom: 10,
    },
    amountCol: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    grossValue: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
        marginTop: 3,
    },
    netValue: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.success,
        marginTop: 3,
    },
    divider: {
        width: 1,
        height: 38,
        backgroundColor: theme.colors.divider,
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
        color: theme.colors.success,
    },
    tapHint: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontWeight: '500',
    },
});

export default SalarySummaryCard;
