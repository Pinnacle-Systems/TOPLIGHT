import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGetFilterEmployeesQuery } from '../../../../redux/service/misDashboardService';
import { useGetUserBasicDetailsQuery } from '../../../../redux/service/user';
import CustomizeButton from '../../../Buttons/CustomizeButton';
import AntDesign from 'react-native-vector-icons/AntDesign'
function EmployeeFilter({ hod,admin, USER,setFilteredEmpId,closeModel,temp,set_tempsearch}) {
  const [searchText, setSearchText] = useState();
  const { data, refetch } = useGetFilterEmployeesQuery({ params: { hod,admin } });
  const filterData = data?.data ? data.data.filter(item => item.Idcard!=hod   ).map((data)=>data?.Idcard) : [];
  const { data: filterEmployeeData, isLoading, isError,error, refetch: ref_filter } = useGetUserBasicDetailsQuery({ Idcard: String(filterData), ismul: true });

  useEffect(() => {
    if (filterData.length > 0) {
      ref_filter({ Idcard: filterData, ismul: true });
    }
  }, [data]);

  useEffect(()=>{
setSearchText(temp)
  },[temp])



  // Prepare employees from API response
  const employees = filterEmployeeData?.data || []; // assume API gives data in { data: [...] } format

  const filteredEmployees = employees.filter(emp => {
    const matchesName = emp?.FNAME?.toLowerCase().includes(searchText?.toLowerCase());
    const matchesId = emp?.EMPID?.toLowerCase().includes(searchText?.toLowerCase());
    return matchesName || matchesId;
  });

  const onselected=(item)=>{
    setFilteredEmpId(item?.EMPID)
    set_tempsearch(item?.FNAME)
    closeModel(false)
  }


 
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={()=>onselected(item)}>
    <View style={styles.employeeItem} >
      <Image
        source={{ uri: item?.PhotoPath || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item?.FNAME || '-'}</Text>
        <Text style={styles.employeeRole}>{item?.DESIGNATION || 'No Designation'}</Text>
        <Text style={styles.employeeEmail}>{item?.EMPID || '-'}</Text>
        <Text style={styles.employeeEmail}>Mobile - {item?.MOBNO || '-'}</Text>
      </View>
    </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#636e72" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red' }}>Failed to load employees.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Name or ID..."
        value={searchText}
        onChangeText={text => setSearchText(text)}
      />

      {/* Employee List */}
      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.Idcard}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.noResults}>No employees found.</Text>}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  searchInput: {
    height: 50,
    borderColor: '#e1e2e3',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#dfe6e9',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3436',
  },
  employeeRole: {
    fontSize: 14,
    color: '#636e72',
  },
  employeeEmail: {
    fontSize: 13,
    color: '#b2bec3',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#636e72',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmployeeFilter;
