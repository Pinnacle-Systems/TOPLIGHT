import React, { useState, useEffect } from 'react';
import { 
  FlatList, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  ScrollView, 
  Image, 
  Platform, 
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Dropdown } from '../../../../ReusableComponents/inputs';
import moment from 'moment';
import { screenWidth } from '../../../Utils/Screens';
import { useGetEmployeeidsQuery } from '../../../../redux/service/user';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux';
import FilterModel from '../../../FilterModal/FilterModel';
import { useGet__VechileQuery, useGetHod_showable_dataQuery } from '../../../../redux/service/Onduty';
import OpenGoogleMaps from '../../Location/Gmap/Googlemap';
import tailwind from 'twrnc';
import { getOndutyImageUrl } from '../../../../constants/apiUrl';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const parseUtcToLocal = (timeStr) => {
  if (!timeStr) return null;
  // If it's just a time like "07:01:28", treat it as UTC and convert to local
  if (typeof timeStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return moment.utc(timeStr, "HH:mm:ss").local();
  }
  // If the backend sends raw time missing a timezone (e.g. from a UTC database), force UTC -> Local
  if (typeof timeStr === 'string' && !timeStr.endsWith('Z') && !timeStr.includes('+')) {
    return moment.utc(timeStr, ["YYYY-MM-DD HH:mm:ss", moment.ISO_8601]).local();
  }
  return moment(timeStr);
};

const friendlyDateTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseUtcToLocal(timeStr);
  return m.isValid() ? m.format('DD MMM YYYY, hh:mm A') : timeStr;
};

const friendlyTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseUtcToLocal(timeStr);
  return m.isValid() ? m.format('hh:mm A') : timeStr;
};

