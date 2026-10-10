import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  useWindowDimensions
} from 'react-native';
import CustomText from '../Text/CustomText';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { useGet_fcm_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import socket from '../Utils/Socket';
import { useRequestLeave_ApprovalMutation } from '../../redux/service/Leave';

export default function Leave_ApprovalScreen({route}) {
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = route?.params;
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (params?.all) {
      const { all, refresh, ...clickedItem } = params;
      const remaining = all.filter(
        req => req.group === 'Leave' && req.docid !== clickedItem?.docid
      );
      setAllRequests([clickedItem, ...remaining]);
    } else if (params) {
      setAllRequests([params]);
    }
  }, [params?.docid]);

  const {data: ref_token} = useGet_refresh_tokenQuery();
  const {data: fcm_use_token} = useGet_fcm_tokenQuery({params: {Idcard: params?.userdata?.Idcard}});

  const makeCall = async (number) => {
    try {
      const url = `tel:${number}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not make the call');
    }
  };

  const [updateStatus] = useRequestLeave_ApprovalMutation();

  const handleAction = async (item, status) => {
    setIsLoading(true);
    try {
      const response = await updateStatus({
        approval: String(status).toLowerCase(),
        docid: item.docid,
        approvedBy: status === "APPROVED" ? UserSelect?.UserId : "",
        rejectBy: status === "REJECTED" ? UserSelect?.UserId : ""
      }).unwrap();

      const isApproved = response?.data?.approvalStatus === "approved";
      setApprovalStatus(isApproved ? 'approved' : 'rejected');

      try {
        socket.emit("leave_Approval_Response", {
          Idcard: item?.userdata?.Idcard,
          compcode: UserSelect?.GCOMPCODE,
          status: response?.data?.approvalStatus,
          approved: isApproved
        });
        await _FCM_SENDER(
          ref_token?.data?.token,
          fcm_use_token?.data?.fcm,
          isApproved ? "✔ APPROVED Your Leave Request" : "❌ REJECTED Your Leave Request"
        );
      } catch (error) {}

      setTimeout(() => {
        setAllRequests(prev => prev.filter(req => req.docid !== item.docid));
        setApprovalStatus(null);
      }, 3000);

    } catch (error) {
      Alert.alert("Error", "Failed to process your request");
    } finally {
      setIsLoading(false);
      params?.refresh?.({ force: true });
    }
  };

  if (approvalStatus && approvalStatus !== null) {
    return (
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusCard,
          approvalStatus === 'approved' ? styles.approvedCard : styles.rejectedCard
        ]}>
          <Feather 
            name={approvalStatus === 'approved' ? "check-circle" : "x-circle"} 
            size={48} 
            color="#fff" 
          />
          <Text style={styles.statusText}>
            {approvalStatus === 'approved' ? "Leave Approved" : "Leave Rejected"}
          </Text>
          <Text style={styles.statusSubtext}>
            {allRequests.length} requests remaining
          </Text>
        </View>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <ScrollView style={{ width: width }} contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Feather name="user" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.userName}>{item?.userdata?.username}</Text>
              <Text style={styles.userId}>{item?.userdata?.Idcard}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Feather name="file-text" size={18} color="#666" />
              <Text style={styles.detailText}>Document ID: {item?.docid}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Feather name="calendar" size={18} color="#666" />
              <Text style={styles.detailText}>
                {new Date(item?.docDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.dateRange}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>From</Text>
                <Text style={styles.dateValue}>
                  {new Date(item?.fromDate).toLocaleDateString()}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#666" />
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>To</Text>
                <Text style={styles.dateValue}>
                  {new Date(item?.toDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Days</Text>
              <Text style={styles.infoValue}>{item?.totalDays}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Leave Type</Text>
              <Text style={styles.infoValue}>{item?.ltype}</Text>
            </View>

            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Reason:</Text>
              <Text style={styles.reasonText}>{item?.reason}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAction(item, 'APPROVED')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleAction(item, 'REJECTED')}
              disabled={isLoading}
            >
              <Feather name="x" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]}
              onPress={() => makeCall(item?.userdata?.phone)}
            >
              <Feather name="phone" size={18} color="#fff" />
              <Text style={styles.buttonText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leave Approval Request</Text>
        <Text style={{textAlign: 'center', color: '#666'}}>{allRequests.length} requests pending</Text>
        <View style={styles.headerDivider} />
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Feather name="inbox" size={50} color="#ccc" />
          <Text style={{ marginTop: 15, color: '#888', fontSize: 16 }}>No pending leave requests</Text>
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
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginTop: 12,
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  userId: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 8,
  },
  dateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reasonContainer: {
    marginTop: 16,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
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
    marginLeft: 8,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  statusCard: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  approvedCard: {
    backgroundColor: '#4CAF50',
  },
  rejectedCard: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
  },
  statusSubtext: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});