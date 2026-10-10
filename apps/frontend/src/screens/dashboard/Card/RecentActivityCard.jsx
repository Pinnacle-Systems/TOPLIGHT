import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RecentActivityCard = ({ data, onDetailPress }) => {
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
            <View style={[styles.iconContainer, { backgroundColor: item.INTIME ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
              <MaterialCommunityIcons 
                name={item.INTIME ? "clock-check-outline" : "clock-alert-outline"} 
                size={20} 
                color={item.INTIME ? "#4CAF50" : "#F44336"} 
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  viewAll: {
    fontSize: 12,
    color: '#3498db',
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
    color: '#34495e',
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  shiftText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2c3e50',
  },
  otBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  otText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '700',
  }
});

export default RecentActivityCard;


