import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { DataTable } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Colors } from '../../../../constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGet_leavesQuery } from '../../../../redux/service/Leave';

const LeaveReport = ({ UserId }) => {
     var init_fromdate=new Date()
     init_fromdate?.setDate(1)
     init_fromdate?.setMonth(0)
  const [fromDate, setFromDate] = useState(init_fromdate);
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const { data: leaveData, loading, refetch } = useGet_leavesQuery({
    fromdate: moment(fromDate).format("DD-MM-YYYY"),
    todate: moment(toDate).format("DD-MM-YYYY"),
    Idcard: UserId
  });

  const handleDateChange = (event, selectedDate, type) => {
    if (event.type === 'set') {
      if (type === 'from') {
        setFromDate(selectedDate);
      } else {
        setToDate(selectedDate);
      }
    }
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    refetch(); // Refresh data when dates change
  };

  const formatTableDate = (dateString) => {
    return moment(dateString).format('DD-MMM-YY');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Selection Row */}
      <View style={styles.dateSelectionContainer}>
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => setShowFromDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
          <Text style={styles.dateText}>{moment(fromDate).format('DD-MMM-YYYY')}</Text>
        </TouchableOpacity>

        <Text style={styles.toText}>to</Text>

        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => setShowToDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
          <Text style={styles.dateText}>{moment(toDate).format('DD-MMM-YYYY')}</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, 'from')}
          maximumDate={toDate}
        />
      )}
      
      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, 'to')}
          minimumDate={fromDate}
          maximumDate={new Date()}
        />
      )}

      {/* Report Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leave Report</Text>
        <Text style={styles.subtitle}>
          {moment(fromDate).format('DD MMM YYYY')} to {moment(toDate).format('DD MMM YYYY')}
        </Text>
      </View>

      {/* Data Table */}
      <ScrollView style={{ flex: 1 }}>
      <ScrollView horizontal={true}  style={styles.tableContainer}>
        <DataTable style={styles.dataTable}>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={styles.tableCell}>Emp ID</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>Name</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>Leave Type</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>From Date</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>To Date</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>Day</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>Days</DataTable.Title>
            <DataTable.Title style={styles.tableCell}>Shift</DataTable.Title>
          </DataTable.Header>

          {leaveData?.data?.map((item, index) => (
            <DataTable.Row key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
              <DataTable.Cell style={styles.tableCell}>{item.IDCARD1}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>{item.EMPNAME}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>{item.LTYPE}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>{formatTableDate(item.LFROMDATE)}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>{formatTableDate(item.LTODATE)}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>{item.LDAY?.trim()}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>{item.NDAYS}</DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>
                {item.HALFDAY === 'I & II' ? 'Full Day' : item.HALFDAY}
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
      </ScrollView>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Leave Days:</Text>
          <Text style={styles.summaryValue}>
            {leaveData?.data?.reduce((sum, item) => sum + (item.NDAYS || 0), 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Available Leaves:</Text>
          <Text style={styles.summaryValue}>
            {leaveData?.data?.[0]?.AVAILLEAVES || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.lightBackground,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  dateText: {
    marginLeft: 8,
    color: Colors.dark,
    fontSize: 14,
  },
  toText: {
    marginHorizontal: 5,
    color: Colors.gray,
    fontSize: 14,
  },
  header: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  tableContainer: {
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dataTable: {
    padding: 5,
  },
  tableHeader: {
    backgroundColor: Colors.primaryLight,
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    justifyContent: 'center',
  },
  evenRow: {
    backgroundColor: Colors.white,
  },
  oddRow: {
    backgroundColor: Colors.lightBackground,
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.dark,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.grayDark,
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 14,
  },
});

export default LeaveReport;