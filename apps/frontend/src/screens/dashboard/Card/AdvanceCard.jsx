import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useGetPayslipQuery } from '../../../store/api/DashboardApi';
import CommonModal from '../../../components/modal/CommonModal';
import PayslipWithFilter from '../payslip/filtercontent/PaySlipFilter_Content';
import { useAppTheme } from '../../../theme';

const SalaryAdvanceCard = ({
    amount = 0,
    month = 'Current Month',
    title = 'Advance Salary',
    status = 'Debited',
}) => {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM'));
    const [openModal, setOpenModal] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [cardScale] = useState(new Animated.Value(0.95));

    const UserId = useSelector((state) => state?.UserDetails);
    const { width } = useWindowDimensions();

    const { data } = useGetPayslipQuery({
        params: {
            IdCard: UserId?.UserId,
            PAYPERIOD: `${selectedMonth} ${selectedYear}`,
        },
    });

    useEffect(() => {
        Animated.spring(cardScale, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, []);

    const numericAmount = typeof amount === 'number'
        ? amount
        : Number(String(amount).replace(/[^0-9.-]+/g, '')) || 0;

    const formattedAmount = numericAmount > 0
        ? `₹${numericAmount.toLocaleString('en-IN')}`
        : '₹0.00';

    const hasAdvance = numericAmount > 0;

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
            {/* Modal for Payslip Filter */}
            <CommonModal
                maxHeightPercentage={0.4}
                isModalVisible={openModal}
                Title="Filter PaySlip"
                BodyComponent={
                    <PayslipWithFilter
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                        setSelectedYear={setSelectedYear}
                        setSelectedMonth={setSelectedMonth}
                        payslipData={data?.data}
                    />
                }
                setIsModalVisible={setOpenModal}
            />

            {/* Left Accent Stripe */}
            <View style={[styles.accentStripe, { backgroundColor: hasAdvance ? theme.colors.danger : theme.colors.textMuted }]} />

            <View style={styles.contentWrap}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.iconBox, { backgroundColor: hasAdvance ? theme.colors.dangerSoft : theme.colors.surfaceSunken }]}>
                            <MaterialCommunityIcons
                                name="cash-fast"
                                size={22}
                                color={hasAdvance ? theme.colors.danger : theme.colors.textMuted}
                            />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>{title}</Text>
                            <Text style={styles.cardSubtitle}>
                                {hasAdvance ? 'Pending salary advance deduction' : 'No active advance balance'}
                            </Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: hasAdvance ? theme.colors.dangerSoft : theme.colors.successSoft }
                    ]}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: hasAdvance ? theme.colors.danger : theme.colors.success }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            { color: hasAdvance ? theme.colors.danger : theme.colors.success }
                        ]}>
                            {hasAdvance ? status : 'Cleared'}
                        </Text>
                    </View>
                </View>

                {/* Amount Row */}
                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.amountLabel}>Total Advance Balance</Text>
                        <Text style={[styles.amountValue, { color: hasAdvance ? theme.colors.danger : theme.colors.text }]}>
                            {formattedAmount}
                        </Text>
                    </View>

                    {/* Filter / Payslip Trigger */}
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => setOpenModal(true)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="file-document-outline" size={16} color={theme.colors.brand} />
                        <Text style={styles.actionBtnText}>Payslip</Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.brand} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
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
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    amountLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    amountValue: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 2,
        letterSpacing: -0.5,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.brand,
    },
});

export default SalaryAdvanceCard;
