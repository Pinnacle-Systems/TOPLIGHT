import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useGet_leave_availableQuery } from '../../redux/service/Leave';
import { useSelector } from 'react-redux';

const Leave_AvailableScreen = () => {
 const UserSelect=useSelector((state)=>state?.UserDetails)
  const [searchText, setSearchText] = useState('');

  // Filtered data using memoization for performance


    const { data: leaveData, isLoading: loading } = useGet_leave_availableQuery({Idcard:UserSelect?.UserId});
  const filteredData = useMemo(() => {
     
    if (!leaveData?.data) return [];
   
    return  (Array.isArray(leaveData?.data) ? leaveData?.data : [])?.filter((item) =>
      item.FNAME.toLowerCase().includes(searchText.toLowerCase()) ||   item.IDCARD.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [leaveData?.data,searchText]);

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <Text style={styles.cell}>{item.IDCARD}</Text>
      <Text style={styles.cell}>{item.FNAME}</Text>
      <Text style={styles.cell}>{item.PAYCAT}</Text>
      <Text style={styles.cell}>{item.LCODE}</Text>
      <Text style={styles.cell}>{item.LDESC}</Text>
      <Text style={styles.cell}>{item.AVL}</Text>
      <Text style={styles.cell}>{item.LT}</Text>
      <Text style={styles.cell}>{item.LBAL}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Balance Report</Text>

      <TextInput
        placeholder="Search by Name"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#888"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : (
        <ScrollView horizontal>
          <View>
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.IDCARD + item.LCODE + index}
              ListHeaderComponent={
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={styles.headerCell}>ID</Text>
                  <Text style={styles.headerCell}>Name</Text>
                  <Text style={styles.headerCell}>PayCat</Text>
                  <Text style={styles.headerCell}>Code</Text>
                  <Text style={styles.headerCell}>Description</Text>
                  <Text style={styles.headerCell}>Available</Text>
                  <Text style={styles.headerCell}>Leave Taken</Text>
                  <Text style={styles.headerCell}>Leave BAL</Text>
                </View>
              }
              stickyHeaderIndices={[0]}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f2f2f2',
  },
  cell: {
    width: 100,
    fontSize: 13,
    paddingHorizontal: 5,
    color: '#333',
  },
  headerRow: {
    backgroundColor: '#4A90E2',
    borderBottomWidth: 1,
    borderColor: '#4A90E2',
    paddingVertical: 12,
  },
  headerCell: {
    width: 100,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
    paddingHorizontal: 5,
  },
});

export default Leave_AvailableScreen;
