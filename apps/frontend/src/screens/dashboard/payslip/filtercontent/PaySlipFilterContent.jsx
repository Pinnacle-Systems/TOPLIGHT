import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { useAppTheme } from '../../../../theme';

const PayslipWithFilter = ({ payslipData,selectedYear, setSelectedYear,selectedMonth, setSelectedMonth }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // State for filters

  // Generate years (last 5 years and next 2 years)
  const years = Array.from({ length: 8 }, (_, i) => moment().year() - 5 + i);
  
  // All months
  const months = moment.months().map((month, index) => ({
    name: month,
    value: month
  }));



  // Filter payslips based on selected year and month
  const filteredPayslips = payslipData.filter(payslip => {
    const payslipDate = moment(payslip.PAYPERIOD, 'MMMM YYYY');
    return (
      payslipDate.year() === selectedYear && 
      payslipDate.month()  === selectedMonth
    );
  });

  return (
    <View style={styles.container}>
      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Year:</Text>
          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}>
            {years.map(year => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Month:</Text>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}>
            {months.map(month => (
              <Picker.Item key={month.value} label={month.name} value={month.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Payslip Display */}
      {filteredPayslips.length > 0 ? (
        filteredPayslips.map((payslip, index) => (
          <View key={index} style={styles.payslipContainer}>
            <Text style={styles.payslipTitle}>Payslip - {payslip.PAYPERIOD}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Basic + DA:</Text>
              <Text style={styles.detailValue}>₹{payslip.BASICDA.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>HRA:</Text>
              <Text style={styles.detailValue}>₹{payslip.HRA.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gross Salary:</Text>
              <Text style={styles.detailValue}>₹{payslip.GROSS.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Net Pay:</Text>
              <Text style={[styles.detailValue, styles.netPay]}>₹{payslip.NETPAY.toLocaleString()}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No payslips found for selected period</Text>
      )}
    </View>
  );
};

const createStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.colors.text,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: theme.colors.surfaceSunken,
    color: theme.colors.text,
    borderRadius: 5,
  },
  payslipContainer: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  payslipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  netPay: {
    fontWeight: 'bold',
    color: theme.colors.success,
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});

export default PayslipWithFilter;
