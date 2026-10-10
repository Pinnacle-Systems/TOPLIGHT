import React, { useMemo, useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity, 
  Alert
} from 'react-native';
import { Colors } from '../../../../constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const EmployeeHeadReport = ({ data: employeeData,des,dep, isLoading,gender, fetchMoreData,loading }) => {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

 

  const formatDate = useCallback((date) => moment(date).format('DD MMM YYYY'), []);

  // Process and memoize the employee data
  const formattedData = useMemo(() => {
    // Alert?.alert("",JSON?.stringify(des))
      setLoadingMore(true);
    return employeeData?.filter((data)=>data?.GENDER==gender  &&  (des ? data?.DESIGNATION==des?.label : data?.DEPARTMENT==dep))?.map(emp =>{ 
      setLoadingMore(false);
      return ({
      ...emp,
      formattedDate: formatDate(emp.DOJ)
    })

  }
  
  )
      
  }, [employeeData, formatDate,gender,des]);

  // Function to load more data when scrolling
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && fetchMoreData) {
      setLoadingMore(true);
      const nextPage = page + 1;
      fetchMoreData(nextPage, () => {
        setPage(nextPage);
        setLoadingMore(false);
      });
    }
  }, [loadingMore, page, fetchMoreData]);

  // Render each employee card
  const renderEmployeeCard = useCallback(({ item: employee }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.employeeName} numberOfLines={1} ellipsizeMode="tail">
          {employee.EMPNAME}
        </Text>
        <Text style={styles.employeeId}>ID: {employee.IDCARD}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="gender-male-female" size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{employee.GENDER}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="briefcase" size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{employee.DESIGNATION}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="office-building" size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{employee.DEPARTMENT}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={18} color={Colors.primary} />
          <Text style={styles.detailText}>Band: {employee.BANDID}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.detailText}>Joined: {employee.formattedDate}</Text>
        </View>
      </View>
    </View>
  ), []);


  // Loading state
  if (isLoading || loadingMore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading employees...</Text>
      </View>
    );
  }

  // Empty state
  if (!isLoading && formattedData?.length==0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="account-alert" 
          size={48} 
          color={Colors.gray} 
        />
        <Text style={styles.emptyText}>No employees found</Text>
      </View>
    );
  }

  
  

  return (
    <View style={styles.container}>
      <FlatList
        data={formattedData}
        renderItem={renderEmployeeCard}
        keyExtractor={(item) => item.IDCARD}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.header}>Employee Report ({formattedData?.length || 0})</Text>
        }
        ListFooterComponent={
          loadingMore || isLoading ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  employeeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginRight: 8,
  },
  employeeId: {
    fontSize: 14,
    color: Colors.gray,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.dark,
  },
  footerLoading: {
    paddingVertical: 20,
  },
});

export default React.memo(EmployeeHeadReport);