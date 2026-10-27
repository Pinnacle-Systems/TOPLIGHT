import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  Dimensions,
  useWindowDimensions,
  Animated,
  LayoutAnimation 
} from 'react-native';
import { CustomNavigation } from '../utils/NavigationRef';
import { useAppTheme } from '../../theme';

export default function NotificationModal({refresh, close_modal, livedata={}, data, modalVisible, setModalVisible }) {
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [livedata_man, setlivedata_man] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  useEffect(() => {
    const liveDocId = livedata?.data?.docid || livedata?.data?.docId;
    if (liveDocId) {
      setlivedata_man(prev => {
        const exists = prev.some(item => (item.docid || item.docId) === liveDocId);
        if (!exists) return [...prev, livedata.data];
        return prev;
      });
    }
  }, [livedata?.data?.docid, livedata?.data?.docId]);

  const mergedData = useMemo(() => {
    return [...(data?.data || []), ...livedata_man];
  }, [data?.data, livedata_man]);

  // Group notifications by type and date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    
    mergedData.forEach(notification => {
      const date = new Date(notification.createdAt || Date.now());
      const dateKey = date.toLocaleDateString();
      const rawGroup = notification.group || 'Other';
      const normalizedGroup = rawGroup.toLowerCase();
      const groupTitle = normalizedGroup === 'onduty' ? 'ONDUTY'
        : normalizedGroup === 'leave' ? 'LEAVE'
        : normalizedGroup === 'permission' ? 'PERMISSION'
        : rawGroup;
      const key = `${normalizedGroup}-${dateKey}`;
      
      if (!groups[key]) {
        groups[key] = {
          title: groupTitle,
          groupType: normalizedGroup,
          date: dateKey,
          data: [],
          isExpanded: expandedGroups[key] || false
        };
      }
      groups[key].data.push(notification);
    });
    
    return Object.values(groups).sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });
  }, [mergedData, expandedGroups]);

  const toggleGroup = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const onPress = (data) => {
    const grp = String(data?.group || '').toLowerCase();
    switch(grp) {
      case "leave":
        CustomNavigation("l_approval", {...data, refresh, all: mergedData});
        break;
      case "permission":
        CustomNavigation("p_approval", {...data, refresh, all: mergedData});
        break;
      case "onduty":
        CustomNavigation("onduty_approval", {...data, refresh, all: mergedData});
        break;
      default:
        break;
    }
    close_modal?.(false);
  };

  const NotificationItem = ({ sendBy, description, group, onPress, loanamt, data }) => {
    const isLeave = String(group || '').toLowerCase() === 'leave';
    const isPermission = String(group || '').toLowerCase() === 'permission';
    const isOnduty = String(group || '').toLowerCase() === 'onduty';

    return (
      <TouchableOpacity 
        onPress={() => onPress(data)} 
        style={[
          styles.notificationContainer,
          isLeave && styles.leaveContainer,
          isPermission && styles.permissionContainer,
          isOnduty && styles.ondutyContainer
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.timeBadge}>
            <Text style={styles.notificationTime}>Now</Text>
          </View>
        </View>
        
        <View style={styles.senderRow}>
          <AntDesign name="user" size={isLandscape ? 16 : 14} color={theme.colors.textSecondary} />
          <Text style={styles.notificationSender}>{sendBy || "Unknown"}</Text>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.reasonRow}>
            {isOnduty ? 
              <Entypo name="location-pin" size={isLandscape ? 26 : 24} color={theme.colors.brand} /> :
              <AntDesign name="infocirlceo" size={isLandscape ? 16 : 14} color={theme.colors.textSecondary} />
            }  
            <Text style={styles.notificationDescription} numberOfLines={isLandscape ? 1 : 2}>
              {description}
            </Text>
          </View>
          
          <View style={styles.unseenBadge}>
            <Text style={styles.unseenText}>New</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const NotificationGroup = ({ title, groupType, date, data, isExpanded, onToggle }) => {
    const count = data.length;
    const rotation = new Animated.Value(isExpanded ? 1 : 0);
    const grp = String(groupType || title || '').toLowerCase();
    const isLeave = grp === 'leave';
    const isPermission = grp === 'permission';
    const isOnduty = grp === 'onduty';
    
    Animated.timing(rotation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg']
    });

    return (
      <View style={styles.groupContainer}>
        <TouchableOpacity 
          onPress={onToggle} 
          style={styles.groupHeader}
          activeOpacity={0.8}
        >
          <View style={styles.groupHeaderContent}>
            <View style={[
              styles.groupBadge,
              isLeave && styles.leaveBadge,
              isPermission && styles.permissionBadge,
              isOnduty && styles.ondutyBadge
            ]}>
              <Text style={[
                styles.groupText,
                isLeave && styles.leaveText,
                isPermission && styles.permissionText,
                isOnduty && styles.ondutyText
              ]}>{title}</Text>
            </View>
            <Text style={styles.groupDate}>{date}</Text>
          </View>
          
          <View style={styles.groupHeaderRight}>
            <View style={styles.groupCount}>
              <Text style={styles.groupCountText}>{count}</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <AntDesign name="right" size={isLandscape ? 18 : 16} color={theme.colors.textMuted} />
            </Animated.View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.groupItems}>
            {data.map((item, index) => {
              const sendBy =
                item?.userdata?.username ||
                item?.userdata?.userName ||
                item?.userData?.userName ||
                item?.userData?.username ||
                item?.empName ||
                item?.empname ||
                item?.userName ||
                item?.username ||
                item?.userdata?.Employee ||
                item?.Employee ||
                item?.idCard ||
                item?.idcard ||
                'Employee';

              const ondutyLocation =
                item?.in_location ||
                item?.inLocation ||
                (item?.inLatitude || item?.in_latitude
                  ? `Near ${Number(item?.inLatitude || item?.in_latitude).toFixed(4)}, ${Number(item?.inLongtiude || item?.in_longtiude).toFixed(4)}`
                  : null) ||
                item?.others ||
                'OnDuty Trip';

              const itemGroup = String(item?.group || '').toLowerCase();
              const description =
                itemGroup === 'onduty'
                  ? ondutyLocation
                  : (item?.reason || item?.description || item?.others || (itemGroup === 'leave' ? 'Leave Application' : 'Permission Request'));

              return (
                <NotificationItem
                  key={(item?.docid || item?.docId || index).toString()}
                  sendBy={sendBy}
                  group={item?.group}
                  loanamt={item?.total}
                  description={description}
                  data={item}
                  onPress={(data) => onPress(data)}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <NotificationGroup
      title={item.title}
      groupType={item.groupType}
      date={item.date}
      data={item.data}
      isExpanded={item.isExpanded}
      onToggle={() => toggleGroup(`${item.groupType || item.title}-${item.date}`)}
    />
  );

  const styles = useMemo(
    () => createStyles(isLandscape, width, height, theme),
    [isLandscape, width, height, theme],
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={hideModal}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Image 
                source={require("../../assets/notification.png")} 
                style={styles.icon} 
              />
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.notificationCount}>{mergedData.length}</Text>
            </View>
            <TouchableOpacity 
              onPress={hideModal} 
              style={styles.closeButton}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            >
              <AntDesign name="close" size={isLandscape ? 24 : 20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {groupedNotifications.length > 0 ? (
            <FlatList
              data={groupedNotifications}
              renderItem={renderItem}
              keyExtractor={(item) => `${item.title}-${item.date}`}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={require("../../assets/no-notification.jpg")} 
                style={styles.emptyImage} 
              />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>You'll see important updates here</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (isLandscape, width, height, theme) => StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: theme.colors.scrim,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: isLandscape ? 20 : 60,
    paddingHorizontal: 12,
  },
  modalContainer: {
    width: isLandscape ? Math.min(width * 0.7, 620) : width - 24,
    maxHeight: isLandscape ? height * 0.9 : '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: isLandscape ? 15 : 20,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLandscape ? 15 : 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    paddingBottom: isLandscape ? 10 : 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: isLandscape ? 28 : 24,
    height: isLandscape ? 28 : 24,
    marginRight: isLandscape ? 15 : 12,
    tintColor: theme.colors.brand,
  },
  headerTitle: {
    fontSize: isLandscape ? 22 : 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notificationCount: {
    backgroundColor: theme.colors.brand,
    color: theme.colors.brandContrast,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: isLandscape ? 14 : 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    padding: 5,
  },
  list: {
    paddingBottom: 10,
  },
  groupContainer: {
    marginBottom: isLandscape ? 12 : 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSunken,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isLandscape ? 12 : 15,
    backgroundColor: theme.colors.surface,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupBadge: {
    backgroundColor: theme.colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 10,
  },
  leaveBadge: {
    backgroundColor: theme.colors.dangerSoft,
  },
  permissionBadge: {
    backgroundColor: theme.colors.infoSoft,
  },
  ondutyBadge: {
    backgroundColor: theme.colors.warningSoft,
  },
  groupText: {
    fontSize: isLandscape ? 15 : 13,
    fontWeight: '600',
    color: theme.colors.brand,
    textTransform: 'uppercase',
  },
  leaveText: {
    color: theme.colors.danger,
  },
  permissionText: {
    color: theme.colors.info,
  },
  ondutyText: {
    color: theme.colors.warning,
  },
  groupDate: {
    fontSize: isLandscape ? 14 : 12,
    color: theme.colors.textSecondary,
  },
  groupCount: {
    backgroundColor: theme.colors.brand,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
  },
  groupCountText: {
    color: theme.colors.brandContrast,
    fontSize: isLandscape ? 13 : 11,
    fontWeight: '600',
  },
  groupItems: {
    paddingHorizontal: isLandscape ? 10 : 8,
    paddingBottom: isLandscape ? 8 : 6,
  },
  notificationContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: isLandscape ? 12 : 14,
    marginBottom: isLandscape ? 8 : 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  leaveContainer: {
    borderLeftColor: theme.colors.danger,
  },
  permissionContainer: {
    borderLeftColor: theme.colors.info,
  },
  ondutyContainer: {
    borderLeftColor: theme.colors.warning,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: isLandscape ? 6 : 8,
  },
  timeBadge: {
    backgroundColor: theme.colors.surfaceSunken,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  notificationTime: {
    fontSize: isLandscape ? 13 : 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLandscape ? 6 : 8,
  },
  notificationSender: {
    fontSize: isLandscape ? 16 : 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  loanDescription: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: isLandscape ? 16 : 14,
    marginLeft: 6,
  },
  notificationDescription: {
    fontSize: isLandscape ? 14 : 13,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  unseenBadge: {
    backgroundColor: theme.colors.dangerSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unseenText: {
    fontSize: isLandscape ? 13 : 11,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isLandscape ? 30 : 40,
  },
  emptyImage: {
    width: isLandscape ? 140 : 120,
    height: isLandscape ? 140 : 120,
    marginBottom: isLandscape ? 25 : 20,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: isLandscape ? 20 : 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: isLandscape ? 16 : 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    maxWidth: '80%',
  },
});