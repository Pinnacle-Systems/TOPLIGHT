import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

const LiveStatusCard = ({ UserId }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  const statusColor = isPresent ? theme.colors.success : theme.colors.danger;

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
          <View style={[styles.iconWrapper, { backgroundColor: theme.colors.successSoft }]}>
            <MaterialCommunityIcons name="login" size={20} color={theme.colors.success} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Punch In</Text>
            <Text style={[styles.detailValue, { color: isPresent ? theme.colors.text : theme.colors.textMuted }]}>
              {isPresent ? UserId?.INTIME : '--:--'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Working Hours (estimated, or OUTTIME) */}
        <View style={styles.detailBox}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.colors.warningSoft }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.warning} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Working Hours</Text>
            <Text style={[styles.detailValue, { color: isPresent ? theme.colors.text : theme.colors.textMuted }]}>
               {isPresent ? 'Tracking...' : '--:--'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = theme => StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle
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
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 28,
    fontFamily: 'Dosis-Bold',
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
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
    backgroundColor: theme.colors.surfaceSunken,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
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
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.divider,
    marginHorizontal: 15,
  }
});

export default LiveStatusCard;

