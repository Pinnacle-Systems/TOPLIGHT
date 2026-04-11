// PunchSummary.jsx
import React from 'react';
import moment from 'moment';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetPunchSummaryQuery } from '../../../redux/service/AttendanceRtk';

// Convert a "HH:mm:ss" UTC string from the backend to local time display
const utcTimeToLocal = (timeStr) => {
  if (!timeStr || timeStr === '--:--') return timeStr;
  const m = moment.utc(timeStr, 'HH:mm:ss').local();
  return m.isValid() ? m.format('HH:mm:ss') : timeStr;
};

const PunchSummary = () => {
  const { data, isFetching } = useGetPunchSummaryQuery();
  const summary = data?.data;

  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ── Top stats row ── */}
      <View style={styles.statsRow}>

        <View style={[styles.statCard, { borderTopColor: '#3b82f6' }]}>
          <MaterialCommunityIcons name="counter" size={28} color="#3b82f6" />
          <Text style={styles.statValue}>{summary?.totalPunches ?? summary?.TOTALPUNCHES ?? 0}</Text>
          <Text style={styles.statLabel}>Total Punches</Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#10b981' }]}>
          <MaterialCommunityIcons name="clock-outline" size={28} color="#10b981" />
          <Text style={styles.statValue}>{summary?.totalTimeFormatted ?? summary?.TOTALTIMEFORMATTED ?? '00:00'}</Text>
          <Text style={styles.statLabel}>Hours Worked</Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#f59e0b' }]}>
          <MaterialCommunityIcons name="timer-outline" size={28} color="#f59e0b" />
          <Text style={styles.statValue}>{summary?.totalMinutesWorked ?? summary?.TOTALMINUTESWORKED ?? 0}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>

      </View>

      {/* ── Punch pairs list ── */}
      <Text style={styles.sectionTitle}>Today's Punch Log</Text>

      {!summary?.punches?.length && !summary?.PUNCHES?.length ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="calendar-remove" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No punches recorded today</Text>
        </View>
      ) : (
        (summary.punches || summary.PUNCHES).map((punch, index) => (
          <View key={index} style={styles.punchRow}>

            {/* Index badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>#{index + 1}</Text>
            </View>

            {/* IN time */}
            <View style={styles.timeBlock}>
              <MaterialCommunityIcons name="login" size={16} color="#10b981" />
              <Text style={styles.timeLabel}>IN</Text>
              <Text style={styles.timeValue}>{utcTimeToLocal(punch.inTime ?? punch.INTIME) ?? '--:--'}</Text>
            </View>

            {/* Arrow */}
            <MaterialCommunityIcons name="arrow-right" size={18} color="#94a3b8" />

            {/* OUT time */}
            <View style={styles.timeBlock}>
              <MaterialCommunityIcons name="logout" size={16} color="#ef4444" />
              <Text style={styles.timeLabel}>OUT</Text>
              <Text style={[
                styles.timeValue,
                !(punch.outTime || punch.OUTTIME) && { color: '#f59e0b' }   // amber if still active
              ]}>
                {punch.outTime || punch.OUTTIME ? utcTimeToLocal(punch.outTime ?? punch.OUTTIME) : 'Active'}
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.durationBlock}>
              <MaterialCommunityIcons name="timer" size={14} color="#64748b" />
              <Text style={styles.durationText}>{punch.durationFormatted ?? punch.DURATIONFORMATTED}</Text>
            </View>

          </View>
        ))
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container    : { padding: 16, backgroundColor: '#f8fafc' },
  center       : { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsRow     : { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard     : {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 14, alignItems: 'center', borderTopWidth: 3,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  statValue    : { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 8 },
  statLabel    : { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },

  sectionTitle : { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

  punchRow     : {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 8,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  badge        : {
    backgroundColor: '#eff6ff', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  badgeText    : { fontSize: 11, fontWeight: '700', color: '#3b82f6' },

  timeBlock    : { flex: 1, alignItems: 'center', gap: 2 },
  timeLabel    : { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  timeValue    : { fontSize: 14, fontWeight: '700', color: '#1e293b' },

  durationBlock: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f1f5f9', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  durationText : { fontSize: 12, color: '#475569', fontWeight: '600' },

  emptyBox     : { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText    : { color: '#94a3b8', fontSize: 15 },
});

export default PunchSummary;