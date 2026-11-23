import React, { useState, useEffect, useMemo } from 'react';
import { useAppTheme } from '../../../theme';
import { exportReportToPdf, exportReportToExcel, ExportReportModal } from '../../../utils/ReportExportUtils';
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
  StatusBar,
  Linking
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Dropdown } from '../../../components/reusable_components/Inputs';
import moment from 'moment';
import { screenWidth } from '../../../components/utils/Screens';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux';
import FilterModel from '../../../components/filter_modal/FilterModel';
import { useGet__VechileQuery, useGetHod_showable_dataQuery } from '../../../store/api/OndutyApi';
import tailwind from 'twrnc';
import { API_URL } from '@env';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const getOndutyImageUrl = () => {
  const baseUrl = (API_URL || '').replace(/\/+$/, '');
  return `${baseUrl}/onduty/Onduty_uploaded_image`;
};

const OpenGoogleMaps = ({ latitude, longitude, style, children }) => {
  const handleOpen = () => {
    if (!latitude || !longitude) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(err => console.warn('Could not open map:', err));
  };
  return (
    <TouchableOpacity style={style} onPress={handleOpen}>
      {children}
    </TouchableOpacity>
  );
};

// Backend stores IST directly — parse as-is, NO UTC→local conversion.
const parseISTTime = (timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return moment(timeStr, 'HH:mm:ss');
  }
  return moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true).isValid()
    ? moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601])
    : moment(timeStr);
};

const friendlyDateTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseISTTime(timeStr);
  return m && m.isValid() ? m.format('DD MMM YYYY, hh:mm A') : timeStr;
};

const friendlyTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseISTTime(timeStr);
  return m && m.isValid() ? m.format('hh:mm A') : timeStr;
};

const ONDUTY_COLUMNS = [
    { key: '#', label: '#' },
    { key: 'docid', label: 'Doc ID', getValue: (item) => item?.docid || '-' },
    { key: 'employee', label: 'Employee Name', getValue: (item) => item?.empname || item?.createdBy_user?.username || 'Employee' },
    { key: 'userId', label: 'Emp ID', getValue: (item) => item?.userId || item?.idCard || '-' },
    { key: 'docdate', label: 'Date', getValue: (item) => item?.docdate ? moment(item.docdate).format('DD MMM YYYY') : '-' },
    { key: 'inLocation', label: 'In Location', getValue: (item) => item?.in_location || '-' },
    { key: 'inAddress', label: 'In Address', getValue: (item) => item?.in_address || item?.inAddress || '-' },
    { key: 'outLocation', label: 'Out Location', getValue: (item) => item?.out_location || '-' },
    { key: 'outAddress', label: 'Out Address', getValue: (item) => item?.out_address || item?.outAddress || '-' },
    { key: 'inTime', label: 'In Time', getValue: (item) => friendlyTime(item?.in_time) },
    { key: 'outTime', label: 'Out Time', getValue: (item) => friendlyTime(item?.out_time) },
    { key: 'status', label: 'Status', getValue: (item) => (item?.approvalStatus || 'PENDING').toUpperCase() },
    { key: 'reason', label: 'Purpose', getValue: (item) => item?.others || item?.reason || '-' },
];

const STATUS_OPTIONS = {
  data: [
    { label: 'All Statuses', value: '' },
    { label: '✔ Approved', value: 'approved' },
    { label: '❌ Rejected', value: 'rejected' },
    { label: '⏳ Pending', value: 'pending' },
  ],
};

