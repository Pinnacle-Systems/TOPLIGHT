import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  ScrollView,
  Modal,
  Dimensions, 
  Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import tailwind from 'twrnc';

// Custom Components
import FilterModel from '../../../FilterModal/FilterModel';
import FROMTO_CustomDateInput from '../../../Inputs/FROM_TO_Custom_INPUT_DATE';
import CustomDropdownInput from '../../../Inputs/DropDownCustom';
import ProgressPopup from '../../../Utils/PopupLoading';

// API Services
import { 
  useGet__Date_Wise_Fuel_IndividualQuery, 
  useGet__Date_Wise_FuelQuery, 
  useGet__VechileQuery 
} from '../../../../redux/service/Onduty';

// Redux Actions
import { setInput } from '../../../../redux/Slices/inputsHandler';

const { width, height } = Dimensions.get('window');

const FuelList = () => {
  const [Idcard_filter, setIdCard_Idcard] = useState([]);
  const [selected_item_status, setSelected_item_status] = useState("");
  const [status_filter, set_status_filter] = useState();
  const [showFilters, setShowFilters] = useState(false);
  const [more_model, setmore_model] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data_store_loader, set_data_store_loader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    vehicleNo: '',
    driverName: '',
    amountRange: { min: '', max: '' },
    kmRange: { min: '', max: '' }
  });

  const FuelSelect = useSelector((state) => state?.Input?.Fuel_state);
  const dispatch = useDispatch();
  const { data: get_all_vechile } = useGet__VechileQuery();

  const {data: IndividualRecord_Data, isLoading: IndividualRecord_Loading} = useGet__Date_Wise_Fuel_IndividualQuery({
    params: {
      FROMDATE: FuelSelect?.from_date,
      TODATE: FuelSelect?.to_date,
      VEHICLENO1: selectedItem?.VEHICLENO || "ALL"
    }
  });

  const { data, isLoading, isFetching } = useGet__Date_Wise_FuelQuery({
    params: {
      FROMDATE: FuelSelect?.from_date,
      TODATE: FuelSelect?.to_date,
      VEHICLENO1: FuelSelect?.vechile || "ALL"
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setIdCard_Idcard([]);
    set_status_filter(null);
    setAdvancedFilters({
      vehicleNo: '',
      driverName: '',
      amountRange: { min: '', max: '' },
      kmRange: { min: '', max: '' }
    });
    dispatch(setInput({id:"Fuel_state", vechile: ""}));
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        set_data_store_loader(true);
        setmore_model(true); 
        setSelectedItem(item);
        setSelected_item_status(item?.approvalStatus);
        set_data_store_loader(false);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.vehicleBadge}>
          <MaterialCommunityIcons name="car" size={16} color="#3B82F6" />
          <Text style={styles.cardId}>{item.VEHICLENO}</Text>
        </View>
        <Text style={styles.vehicleName}>{item?.VEHNAME}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={16} color="#64748B" />
          <Text style={styles.infoText}>{item.USEDBY}</Text>
        </View>
        
        <View style={styles.dateRange}>
          <View style={styles.dateBlock}>
            <MaterialCommunityIcons name="calendar-start" size={14} color="#64748B" />
            <Text style={styles.dateText}>{FuelSelect?.from_date}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#94A3B8" />
          <View style={styles.dateBlock}>
            <MaterialCommunityIcons name="calendar-end" size={14} color="#64748B" />
            <Text style={styles.dateText}>{FuelSelect?.to_date}</Text>
          </View>
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#64748B" />
            <Text style={styles.metricText}>{item.TOTKM} KM</Text>
          </View>
          <View style={styles.metricItem}>
            <FontAwesome name="rupee" size={16} color="#64748B" />
            <Text style={[styles.metricText, styles.amountText]}>₹{item?.AMOUNT}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.moreText}>View Details</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#3B82F6" />
      </View>
    </TouchableOpacity>
  );

  const IndividualRecordTable = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="fuel" size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateText}>No detailed records available</Text>
        </View>
      );
    }

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderInfo}>
            <MaterialCommunityIcons name="car" size={20} color="#3B82F6" />
            <Text style={styles.detailTitle}>{selectedItem?.VEHICLENO}</Text>
          </View>
          <View style={styles.detailHeaderInfo}>
            <MaterialCommunityIcons name="account" size={20} color="#3B82F6" />
            <Text style={styles.detailSubtitle}>{selectedItem?.USEDBY}</Text>
          </View>
        </View>
        
        <View style={styles.detailTableHeader}>
          <Text style={[styles.detailHeaderText, {flex: 1}]}>Date</Text>
          <Text style={[styles.detailHeaderText, {flex: 1.5}]}>Station</Text>
          <Text style={[styles.detailHeaderText, {flex: 1}]}>Type</Text>
          <Text style={[styles.detailHeaderText, {flex: 1}]}>KM</Text>
          <Text style={[styles.detailHeaderText, {flex: 1}]}>Amount</Text>
        </View>

        <ScrollView style={styles.detailScrollView}>
          {data.map((record, index) => (
            <View key={index} style={styles.detailTableRow}>
              <Text style={[styles.detailRowText, {flex: 1}]}>
                {moment(record.TOKENDATE).format('DD/MM')}
              </Text>
              <Text style={[styles.detailRowText, {flex: 1.5}]} numberOfLines={1}>
                {record.BUNKNAME}
              </Text>
              <Text style={[styles.detailRowText, {flex: 1}]}>
                {record.ITEMNAME}
              </Text>
              <Text style={[styles.detailRowText, {flex: 1}]}>
                {record.TOTKM}
              </Text>
              <Text style={[styles.detailRowText, {flex: 1, color: '#10B981'}]}>
                ₹{record.AMOUNT}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };


  

  const Filtered_data = data?.data?.length > 0 ? data?.data?.filter(item => {
    const matchesSearch = !searchQuery || 
      item.VEHICLENO.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.USEDBY.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVehicle = !advancedFilters.vehicleNo || 
      item.VEHICLENO.toLowerCase().includes(advancedFilters.vehicleNo.toLowerCase());
    
    const matchesDriver = !advancedFilters.driverName || 
      item.USEDBY.toLowerCase().includes(advancedFilters.driverName.toLowerCase());
    
    const matchesAmount = (
      (!advancedFilters.amountRange.min || parseFloat(item.AMOUNT) >= parseFloat(advancedFilters.amountRange.min)) && 
      (!advancedFilters.amountRange.max || parseFloat(item.AMOUNT) <= parseFloat(advancedFilters.amountRange.max)));
    
    const matchesKm = (
      (!advancedFilters.kmRange.min || parseFloat(item.TOTKM) >= parseFloat(advancedFilters.kmRange.min)) && 
      (!advancedFilters.kmRange.max || parseFloat(item.TOTKM) <= parseFloat(advancedFilters.kmRange.max)));
    
    return matchesSearch && matchesVehicle && matchesDriver && matchesAmount && matchesKm;
  }) : [];

  useEffect(() => {
    if (get_all_vechile?.data) {
      dispatch(setInput({ id: "Fuel_state", vechil_option: get_all_vechile?.data }));
    }
  }, [get_all_vechile]);

  useEffect(() => {
    if (FuelSelect?.vechile) {
      setAdvancedFilters({...advancedFilters, vehicleNo: FuelSelect?.vechile});
    }
  }, [FuelSelect?.vechile]);

  if (IndividualRecord_Loading) return (
    <ProgressPopup
      box={false}
      sync={true}
      visible={IndividualRecord_Loading}
      message="Fetching Your Datas..."
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fuel Report</Text>
          <Text style={styles.headerSubtitle}>Track and analyze fuel consumption</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons 
            name={showFilters ? "filter-off" : "filter"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Search and Date Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vehicle or driver..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.dateFilterContainer}>
        <FROMTO_CustomDateInput 
          height={48}  
          props={{ maximumDate: new Date() }}  
          isDateInput={true} 
          id={"Fuel_state"}  
          state={"from_date"} 
          label={"From Date"}
        />
        <FROMTO_CustomDateInput 
          height={48}  
          props={{ minimumDate: new Date() }}  
          isDateInput={true}  
          id={"Fuel_state"}  
          state={"to_date"} 
          label={"To Date"}
        />
      </View>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <AntDesign name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Vehicle Number</Text>
                <CustomDropdownInput 
                  height={50} 
                  full={true}
                  labelKey={"vechilename"} 
                  valueKey={"vechileno"} 
                  items_state={"vechil_option"}  
                  id={"Fuel_state"}  
                  state={"vechile"} 
                  label={"Select Vehicle"}
                />
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Driver Name</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter driver name"
                  value={advancedFilters.driverName}
                  onChangeText={(text) => setAdvancedFilters({...advancedFilters, driverName: text})}
                />
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Amount Range (₹)</Text>
                <View style={styles.rangeContainer}>
                  <TextInput
                    style={[styles.filterInput, styles.rangeInput]}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={advancedFilters.amountRange.min}
                    onChangeText={(text) => setAdvancedFilters({
                      ...advancedFilters, 
                      amountRange: {...advancedFilters.amountRange, min: text}
                    })}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={[styles.filterInput, styles.rangeInput]}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={advancedFilters.amountRange.max}
                    onChangeText={(text) => setAdvancedFilters({
                      ...advancedFilters, 
                      amountRange: {...advancedFilters.amountRange, max: text}
                    })}
                  />
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>KM Range</Text>
                <View style={styles.rangeContainer}>
                  <TextInput
                    style={[styles.filterInput, styles.rangeInput]}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={advancedFilters.kmRange.min}
                    onChangeText={(text) => setAdvancedFilters({
                      ...advancedFilters, 
                      kmRange: {...advancedFilters.kmRange, min: text}
                    })}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={[styles.filterInput, styles.rangeInput]}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={advancedFilters.kmRange.max}
                    onChangeText={(text) => setAdvancedFilters({
                      ...advancedFilters, 
                      kmRange: {...advancedFilters.kmRange, max: text}
                    })}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Content */}
      {data_store_loader || isLoading || isFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading fuel reports...</Text>
        </View>
      ) : Filtered_data.length > 0 ? (
        <FlatList
          data={Filtered_data}
          keyExtractor={(item) => item.SNO}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="fuel" size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Fuel Reports Found</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery || showFilters ? 
              "Try adjusting your search or filters" : 
              "No reports available for the selected period"}
          </Text>
          {(searchQuery || showFilters) && (
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
          style={{ backgroundColor: '#3B82F6' }}
          setModalVisible={setmore_model}
          name="Fuel Report Details"
        >
          {IndividualRecord_Loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading fuel details...</Text>
            </View>
          ) : (
            <IndividualRecordTable data={IndividualRecord_Data?.data || []} />
          )}
        </FilterModel>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    fontWeight: '500',
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    marginLeft: 12,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 6,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#475569',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#475569',
  },
  amountText: {
    fontWeight: '600',
    color: '#10B981',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  moreText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalContent: {
    padding: 20,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  filterInput: {
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    marginHorizontal: 8,
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#F8FAFC',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
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
    color: '#334155',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginLeft: 8,
  },
  detailTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  detailHeaderText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  detailScrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  detailTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  detailRowText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
});

export default FuelList;