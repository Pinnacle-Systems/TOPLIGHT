import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
    return (
        <View style={styles.card}>
            {/* Left Accent Stripe */}
            <View style={styles.accentStripe} />

            <View style={styles.contentWrap}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="shield-check-outline" size={22} color="#8B5CF6" />
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
                        <MaterialCommunityIcons name="tune-variant" size={14} color="#8B5CF6" />
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
                            <View style={[styles.miniIconWrap, { backgroundColor: '#DCFCE7' }]}>
                                <MaterialCommunityIcons name="hospital-box-outline" size={14} color="#16A34A" />
                            </View>
                            <Text style={[styles.miniCardLabel, { color: '#16A34A' }]}>ESI</Text>
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
                            <View style={[styles.miniIconWrap, { backgroundColor: '#E0F2FE' }]}>
                                <MaterialCommunityIcons name="piggy-bank-outline" size={14} color="#0284C7" />
                            </View>
                            <Text style={[styles.miniCardLabel, { color: '#0284C7' }]}>PF</Text>
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
                            <View style={[styles.miniIconWrap, { backgroundColor: '#F3E8FF' }]}>
                                <MaterialCommunityIcons name="clock-plus-outline" size={14} color="#8B5CF6" />
                            </View>
                            <Text style={[styles.miniCardLabel, { color: '#8B5CF6' }]}>OT</Text>
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
        backgroundColor: '#8B5CF6',
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
        backgroundColor: '#F3E8FF',
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
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    filterBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8B5CF6',
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
        backgroundColor: '#F0FDF4',
        borderColor: '#DCFCE7',
    },
    pfCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#E0F2FE',
    },
    otCard: {
        backgroundColor: '#FAF5FF',
        borderColor: '#F3E8FF',
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
        color: '#0F172A',
        marginBottom: 2,
    },
    miniCardSub: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },
    footerRow: {
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    footerTip: {
        fontSize: 10,
        color: '#94A3B8',
        textAlign: 'center',
    },
});

export default EsiPfOtCard;
