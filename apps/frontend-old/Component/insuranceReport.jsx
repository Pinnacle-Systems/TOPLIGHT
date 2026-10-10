import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from './Text/CustomText';
import { setTableData } from '../redux/Slices/insuranceDataSlice';
import { setCountUnder20DueDays } from '../redux/Slices/dueDaysSlice';
import { useGetMisDashboardOrdersInHandQuery } from '../redux/service/misDashboardService';
import tailwind from 'twrnc';

export default function InsuranceReport({ route }) {
 const { width, height } = useWindowDimensions()
   const isLandscape = width > height;
    // const { width } = Dimensions.get('window');

    const tableData = useSelector(state => state.tableData.tableData) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDueDays, setFilterDueDays] = useState(null);
    const dispatch=useDispatch()
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
 const { data: insurancedata } = useGetMisDashboardOrdersInHandQuery({ params: {} });
    // Calculate column widths based on orientation
    const columnWidths = useMemo(() => {
        if (isLandscape) {
            return {
                sno: 50,
                usedby: 120,
                discoFinAsset: 120,
                vehNo: 120,
                vehName: 150,
                policyNo: 170,
                insuredby: 220,
                validFrom: 120,
                validTo: 120,
                totalPremium: 100,
                dueDays: 100
            };
        } else {
            return {
                sno: 40,
                usedby: 100,
                discoFinAsset: 100,
                vehNo: 100,
                vehName: 120,
                policyNo: 140,
                insuredby: 200,
                validFrom: 100,
                validTo: 100,
                totalPremium: 80,
                dueDays: 80
            };
        }
    }, [isLandscape]);


     useEffect(() => {
            if (insurancedata?.data) {
                const formattedData = insurancedata.data.map(item => ({
                    sno: item.sno,
                    discoFinAsset: item.discoFinAsset,
                    policyNo: item.policyNo,
                    vehNo: item.vehNo,
                    vehName: item.vehName,
                    totalPremium: item.totalPremium,
                    validFrom: item.validFrom,
                    validTo: item.validTo,
                    insuredby: item.insuredby,
                    dueDays: item.dueDays,
                    ...item
                }));
                dispatch(setTableData(formattedData));
                const count = formattedData.filter(item => item.dueDays < 30).length;
                dispatch(setCountUnder20DueDays(count));
            }
        }, [insurancedata]);

    const getDueDaysStyle = (due) => {
        const days = due || 0;
        if (days < 0) return styles.dueDaysExpired;
        return days < 30 ? styles.dueDaysWarning : styles.dueDaysNormal;
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        if (route?.params?.warning) {
            setFilterDueDays("warning");
        }
    }, [route?.params?.warning]);

    const filteredData = tableData.filter(item => {
        if (!item) return false;
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            (item.vehNo?.toLowerCase() || '').includes(searchLower) ||
            (item.vehName?.toLowerCase() || '').includes(searchLower) ||
            (item.policyNo?.toLowerCase() || '').includes(searchLower) ||
            (item.usedby?.toLowerCase() || '').includes(searchLower) ||
            (item.insuredby?.toLowerCase() || '').includes(searchLower);
        
        const matchesDueFilter = 
            filterDueDays === null || 
            (filterDueDays === 'expired' && (item.dueDays || 0) < 0) ||
            (filterDueDays === 'warning' && (item.dueDays || 0) >= 0 && (item.dueDays || 0) < 30) ||
            (filterDueDays === 'normal' && (item.dueDays || 0) >= 30);
        
        return matchesSearch && matchesDueFilter;
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'ascending' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        return sortConfig.direction === 'ascending' 
            ? (aValue < bValue ? -1 : 1)
            : (aValue > bValue ? -1 : 1);
    });

    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return (
            <MaterialIcons 
                name={sortConfig.direction === 'ascending' ? 'arrow-drop-up' : 'arrow-drop-down'} 
                size={18} 
                color="#333" 
            />
        );
    };

    const renderItem = ({ item, index }) => (
        <View style={[
            styles.row,
            index % 2 === 0 ? styles.evenRow : styles.oddRow
        ]}>
            <View style={[styles.cell, { width: columnWidths.sno }]}>
                <CustomText style={styles.cellText}>{item.sno}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.usedby }]}>
                <CustomText style={styles.cellText}>{item.usedby}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.discoFinAsset }]}>
                <CustomText style={styles.cellText}>{item.discoFinAsset}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.vehNo }]}>
                <CustomText style={getDueDaysStyle(item.dueDays)}>{item.vehNo}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.vehName }]}>
                <CustomText style={getDueDaysStyle(item.dueDays)}>{item.vehName}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.policyNo }]}>
                <CustomText style={styles.cellText}>{item.policyNo}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.insuredby }]}>
                <CustomText style={styles.cellText}>{item.insuredby}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.validFrom }]}>
                <CustomText style={styles.cellText}>{moment(item.validFrom).format('DD/MM/YYYY')}</CustomText>
            </View>
            <View style={[styles.cell, { width: columnWidths.validTo }]}>
                <CustomText style={styles.cellText}>{moment(item.validTo).format('DD/MM/YYYY')}</CustomText>
            </View>
            <View style={[styles.cellNumber, { width: columnWidths.totalPremium }]}>
                <CustomText style={styles.cellNum}>₹{item.totalPremium}</CustomText>
            </View>
            <View style={[styles.cellNumber, { width: columnWidths.dueDays }]}>
                <CustomText style={getDueDaysStyle(item.dueDays)}>{item.dueDays}</CustomText>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={[styles.row, styles.headerRow]}>
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.sno }]}
                onPress={() => handleSort('sno')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Sno</CustomText>
                    <SortIndicator columnKey="sno" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.usedby }]}
                onPress={() => handleSort('usedby')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Driver</CustomText>
                    <SortIndicator columnKey="usedby" />
                </View>
            </TouchableOpacity> 

            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.discoFinAsset }]}
                onPress={() => handleSort('discoFinAsset')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Asset</CustomText>
                    <SortIndicator columnKey="discoFinAsset" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.vehNo }]}
                onPress={() => handleSort('vehNo')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Vehicle No</CustomText>
                    <SortIndicator columnKey="vehNo" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.vehName }]}
                onPress={() => handleSort('vehName')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Vehicle Name</CustomText>
                    <SortIndicator columnKey="vehName" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.policyNo }]}
                onPress={() => handleSort('policyNo')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Policy No</CustomText>
                    <SortIndicator columnKey="policyNo" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.insuredby }]}
                onPress={() => handleSort('insuredby')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Insured By</CustomText>
                    <SortIndicator columnKey="insuredby" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.validFrom }]}
                onPress={() => handleSort('validFrom')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Valid From</CustomText>
                    <SortIndicator columnKey="validFrom" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.validTo }]}
                onPress={() => handleSort('validTo')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Valid To</CustomText>
                    <SortIndicator columnKey="validTo" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.totalPremium }]}
                onPress={() => handleSort('totalPremium')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Premium</CustomText>
                    <SortIndicator columnKey="totalPremium" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.cell, { width: columnWidths.dueDays }]}
                onPress={() => handleSort('dueDays')}
            >
                <View style={styles.headerCellContent}>
                    <CustomText style={styles.headerText}>Due Days</CustomText>
                    <SortIndicator columnKey="dueDays" />
                </View>
            </TouchableOpacity>
        </View>
    );

   const  View_Content=()=>(
        
        <View style={[styles.pageContainer, isLandscape && styles.landscapeContainer,tailwind`h-screen`]}>
            <CustomText style={styles.header}>Insurance Detail Report</CustomText>
            
            {/* Filter Controls */}
            <View style={[styles.filterContainer, isLandscape && styles.landscapeFilterContainer]}>
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by vehicle, policy, etc..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholderTextColor="#999"
                    />
                </View>
                
                <View style={styles.filterButtons}>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterDueDays === null && styles.activeFilter]}
                        onPress={() => setFilterDueDays(null)}
                    >
                        <CustomText>All</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterDueDays === 'expired' && styles.activeFilter]}
                        onPress={() => setFilterDueDays('expired')}
                    >
                        <CustomText style={styles.dueDaysExpired}>Expired</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterDueDays === 'warning' && styles.activeFilter]}
                        onPress={() => setFilterDueDays('warning')}
                    >
                        <CustomText style={styles.dueDaysWarning}>Warning</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterDueDays === 'normal' && styles.activeFilter]}
                        onPress={() => setFilterDueDays('normal')}
                    >
                        <CustomText style={styles.dueDaysNormal}>Normal</CustomText>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                horizontal 
                style={styles.horizontalScroll}
                contentContainerStyle={isLandscape && styles.landscapeScrollContent}
            >
                <View>
                    {renderHeader()}
                    <FlatList
                        data={sortedData}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={
                            <View style={styles.noDataContainer}>
                                <MaterialIcons name="error-outline" size={40} color="#999" />
                                <CustomText style={styles.noDataText}>No matching records found</CustomText>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
            
            <View style={styles.summaryContainer}>
                <CustomText style={styles.summaryText}>
                    Showing {sortedData.length} of {tableData.length} records
                </CustomText>
            </View>
        </View>
    );

    if(isLandscape){
        return (<ScrollView><View_Content></View_Content></ScrollView>)

     } else {
      return <View_Content></View_Content>

     }
}

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        paddingTop: 15,
        paddingHorizontal: 10,
        backgroundColor: '#f5f7fa',
    },
    landscapeContainer: {
        paddingHorizontal: 5,
       
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
        textAlign: 'center',
    },
    filterContainer: {
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flexDirection:"column"
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    landscapeSearchContainer: {
        flex: 1,
        marginBottom: 0,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: '#333',
    },
    filterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    landscapeFilterButtons: {
        marginTop: 0,
        width: 'auto',
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f8f9fa',
    },
    activeFilter: {
        backgroundColor: '#e3f2fd',
        borderColor: '#90caf9',
    },
    horizontalScroll: {
        flex: 1,
        marginBottom: 10,
    },
    landscapeScrollContent: {
        minWidth: '100%',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 50,
    },
    evenRow: {
        backgroundColor: '#f9f9f9',
    },
    oddRow: {
        backgroundColor: '#ffffff',
    },
    headerRow: {
        backgroundColor: '#e3f2fd',
    },
    headerCellContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 10,
    },
    headerText: {
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 13,
        color: '#333',
    },
    cellText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#444',
    },
    cellNumber: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 10,
    },
    dueDaysExpired: {
        color: '#d32f2f',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    dueDaysWarning: {
        color: '#ffa000',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    dueDaysNormal: {
        color: '#388e3c',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    cellNum: {
        textAlign: 'center',
        fontSize: 12,
        color: '#444',
    },
    noDataContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    summaryContainer: {
        padding: 10,
        backgroundColor: '#f5f7fa',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    summaryText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});