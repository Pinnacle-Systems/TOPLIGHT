import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AttendanceStatsCard = ({ workedDays, totalDays, otHours, leavesTaken }) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 64) / 4; // grid-like layout

  const stats = [
    { label: 'Worked', value: workedDays || 0, icon: 'calendar-check', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' },
    { label: 'Target', value: totalDays || 24, icon: 'flag-outline', color: '#3498DB', bg: 'rgba(52, 152, 219, 0.1)' },
    { label: 'OT Hrs', value: otHours || 0, icon: 'clock-fast', color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
    { label: 'Leaves', value: leavesTaken || 0, icon: 'calendar-remove', color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.1)' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Performance Overview</Text>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statBox, { width: cardWidth }]}>
            <View style={[styles.iconWrapper, { backgroundColor: stat.bg }]}>
              <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: 'Dosis-Bold',
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  }
});

export default AttendanceStatsCard;


