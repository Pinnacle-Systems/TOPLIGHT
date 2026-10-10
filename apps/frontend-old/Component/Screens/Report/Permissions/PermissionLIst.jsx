import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Dropdown } from '../../../../ReusableComponents/inputs';
import moment from 'moment';
import { screenWidth } from '../../../Utils/Screens';
import { useGetEmployeeidsQuery } from '../../../../redux/service/user';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux';
import { useGet__per_categoryQuery, useGetHod_showable_dataQuery } from '../../../../redux/service/permission';
import FilterModel from '../../../FilterModal/FilterModel';

const PermissionList = () => {
  const [Idcard_filter, setIdCard_Idcard] = useState([]);
  const [category, setCategory] = useState();
  const [selected_item_status, setSelected_item_status] = useState("");
  const [status_filter, set_status_filter] = useState();
  const [showFilters, setShowFilters] = useState(false);
  const [My_permission, set_My_permission] = useState(true);
  const [more_model, setmore_model] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const UserSelect = useSelector((state) => state?.UserDetails);
  const { data: get_per_category, isLoading: get_cayegory_loading } = useGet__per_categoryQuery();
  const { data, isLoading, isFetching } = useGetHod_showable_dataQuery({ 
    params: My_permission ? { id: UserSelect?.UserId } : { hod: UserSelect?.UserId } 
  });
  const { data: employee, isLoading: loading_employee } = useGetEmployeeidsQuery();

  const clearFilters = () => {
    setSearchQuery('');
    setCategory(null);
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
        <Text style={styles.cardId}>#{item.docid}</Text>
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
        
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <MaterialCommunityIcons name="clock-start" size={14} color="#555" />
            <Text style={styles.timeText}>{item.fTime}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#777" />
          <View style={styles.timeBlock}>
            <MaterialCommunityIcons name="clock-end" size={14} color="#555" />
            <Text style={styles.timeText}>{item.tTime}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.moreText}>View details →</Text>
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
    set_My_permission(tab === 'my');
  };

  const Filtered_data = data?.data?.length > 0 ? data?.data?.filter(item => {
    const matchesId = Idcard_filter?.length === 0 || Idcard_filter.includes(item.userId);
    const matchesStatus = !status_filter || item.approvalStatus === status_filter;
    const matchesCategory = !category || item.category === category;
    const matchesSearch = !searchQuery || item.docid.includes(searchQuery);
    return matchesId && matchesStatus && matchesSearch && matchesCategory;
  }) : [];

  if (isLoading || isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading permission requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Permission Request Report</Text>
      </View>

      {/* Tabs and Filter Button */}
      <View style={styles.tabContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, My_permission && styles.activeTab]} 
            onPress={() => handleTabSwitch('my')}
          >
            <Text style={[styles.tabText, My_permission && styles.activeTabText]}>My Permissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, !My_permission && styles.activeTab]} 
            onPress={() => handleTabSwitch('all')}
          >
            <Text style={[styles.tabText, !My_permission && styles.activeTabText]}>Team Permissions</Text>
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
            placeholder="Search by Doc ID..."
            placeholderTextColor="#999"
          />

          <View style={styles.filterRow}>
            <Dropdown
              selected={category}
              isLoading={get_cayegory_loading}
              label="Filter by Category"
              _label="label"
              _value="value"
              width={screenWidth * 0.8}
              setSelected={setCategory}
              options={get_per_category}
              zIndex={300}
              style={styles.dropdown}
            />
          </View>

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

      {/* Content */}
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
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#9E9E9E" />
          <Text style={styles.emptyStateTitle}>No Permission Requests Found</Text>
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
        name="Permission Details"
      >
        {selectedItem && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <View style={[styles.modalStatus, { backgroundColor: getStatusColor(selectedItem.approvalStatus) }]}>
                <Text style={styles.modalStatusText}>{selectedItem.approvalStatus}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="identifier" size={16} color="#555" />
                  <Text style={styles.labelText}>Doc ID</Text>
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
                  <Text style={styles.labelText}>Date</Text>
                </View>
                <Text style={styles.detailValue}>{moment(selectedItem.docDate).format('DD MMM YYYY')}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Time Details</Text>
              <View style={styles.timeDetailRow}>
                <View style={styles.timeDetailBlock}>
                  <MaterialCommunityIcons name="clock-start" size={16} color="#555" />
                  <Text style={styles.timeDetailLabel}>From</Text>
                  <Text style={styles.timeDetailValue}>{selectedItem.fTime}</Text>
                </View>
                
                <MaterialCommunityIcons name="arrow-right" size={20} color="#777" style={styles.timeArrow} />
                
                <View style={styles.timeDetailBlock}>
                  <MaterialCommunityIcons name="clock-end" size={16} color="#555" />
                  <Text style={styles.timeDetailLabel}>To</Text>
                  <Text style={styles.timeDetailValue}>{selectedItem.tTime}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <MaterialCommunityIcons name="note-text" size={16} color="#555" />
                  <Text style={styles.labelText}>Reason</Text>
                </View>
                <Text style={[styles.detailValue, { textAlign: 'left' }]}>{selectedItem.reason || 'No reason provided'}</Text>
              </View>
              
              {selectedItem.category && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <MaterialCommunityIcons name="tag" size={16} color="#555" />
                    <Text style={styles.labelText}>Category</Text>
                  </View>
                  <Text style={styles.detailValue}>{selectedItem.category}</Text>
                </View>
              )}
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
  cardId: {
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  moreText: {
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
  timeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
  },
  timeDetailBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeDetailLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  timeDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeArrow: {
    marginHorizontal: 8,
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
    width:"auto"
  },
});

export default PermissionList;