import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import CustomDropdownSelect from '../../../../components/DropDownSelect/DropDownSelect';
import { EsiandPFBodyStyle } from '../Style/EsiPfStyle';
import CustomText from '../../../../components/Text/CustomText';
import { useGetOverTimeQuery } from '../../../../store/api/dashboardApi';
import { NumbertoCurrency } from '../../../../components/Utils/NumberToCurrency';

function OTIndividualModalBody({ CurrentOTAmt, CurrentYearandMonth, UserId }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 600; // Tablet breakpoint

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    esiPfContainer: {
      flex: 1,
      padding: isTablet ? 20 : 15,
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      margin: isTablet ? 10 : 5,
    },
    dropdownRow: {
      flexDirection: isLandscape ? 'row' : 'column',
      justifyContent: 'space-between',
      marginBottom: 15,
      gap: isLandscape ? 0 : 10,
    },
    dateText: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: '600',
      color: '#333',
      marginVertical: 15,
      textAlign: 'center',
    },
    tablesContainer: {
      flex: 1,
      flexDirection: isLandscape ? 'row' : 'column',
      gap: 15,
    },
    tableWrapper: {
      flex: isLandscape ? 1 : undefined,
    },
    tableContainer: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      maxHeight: isLandscape ? height * 0.6 : height * 0.4,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#3f51b5',
      paddingVertical: isTablet ? 14 : 12,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: isTablet ? 14 : 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      minHeight: isTablet ? 50 : 40,
    },
    evenRow: {
      backgroundColor: '#f9f9f9',
    },
    oddRow: {
      backgroundColor: '#fff',
    },
    headerCell: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    headerText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: isTablet ? 16 : 14,
    },
    cell: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
    },
    cellText: {
      fontSize: isTablet ? 15 : 14,
      color: '#333',
    },
    amountText: {
      fontWeight: '600',
      color: '#2e7d32',
    },
    summaryContainer: {
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      padding: isTablet ? 20 : 15,
      minWidth: isLandscape ? 250 : '100%',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
      color: '#333',
    },
    summaryValue: {
      fontSize: isTablet ? 18 : 16,
      fontWeight: '700',
      color: '#3f51b5',
    },
    noDataText: {
      textAlign: 'center',
      padding: 20,
      color: '#666',
      fontSize: isTablet ? 18 : 16,
    },
  });

  // Column widths - now responsive
  const columnWidths = {
    sno: isTablet ? 60 : 50,
    date: isTablet ? 150 : 120,
    hour: isTablet ? 120 : 100,
    amount: isTablet ? 150 : 120,
  };

  const [Otyear, setOtyear] = useState();
  const [OtMonth, setOtMonth] = useState();

  var OTpfEsiPayperiod = OtMonth && Otyear ? OtMonth + " " + Otyear : CurrentYearandMonth;

  useLayoutEffect(() => {
    const year = CurrentYearandMonth?.split(" ")[1];
    const Month = CurrentYearandMonth?.split(" ")[0];
    setOtyear(Number(year));
    setOtMonth(Month);
  }, []);

  const { data: OverTimedata } = useGetOverTimeQuery({
    params: {
      Idcard: UserId?.UserId ? UserId?.UserId : UserId,
      payperiod: OTpfEsiPayperiod,
      COMPCODE: UserId?.GCOMPCODE
    }
  });

  const OtData = OverTimedata?.data ? OverTimedata?.data?.reduce(function (acc, obj) {
    return { OTAMT: acc.OTAMT + obj.OTAMT, OT: acc.OT + obj.OT };
  }, { OTAMT: 0, OT: 0 }) : {};

  return (
    <View style={styles.container}>
      <View style={styles.esiPfContainer}>
        <View style={styles.dropdownRow}>
          <CustomDropdownSelect
            placeholder={"Select Year"}
            width={isLandscape ? (isTablet ? '48%' : '45%') : '100%'}
            isyear={true}
            selectedValue={Otyear}
            setSelectedValue={setOtyear}
          />
          <CustomDropdownSelect
            placeholder={"Select Month"}
            width={isLandscape ? (isTablet ? '48%' : '45%') : '100%'}
            ismonth={true}
            selectedValue={OtMonth}
            setSelectedValue={setOtMonth}
          />
        </View>

        <CustomText style={styles.dateText}>
          Overtime for: {Otyear ? OtMonth + " " + Otyear : CurrentYearandMonth}
        </CustomText>

        <View style={styles.tablesContainer}>
          {/* Main Table */}
          <View style={[styles.tableWrapper, { flex: isLandscape ? 2 : undefined }]}>
            <View style={styles.tableContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <View style={{ width: columnWidths.sno }}>
                      <Text style={styles.headerText}>S.NO</Text>
                    </View>
                    <View style={{ width: columnWidths.date }}>
                      <Text style={styles.headerText}>Date</Text>
                    </View>
                    <View style={{ width: columnWidths.hour }}>
                      <Text style={styles.headerText}>OT Hours</Text>
                    </View>
                    <View style={{ width: columnWidths.amount }}>
                      <Text style={styles.headerText}>OT Amount</Text>
                    </View>
                  </View>

                  {/* Table Body */}
                  <ScrollView>
                    {OverTimedata?.data ? (
                      OverTimedata?.data.map((item, index) => (
                        <View
                          key={index}
                          style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.evenRow : styles.oddRow
                          ]}
                        >
                          <View style={{ width: columnWidths.sno }}>
                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{index + 1}</Text>
                          </View>
                          <View style={{ width: columnWidths.date }}>
                            <Text style={styles.cellText}>{item.DOCDATE}</Text>
                          </View>
                          <View style={{ width: columnWidths.hour }}>
                            <Text style={[styles.cellText, { textAlign: 'right' }]}>{item.OT} Hr</Text>
                          </View>
                          <View style={{ width: columnWidths.amount }}>
                            <Text style={[styles.cellText, styles.amountText, { textAlign: 'right' }]}>
                              {Number(item?.OTAMT).toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={[styles.tableRow, { justifyContent: 'center', width: '100%' }]}>
                        <Text style={styles.noDataText}>No overtime data available</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Days:</Text>
              <Text style={styles.summaryValue}>{OverTimedata?.data?.length || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Hours:</Text>
              <Text style={styles.summaryValue}>{OtData?.OT || 0} Hr</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={[styles.summaryValue, { color: '#2e7d32' }]}>
                {NumbertoCurrency(OtData?.OTAMT || 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default OTIndividualModalBody;

