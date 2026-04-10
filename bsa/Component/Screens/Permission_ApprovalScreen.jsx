import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Alert, Image, useWindowDimensions, ScrollView } from 'react-native';
import CustomText from '../Text/CustomText';
import { Linking } from 'react-native';
import { useRequestPermission_ApprovalMutation } from '../../redux/service/permission';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather'
import { useSelector } from 'react-redux';
import { useGet_fcm_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import socket from '../Utils/Socket';

export default function Permission_ApprovalScreen({route}) {
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const params = route?.params;
  const { width } = useWindowDimensions();
  
  const {data: ref_token, isError: ref_token_error} = useGet_refresh_tokenQuery();
  const {data: fcm_use_token, isError: Error_Token} = useGet_fcm_tokenQuery({params: {Idcard: params?.userdata?.Idcard}});

  const makeCall = async (number) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Cannot place call without permission.');
          return;
        }
      }
      const url = `tel:${number}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone call not supported on this device.');
      }
    } catch (error) {
      Alert.alert('Call Error', error.message || 'Unknown error');
    }
  };

  if(ref_token_error || Error_Token) {
    Alert.alert("Notification", "Can't receive approval or rejection notification to requesting employee");
  }

  useEffect(() => {
    if (params?.all) {
      const { all, refresh, ...clickedItem } = params;
      const remaining = all.filter(
        req => req.group === 'Permission' && req.docid !== clickedItem?.docid
      );
      setAllRequests([clickedItem, ...remaining]);
    } else if (params) {
      setAllRequests([params]);
    }
  }, [params?.docid]);

  const [updateStatus, { isLoading: isUpdating }] = useRequestPermission_ApprovalMutation();

  const handleAction = async (item, status) => {
    try {
      const update_approval = await updateStatus({
        approval: String(status).toLowerCase(),
        docid: item.docid,
        approvedBy: status == "APPROVED" ? UserSelect?.UserId : "",
        rejectBy: status == "REJECTED" ? UserSelect?.UserId : ""
      }).unwrap();
      
      const isApproved = update_approval?.data?.approvalStatus == "approved";
      setApprovalStatus(isApproved ? 'approved' : 'rejected');

      try {
        socket.emit("Approval_Response", {
          Idcard: item?.userdata?.Idcard,
          compcode: UserSelect?.GCOMPCODE,
          status: update_approval?.data?.approvalStatus,
          approved: isApproved
        });
        await _FCM_SENDER(
          ref_token?.data?.token,
          fcm_use_token?.data?.fcm,
          isApproved ? "✔ APPROVED Your Permission Request" : "❌ REJECTED Your Permission Request"
        );
      } catch (error) {
        console.error('Error sending notification:', error);
      }

      setTimeout(() => {
        setAllRequests(prev => prev.filter(req => req.docid !== item.docid));
        setApprovalStatus(null);
      }, 3000);

    } catch (err) {
      console.error(err);
    } finally {
      params?.refresh({ force: true });
    }
  };

  const renderItem = ({ item }) => (
    <ScrollView style={{ width: width }} contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
    <View style={styles.card}>
      <View style={styles.userHeader}>
        <Image 
          source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi-Wf3JniM-syXFLvUtaM5KKYGK_bIf64-kn75JENLuF9TNxO975jwG5pi0rGBp5lSuxk&usqp=CAU"}}
          style={styles.avatar} 
        />
        <View>
          <Text style={styles.userName}>{item?.userdata?.username}</Text>
          <Text style={styles.userId}>{item?.userdata?.Idcard}</Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <MaterialIcons name="date-range" size={18} color="#555" />
        <Text style={styles.detailText}>{new Date(item?.docDate).toDateString()}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Feather name="hash" size={18} color="#555" />
        <Text style={styles.detailText}>Doc ID: {item?.docid}</Text>
      </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeBox}>
          <Feather name="clock" size={16} color="#555" />
          <Text style={styles.timeText}>From: {item?.fTime}</Text>
        </View>
        <View style={styles.timeBox}>
          <Feather name="clock" size={16} color="#555" />
          <Text style={styles.timeText}>To: {item?.tTime}</Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Feather name="watch" size={18} color="#555" />
        <Text style={styles.detailText}>Total Hours: {item?.thrs}</Text>
      </View>
      
      <View style={styles.reasonContainer}>
        <Feather name="edit-3" size={18} color="#555" />
        <Text style={styles.reasonText}>{item?.reason}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleAction(item, 'APPROVED')}
        >
          <Feather name="check" size={20} color="white" />
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleAction(item, 'REJECTED')}
        >
          <Feather name="x" size={20} color="white" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => makeCall(item?.userdata?.phone)}
        >
          <Feather name="phone" size={20} color="white" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );

  if (approvalStatus && approvalStatus !== null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[
          styles.statusContainer,
          approvalStatus === 'approved' ? styles.approvedStatus : styles.rejectedStatus
        ]}>
          <Feather 
            name={approvalStatus === 'approved' ? "check-circle" : "x-circle"} 
            size={40} 
            color="white" 
          />
          <View>
            <Text style={styles.statusText}>
              {approvalStatus === 'approved' ? "Permission Approved" : "Permission Rejected"}
            </Text>
            <Text style={{color: 'white', marginLeft: 10, marginTop: 5}}>
              {allRequests.length} requests remaining
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Permission Requests</Text>
        <Text style={styles.headerSubtitle}>{allRequests.length} requests pending</Text>
      </View>

      {allRequests.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={allRequests}
            renderItem={renderItem}
            keyExtractor={(item) => item?.docid?.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No pending permission requests</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#e1f5fe',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    width: '48%',
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  reasonContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '30%',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  callButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  approvedStatus: {
    backgroundColor: '#4CAF50',
  },
  rejectedStatus: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 15,
  },
});