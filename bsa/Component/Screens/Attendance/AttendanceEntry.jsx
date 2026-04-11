import React, { useState, useContext } from 'react';
import moment from 'moment';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import { Common_Context } from '../../../Context/Common_Context';
import {
  usePunchInMutation,
  usePunchOutMutation,
  useGetAttendanceStatusQuery,
} from '../../../redux/service/AttendanceRtk';
import { useGetEmployeeIdsWithAttQuery } from '../../../redux/service/user';
import { getCurrentLocation } from '../../Utils/CustomLocation';
import PunchSummary from './PunchSummary';
import AttendanceList from './AttendanceList';

// Convert a "HH:mm:ss" UTC string from the backend to local time display
const utcTimeToLocal = (timeStr) => {
  if (!timeStr || timeStr === '--:--') return timeStr;
  const m = moment.utc(timeStr, 'HH:mm:ss').local();
  return m.isValid() ? m.format('HH:mm:ss') : timeStr;
};

const AttendanceEntry = () => {
  const [activeTab, setActiveTab]       = useState('SELF');
  const [searchQuery, setSearchQuery]   = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { admin } = useContext(Common_Context);
  const user       = useSelector((state) => state.UserDetails);
  const userIdcard = user?.idcard || user?.Idcard || user?.IDCARD;

  const isHOD = user?.level?.toUpperCase() === 'HOD'
             || (userIdcard && user?.hod && userIdcard.toUpperCase() === user.hod.toUpperCase())
             || admin === 1;

  // ── RTK Hooks ──────────────────────────────────────────────────────────────

  // No params needed — SetHeader already sends idcard + compcode
  const {
    data         : statusData,
    isFetching   : isStatusFetching,
    refetch      : refetchStatus,
  } = useGetAttendanceStatusQuery();

  const [punchIn,  { isLoading: isPunchingIn  }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();

  const {
    data       : employeesData,
    isFetching : isEmployeesFetching,
    refetch    : refetchEmployees,
  } = useGetEmployeeIdsWithAttQuery(
    { hod: userIdcard || user?.UserId },
    { skip: !(activeTab === 'EMPLOYEE' && isHOD) }
  );

  // { punchIn: "HH:mm:ss" | null, punchOut: "HH:mm:ss" | null, status: "NONE"|"IN"|"OUT" }
  const attendanceStatus = statusData?.data;

  // ── Handlers ───────────────────────────────────────────────────────────────


  // console.log("LOG",user)

  const handleSelfPunch = async (type) => {
    try {
      setLoadingLocation(true);

      const coords = await new Promise((resolve, reject) => {
        getCurrentLocation(({ coords }) => resolve(coords), reject);
      });

      setLoadingLocation(false);

      // idcard & compcode are sent automatically via SetHeader
      const payload = {
        empname  : user?.EMPNAME,
        latitude : String(coords.latitude),
        longitude: String(coords.longitude),
        location : 'Captured via Mobile',
      };

      const res = type === 'IN'
        ? await punchIn(payload).unwrap()
        : await punchOut(payload).unwrap();

      if (res?.status === 1) {
        showMessage({ message: `Punch ${type} Successful`, type: 'success' });
        refetchStatus();
      } else {
        Alert.alert('Error', res?.message || 'Action failed');
      }

    } catch (error) {
      setLoadingLocation(false);
      showMessage({
        message    : 'Error',
        description: error?.message || 'Location or API error',
        type       : 'danger',
      });
    }
  };

  const handleEmployeePunch = async (employee, type) => {
    try {
      // For HOD manual punch — override headers not possible via SetHeader,
      // so pass idcard/compcode in body and handle on backend
      const payload = {
        idcard   : employee.idcard,
        empname  : employee.empname,

        latitude : '0',
        longitude: '0',
        location : 'Manually by HOD',
        manual   : true,
      };

      const res = type === 'IN'
        ? await punchIn(payload).unwrap()
        : await punchOut(payload).unwrap();

      if (res?.status === 1) {
        showMessage({ message: `${employee.empname} Punched ${type}`, type: 'success' });
        refetchEmployees();
      } else {
        Alert.alert('Error', res?.message || 'Action failed');
      }

    } catch (error) {
      showMessage({
        message    : 'Error',
        description: error?.message || 'API error',
        type       : 'danger',
      });
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredEmployees = employeesData?.data?.filter((emp) => {
    const name = (emp.empname || emp.EMPNAME || '').toLowerCase();
    const id   = (emp.idcard  || emp.IDCARD  || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase())
        || id.includes(searchQuery.toLowerCase());
  }) || [];

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderPunchButton = () => {
    if (loadingLocation || isPunchingIn || isPunchingOut || isStatusFetching) {
      return <ActivityIndicator size="large" color="#3b82f6" />;
    }

    // status: "NONE" or undefined → show PUNCH IN
    // status: "IN"               → show PUNCH OUT
    // status: "OUT"              → show PUNCH IN again (multiple cycles)
    const status = (attendanceStatus?.status || attendanceStatus?.STATUS || '').toUpperCase();

    if (!status || status === 'NONE' || status === 'OUT') {
      return (
        <TouchableOpacity
          style={[styles.punchButton, { backgroundColor: '#10b981' }]}
          onPress={() => handleSelfPunch('IN')}
        >
          <MaterialCommunityIcons name="fingerprint" size={40} color="#fff" />
          <Text style={styles.punchButtonText}>PUNCH IN</Text>
        </TouchableOpacity>
      );
    }

    if (status === 'IN') {
      return (
        <TouchableOpacity
          style={[styles.punchButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleSelfPunch('OUT')}
        >
          <MaterialCommunityIcons name="fingerprint" size={40} color="#fff" />
          <Text style={styles.punchButtonText}>PUNCH OUT</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderEmployeeItem = ({ item }) => {
    const empName     = item.empname   || item.EMPNAME   || 'Unknown';
    const empId       = item.idcard    || item.IDCARD    || '---';
    const punchInTime = item.punchIn   || item.PUNCHIN   || '--:--';
    const punchOutTime= item.punchOut  || item.PUNCHOUT  || '--:--';

    // Determine button: last INOUT drives state same as self punch
    const lastInout = item.lastInout ?? item.LASTINOUT;  // backend should return this

    return (
      <View style={styles.employeeCard}>
        <View style={styles.empInfo}>
          <Text style={styles.empName}>{empName}</Text>
          <Text style={styles.empId}>{empId}</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>
              In: <Text style={styles.timeValue}>{punchInTime}</Text>
            </Text>
            <Text style={styles.timeLabel}>
              Out: <Text style={styles.timeValue}>{punchOutTime}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.empActions}>
          {/* Show IN if: no punch at all OR last punch was OUT (0) */}
          {(!lastInout && lastInout !== 0) || lastInout === 0 ? (
            <TouchableOpacity
              style={[styles.miniButton, { backgroundColor: '#10b981' }]}
              onPress={() => handleEmployeePunch({ idcard: empId, empname: empName }, 'IN')}
            >
              <Text style={styles.miniButtonText}>IN</Text>
            </TouchableOpacity>
          ) : lastInout === 1 ? (
            /* Show OUT if last punch was IN (1) */
            <TouchableOpacity
              style={[styles.miniButton, { backgroundColor: '#ef4444' }]}
              onPress={() => handleEmployeePunch({ idcard: empId, empname: empName }, 'OUT')}
            >
              <Text style={styles.miniButtonText}>OUT</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* Tab bar — only for HOD / admin */}
      {isHOD ? (
        <View style={styles.tabBar}>
          {['SELF', 'EMPLOYEE'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'SELF' ? 'Self' : 'Employees'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* ── SELF tab ── */}
      {activeTab === 'SELF' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Today's Attendance</Text>

            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <MaterialCommunityIcons name="clock-in" size={24} color="#10b981" />
                <Text style={styles.statusLabel}>Punch In</Text>
                <Text style={styles.statusTime}>
                  {utcTimeToLocal(attendanceStatus?.punchIn || attendanceStatus?.PUNCHIN) || '--:--'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statusItem}>
                <MaterialCommunityIcons name="clock-out" size={24} color="#ef4444" />
                <Text style={styles.statusLabel}>Punch Out</Text>
                <Text style={styles.statusTime}>
                  {utcTimeToLocal(attendanceStatus?.punchOut || attendanceStatus?.PUNCHOUT) || '--:--'}
                </Text>
              </View>
            </View>

            <View style={styles.actionContainer}>
              {renderPunchButton()}
            </View>
          </View>


          <PunchSummary />

        </ScrollView>

      ) : (
        /* ── EMPLOYEE tab ── */
        <View style={{ flex: 1 }}>
          <AttendanceList 
            data={employeesData?.data} 
            onRefresh={refetchEmployees} 
            isRefreshing={isEmployeesFetching}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container         : { flex: 1, backgroundColor: '#f8fafc' },
  tabBar            : { flexDirection: 'row', backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  tab               : { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab         : { borderBottomColor: '#3b82f6' },
  tabText           : { fontSize: 16, fontWeight: '600', color: '#64748b' },
  activeTabText     : { color: '#3b82f6' },
  scrollContent     : { padding: 20 },
  statusCard        : { backgroundColor: '#fff', borderRadius: 20, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  statusTitle       : { fontSize: 18, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 20 },
  statusRow         : { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 30 },
  statusItem        : { alignItems: 'center' },
  statusLabel       : { fontSize: 12, color: '#64748b', marginTop: 5 },
  statusTime        : { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  divider           : { width: 1, height: 40, backgroundColor: '#e2e8f0' },
  actionContainer   : { alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  punchButton       : { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  punchButtonText   : { color: '#fff', fontWeight: '900', marginTop: 10, fontSize: 16 },
  searchBar         : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 15, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput       : { flex: 1, paddingVertical: 10, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  listContent       : { paddingHorizontal: 15, paddingBottom: 20 },
  employeeCard      : { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, alignItems: 'center' },
  empInfo           : { flex: 1 },
  empName           : { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  empId             : { fontSize: 13, color: '#64748b', marginTop: 2 },
  timeRow           : { flexDirection: 'row', marginTop: 8, gap: 15 },
  timeLabel         : { fontSize: 11, color: '#94a3b8' },
  timeValue         : { color: '#334155', fontWeight: '600' },
  empActions        : { marginLeft: 10 },
  miniButton        : { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, elevation: 2 },
  miniButtonText    : { color: '#fff', fontWeight: '800', fontSize: 12 },
  emptyContainer    : { padding: 50, alignItems: 'center' },
  emptyText         : { color: '#94a3b8', fontSize: 16 },
});

export default AttendanceEntry;