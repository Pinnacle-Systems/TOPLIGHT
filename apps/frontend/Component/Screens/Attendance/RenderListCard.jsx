import React, { useState } from 'react';
import moment from 'moment';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import { useSelector } from 'react-redux';
import {
  usePunchInMutation,
  usePunchOutMutation,
} from '../../../redux/service/AttendanceRtk';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// No conversion needed, backend sends local time
const formatTime = (timeStr) => timeStr || '--:--';

function RenderListCard({ item, onRefresh }) {
  const [expanded, setExpanded]   = useState(false);
  const user                      = useSelector((state) => state.UserDetails);
  const [punchIn,  { isLoading: isPunchingIn  }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();

  const empName      = item.empname    || item.EMPNAME    || 'Unknown';
  const empId        = item.idcard     || item.IDCARD     || '---';
  const punchInTime  = item.punchIn    || item.PUNCHIN    || null;
  const punchOutTime = item.punchOut   || item.PUNCHOUT   || null;
  const lastInout    = item.lastInout  ?? item.LASTINOUT  ?? null;

  // Punch pairs from backend: [{ inTime, outTime, durationFormatted }, ...]
  const punches            = item.punches             || item.PUNCHES || [];
  const totalTimeFormatted = item.totalTimeFormatted  || item.TOTALTIMEFORMATTED || '00:00';
  const totalPunches       = item.totalPunches        || item.TOTALPUNCHES || 0;
  const totalMinutes       = item.totalMinutesWorked  || item.TOTALMINUTESWORKED || 0;

  const isLoading = isPunchingIn || isPunchingOut;

  const handlePunch = async (type) => {
    try {
      const payload = {
        idcard   : empId,
        empname  : empName,
        latitude : '0',
        longitude: '0',
        location : 'Manually by HOD',
        manual   : true,
      };

      const res = type === 'IN'
        ? await punchIn(payload).unwrap()
        : await punchOut(payload).unwrap();

      if (res?.status === 1) {
        showMessage({ message: `${empName} Punched ${type}`, type: 'success' });
        if (onRefresh) onRefresh();
      } else {
        showMessage({ message: res?.message || 'Action failed', type: 'danger' });
      }
    } catch (error) {
      showMessage({
        message    : 'Error',
        description: error?.message || 'API error',
        type       : 'danger',
      });
    }
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  // Determine button state from lastInout
  // null / undefined = no punch today  → show IN
  // 1                = last was IN     → show OUT
  // 0                = last was OUT    → show IN again
  const renderActionButton = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#3b82f6" />;
    }
    // 1 can be returned as string or number
    if (String(lastInout) === '1') {
      return (
        <TouchableOpacity
          style={[styles.punchBtn, { backgroundColor: '#ef4444' }]}
          onPress={() => handlePunch('OUT')}
        >
          <Text style={styles.punchBtnText}>OUT</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.punchBtn, { backgroundColor: '#10b981' }]}
        onPress={() => handlePunch('IN')}
      >
        <Text style={styles.punchBtnText}>IN</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>

      {/* ── Main row ── */}
      <View style={styles.mainRow}>

        {/* Left: name + id + IN/OUT times */}
        <View style={styles.infoBlock}>
          <Text style={styles.empName}>{empName}</Text>
          <Text style={styles.empId}>{empId}</Text>
          <View style={styles.timeRow}>
            <View style={styles.timePill}>
              <MaterialCommunityIcons name="login"  size={12} color="#10b981" />
              <Text style={styles.timeText}>{formatTime(punchInTime)}</Text>
            </View>
            <View style={styles.timePill}>
              <MaterialCommunityIcons name="logout" size={12} color="#ef4444" />
              <Text style={styles.timeText}>{formatTime(punchOutTime)}</Text>
            </View>
          </View>
        </View>

        {/* Right: stats + punch button */}
        <View style={styles.rightBlock}>

          {/* Mini stats */}
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{totalPunches}</Text>
              <Text style={styles.miniStatLabel}>punches</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{totalTimeFormatted}</Text>
              <Text style={styles.miniStatLabel}>worked</Text>
            </View>
          </View>

          {/* Punch button */}
          <View style={styles.btnRow}>
            {renderActionButton()}
            <TouchableOpacity style={styles.expandBtn} onPress={toggleExpand}>
              <MaterialCommunityIcons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* ── Expanded punch log ── */}
      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.expandedDivider} />
          <Text style={styles.expandedTitle}>Punch Log</Text>

          {punches.length === 0 ? (
            <Text style={styles.noLogText}>No punch records</Text>
          ) : (
            punches.map((punch, index) => (
              <View key={index} style={styles.punchLogRow}>
                <View style={styles.logBadge}>
                  <Text style={styles.logBadgeText}>#{index + 1}</Text>
                </View>

                <View style={styles.logTimeBlock}>
                  <MaterialCommunityIcons name="login" size={13} color="#10b981" />
                  <Text style={styles.logTime}>{formatTime(punch.inTime || punch.INTIME)}</Text>
                </View>

                <MaterialCommunityIcons name="arrow-right" size={14} color="#94a3b8" />

                <View style={styles.logTimeBlock}>
                  <MaterialCommunityIcons name="logout" size={13} color="#ef4444" />
                  <Text style={[
                    styles.logTime,
                    !(punch.outTime || punch.OUTTIME) && { color: '#f59e0b' },
                  ]}>
                    {punch.outTime || punch.OUTTIME ? formatTime(punch.outTime ?? punch.OUTTIME) : 'Active'}
                  </Text>
                </View>

                <View style={styles.logDuration}>
                  <MaterialCommunityIcons name="timer-outline" size={12} color="#64748b" />
                  <Text style={styles.logDurationText}>{punch.durationFormatted || punch.DURATIONFORMATTED}</Text>
                </View>
              </View>
            ))
          )}

          {/* Total row */}
          {punches.length > 0 && (
            <View style={styles.totalRow}>
              <MaterialCommunityIcons name="sigma" size={14} color="#3b82f6" />
              <Text style={styles.totalText}>
                Total: {totalTimeFormatted}  ({totalMinutes} min)
              </Text>
            </View>
          )}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  card             : {
    backgroundColor: '#fff', borderRadius: 16, padding: 15,
    marginBottom: 12, elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  mainRow          : { flexDirection: 'row', alignItems: 'flex-start' },
  infoBlock        : { flex: 1 },
  empName          : { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  empId            : { fontSize: 12, color: '#64748b', marginTop: 2 },
  timeRow          : { flexDirection: 'row', gap: 8, marginTop: 8 },
  timePill         : {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f1f5f9', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  timeText         : { fontSize: 11, color: '#475569', fontWeight: '600' },

  rightBlock       : { alignItems: 'flex-end', gap: 8 },
  miniStats        : {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, gap: 8,
  },
  miniStat         : { alignItems: 'center' },
  miniStatValue    : { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  miniStatLabel    : { fontSize: 9,  color: '#94a3b8', fontWeight: '500' },
  miniStatDivider  : { width: 1, height: 24, backgroundColor: '#e2e8f0' },

  btnRow           : { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punchBtn         : {
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 8, elevation: 2,
  },
  punchBtnText     : { color: '#fff', fontWeight: '800', fontSize: 12 },
  expandBtn        : {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center',
  },

  expandedSection  : { marginTop: 10 },
  expandedDivider  : { height: 1, backgroundColor: '#f1f5f9', marginBottom: 10 },
  expandedTitle    : { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8 },
  noLogText        : { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 10 },

  punchLogRow      : {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  logBadge         : {
    backgroundColor: '#eff6ff', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  logBadgeText     : { fontSize: 10, fontWeight: '700', color: '#3b82f6' },
  logTimeBlock     : { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  logTime          : { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  logDuration      : {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f1f5f9', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  logDurationText  : { fontSize: 11, color: '#475569', fontWeight: '600' },

  totalRow         : {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  totalText        : { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
});

export default RenderListCard;