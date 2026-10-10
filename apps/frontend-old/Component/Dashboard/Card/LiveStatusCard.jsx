import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const LiveStatusCard = ({ UserId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Setup live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Setup Pulse Animation
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Status mapping logic
  const isPresent = !!UserId?.INTIME;
  // Fallbacks: If isPresent is true, we consider them clocked in.
  const statusText = isPresent ? 'ACTIVE SHIFT' : 'NOT CLOCKED IN';
  const statusColor = isPresent ? '#00E676' : '#FF1744';

  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  const formattedTime = currentTime.toLocaleTimeString('en-US', timeOptions);
  
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString('en-US', dateOptions);

  return (
    <View style={styles.cardContainer}>
      {/* Background Decorators */}
      <View style={[styles.decorator, { backgroundColor: statusColor, opacity: 0.1 }]} />
      
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Animated.View 
            style={[
              styles.pulseDot, 
              { backgroundColor: statusColor, transform: [{ scale: pulseAnim }] }
            ]} 
          />
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.detailsContainer}>
        {/* Punch In */}
        <View style={styles.detailBox}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(0,230,118, 0.15)' }]}>
            <MaterialCommunityIcons name="login" size={20} color="#00C853" />
          </View>
          <View>
            <Text style={styles.detailLabel}>Punch In</Text>
            <Text style={[styles.detailValue, { color: isPresent ? '#333' : '#999' }]}>
              {isPresent ? UserId?.INTIME : '--:--'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Working Hours (estimated, or OUTTIME) */}
        <View style={styles.detailBox}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,145,0,0.15)' }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#FF9100" />
          </View>
          <View>
            <Text style={styles.detailLabel}>Working Hours</Text>
            <Text style={[styles.detailValue, { color: isPresent ? '#333' : '#999' }]}>
               {isPresent ? 'Tracking...' : '--:--'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  decorator: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 13,
    color: '#8e9eab',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 28,
    fontFamily: 'Dosis-Bold',
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Dosis-Bold',
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 15,
  }
});

export default LiveStatusCard;
