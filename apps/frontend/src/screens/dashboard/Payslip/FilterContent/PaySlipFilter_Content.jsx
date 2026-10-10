import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';

const PayslipWithFilter = ({ payslipData,selectedYear, setSelectedYear,selectedMonth, setSelectedMonth }) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'white',
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
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  payslipContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  payslipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  netPay: {
    fontWeight: 'bold',
    color: '#27ae60',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default PayslipWithFilter;

