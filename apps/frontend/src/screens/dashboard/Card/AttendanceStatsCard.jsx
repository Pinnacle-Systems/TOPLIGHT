import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const AttendanceStatsCard = ({ workedDays, totalDays, otHours, leavesTaken }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const cardWidth = (width - 64) / 4; // grid-like layout

  const stats = [
    { label: 'Worked', value: workedDays || 0, icon: 'calendar-check', color: theme.colors.success, bg: theme.colors.successSoft },
    { label: 'Target', value: totalDays || 24, icon: 'flag-outline', color: theme.colors.info, bg: theme.colors.infoSoft },
    { label: 'OT Hrs', value: otHours || 0, icon: 'clock-fast', color: theme.colors.warning, bg: theme.colors.warningSoft },
    { label: 'Leaves', value: leavesTaken || 0, icon: 'calendar-remove', color: theme.colors.danger, bg: theme.colors.dangerSoft },
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

const createStyles = theme => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
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
    color: theme.colors.text,
    fontFamily: 'Dosis-Bold',
  },
  label: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  }
});

export default AttendanceStatsCard;

