import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Dropdown } from '../../../../ReusableComponents/inputs';
import moment from 'moment';
import { screenWidth } from '../../../Utils/Screens';
import { useGetEmployeeidsQuery } from '../../../../redux/service/user';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux';
import FilterModel from '../../../FilterModal/FilterModel';
import { useGetHod_showable_dataQuery } from '../../../../redux/service/Advance';

const AdvanceLoanList = () => {
  const [Idcard_filter, setIdCard_Idcard] = useState([]);
  const [selected_item_status, setSelected_item_status] = useState("");
  const [status_filter, set_status_filter] = useState();
  const [showFilters, setShowFilters] = useState(false);
  const [myLoans, setMyLoans] = useState(true);
  const [more_model, setmore_model] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const UserSelect = useSelector((state) => state?.UserDetails);
  const { data, isLoading, isFetching } = useGetHod_showable_dataQuery({ 
    params: myLoans ? { id: UserSelect?.UserId } : { hod: UserSelect?.UserId }
  });
  const { data: employee, isLoading: loading_employee } = useGetEmployeeidsQuery();

  const clearFilters = () => {
    setSearchQuery('');
    setIdCard_Idcard([]);
    set_status_filter(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedItem(item);
        setSelected_item_status(item?.approvalStatus);
        setmore_model(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.docId}>#{item.docid}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approvalStatus) }]}>
          <FontAwesome name="circle" size={10} color="white" />
          <Text style={styles.statusText}>{item.approvalStatus}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={16} color="#555" />
          <Text style={styles.infoText}>{item.createdBy_user?.username}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#555" />
          <Text style={styles.infoText}>{moment(item.docDate).format('DD MMM YYYY')}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Loan Amount</Text>
          <Text style={styles.amountValue}>₹{item.totalloan}</Text>
        </View>
        
        <View style={styles.installmentContainer}>
          <View style={styles.installmentItem}>
            <MaterialCommunityIcons name="calendar-clock" size={14} color="#555" />
            <Text style={styles.installmentText}>{item.ins} months</Text>
          </View>
          <View style={styles.installmentItem}>
            <MaterialCommunityIcons name="currency-inr" size={14} color="#555" />
            <Text style={styles.installmentText}>₹{item.due}/month</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const handleTabSwitch = (tab) => {
    setMyLoans(tab === 'my');
  };

  const Filtered_data = data?.data?.length > 0 ? data?.data?.filter(item => {
    const matchesId = Idcard_filter?.length === 0 || Idcard_filter.includes(item.userId);
    const matchesStatus = !status_filter || item.approvalStatus === status_filter;
    const matchesSearch = !searchQuery || item.docid.includes(searchQuery);
    return matchesId && matchesStatus && matchesSearch;
  }) : [];

  if (isLoading || isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading loan requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advance Loan Report</Text>
      </View>

      {/* Tabs and Filter Button */}
      <View style={styles.tabContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, myLoans && styles.activeTab]} 
            onPress={() => handleTabSwitch('my')}
          >
            <Text style={[styles.tabText, myLoans && styles.activeTabText]}>My Loans</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, !myLoans && styles.activeTab]} 
            onPress={() => handleTabSwitch('all')}
          >
            <Text style={[styles.tabText, !myLoans && styles.activeTabText]}>Team Loans</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons 
            name={showFilters ? "filter-remove" : "filter"} 
            size={20} 
            color={showFilters ? "#F44336" : "#3B82F6"} 
          />
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filterSection}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholder="Search by Loan ID..."
            placeholderTextColor="#999"
          />

          <View style={styles.filterRow}>
            <Dropdown
              selected={Idcard_filter}
              isLoading={loading_employee}
              label="Filter by Employee"
              multiple
              width={screenWidth * 0.8}
              setSelected={setIdCard_Idcard}
              options={employee}
              zIndex={300}
              style={styles.dropdown}
            />
          </View>

          <View style={styles.filterRow}>
            <Dropdown
              selected={status_filter}
              label="Filter by Status"
              width={screenWidth * 0.8}
              _label="label"
              _value="value"
              setSelected={set_status_filter}
              options={{
                data: [
                  { label: '✔ Approved', value: 'approved' },
                  { label: '❌ Rejected', value: 'rejected' },
                  { label: '⏳ Pending', value: 'pending' },
                ],
              }}
              zIndex={299}
              style={styles.dropdown}
            />
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loan List */}
      {Filtered_data?.length > 0 ? (
        <FlatList
          data={Filtered_data}
          keyExtractor={(item) => item.docid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cash-multiple" size={48} color="#9E9E9E" />
          <Text style={styles.emptyStateTitle}>No Loan Requests Found</Text>
          <Text style={styles.emptyStateText}>
            {showFilters ? 
              "Try adjusting your filters" : 
              "Check back later for new requests"}
          </Text>
          {showFilters && (
            <TouchableOpacity style={styles.emptyStateButton} onPress={clearFilters}>
              <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Details Modal */}
      <View style={{position:"absolute"}}>
      <FilterModel
        close={"direct"}
        modalVisible={more_model}
        style={{ backgroundColor: getStatusColor(selected_item_status) }}
        setModalVisible={setmore_model}
        name="Loan Details"
      >
        {selectedItem && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Loan Details</Text>
              <View style={[styles.modalStatus, { backgroundColor: getStatusColor(selectedItem.approvalStatus) }]}>
                <Text style={styles.modalStatusText}>{selectedItem.approvalStatus}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="identifier" size={16} color="#555" />
                  <Text style={styles.labelText}>Loan ID</Text>
                </View>
                <Text style={styles.detailValue}>{selectedItem.docid}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="account" size={16} color="#555" />
                  <Text style={styles.labelText}>Employee</Text>
                </View>
                <Text style={styles.detailValue}>{selectedItem.createdBy_user?.username}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="calendar" size={16} color="#555" />
                  <Text style={styles.labelText}>Request Date</Text>
                </View>
                <Text style={styles.detailValue}>{moment(selectedItem.docDate).format('DD MMM YYYY')}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Loan Details</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="cash" size={16} color="#555" />
                  <Text style={styles.labelText}>Amount</Text>
                </View>
                <Text style={[styles.detailValue, { color: '#2E7D32', fontWeight: '600' }]}>
                  ₹{selectedItem.totalloan}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="calendar-clock" size={16} color="#555" />
                  <Text style={styles.labelText}>Installments</Text>
                </View>
                <Text style={styles.detailValue}>{selectedItem.ins} months</Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="currency-inr" size={16} color="#555" />
                  <Text style={styles.labelText}>Monthly Due</Text>
                </View>
                <Text style={styles.detailValue}>₹{selectedItem.due}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="note-text" size={16} color="#555" />
                  <Text style={styles.labelText}>Purpose</Text>
                </View>
                <Text style={[styles.detailValue, { textAlign: 'left' }]}>
                  {selectedItem.remark || 'No purpose specified'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </FilterModel>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 16,
    color: '#555',
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#3B82F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: 'white',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
  filterSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterRow: {
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
  },
  clearButton: {
    alignSelf: 'center',
    padding: 12,
    marginBottom: 8,
  },
  clearButtonText: {
    color: '#F44336',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  docId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  amountContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  installmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
  },
  installmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  installmentText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalContent: {
    padding: 16,
     width:"100%"
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  modalStatusText: {
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
});

export default AdvanceLoanList;