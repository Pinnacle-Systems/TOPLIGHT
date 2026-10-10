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
import { CustomNavigation } from '../Utils/NavigationRef';

export default function NotificationModal({refresh, close_modal, livedata={}, data, modalVisible, setModalVisible }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [livedata_man, setlivedata_man] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  useEffect(() => {
    if (livedata?.data?.docid) {
      setlivedata_man(prev => {
        const exists = prev.some(item => item.docid === livedata.data.docid);
        if (!exists) return [...prev, livedata.data];
        return prev;
      });
    }
  }, [livedata?.data?.docid]);

  const mergedData = useMemo(() => {
    return [...(data?.data || []), ...livedata_man];
  }, [data?.data, livedata_man]);

  // Group notifications by type and date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    
    mergedData.forEach(notification => {
      const date = new Date(notification.createdAt || Date.now());
      const dateKey = date.toLocaleDateString();
      const groupKey = notification.group || 'Other';
      const key = `${groupKey}-${dateKey}`;
      
      if (!groups[key]) {
        groups[key] = {
          title: groupKey,
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
    switch(data?.group) {
      case "Leave":
        CustomNavigation("l_approval", {...data, refresh,all:mergedData});
        break;
      case "Permission":
        CustomNavigation("p_approval", {...data, refresh,all:mergedData});
        break;
      case "Advance":
        CustomNavigation("ln_approval", {...data, refresh,all:mergedData});
        break;
      case "onduty":
        CustomNavigation("onduty_approval", {...data, refresh,all:mergedData});
        break;
      default:
        CustomNavigation("p_approval", {...data, refresh,all:mergedData});
        break;
    }
    close_modal?.(false);
  }

  const NotificationItem = ({ sendBy, description, group, onPress, loanamt, data }) => (
    <TouchableOpacity 
      onPress={() => onPress(data)} 
      style={[
        styles.notificationContainer,
        group === "Leave" && styles.leaveContainer,
        group === "Permission" && styles.permissionContainer,
        group === "Advance" && styles.advanceContainer,
        group === "onduty" && styles.ondutyContainer
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.timeBadge}>
          <Text style={styles.notificationTime}>Now</Text>
        </View>
      </View>
      
      <View style={styles.senderRow}>
        <AntDesign name="user" size={isLandscape ? 16 : 14} color="#555" />
        <Text style={styles.notificationSender}>{sendBy || "Unknown"}</Text>
      </View>
      
      <View style={styles.statusRow}>
        {group === "Advance" ? (
          <View style={styles.loanRow}>
            <AntDesign name="creditcard" size={isLandscape ? 16 : 14} color="#4CAF50" />
            <Text style={styles.loanDescription}>₹{loanamt}</Text>
          </View>
        ) : (
          <View style={styles.reasonRow}>
            {group === "onduty" ? 
              <Entypo name="location-pin" size={isLandscape ? 26 : 24} color="black" /> : 
              <AntDesign name="infocirlceo" size={isLandscape ? 16 : 14} color="#555" />
            }  
            <Text style={styles.notificationDescription} numberOfLines={isLandscape ? 1 : 2}>
              {group === "onduty" ? data?.in_location : description}
            </Text>
          </View>
        )}
        
        <View style={styles.unseenBadge}>
          <Text style={styles.unseenText}>New</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const NotificationGroup = ({ title, date, data, isExpanded, onToggle }) => {
    const count = data.length;
    const rotation = new Animated.Value(isExpanded ? 1 : 0);
    
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
              title === "Leave" && styles.leaveBadge,
              title === "Permission" && styles.permissionBadge,
              title === "Advance" && styles.advanceBadge,
              title === "onduty" && styles.ondutyBadge
            ]}>
              <Text style={styles.groupText}>{title}</Text>
            </View>
            <Text style={styles.groupDate}>{date}</Text>
          </View>
          
          <View style={styles.groupHeaderRight}>
            <View style={styles.groupCount}>
              <Text style={styles.groupCountText}>{count}</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <AntDesign name="right" size={isLandscape ? 18 : 16} color="#666" />
            </Animated.View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.groupItems}>
            {data.map((item, index) => (
              <NotificationItem
                key={item?.docid?.toString() || index.toString()}
                sendBy={item?.userdata?.username}
                group={item?.group}
                loanamt={item?.total}
                description={item?.reason}
                data={item}
                onPress={(data) => onPress(data)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <NotificationGroup
      title={item.title}
      date={item.date}
      data={item.data}
      isExpanded={item.isExpanded}
      onToggle={() => toggleGroup(`${item.title}-${item.date}`)}
    />
  );

  const styles = createStyles(isLandscape, width, height);

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
                source={require("../../assets/Notification.png")} 
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
              <AntDesign name="close" size={isLandscape ? 24 : 20} color="#666" />
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
                source={require("../../assets/noNotification.jpg")} 
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

const createStyles = (isLandscape, width, height) => StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: isLandscape ? 20 : 60,
  },
  modalContainer: {
    width: isLandscape ? width * 0.7 : width * 0.9,
    maxHeight: isLandscape ? height * 0.9 : '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: isLandscape ? 15 : 20,
    shadowColor: '#000',
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
    borderBottomColor: '#f0f0f0',
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
    tintColor: '#3a86ff',
  },
  headerTitle: {
    fontSize: isLandscape ? 22 : 20,
    fontWeight: '700',
    color: '#333',
  },
  notificationCount: {
    backgroundColor: '#3a86ff',
    color: 'white',
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
    backgroundColor: '#f9f9f9',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isLandscape ? 12 : 15,
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 10,
  },
  leaveBadge: {
    backgroundColor: '#FFEBEE',
  },
  permissionBadge: {
    backgroundColor: '#E3F2FD',
  },
  advanceBadge: {
    backgroundColor: '#E8F5E9',
  },
  ondutyBadge: {
    backgroundColor: '#FFF8E1',
  },
  groupText: {
    fontSize: isLandscape ? 15 : 13,
    fontWeight: '600',
    color: '#3a86ff',
    textTransform: 'uppercase',
  },
  leaveText: {
    color: '#FF7043',
  },
  permissionText: {
    color: '#42A5F5',
  },
  advanceText: {
    color: '#66BB6A',
  },
  ondutyText: {
    color: '#FFA000',
  },
  groupDate: {
    fontSize: isLandscape ? 14 : 12,
    color: '#666',
  },
  groupCount: {
    backgroundColor: '#3a86ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
  },
  groupCountText: {
    color: 'white',
    fontSize: isLandscape ? 13 : 11,
    fontWeight: '600',
  },
  groupItems: {
    paddingHorizontal: isLandscape ? 10 : 8,
    paddingBottom: isLandscape ? 8 : 6,
  },
  notificationContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: isLandscape ? 12 : 14,
    marginBottom: isLandscape ? 8 : 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3a86ff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  leaveContainer: {
    borderLeftColor: '#FF7043',
  },
  permissionContainer: {
    borderLeftColor: '#42A5F5',
  },
  advanceContainer: {
    borderLeftColor: '#66BB6A',
  },
  ondutyContainer: {
    borderLeftColor: '#FFA000',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: isLandscape ? 6 : 8,
  },
  timeBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  notificationTime: {
    fontSize: isLandscape ? 13 : 11,
    color: '#666',
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
    color: '#1a1a1a',
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
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: isLandscape ? 16 : 14,
    marginLeft: 6,
  },
  notificationDescription: {
    fontSize: isLandscape ? 14 : 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  unseenBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unseenText: {
    fontSize: isLandscape ? 13 : 11,
    color: '#e53935',
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
    color: '#555',
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: isLandscape ? 16 : 14,
    color: '#888',
    textAlign: 'center',
    maxWidth: '80%',
  },
});