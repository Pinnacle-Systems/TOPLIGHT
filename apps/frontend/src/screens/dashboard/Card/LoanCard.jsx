import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const LoanCard = ({ 
    loanName = 'Loan Summary', 
    onPress,
    data,
}) => {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const loan = data?.[0];
    const totalLoanAmt = Number(loan?.TOTLOANAMT || 0);
    const totalPaid = Number(loan?.TOTALPAID || 0);
    const dueAmt = Number(loan?.DUE || 0);
    const outstandingLoan = Math.max(0, totalLoanAmt - totalPaid);

    const paidPercentage = totalLoanAmt > 0 
        ? Math.min(100, Math.round((totalPaid / totalLoanAmt) * 100)) 
        : 0;

    const hasActiveLoan = totalLoanAmt > 0 && outstandingLoan > 0;

    const formatCurrency = (val) => {
        const num = Number(val || 0);
        return `₹${num.toLocaleString('en-IN')}`;
    };

    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={styles.card}
            activeOpacity={0.85}
        >
            {/* Left Accent Stripe */}
            <View style={[styles.accentStripe, { backgroundColor: hasActiveLoan ? theme.colors.accent : theme.colors.success }]} />

            <View style={styles.contentWrap}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.iconBox, { backgroundColor: hasActiveLoan ? theme.colors.accentSoft : theme.colors.successSoft }]}>
                            <MaterialCommunityIcons 
                                name="bank-outline" 
                                size={22} 
                                color={hasActiveLoan ? theme.colors.accent : theme.colors.success}
                            />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>{loanName}</Text>
                            <Text style={styles.cardSubtitle}>
                                {hasActiveLoan ? 'Company loan repayment schedule' : 'No active loan balance'}
                            </Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: hasActiveLoan ? theme.colors.accentSoft : theme.colors.successSoft }
                    ]}>
                        <View style={[
                            styles.statusDot, 
                            { backgroundColor: hasActiveLoan ? theme.colors.accent : theme.colors.success }
                        ]} />
                        <Text style={[
                            styles.statusText, 
                            { color: hasActiveLoan ? theme.colors.accent : theme.colors.success }
                        ]}>
                            {hasActiveLoan ? 'Active' : 'No Loans'}
                        </Text>
                    </View>
                </View>

                {/* Primary Metric Row */}
                <View style={styles.mainAmountRow}>
                    <View style={styles.amountCol}>
                        <Text style={styles.amountLabel}>Total Loan Amount</Text>
                        <Text style={styles.amountValue}>
                            {formatCurrency(totalLoanAmt)}
                        </Text>
                    </View>

                    <View style={styles.progressCol}>
                        <View style={styles.progressPill}>
                            <MaterialCommunityIcons 
                                name={paidPercentage >= 100 ? "check-circle" : "progress-clock"} 
                                size={14} 
                                color={theme.colors.accent}
                            />
                            <Text style={styles.progressPillText}>{paidPercentage}% Paid</Text>
                        </View>
                    </View>
                </View>

                {/* Horizontal Progress Bar */}
                {totalLoanAmt > 0 && (
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${paidPercentage}%` }]} />
                    </View>
                )}

                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Outstanding</Text>
                        <Text style={[styles.gridValue, { color: outstandingLoan > 0 ? theme.colors.danger : theme.colors.success }]}>
                            {formatCurrency(outstandingLoan)}
                        </Text>
                    </View>

                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Paid Amount</Text>
                        <Text style={[styles.gridValue, { color: theme.colors.success }]}>
                            {formatCurrency(totalPaid)}
                        </Text>
                    </View>

                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Due Amount</Text>
                        <Text style={styles.gridValue}>
                            {formatCurrency(dueAmt)}
                        </Text>
                    </View>
                </View>

                {/* EMI & Timeline Row if active */}
                {hasActiveLoan && (
                    <View style={styles.footerRow}>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons name="calendar-clock" size={13} color={theme.colors.textMuted} />
                            <Text style={styles.footerText}>
                                Term: {loan?.TERM || 'Ongoing'}
                            </Text>
                        </View>
                        {loan?.DUEDATE && (
                            <View style={styles.footerItem}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={theme.colors.warning} />
                                <Text style={[styles.footerText, { color: theme.colors.warning }]}>
                                    Due: {loan.DUEDATE}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
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
        alignSelf: 'stretch',
    },
    accentStripe: {
        width: 4,
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
        marginBottom: 12,
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    mainAmountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
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
    amountValue: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
        marginTop: 2,
        letterSpacing: -0.5,
    },
    progressCol: {
        alignItems: 'flex-end',
    },
    progressPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accentSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    progressPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.accent,
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 14,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.accent,
        borderRadius: 3,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
        gap: 8,
    },
    gridItem: {
        flex: 1,
    },
    gridLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 3,
    },
    gridValue: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.text,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
});

export default LoanCard;
