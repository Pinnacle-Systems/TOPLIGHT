import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const EsiPfOtCard = ({
    payperiod = '',
    esiAmount = '₹0.00',
    pfAmount = '₹0.00',
    otHours = 0,
    otAmount = '₹0.00',
    onFilterPress,
    onEsiPress,
    onPfPress,
    onOtPress,
}) => {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    return (
        <View style={styles.card}>
            {/* Left Accent Stripe */}
            <View style={styles.accentStripe} />

            <View style={styles.contentWrap}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.colors.accent} />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>ESI, PF & Overtime</Text>
                            <Text style={styles.cardSubtitle}>
                                {payperiod ? `Cycle: ${payperiod}` : 'Statutory deductions & overtime'}
                            </Text>
                        </View>
                    </View>

                    {/* Filter Period Button */}
                    <TouchableOpacity 
                        style={styles.filterBtn}
                        onPress={onFilterPress}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="tune-variant" size={14} color={theme.colors.accent} />
                        <Text style={styles.filterBtnText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {/* 3 Metric Cards Row */}
                <View style={styles.metricRow}>
                    {/* ESI Metric Card */}
                    <TouchableOpacity 
                        style={[styles.miniCard, styles.esiCard]}
                        onPress={onEsiPress}
                        activeOpacity={0.8}
                    >
                        <View style={styles.miniCardHeader}>
                            <View style={[styles.miniIconWrap, { backgroundColor: theme.colors.successSoft }]}>
                                <MaterialCommunityIcons name="hospital-box-outline" size={14} color={theme.colors.success} />
                            </View>
                            <Text style={[styles.miniCardLabel, { color: theme.colors.success }]}>ESI</Text>
                        </View>
                        <Text style={styles.miniCardValue} numberOfLines={1}>{esiAmount}</Text>
                        <Text style={styles.miniCardSub}>Health Ins.</Text>
                    </TouchableOpacity>

                    {/* PF Metric Card */}
                    <TouchableOpacity 
                        style={[styles.miniCard, styles.pfCard]}
                        onPress={onPfPress}
                        activeOpacity={0.8}
                    >
                        <View style={styles.miniCardHeader}>
                            <View style={[styles.miniIconWrap, { backgroundColor: theme.colors.infoSoft }]}>
                                <MaterialCommunityIcons name="piggy-bank-outline" size={14} color={theme.colors.info} />
                            </View>
                            <Text style={[styles.miniCardLabel, { color: theme.colors.info }]}>PF</Text>
                        </View>
                        <Text style={styles.miniCardValue} numberOfLines={1}>{pfAmount}</Text>
                        <Text style={styles.miniCardSub}>Provident Fund</Text>
                    </TouchableOpacity>

                    {/* Overtime Metric Card */}
                    <TouchableOpacity 
                        style={[styles.miniCard, styles.otCard]}
                        onPress={onOtPress}
                        activeOpacity={0.8}
                    >
                        <View style={styles.miniCardHeader}>
                            <View style={[styles.miniIconWrap, { backgroundColor: theme.colors.accentSoft }]}>
                                <MaterialCommunityIcons name="clock-plus-outline" size={14} color={theme.colors.accent} />
                            </View>
                            <Text style={[styles.miniCardLabel, { color: theme.colors.accent }]}>OT</Text>
                        </View>
                        <Text style={styles.miniCardValue} numberOfLines={1}>{otHours ? `${otHours}h` : '0h'}</Text>
                        <Text style={styles.miniCardSub} numberOfLines={1}>{otAmount}</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Tip */}
                <View style={styles.footerRow}>
                    <Text style={styles.footerTip}>Tap any card to view detailed breakdown statements</Text>
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
    },
    accentStripe: {
        width: 4,
        backgroundColor: theme.colors.accent,
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
        backgroundColor: theme.colors.accentSoft,
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
        backgroundColor: theme.colors.accentSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    filterBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.accent,
    },
    metricRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    miniCard: {
        flex: 1,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
    },
    esiCard: {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.success,
    },
    pfCard: {
        backgroundColor: theme.colors.infoSoft,
        borderColor: theme.colors.info,
    },
    otCard: {
        backgroundColor: theme.colors.accentSoft,
        borderColor: theme.colors.accent,
    },
    miniCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 6,
    },
    miniIconWrap: {
        width: 22,
        height: 22,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniCardLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    miniCardValue: {
        fontSize: 14,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 2,
    },
    miniCardSub: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    footerRow: {
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    footerTip: {
        fontSize: 10,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});

export default EsiPfOtCard;
