import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useGetMisDashboardOrdersInHandMonthWiseQuery } from '../redux/service/misDashboardService';
import { DateInput } from '../ReusableComponents/inputs';
import { screenWidth } from './Utils/Screens';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';

export default function AttendanceReport() {
    const [date, setDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [uniqueDepartments, setUniqueDepartments] = useState([]);
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [filter_enable,set_filter_enable]=useState(false)
    const { width } = useWindowDimensions();
    const isTablet = width >= 768; // Tablet breakpoint

    const { 
      data, 
      isLoading, 
      isFetching, 
      refetch 
    } = useGetMisDashboardOrdersInHandMonthWiseQuery({ params: { date: date } });
    
    const rawTableData = data?.data || [];
    
    // Extract unique departments and categories when data changes
    useEffect(() => {
        if (rawTableData.length > 0) {
            const departments = [...new Set(rawTableData.map(item => item.DEPTNAME))];
            const categories = [...new Set(rawTableData.map(item => item.BANDID))];
            
            setUniqueDepartments(['all', ...departments]);
            setUniqueCategories(['all', ...categories]);
        }
    }, [rawTableData]);

    // Filter data based on selected filters
    const tableData = rawTableData.filter(item => {
        const departmentMatch = departmentFilter === 'all' || item.DEPTNAME === departmentFilter;
        const categoryMatch = categoryFilter === 'all' || item.BANDID === categoryFilter;
        return departmentMatch && categoryMatch;
    });

    // Column widths adjusted for responsiveness
    const columnWidths = {
        sno: isTablet ? 60 : 50,
        category: isTablet ? 200 : 160,
        department: isTablet ? 200 : 160,
        genderGroup: isTablet ? 240 : 200,
        subColumn: isTablet ? 80 : 70
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3f51b5" />
                <Text style={styles.loadingText}>Loading Attendance Data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Attendance Report</Text>
                <DateInput 
                    date={date} 
                    setDate={setDate} 
                    style={styles.datePicker}
                />
            </View>

            {/* Filter Section */}

             <TouchableOpacity onPress={()=>set_filter_enable(!filter_enable)} style={ tailwind`absolute right-2 top-3 z-100`}>
                { !filter_enable  ?  <AntDesign   name="filter" size={24} color="black" /> :
                <MaterialIcons name="filter-alt-off" size={24} color="black" />}
                </TouchableOpacity>
            <View style={[styles.filterContainer,filter_enable && tailwind`relative border-2  p-3 border-gray-200`]}>
                
{
 filter_enable && <>
 
  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Department:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={departmentFilter}
                            style={styles.picker}
                            onValueChange={(itemValue) => setDepartmentFilter(itemValue)}
                        >
                            {uniqueDepartments.map((dept, index) => (
                                <Picker.Item key={`dept-${index}`} label={dept === 'all' ? 'All Departments' : dept} value={dept} />
                            ))}
                        </Picker>
                    </View>
                </View>
                
                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Category:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={categoryFilter}
                            style={styles.picker}
                            onValueChange={(itemValue) => setCategoryFilter(itemValue)}
                        >
                            {uniqueCategories.map((cat, index) => (
                                <Picker.Item key={`cat-${index}`} label={cat === 'all' ? 'All Categories' : cat} value={cat} />
                            ))}
                        </Picker>
                    </View>
                </View>
 
 
 </>

}

               

            </View>

            {/* Loading indicator when fetching new data */}
            {isFetching && !refreshing && (
                <View style={styles.fetchingIndicator}>
                    <ActivityIndicator size="small" color="#3f51b5" />
                </View>
            )}

            {/* Results count */}
            <Text style={styles.resultsCount}>
                Showing {tableData.length} of {rawTableData.length} records
            </Text>

            {/* Table Section */}
            <ScrollView 
                style={styles.outerScroll}
                nestedScrollEnabled
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3f51b5']}
                        tintColor="#3f51b5"
                    />
                }
            >
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                >
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.row, styles.headerRow]}>
                            {/* Serial Number */}
                            <View style={[styles.headerCell, { width: columnWidths.sno }]}>
                                <Text style={styles.headerText}>S.NO</Text>
                            </View>
                            
                            {/* Category */}
                            <View style={[styles.headerCell, { width: columnWidths.category }]}>
                                <Text style={styles.headerText}>Category</Text>
                            </View>
                            
                            {/* Department */}
                            <View style={[styles.headerCell, { width: columnWidths.department }]}>
                                <Text style={styles.headerText}>Department</Text>
                            </View>
                          
                            {/* Male Column Group */}
                            <View style={[styles.genderGroup, { width: columnWidths.genderGroup }]}>
                                <View style={styles.genderHeader}>
                                    <Text style={styles.genderHeaderText}>Male</Text>
                                </View>
                                <View style={styles.subHeaderRow}>
                                    <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.subHeaderText}>Total</Text>
                                    </View>
                                    <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.subHeaderText}>Present</Text>
                                    </View>
                                    <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.subHeaderText}>Absent</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Female Column Group */}
                            <View style={[styles.genderGroup, { width: columnWidths.genderGroup }]}>
                                <View style={styles.genderHeader}>
                                    <Text style={styles.genderHeaderText}>Female</Text>
                                </View>
                                <View style={styles.subHeaderRow}>
                                    <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.subHeaderText}>Total</Text>
                                    </View>
                                    <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.subHeaderText}>Present</Text>
                                    </View>
                                    <View style={[styles.subHeaderCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.subHeaderText}>Absent</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Table Data Rows */}
                        {tableData.length > 0 ? (
                            tableData.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.row,
                                        styles.dataRow,
                                        index % 2 === 0 ? styles.evenRow : styles.oddRow
                                    ]}
                                >
                                    {/* Serial Number */}
                                    <View style={[styles.cell, { width: columnWidths.sno }]}>
                                        <Text style={styles.cellText}>{index + 1}</Text>
                                    </View>
                                    
                                    {/* Category */}
                                    <View style={[styles.cell, { width: columnWidths.category }]}>
                                        <Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
                                            {item.BANDID || '-'}
                                        </Text>
                                    </View>
                                    
                                    {/* Department */}
                                    <View style={[styles.cell, { width: columnWidths.department }]}>
                                        <Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
                                            {item.DEPTNAME || '-'}
                                        </Text>
                                    </View>
                                    
                                    {/* Male Data */}
                                    <View style={[styles.cell, styles.numberCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.cellText}>
                                            {Number(item?.PREMALE || 0) + Number(item?.ABSMALE || 0)}
                                        </Text>
                                    </View>
                                    <View style={[styles.cell, styles.numberCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.cellText}>{item.PREMALE || 0}</Text>
                                    </View>
                                    <View style={[styles.cell, styles.numberCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.cellText}>{item.ABSMALE || 0}</Text>
                                    </View>
                                    
                                    {/* Female Data */}
                                    <View style={[styles.cell, styles.numberCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.cellText}>
                                            {Number(item?.PREFEMALE || 0) + Number(item?.ABSFEMALE || 0)}
                                        </Text>
                                    </View>
                                    <View style={[styles.cell, styles.numberCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.cellText}>{item.PREFEMALE || 0}</Text>
                                    </View>
                                    <View style={[styles.cell, styles.numberCell, { width: columnWidths.subColumn }]}>
                                        <Text style={styles.cellText}>{item?.ABSFEMALE || 0}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No attendance data available for selected filters</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#555',
    },
    fetchingIndicator: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        flexWrap: 'wrap',
        rowGap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2c3e50',
    },
    datePicker: {
        width: 200,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        flexWrap: 'wrap',
        rowGap: 3,
        padding:5
    },
    filterItem: {
        display:"flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginRight: 16,
        maxWidth:screenWidth/3

    },
    filterLabel: {
        marginRight: 8,
        fontSize: 16,
        color: '#555',
    },
    pickerContainer: {
       
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#fff',
        width:screenWidth/2.5
    },
    picker: {
        height: 40,
        width: '100%',
    },
    resultsCount: {
        marginBottom: 12,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    outerScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    horizontalScroll: {
        flexGrow: 1,
    },
    table: {
        borderRadius: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        minHeight: 52,
    },
    headerRow: {
        backgroundColor: '#3f51b5',
    },
    dataRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    evenRow: {
        backgroundColor: '#ffffff',
    },
    oddRow: {
        backgroundColor: '#f8f9fa',
    },
    headerCell: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.2)',
    },
    headerText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 15,
    },
    genderGroup: {
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.3)',
    },
    genderHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    genderHeaderText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    subHeaderRow: {
        flexDirection: 'row',
    },
    subHeaderCell: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.2)',
    },
    subHeaderText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
    },
    numberCell: {
        backgroundColor: 'rgba(63, 81, 181, 0.05)',
    },
    cellText: {
        fontSize: 14,
        color: '#333333',
        textAlign: 'center',
    },
    noDataContainer: {
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    noDataText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});