const OndutyList = () => {
  // State management
  const [Idcard_filter, setIdCard_Idcard] = useState([]);
  const [selected_item_status, setSelected_item_status] = useState("");
  const [status_filter, set_status_filter] = useState();
  const [showFilters, setShowFilters] = useState(false);
  const [current_Date, setCurrent_Date] = useState(new Date());
  const [My_onduty, set_My_onduty] = useState(true);
  const [My_Summary, set_My_Summary] = useState(false);
  const [more_model, setmore_model] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [Location_report, set_Location_report] = useState(true);
  const [showPicker, setshowPicker] = useState(false);
  const {data:get_all_vechile}=useGet__VechileQuery({})

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const isLandscape = dimensions.width > dimensions.height;

  // Redux data
  const UserSelect = useSelector((state) => state?.UserDetails);
  const { data: employee, isLoading: loading_employee } = useGetEmployeeidsQuery();
  const { data, isLoading, isFetching } = useGetHod_showable_dataQuery({ 
    params: My_onduty ? { id: UserSelect?.UserId } : { hod: UserSelect?.UserId } 
  });

  // Filter functions
  const clearFilters = () => {
    setSearchQuery('');
    setIdCard_Idcard([]);
    set_status_filter(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const handleTabSwitch = (tab) => {
    if(tab === "sumary"){
      set_My_onduty(false);
      set_My_Summary(tab === 'sumary');
    } else {
      set_My_onduty(tab === 'my');
      set_My_Summary(false);
    }
  };  

  const handleTabSwitch_report = (tab) => {
    set_Location_report(tab === 'location');
  };

  const handleDateChange = (event, selectedDate) => {
    setshowPicker(false);
    const chosenDate = selectedDate || current_Date;
    setCurrent_Date(chosenDate);
  };

  // Enhanced filter logic
  const Filtered_data = data?.data?.length > 0 ? data.data.filter(item => {
    const itemId = `${UserSelect?.GCOMPCODE}-${item.userId || item.idCard || ''}`.trim();
    const matchesId = Idcard_filter?.length === 0 || 
                     Idcard_filter.some(filterId => 
                         filterId.toString().includes(itemId) || 
                         itemId.includes(filterId.toString())
                     );

    const matchesStatus = !status_filter || item.approvalStatus === status_filter;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                         (item?.docid && item.docid.toLowerCase().includes(searchLower)) ||
                         (item?.empname && item.empname.toLowerCase().includes(searchLower)) ||
                         (item?.in_location && item.in_location.toLowerCase().includes(searchLower));

    return matchesId && matchesStatus && matchesSearch;
  }) : [];

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const Filtered_sumary_data = data?.data?.length > 0 ? data.data.filter(item => {
    const itemId = `${UserSelect?.GCOMPCODE}-${item.userId || item.idCard || ''}`.trim();
    const matchesId = Idcard_filter?.length === 0 || 
                     Idcard_filter.some(filterId => 
                         filterId.toString().includes(itemId) || 
                         itemId.includes(filterId.toString())
                     );

    const matchesStatus = !status_filter || item.approvalStatus === status_filter;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                         (item?.docid && item.docid.toLowerCase().includes(searchLower)) ||
                         (item?.empname && item.empname.toLowerCase().includes(searchLower)) ||
                         (item?.in_location && item.in_location.toLowerCase().includes(searchLower));

    const date_match = moment(current_Date).format('DD MM YYYY') === moment(item.docdate).format('DD MM YYYY');
    
    return matchesId && matchesStatus && matchesSearch && date_match;
  }) : [];

  // Render functions
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
        <Text style={styles.cardId}>#{item?.docid}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approvalStatus) }]}>
          <FontAwesome name="circle" size={10} color="white" /> 
          <Text style={styles.statusText}>{item.approvalStatus}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
          <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={16} color="#555" />
          <Text style={styles.infoText}>{item.empname}</Text>
          </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#555" />
          <Text style={styles.infoText}>{moment(item.docdate).format('DD MMM YYYY')}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#555" />
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {item.in_location || 'Location not specified'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.moreText}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading || isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading onduty requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#3b82f6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Onduty Request Report</Text>
      </LinearGradient>

      {/* Tabs and Filters */}
      <View style={styles.tabContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, My_onduty && !My_Summary && styles.activeTab]} 
            onPress={() => handleTabSwitch('my')}
          >
            <Text style={[styles.tabText, My_onduty && !My_Summary && styles.activeTabText]}>My Onduties</Text>
          </TouchableOpacity>
        
          <TouchableOpacity 
            style={[styles.tab, !My_onduty && !My_Summary && styles.activeTab]} 
            onPress={() => handleTabSwitch('team')}
          >
            <Text style={[styles.tabText, !My_onduty && !My_Summary && styles.activeTabText]}>Team Onduties</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, !My_onduty && My_Summary && styles.activeTab]} 
            onPress={() => handleTabSwitch('sumary')}
          >
            <Text style={[styles.tabText, !My_onduty && My_Summary && styles.activeTabText]}>
              <MaterialIcons name="summarize" size={20} color={My_Summary ? "white" : "black"} />
            </Text>
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

      {/* Enhanced Filter Section */}
      {showFilters && (
        <View style={styles.filterSection}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholder="Search by Doc ID, Name, or Location..."
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
              searchable
              searchPlaceholder="Search employees..."
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

          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.dateFilterButton}
              onPress={() => setshowPicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#3B82F6" />
              <Text style={styles.dateFilterText}>Select Date</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={[styles.filterActionButton, styles.clearButton]} 
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterActionButton, styles.applyButton]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={current_Date}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
          onChange={handleDateChange}
        />
      )}

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        {!My_Summary ? (
          <>{Filtered_data?.length > 0 ? (
            <FlatList
              data={Filtered_data}
              keyExtractor={(item) => item.docid}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateTitle}>No Onduty Requests Found</Text>
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
          )}</>  
        ) : (
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryHeader, tailwind`flex flex-row justify-center`]}>
              <Text style={styles.summaryTitle}>Daily Summary -</Text>
              <Text 
                onPress={() => setshowPicker(!showPicker)} 
                style={[styles.dateText, tailwind`bg-gray-200 p-1 ml-2 text-lg rounded-xl`]}
              >
                {moment(current_Date).format('DD MMM YYYY')}
              </Text>
            </View>

            {/* Responsive Table */}
            <View style={[styles.tableContainer, isLandscape && styles.landscapeTableContainer]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  {/* Header Row */}
                  <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={[styles.tableHeaderCell, styles.columnIndex]}>#</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnEmployee]}>Employee</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnVehicle]}>Vehicle No</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnUnit]}>Visiting Unit</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnTime]}>Time</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnPurpose]}>Purpose</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnKm]}>Traveled KM</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnKm]}>Return Office KM</Text>
                    <Text style={[styles.tableHeaderCell, styles.columnKm]}>Total KM</Text>
                  </View>

                  {/* Data Rows */}
                  {Filtered_sumary_data?.length > 0 ? (
                    Filtered_sumary_data.map((item, index) => (
                      <View 
                        key={item.docid}
                        style={[
                          styles.tableRow,
                          index % 2 === 0 ? styles.evenRow : styles.oddRow
                        ]}
                      >
                        <Text style={[styles.tableCell, styles.columnIndex]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.columnEmployee]}>{item.empname}</Text>
                        <Text style={[styles.tableCell, styles.columnVehicle]}>{item.vechileno || '-'}</Text>
                        <Text style={[styles.tableCell, styles.columnUnit]}>{item.in_location || '-'}</Text>
                        <Text style={[styles.tableCell, styles.columnTime]}>
                          {friendlyTime(item.in_time)}
                        </Text>
                        <Text style={[styles.tableCell, styles.columnPurpose]}>{item.others || '-'}</Text>
                        <Text style={[styles.tableCell, styles.columnKm]}>{item.start_km || '0'}</Text>
                        <Text style={[styles.tableCell, styles.columnKm]}>
                          {item?.to_onduty==1 ? "💼Onduty" : item.end_km || '0'}
                        </Text>
                        <Text style={[styles.tableCell, styles.columnKm]}>
                          {item?.to_onduty == 1 ? '-' : 
                            (item.start_km && item.end_km ? 
                              (Math.max(0, Number(item.end_km) - Number(item.start_km))).toFixed(2) : 
                              '0')}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={[styles.tableRow, styles.noDataRow]}>
                      <Text style={styles.noDataText}>No summary data available</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
            
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryFooterText}>
                Total Records: {Filtered_sumary_data?.length || 0}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Item Details Modal */}
      <View style={{position:"absolute"}}>
      <FilterModel
        close={"direct"}
        modalVisible={more_model}
        style={{ backgroundColor: getStatusColor(selected_item_status) }}
        setModalVisible={setmore_model}
        name="Onduty Details"
      >
        <View style={styles.modalContentContainer}>
          <ScrollView style={styles.modalScrollView}>
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
                    <Text style={styles.detailValue}>{selectedItem?.docid}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <MaterialCommunityIcons name="account" size={16} color="#555" />
                      <Text style={styles.labelText}>Employee</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedItem.empname}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#555" />
                      <Text style={styles.labelText}>Date</Text>
                    </View>
                    <Text style={styles.detailValue}>{moment(selectedItem.docdate).format('DD MMM YYYY')}</Text>
                  </View>
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: `${getOndutyImageUrl()}?image=${selectedItem?.photo}` }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Location Details</Text>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#555" />
                      <Text style={styles.labelText}>In Location</Text>
                    </View>
                    <Text style={styles.detailValue}>{selectedItem.in_location || 'Not specified'}</Text>
                  </View>
                  
                  {selectedItem.in_time && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <MaterialCommunityIcons name="clock" size={16} color="#555" />
                        <Text style={styles.labelText}>In Time</Text>
                      </View>
                      <Text style={styles.detailValue}>{friendlyTime(selectedItem.in_time)}</Text>
                    </View>
                  )}
                  
                  {selectedItem?.in_latitude && selectedItem?.in_longtiude && (
                    <OpenGoogleMaps
                      latitude={selectedItem?.in_latitude} 
                      longitude={selectedItem?.in_longtiude} 
                      style={styles.mapButton}
                    >
                      <MaterialCommunityIcons name="google-maps" size={16} color="white" />
                      <Text style={styles.mapButtonText}>View In Location on Map</Text>
                    </OpenGoogleMaps>
                  )}
                </View>

                {selectedItem.out_location && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Check-out Details</Text>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#555" />
                        <Text style={styles.labelText}>Out Location</Text>
                      </View>
                      <Text style={styles.detailValue}>{selectedItem.out_location}</Text>
                    </View>

                    {selectedItem.out_time && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailLabel}>
                          <MaterialCommunityIcons name="clock" size={16} color="#555" />
                          <Text style={styles.labelText}>Out Time</Text>
                        </View>
                        <Text style={styles.detailValue}>{friendlyTime(selectedItem.out_time)}</Text>
                      </View>
                    )}
                    
                    {selectedItem?.out_latitude && selectedItem?.out_longtiude && (
                      <OpenGoogleMaps
                        latitude={selectedItem?.out_latitude} 
                        longitude={selectedItem?.out_longtiude} 
                        style={styles.mapButton}
                      >
                        <MaterialCommunityIcons name="google-maps" size={16} color="white" />
                        <Text style={styles.mapButtonText}>View Out Location on Map</Text>
                      </OpenGoogleMaps>
                    )}
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <MaterialCommunityIcons name="note-text" size={16} color="#555" />
                      <Text style={styles.labelText}>Reason</Text>
                    </View>
                    <Text style={[styles.detailValue, styles.multilineText]}>
                      {selectedItem.others || 'No reason provided'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
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
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
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
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateFilterText: {
    marginLeft: 8,
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  filterActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearButtonText: {
    color: '#F44336',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    color: 'white',
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
    flex: 1,
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
  modalContentContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  modalScrollView: {
    width: '100%',
    paddingBottom: 40,
  },
  modalContent: {
    padding: 16,
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
  multilineText: {
    textAlign: 'left',
  },
  imageContainer: {
    height: 200,
    marginBottom: 16,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginTop: 8,
  },
  mapButtonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '500',
  },
  tableSection: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  tableHeader: {
    fontWeight: '600',
    backgroundColor: '#F5F7FB',
    color: '#3B82F6',
  },
  totalRow: {
    backgroundColor: '#EFF6FF',
  },
  totalText: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
  },
  summaryHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
    maxHeight: 400,
  },
  landscapeTableContainer: {
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  tableHeaderRow: {
    backgroundColor: '#3B82F6',
    padding: 10,
  },
  tableHeaderCell: {
    color: 'white',
    padding: 5,
    fontWeight: 'bold',
  },
  columnIndex: {
    width: 50,
    textAlign: 'center',
  },
  columnEmployee: {
    width: 150,
  },
  columnVehicle: {
    width: 100,
  },
  columnUnit: {
    width: 150,
  },
  columnTime: {
    width: 100,
  },
  columnPurpose: {
    width: 120,
  },
  columnKm: {
    width: 80,
    textAlign: 'right',
  },
  evenRow: {
    backgroundColor: '#FFFFFF',
  },
  oddRow: {
    backgroundColor: '#F5F7FB',
  },
  noDataRow: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width - 32,
  },
  noDataText: {
    color: '#777',
    fontSize: 14,
  },
  summaryFooter: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  summaryFooterText: {
    color: '#555',
    fontSize: 14,
  },
});

export default OndutyList;