const OndutyList = ({ navigation }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // State management
  const [Idcard_filter, setIdCard_Idcard] = useState([]);
  const [selected_item_status, setSelected_item_status] = useState("");
  const [status_filter, set_status_filter] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [current_Date, setCurrent_Date] = useState(new Date());
  const [pickerTarget, setPickerTarget] = useState('filter');
  const [My_onduty, set_My_onduty] = useState(true);
  const [My_Summary, set_My_Summary] = useState(false);
  const [more_model, setmore_model] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [Location_report, set_Location_report] = useState(true);
  const [showPicker, setshowPicker] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [singleItemToExport, setSingleItemToExport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingType, setExportingType] = useState(null);
  const {data:get_all_vechile}=useGet__VechileQuery({})

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const isLandscape = dimensions.width > dimensions.height;

  // Redux data
  const UserSelect = useSelector((state) => state?.UserDetails);
  const { data, isLoading, isFetching } = useGetHod_showable_dataQuery({ 
    params: My_onduty ? { id: UserSelect?.UserId } : { hod: UserSelect?.UserId } 
  });

  // Derive available employees only from loaded onduty records (not all from DB query)
  const availableEmployees = useMemo(() => {
    const list = data?.data || [];
    if (!Array.isArray(list) || list.length === 0) {
      return { data: [] };
    }

    const seen = new Set();
    const result = [];

    list.forEach(item => {
      const empId = String(item.userId || item.idCard || item.userData?.idCard || '').trim();
      const empName = String(item.empname || item.empName || item.createdBy_user?.username || item.userData?.userName || '').trim();
      const compCode = String(item.compCode || '').trim();

      if (!empId && !empName) return;

      const key = compCode && empId ? `${compCode}-${empId}` : (empId || empName);
      if (seen.has(key)) return;
      seen.add(key);

      const label = empName 
        ? (empId ? `${empName} (${empId})` : empName)
        : key;

      result.push({
        label,
        value: key,
        id: empId,
        name: empName,
        comp: compCode,
      });
    });

    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return { data: result };
  }, [data?.data]);

  // Clean up selected employees if no longer present in available employees
  useEffect(() => {
    if (Array.isArray(Idcard_filter) && Idcard_filter.length > 0 && availableEmployees.data?.length > 0) {
      const validSet = new Set(availableEmployees.data.map(opt => opt.value));
      const remaining = Idcard_filter.filter(v => {
        const val = typeof v === 'object' && v !== null ? (v.value || v.id) : v;
        return validSet.has(val);
      });
      if (remaining.length !== Idcard_filter.length) {
        setIdCard_Idcard(remaining);
      }
    }
  }, [availableEmployees]);

  // Filter functions
  const clearFilters = () => {
    setSearchQuery('');
    setIdCard_Idcard([]);
    set_status_filter('');
    setFilterDate(null);
  };

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'approved': return theme.colors.success || '#15803D';
      case 'rejected': return theme.colors.danger || '#B91C1C';
      default: return theme.colors.warning || '#B45309';
    }
  };

  const getStatusStyle = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') {
      return { bg: theme.colors.successSoft || '#DCFCE7', color: theme.colors.success || '#15803D', label: 'APPROVED' };
    }
    if (s === 'rejected') {
      return { bg: theme.colors.dangerSoft || '#FEE2E2', color: theme.colors.danger || '#B91C1C', label: 'REJECTED' };
    }
    return { bg: theme.colors.warningSoft || '#FEF3C7', color: theme.colors.warning || '#B45309', label: 'PENDING' };
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
    if (event?.type === 'dismissed') return;
    if (selectedDate) {
      if (pickerTarget === 'summary') {
        setCurrent_Date(selectedDate);
      } else {
        setFilterDate(selectedDate);
        setCurrent_Date(selectedDate);
      }
    }
  };

  // Normalized selected employee filter values
  const selectedEmployeeValues = useMemo(() => {
    if (!Idcard_filter) return [];
    const list = Array.isArray(Idcard_filter) ? Idcard_filter : [Idcard_filter];
    return list
      .map(v => {
        if (!v) return '';
        if (typeof v === 'object') return String(v.value || v.id || '').trim();
        return String(v).trim();
      })
      .filter(Boolean);
  }, [Idcard_filter]);

  // Robust matching helpers
  const matchEmployee = (item) => {
    if (selectedEmployeeValues.length === 0) return true;

    const itemUserId = String(item.userId || item.idCard || item.idcard || item.userData?.idCard || '').trim();
    const itemComp = String(item.compCode || '').trim();
    const itemFull = itemComp && itemUserId ? `${itemComp}-${itemUserId}` : '';
    const itemEmpName = String(item.empname || item.empName || item.userData?.userName || '').toLowerCase().trim();

    return selectedEmployeeValues.some(filterVal => {
      const fStr = String(filterVal).trim();
      const fLower = fStr.toLowerCase();

      // Exact match on full code (e.g. "TLT-181")
      if (itemFull && itemFull.toLowerCase() === fLower) return true;

      // Exact match on user id / idcard (e.g. "181")
      if (itemUserId && itemUserId.toLowerCase() === fLower) return true;

      // Cleaned ID extracted from "TLT-181" -> "181"
      const cleanedFilterId = fStr.includes('-') ? fStr.split('-').pop().trim() : fStr;
      if (itemUserId && (itemUserId.toLowerCase() === cleanedFilterId.toLowerCase())) return true;

      // Parentheses or hyphen format: "TLT(181)" or "TLT-181"
      if (itemUserId && (fStr.includes(`(${itemUserId})`) || fStr.endsWith(`-${itemUserId}`))) return true;

      // Substring match on employee name
      if (itemEmpName && (fLower.includes(itemEmpName) || (itemEmpName.length > 3 && itemEmpName.includes(fLower)))) return true;

      return false;
    });
  };

  const matchStatus = (item) => {
    const rawVal = typeof status_filter === 'object' && status_filter !== null
      ? (status_filter.value ?? '')
      : String(status_filter || '');
    const cleanFilter = String(rawVal).trim().toLowerCase();

    if (!cleanFilter || cleanFilter === 'all') return true;

    const itemStatus = String(item.approvalStatus || item.status || 'pending').trim().toLowerCase();
    return itemStatus === cleanFilter;
  };

  const matchDate = (item, targetDate) => {
    if (!targetDate) return true;
    const target = moment(targetDate).format('YYYY-MM-DD');
    const rawDate = item.docdate || item.docDate || item.createdAt;
    if (!rawDate) return false;
    return moment(rawDate).format('YYYY-MM-DD') === target;
  };

  const matchSearch = (item) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();

    const docId = String(item.docid || item.docId || '').toLowerCase();
    const empName = String(item.empname || item.empName || item.createdBy_user?.username || '').toLowerCase();
    const userId = String(item.userId || item.idCard || item.idcard || '').toLowerCase();
    const inLoc = String(item.in_location || item.inLocation || '').toLowerCase();
    const outLoc = String(item.out_location || item.outLocation || '').toLowerCase();
    const purpose = String(item.others || item.reason || '').toLowerCase();
    const vehicle = String(item.vechileno || '').toLowerCase();

    return (
      docId.includes(q) ||
      empName.includes(q) ||
      userId.includes(q) ||
      inLoc.includes(q) ||
      outLoc.includes(q) ||
      purpose.includes(q) ||
      vehicle.includes(q)
    );
  };

  // Has active filters
  const hasActiveFilters = Boolean(
    selectedEmployeeValues.length > 0 ||
    (typeof status_filter === 'object' && status_filter !== null ? Boolean(status_filter.value) : Boolean(status_filter)) ||
    Boolean(searchQuery?.trim()) ||
    Boolean(filterDate)
  );

  // Filtered data
  const Filtered_data = useMemo(() => {
    const list = data?.data || [];
    if (!Array.isArray(list) || list.length === 0) return [];

    return list.filter(item => (
      matchEmployee(item) &&
      matchStatus(item) &&
      matchDate(item, filterDate) &&
      matchSearch(item)
    ));
  }, [data?.data, selectedEmployeeValues, status_filter, filterDate, searchQuery]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const Filtered_sumary_data = useMemo(() => {
    const list = data?.data || [];
    if (!Array.isArray(list) || list.length === 0) return [];

    const summaryDate = filterDate || current_Date;
    return list.filter(item => (
      matchEmployee(item) &&
      matchStatus(item) &&
      matchDate(item, summaryDate) &&
      matchSearch(item)
    ));
  }, [data?.data, selectedEmployeeValues, status_filter, filterDate, current_Date, searchQuery]);

  const currentExportData = (My_Summary ? Filtered_sumary_data : Filtered_data) || [];
  const currentExportSubtitle = My_Summary ? 'Daily Summary' : (My_onduty ? 'My Onduties' : 'Team Onduties');

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setExportingType('pdf');
      const targetData = singleItemToExport ? [singleItemToExport] : currentExportData;
      const docSuffix = singleItemToExport?.docid ? `_${String(singleItemToExport.docid).replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
      await exportReportToPdf({
        title: singleItemToExport ? `Onduty Request (#${singleItemToExport.docid || ''})` : 'Onduty Report',
        subtitle: singleItemToExport
          ? `Employee: ${singleItemToExport.empname || singleItemToExport.createdBy_user?.username || 'Employee'}`
          : currentExportSubtitle,
        columns: ONDUTY_COLUMNS,
        data: targetData,
        fileName: `Onduty_Report${docSuffix}_${moment().format('YYYYMMDD_HHmmss')}`,
      });
      setExportModalVisible(false);
      setSingleItemToExport(null);
    } catch (err) {
      Alert.alert('Export Error', err?.message || 'Failed to export PDF');
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExportingType('excel');
      const targetData = singleItemToExport ? [singleItemToExport] : currentExportData;
      const docSuffix = singleItemToExport?.docid ? `_${String(singleItemToExport.docid).replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
      await exportReportToExcel({
        title: singleItemToExport ? `Onduty Request (#${singleItemToExport.docid || ''})` : 'Onduty Report',
        subtitle: singleItemToExport
          ? `Employee: ${singleItemToExport.empname || singleItemToExport.createdBy_user?.username || 'Employee'}`
          : currentExportSubtitle,
        columns: ONDUTY_COLUMNS,
        data: targetData,
        fileName: `Onduty_Report${docSuffix}_${moment().format('YYYYMMDD_HHmmss')}`,
        sheetName: singleItemToExport?.docid ? String(singleItemToExport.docid).slice(0, 31) : 'Onduty Report',
      });
      setExportModalVisible(false);
      setSingleItemToExport(null);
    } catch (err) {
      Alert.alert('Export Error', err?.message || 'Failed to export Excel');
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  // Render functions
  const renderItem = ({ item }) => {
    const statusMeta = getStatusStyle(item.approvalStatus);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          setSelectedItem(item);
          setSelected_item_status(item?.approvalStatus);
          setmore_model(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.docIdBadge}>
            <MaterialCommunityIcons name="pound" size={12} color={theme.colors.brand} />
            <Text style={styles.cardId}>{item?.docid}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
            <Text style={[styles.statusText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.employeeRow}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={18} color={theme.colors.brand} />
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName} numberOfLines={1}>
                {item.empname || 'Employee'}
              </Text>
              <Text style={styles.requestDate}>
                Requested: {moment(item.docdate).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationBox}>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={16} color={theme.colors.brand} />
              <Text style={styles.locationText} numberOfLines={2}>
                {item.in_location || 'Location not specified'}
              </Text>
            </View>
            {!!item.others && item.others !== 'ONDUTY' && (
              <View style={styles.purposeRow}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.purposeText} numberOfLines={1}>{item.others}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <Text style={styles.moreText}>View full details</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.brand} />
          </View>
          <TouchableOpacity
            style={styles.cardDownloadBtn}
            onPress={(e) => {
              e?.stopPropagation?.();
              setSingleItemToExport(item);
              setExportModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="tray-arrow-down" size={14} color={theme.colors.brand} />
            <Text style={styles.cardDownloadText}>Download</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
      {/* Common Header Bar */}
      <View style={styles.header}>
        {navigation?.canGoBack?.() && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Onduty Report</Text>
          <Text style={styles.headerSubtitle}>
            {Filtered_data.length} {Filtered_data.length === 1 ? 'record' : 'records'} found
          </Text>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.exportToggleBtn}
            onPress={() => {
              setSingleItemToExport(null);
              setExportModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="tray-arrow-down"
              size={18}
              color={theme.colors.brand}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              showFilters && styles.filterToggleBtnActive,
              hasActiveFilters && styles.filterToggleBtnBadge,
            ]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={showFilters ? "filter-remove" : "filter-variant"}
              size={18}
              color={showFilters ? theme.colors.danger : (hasActiveFilters ? theme.colors.brand : theme.colors.text)}
            />
            {hasActiveFilters && !showFilters && (
              <View style={styles.activeFilterDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabBar}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segment, My_onduty && !My_Summary && styles.segmentActive]} 
            onPress={() => handleTabSwitch('my')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, My_onduty && !My_Summary && styles.segmentTextActive]}>
              My Onduties
            </Text>
          </TouchableOpacity>
        
          <TouchableOpacity 
            style={[styles.segment, !My_onduty && !My_Summary && styles.segmentActive]} 
            onPress={() => handleTabSwitch('team')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, !My_onduty && !My_Summary && styles.segmentTextActive]}>
              Team Onduties
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segment, !My_onduty && My_Summary && styles.segmentActive]} 
            onPress={() => handleTabSwitch('sumary')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, !My_onduty && My_Summary && styles.segmentTextActive]}>
              Daily Summary
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Filter Section */}
      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholder="Search by Doc ID, Name, ID, or Location..."
              placeholderTextColor={theme.colors.placeholder || "#999"}
              returnKeyType="search"
            />
            {Boolean(searchQuery) && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textMuted || "#999"} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            <Dropdown
              selected={Idcard_filter}
              isLoading={isLoading || isFetching}
              label="Filter by Employee"
              multiple
              width="100%"
              _label="label"
              _value="value"
              setSelected={setIdCard_Idcard}
              options={availableEmployees}
              zIndex={300}
              style={styles.dropdown}
              placeholder={availableEmployees.data.length > 0 ? "Select Employee" : "No employees in report"}
              searchable
              searchPlaceholder="Search available employees..."
            />
          </View>

          <View style={styles.filterRow}>
            <Dropdown
              selected={status_filter}
              label="Filter by Status"
              width="100%"
              _label="label"
              _value="value"
              setSelected={set_status_filter}
              options={STATUS_OPTIONS}
              zIndex={299}
              style={styles.dropdown}
              placeholder="All Statuses"
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.dateFilterContainer}>
              <TouchableOpacity 
                style={[
                  styles.dateFilterButton,
                  filterDate && styles.dateFilterButtonActive,
                ]}
                onPress={() => {
                  setPickerTarget('filter');
                  setshowPicker(true);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={20} 
                  color={filterDate ? theme.colors.brand : "#3B82F6"} 
                />
                <Text style={[
                  styles.dateFilterText,
                  filterDate && styles.dateFilterTextActive,
                ]}>
                  {filterDate ? `Date: ${moment(filterDate).format('DD MMM YYYY')}` : 'Select Date (All Dates)'}
                </Text>
              </TouchableOpacity>
              {filterDate && (
                <TouchableOpacity
                  style={styles.clearDateBtn}
                  onPress={() => setFilterDate(null)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={22} color={theme.colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <View style={styles.activeChipsContainer}>
              <Text style={styles.activeChipsTitle}>Active:</Text>
              {selectedEmployeeValues.length > 0 && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeChipText}>
                    {selectedEmployeeValues.length === 1
                      ? (availableEmployees.data.find(e => e.value === selectedEmployeeValues[0])?.name || selectedEmployeeValues[0])
                      : `Emp: ${selectedEmployeeValues.length}`}
                  </Text>
                  <TouchableOpacity onPress={() => setIdCard_Idcard([])} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <MaterialCommunityIcons name="close" size={12} color={theme.colors.brand} />
                  </TouchableOpacity>
                </View>
              )}
              {Boolean(status_filter && (typeof status_filter === 'object' ? status_filter.value : status_filter)) && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeChipText}>Status: {typeof status_filter === 'object' ? status_filter.label : status_filter}</Text>
                  <TouchableOpacity onPress={() => set_status_filter('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <MaterialCommunityIcons name="close" size={12} color={theme.colors.brand} />
                  </TouchableOpacity>
                </View>
              )}
              {Boolean(filterDate) && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeChipText}>{moment(filterDate).format('DD MMM YYYY')}</Text>
                  <TouchableOpacity onPress={() => setFilterDate(null)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <MaterialCommunityIcons name="close" size={12} color={theme.colors.brand} />
                  </TouchableOpacity>
                </View>
              )}
              {Boolean(searchQuery.trim()) && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeChipText}>"{searchQuery.trim()}"</Text>
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <MaterialCommunityIcons name="close" size={12} color={theme.colors.brand} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={[styles.filterActionButton, styles.clearButton]} 
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterActionButton, styles.applyButton]}
              onPress={() => setShowFilters(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={pickerTarget === 'summary' ? (filterDate || current_Date) : (filterDate || new Date())}
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
                {hasActiveFilters ? 
                  "No requests match the selected filters" : 
                  "Check back later for new requests"}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={clearFilters}>
                  <Text style={styles.emptyStateButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}</>  
        ) : (
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryHeader, tailwind`flex flex-row justify-center items-center`]}>
              <Text style={styles.summaryTitle}>Daily Summary -</Text>
              <TouchableOpacity 
                onPress={() => {
                  setPickerTarget('summary');
                  setshowPicker(true);
                }} 
                style={[styles.dateText, tailwind`bg-gray-200 p-2 ml-2 rounded-xl flex-row items-center`]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.brand} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text }}>
                  {moment(filterDate || current_Date).format('DD MMM YYYY')}
                </Text>
              </TouchableOpacity>
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

                <TouchableOpacity
                  style={styles.modalDownloadActionBtn}
                  onPress={() => {
                    setmore_model(false);
                    setSingleItemToExport(selectedItem);
                    setExportModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="tray-arrow-down" size={16} color="#FFFFFF" />
                  <Text style={styles.modalDownloadActionText}>Download This Request</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </FilterModel>
      </View>

      <ExportReportModal
        visible={exportModalVisible}
        onClose={() => {
          setExportModalVisible(false);
          setSingleItemToExport(null);
        }}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
        exportingType={exportingType}
        recordCount={singleItemToExport ? 1 : (currentExportData?.length || 0)}
        reportTitle={singleItemToExport ? `Onduty Request (#${singleItemToExport.docid || ''})` : "Onduty Report"}
        theme={theme}
      />
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flex: 1,
      paddingBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 14,
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.sm || 14,
      fontWeight: theme.fontWeights.medium || '500',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md || 16,
      paddingVertical: theme.spacing.sm || 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceSunken,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm || 12,
    },
    headerTextWrap: {
      flex: 1,
    },
    headerTitle: {
      fontSize: theme.fontSizes.md || 17,
      fontWeight: theme.fontWeights.bold || '700',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: theme.fontSizes.xs || 11.5,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    exportToggleBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.surfaceSunken,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterToggleBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.surfaceSunken,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    activeFilterDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.danger || '#EF4444',
    },
    filterToggleBtnActive: {
      backgroundColor: theme.colors.dangerSoft,
    },
    filterToggleBtnBadge: {
      backgroundColor: theme.colors.brandSoft,
    },
    tabBar: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md || 16,
      paddingVertical: theme.spacing.xs || 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceSunken,
      borderRadius: theme.radii.pill || 99,
      padding: 3,
    },
    segment: {
      flex: 1,
      paddingVertical: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.pill || 99,
    },
    segmentActive: {
      backgroundColor: theme.colors.brand,
      shadowColor: theme.colors.brand,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    segmentText: {
      fontSize: theme.fontSizes.xs || 13,
      fontWeight: theme.fontWeights.medium || '500',
      color: theme.colors.textSecondary,
    },
    segmentTextActive: {
      color: '#FFFFFF',
      fontWeight: theme.fontWeights.bold || '700',
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md || 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      backgroundColor: theme.colors.surfaceSunken,
      borderRadius: theme.radii.md || 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      marginBottom: 10,
    },
    searchIcon: {
      marginRight: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
      paddingVertical: 0,
    },
    clearSearchBtn: {
      padding: 4,
    },
    filterRow: {
      marginBottom: 10,
    },
    dropdown: {
      backgroundColor: theme.colors.surfaceSunken,
      borderRadius: theme.radii.sm || 8,
    },
    dateFilterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateFilterButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceSunken,
      borderRadius: theme.radii.md || 10,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    dateFilterButtonActive: {
      borderColor: theme.colors.brand,
      backgroundColor: theme.colors.brandSoft,
    },
    dateFilterText: {
      marginLeft: 8,
      color: theme.colors.text,
      fontSize: 13,
    },
    dateFilterTextActive: {
      color: theme.colors.brand,
      fontWeight: '600',
    },
    clearDateBtn: {
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
      marginBottom: 10,
    },
    activeChipsTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary || '#888',
      marginRight: 2,
    },
    activeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.brandSoft || '#EFF6FF',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      gap: 4,
    },
    activeChipText: {
      fontSize: 11,
      color: theme.colors.brand,
      fontWeight: '600',
    },
    filterActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 10,
    },
    filterActionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.radii.md || 8,
      alignItems: 'center',
    },
    clearButton: {
      backgroundColor: theme.colors.dangerSoft,
    },
    clearButtonText: {
      color: theme.colors.danger,
      fontWeight: '600',
      fontSize: 13,
    },
    applyButton: {
      backgroundColor: theme.colors.brand,
    },
    applyButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 13,
    },
    listContent: {
      padding: theme.spacing.md || 16,
      paddingBottom: 36,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg || 14,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      padding: theme.spacing.md || 16,
      marginBottom: 12,
      shadowColor: theme.colors.shadow || 'rgba(0,0,0,0.05)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    docIdBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSunken,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    cardId: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.brand,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 99,
      gap: 5,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    cardBody: {
      marginBottom: 8,
    },
    employeeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    employeeInfo: {
      flex: 1,
    },
    employeeName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    requestDate: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    locationBox: {
      backgroundColor: theme.colors.surfaceSunken,
      borderRadius: 8,
      padding: 10,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationText: {
      fontSize: 12.5,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
    purposeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    purposeText: {
      fontSize: 11.5,
      color: theme.colors.textSecondary,
    },
    cardFooterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    cardDownloadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: theme.radii.pill || 99,
      backgroundColor: theme.colors.surfaceSunken,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    cardDownloadText: {
      fontSize: theme.fontSizes.xs || 11.5,
      fontWeight: theme.fontWeights.semibold || '600',
      color: theme.colors.brand,
    },
    modalDownloadActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 18,
      paddingVertical: 12,
      backgroundColor: theme.colors.brand,
      borderRadius: 12,
    },
    modalDownloadActionText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderSubtle,
      gap: 4,
    },
    moreText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.brand,
    },
    emptyState: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyStateTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: 14,
      marginBottom: 4,
    },
    emptyStateText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    emptyStateButton: {
      paddingVertical: 9,
      paddingHorizontal: 18,
      backgroundColor: theme.colors.brand,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 13,
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
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    modalStatus: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 99,
    },
    modalStatusText: {
      fontWeight: '700',
      fontSize: 11,
      textTransform: 'uppercase',
    },
    detailSection: {
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 10,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    detailLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    labelText: {
      marginLeft: 8,
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'right',
    },
    multilineText: {
      textAlign: 'left',
    },
    imageContainer: {
      height: 200,
      marginBottom: 16,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 11,
      backgroundColor: theme.colors.brand,
      borderRadius: 8,
      marginTop: 8,
      gap: 6,
    },
    mapButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 13,
    },
    tableSection: {
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      borderRadius: 6,
      overflow: 'hidden',
      marginTop: 8,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    tableCell: {
      flex: 1,
      padding: 10,
      fontSize: 13,
      color: theme.colors.text,
    },
    tableHeader: {
      fontWeight: '600',
      backgroundColor: theme.colors.surfaceSunken,
      color: theme.colors.brand,
    },
    totalRow: {
      backgroundColor: theme.colors.brandSoft,
    },
    totalText: {
      fontWeight: '700',
      color: theme.colors.brand,
    },
    summaryContainer: {
      flex: 1,
      padding: 16,
    },
    summaryHeader: {
      marginBottom: 14,
      alignItems: 'center',
    },
    summaryTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },
    dateText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    tableContainer: {
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: theme.colors.surface,
      maxHeight: 400,
    },
    landscapeTableContainer: {
      maxHeight: Dimensions.get('window').height * 0.6,
    },
    tableHeaderRow: {
      backgroundColor: theme.colors.brand,
      padding: 10,
    },
    tableHeaderCell: {
      color: '#FFFFFF',
      padding: 5,
      fontWeight: '700',
      fontSize: 12,
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
      backgroundColor: theme.colors.surface,
    },
    oddRow: {
      backgroundColor: theme.colors.surfaceSunken,
    },
    noDataRow: {
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
      width: Dimensions.get('window').width - 32,
    },
    noDataText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    summaryFooter: {
      marginTop: 8,
      alignItems: 'flex-end',
    },
    summaryFooterText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  });

export default OndutyList;