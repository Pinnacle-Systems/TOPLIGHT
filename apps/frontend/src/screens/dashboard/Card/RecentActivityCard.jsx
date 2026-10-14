import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const RecentActivityCard = ({ data, onDetailPress }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // Take last 3-4 entries
  const recentData = data?.slice(0, 3) || [];

  if (recentData.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity onPress={onDetailPress}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {recentData.map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.INTIME ? theme.colors.successSoft : theme.colors.dangerSoft }]}>
              <MaterialCommunityIcons 
                name={item.INTIME ? "clock-check-outline" : "clock-alert-outline"} 
                size={20} 
                color={item.INTIME ? theme.colors.success : theme.colors.danger}
              />
            </View>
            
            <View style={styles.details}>
              <Text style={styles.actionText}>{item.INTIME ? 'Shift In' : 'Missed Punch'}</Text>
              <Text style={styles.dateText}>{item.INDT} • {item.INTIME || '--:--'}</Text>
            </View>

            <View style={styles.rightContent}>
               <Text style={styles.shiftText}>{item.SHIFTCNT > 0 ? `${item.SHIFTCNT} Shift` : 'No Entry'}</Text>
               {item.OT > 0 && (
                 <View style={styles.otBadge}>
                    <Text style={styles.otText}>+{item.OT}h OT</Text>
                 </View>
               )}
            </View>
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
    marginHorizontal: 12,
    marginVertical: 5,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  viewAll: {
    fontSize: 12,
    color: theme.colors.brand,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  shiftText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  otBadge: {
    backgroundColor: theme.colors.warningSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  otText: {
    fontSize: 10,
    color: theme.colors.warning,
    fontWeight: '700',
  }
});

export default RecentActivityCard;
