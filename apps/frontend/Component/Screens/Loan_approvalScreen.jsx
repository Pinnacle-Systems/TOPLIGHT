import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking,
  Image,
  ScrollView,
  Animated,
  useWindowDimensions
} from 'react-native';
import CustomText from '../Text/CustomText';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { useGet_fcm_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import socket from '../Utils/Socket';
import { useRequestLoan_ApprovalMutation } from '../../redux/service/Advance';
import { LinearGradient } from 'react-native-linear-gradient';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';

export default function Loan_ApprovalScreen({ route }) {
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = route?.params;
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { width } = useWindowDimensions();
  
  const { data: ref_token } = useGet_refresh_tokenQuery();
  const { data: fcm_use_token } = useGet_fcm_tokenQuery({params: {Idcard: params?.userdata?.Idcard}});

  useEffect(() => {
    if (params?.all) {
      const { all, refresh, ...clickedItem } = params;
      const remaining = all.filter(
        req => req.group === 'Advance' && req.docid !== clickedItem?.docid
      );
      setAllRequests([clickedItem, ...remaining]);
    } else if (params) {
      setAllRequests([params]);
    }
  }, [params?.docid]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [allRequests]);

  const makeCall = async (number) => {
    try {
      const url = `tel:${number}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not make the call');
    }
  };

  const [updateStatus] = useRequestLoan_ApprovalMutation();

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
        socket.emit("loan_Approval_Response", {
          Idcard: item?.userdata?.Idcard,
          compcode: UserSelect?.GCOMPCODE,
          status: response?.data?.approvalStatus,
          approved: isApproved
        });
        await _FCM_SENDER(
          ref_token?.data?.token,
          fcm_use_token?.data?.fcm,
          isApproved ? "✔ APPROVED Your Loan Request" : "❌ REJECTED Your Loan Request"
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

  const renderItem = ({ item }) => (
    <ScrollView style={{ width: width }} contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.userHeader}>
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={28} color="#fff" />
        </View>
        <View>
          <CustomText style={styles.userName}>{item?.userdata?.username}</CustomText>
          <CustomText style={styles.userId}>{item?.userdata?.Idcard}</CustomText>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Feather name="file-text" size={18} color="#666" />
          <CustomText style={styles.detailText}>Doc ID: {item?.docid}</CustomText>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="calendar" size={18} color="#666" />
          <CustomText style={styles.detailText}>
            {new Date(item?.docDate).toLocaleDateString()}
          </CustomText>
        </View>

        <View style={styles.amountContainer}>
          <View style={styles.amountBox}>
            <CustomText style={styles.amountLabel}>Pending</CustomText>
            <CustomText style={styles.amountValue}>₹{item?.preloan}</CustomText>
          </View>
          
          <View style={styles.amountBox}>
            <CustomText style={styles.amountLabel}>Total</CustomText>
            <CustomText style={styles.amountValue}>₹{item?.totalloan}</CustomText>
          </View>
          
          <View style={styles.amountBox}>
            <CustomText style={styles.amountLabel}>Due</CustomText>
            <CustomText style={styles.amountValue}>₹{item?.due}</CustomText>
          </View>
        </View>

        <View style={styles.installmentBox}>
          <CustomText style={styles.installmentText}>
            {item?.ins} Monthly Installments
          </CustomText>
        </View>

        <View style={styles.purposeContainer}>
          <CustomText style={styles.purposeLabel}>Purpose:</CustomText>
          <CustomText style={styles.purposeText}>{item?.remark}</CustomText>
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
          onPress={() => makeCall(item?.userdata?.phone )}
        >
          <Feather name="phone" size={18} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
    </ScrollView>
  );

  if (approvalStatus && approvalStatus !== null) {
    return (
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge, 
          approvalStatus === 'approved' ? styles.approvedBadge : styles.rejectedBadge
        ]}>
          <Feather 
            name={approvalStatus === 'approved' ? "check-circle" : "x-circle"} 
            size={48} 
            color="#fff" 
          />
          <CustomText style={styles.statusText}>
            {approvalStatus === 'approved' ? "Loan Approved" : "Loan Rejected"}
          </CustomText>
          <CustomText style={{color: '#fff', fontSize: 16, marginTop: 8}}>
            {allRequests.length} requests remaining
          </CustomText>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f7f9fc', '#eef2f5']} style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>Loan Approval Request</CustomText>
        <CustomText style={{textAlign: 'center', color: '#666'}}>{allRequests.length} requests pending</CustomText>
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
          <CustomText style={{ marginTop: 15, color: '#888', fontSize: 16 }}>No pending loan requests</CustomText>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
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
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  amountBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  installmentBox: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  installmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  purposeContainer: {
    marginTop: 12,
  },
  purposeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    backgroundColor: '#f7f9fc',
  },
  statusBadge: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  approvedBadge: {
    backgroundColor: '#4CAF50',
  },
  rejectedBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 16,
  },
});