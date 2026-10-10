import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../constants/Colors';
import { screenWidth } from '../../../components/Utils/Screens';

const LeaveSummaryCard = ({ 
  leaveTaken, 
  availableLeaves, 
  attendanceStatus,
  onPress,
  openReport,
  setopenLeaveModal,
  onGenerateReport,
  UserId // New prop for report generation
}) => {
  const statusColor = attendanceStatus === "Present" ? Colors.success : Colors.warning;
    const { width, height } = useWindowDimensions()
    const isLandscape = width > height;


  const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 3,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.white,
    width: isLandscape  ? width/2.5 :  screenWidth - 32,
    height :  isLandscape? 360 :"auto",
    
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent:"space-around"
   
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerIconContainer: {
    backgroundColor: 'rgba(42, 198, 209, 0.1)',
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    flex: 1,
    marginLeft: 12,
  },
  chevron: {
    opacity: 0.7
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconContainer: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: Colors.grayDark,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"#5063e2",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
  },
  reportButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        activeOpacity={0.95}
      >
        {/* Card Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons 
              name="calendar-month-outline" 
              size={24} 
              color={Colors.primary} 
            />
          </View>
          <Text style={styles.headerText}>Leave Summary</Text>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            onPress={() => setopenLeaveModal(true)}
            color={Colors.grayLight} 
            style={styles.chevron}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Leave Taken */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 76, 76, 0.1)' }]}>
              <MaterialCommunityIcons 
                name="calendar-remove" 
                size={20} 
                color={Colors.danger} 
              />
            </View>
            <Text style={styles.statTitle}>Taken</Text>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {typeof leaveTaken === 'number' ? `${leaveTaken} Days` : leaveTaken || '0 Days'}
            </Text>
          </View>

          {/* Available Leave */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <MaterialCommunityIcons 
                name="calendar-check" 
                size={20} 
                color={Colors.success} 
              />
            </View>
            <Text style={styles.statTitle}>Available</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {typeof availableLeaves === 'number' ? `${availableLeaves} Days` : 'N/A'}
            </Text>
          </View>

          {/* Attendance Status */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <MaterialCommunityIcons 
                name="calendar-star" 
                size={20} 
                color={statusColor} 
              />
            </View>
            <Text style={styles.statTitle}>Today</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statValue, { color: Colors.dark }]}>
                {attendanceStatus}
              </Text>
            </View>
          </View>
        </View>
          <TouchableOpacity 
        style={styles.reportButton}
        onPress={()=> openReport(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name="file-chart" 
          size={20} 
          color={Colors.white} 
        />
        <Text style={styles.reportButtonText}>Show Report</Text>
      </TouchableOpacity>
      </TouchableOpacity>


      {/* Report Button */}
    
    </View>
  );
};



export default LeaveSummaryCard;

