import { View, Text, ScrollView, StyleSheet, useWindowDimensions, ActivityIndicator } from "react-native";
import { NumbertoCurrency } from "../../../components/utils/NumberToCurrency";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { DataTable } from "react-native-paper";
import SumofArray from "./SumOfArray";
import React from "react";
import { useAppTheme } from "../../../theme";

const MoreSalaryDetails = ({ data={}, isLoading = false }) => {
    const { theme } = useAppTheme();
    const { width } = useWindowDimensions();
    const isLandscape = width > 600;
    const styles = React.useMemo(() => createStyles(theme, isLandscape), [theme, isLandscape]);

    // Better loading and error states
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.success} />
                <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Loading salary details...</Text>
            </View>
        );
    }

    if (!data || Object.keys(data).length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <MaterialIcons name="info-outline" size={40} color={theme.colors.textMuted} />
                <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>No salary data available for this month.</Text>
            </View>
        );
    }

    const finalDeductions = SumofArray([data?.adv, data?.loan, data?.LOP, data?.pf, data?.esi]);
    const finalEarnings = SumofArray([data?.BASIC, data?.DA, data?.HRA, data?.CONV, data?.MED, data?.OTHERS]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.netSalary}>{NumbertoCurrency(data?.salary)}</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>EARNED</Text>
                        <Text style={styles.summaryValue}>{NumbertoCurrency(finalEarnings)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>DEDUCTED</Text>
                        <Text style={[styles.summaryValue, styles.deductionValue]}>{NumbertoCurrency(finalDeductions)}</Text>
                    </View>
                </View>
            </View>

            {/* Combined Earnings & Deductions Table */}
            <DataTable style={styles.dataTable}>
                <DataTable.Header style={styles.tableHeader}>
                    <DataTable.Title style={styles.headerCell}>Component</DataTable.Title>
                    <DataTable.Title numeric style={styles.headerCell}>Amount</DataTable.Title>
                </DataTable.Header>

                {/* Earnings */}
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Basic</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.value}>{NumbertoCurrency(data?.BASIC)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>DA</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.value}>{NumbertoCurrency(data?.DA)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>HRA</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.value}>{NumbertoCurrency(data?.HRA)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Conveyance</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.value}>{NumbertoCurrency(data?.CONV)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Medical</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.value}>{NumbertoCurrency(data?.MED)}</Text></DataTable.Cell>
                </DataTable.Row>


                  <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Others</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.value}>{NumbertoCurrency(data?.OTHERS)}</Text></DataTable.Cell>
                </DataTable.Row>

                {/* Deductions */}
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Advance</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.deductionText}>{NumbertoCurrency(data?.adv)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Loan</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.deductionText}>{NumbertoCurrency(data?.loan)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>Loss of pay</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.deductionText}>{NumbertoCurrency(data?.LOP)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>PF</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.deductionText}>{NumbertoCurrency(data?.pf)}</Text></DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row style={styles.row}>
                    <DataTable.Cell style={styles.cell}><Text style={styles.label}>ESI</Text></DataTable.Cell>
                    <DataTable.Cell numeric style={styles.cell}><Text style={styles.deductionText}>{NumbertoCurrency(data?.esi)}</Text></DataTable.Cell>
                </DataTable.Row>
            </DataTable>

            {/* Working Details - Compact Grid */}
            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <MaterialIcons name="date-range" size={14} color={theme.colors.success} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Period: {data?.payperiod || "--/--/----"}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialIcons name="work" size={14} color={theme.colors.success} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Type: {data?.saltype || "---"}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialIcons name="calendar-today" size={14} color={theme.colors.success} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Worked: {data?.wd || 0}/{data?.mw || 0}d</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialIcons name="access-time" size={14} color={theme.colors.success} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>OT: {Number(data?.ot || 0)?.toFixed(2)}h ({NumbertoCurrency(data?.otamt)})</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme, isLandscape) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: isLandscape ? 8 : 6,
        paddingBottom: 12,
    },
    header: {
        backgroundColor: theme.colors.success,
        borderRadius: 6,
        padding: 10,
        marginBottom: 8,
        elevation: 1,
    },
    netSalary: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.brandContrast,
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 6,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        color: theme.colors.brandContrast,
        fontSize: 10,
        fontWeight: '500',
    },
    summaryValue: {
        color: theme.colors.brandContrast,
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    deductionValue: {
        color: theme.colors.dangerSoft,
    },
    dataTable: {
        backgroundColor: theme.colors.surface,
        borderRadius: 6,
        marginBottom: 8,
        elevation: 1,
    },
    tableHeader: {
        backgroundColor: theme.colors.successSoft,
        height: 32,
    },
    headerCell: {
        justifyContent: 'center',
    },
    row: {
        minHeight: 32,
        paddingVertical: 0,
    },
    cell: {
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    label: {
        fontSize: 12,
        color: theme.colors.text,
    },
    value: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.success,
    },
    deductionText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.danger,
    },
    detailsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: 6,
        padding: 8,
        elevation: 1,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 6,
    },
    detailIcon: {
        marginRight: 6,
        backgroundColor: theme.colors.successSoft,
        padding: 4,
        borderRadius: 8,
    },
    detailLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 20,
    },
});

export default MoreSalaryDetails;
