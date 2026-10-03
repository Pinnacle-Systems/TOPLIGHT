import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking,
  ScrollView,
  Animated,
  Alert,
  FlatList,
  Image,
  useWindowDimensions
} from 'react-native';
import { useSelector } from 'react-redux';
import { useGet_fcm_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import socket from '../Utils/Socket';
import { useRequestOnduty_ApprovalMutation } from '../../redux/service/Onduty';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import OpenGoogleMaps from './Location/Gmap/Googlemap';
import CustomText from '../Text/CustomText';
import { getOndutyImageUrl } from '../../constants/apiUrl';
import { TextInput } from 'react-native-paper';
import tw from 'twrnc';
import moment from 'moment';

// Backend stores IST directly — parse as-is, NO UTC→local conversion.
const parseISTTime = (timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return moment(timeStr, 'HH:mm:ss');
  }
  return moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true).isValid()
    ? moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601])
    : moment(timeStr);
};

const friendlyTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseISTTime(timeStr);
  return m && m.isValid() ? m.format('hh:mm A') : timeStr;
};

const friendlyDate = (dateStr) => {
  if (!dateStr) return '—';
  const m = moment(dateStr);
  return m.isValid() ? m.format('DD MMM YYYY') : dateStr;
};

export default function Onduty_ApprovalScreen({ route }) {
  // State and selectors
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [reason_reject, setReasonReject] = useState("");
  const params = route?.params;
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // API hooks
  const { data: ref_token } = useGet_refresh_tokenQuery();
  const { data: fcm_use_token } = useGet_fcm_tokenQuery({
    params: { Idcard: params?.userdata?.Idcard }
  });
  const [updateStatus] = useRequestOnduty_ApprovalMutation();

  // Initialize requests — always show the clicked item first
  // Dependency on params?.docid ensures it re-runs if user clicks a new notification
  useEffect(() => {
    if (params?.all) {
      const { all, refresh, ...clickedItem } = params;
      // Filter to ONLY onduty items, exclude the clicked one
      const remaining = all.filter(
        req => req.group === 'onduty' && req.docid !== clickedItem?.docid
      );
      setAllRequests([clickedItem, ...remaining]);
    } else if (params) {
      setAllRequests([params]);
    }
  }, [params?.docid]);

  // Animation effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, allRequests]);

  // Handlers
  const makeCall = useCallback(async (number) => {
    try {
      await Linking.openURL(`tel:${number}`);
    } catch (error) {
      Alert.alert('Error', 'Could not make the call');
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleAction = useCallback(async (item, status) => {
    setIsLoading(true);
    try {
      const response = await updateStatus({
        approval: String(status).toLowerCase(),
        docid: item?.docid,
        reject_reason: reason_reject,
        approvedBy: status === "APPROVED" ? UserSelect?.UserId : "",
        rejectBy: status === "REJECTED" ? UserSelect?.UserId : ""
      }).unwrap();

      const isApproved = response?.data?.approvalStatus === "approved";
      setApprovalStatus(isApproved ? 'approved' : 'rejected');

      // Emit socket event
      socket.emit("onduty_Approval_Response", {
        Idcard: item?.userdata?.Idcard,
        compcode: UserSelect?.GCOMPCODE,
        status: response?.data?.approvalStatus,
        approved: isApproved
      });

      setTimeout(() => {
        // Remove the processed request
        setAllRequests(prev => prev.filter(req => req.docid !== item?.docid));
        setApprovalStatus(null);
        setReasonReject("");
        setImageLoading(true);
        setImageError(false);  // reset error state
      }, 3000);

      // Send FCM notification
      await _FCM_SENDER(
        ref_token?.data?.token,
        fcm_use_token?.data?.fcm,
        isApproved 
          ? "✔ APPROVED Your OnDuty Request" 
          : "❌ REJECTED Your OnDuty Request"
      );
    } catch (error) {
      if(reason_reject === "" && status === "REJECTED"){
      return  Alert.alert("Validation Error", "Please provide a reason for rejection.");
      }
      Alert.alert("Error", "Failed to process your request");
    } finally {
      setIsLoading(false);
      params?.refresh?.({ force: true });
    }
  }, [UserSelect, updateStatus, ref_token, fcm_use_token, reason_reject]);

  // Render functions (keep the same as before)
  const renderDetailRow = (iconName, label, value) => (
    <View style={tw`flex-row items-center mb-2`}>
      <Feather name={iconName} size={18} color="#666" />
      <CustomText style={tw`text-gray-700 ml-2`}>
        {label}: {value || 'N/A'}
      </CustomText>
    </View>
  );

  const renderActionButton = ({ 
    icon, 
    text, 
    onPress, 
    bgColor, 
    disabled = false 
  }) => (
    <TouchableOpacity 
      style={[
        tw`flex-row items-center justify-center py-3 px-4 rounded-lg mx-1 flex-1`,
        { backgroundColor: bgColor },
        disabled && tw`opacity-70`
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {isLoading && bgColor === '#4CAF50' ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Feather name={icon} size={18} color="#fff" />
          <Text style={tw`text-white font-semibold ml-2`}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderImageSection = (item) => {
    if (!item?.photo) return null;

    return (
      <View style={tw`mt-4 mb-3`}>
        <CustomText style={tw`text-lg font-semibold text-gray-800 mb-2`}>
          Attached Photo
        </CustomText>
        <View style={tw`rounded-lg overflow-hidden bg-gray-100 h-48 justify-center items-center`}>
          {imageLoading && (
            <ActivityIndicator size="large" color="#FFA000" style={tw`absolute`} />
          )}
          {imageError ? (
            <View style={tw`absolute justify-center items-center`}>
              <Feather name="image" size={40} color="#ccc" />
              <CustomText style={tw`text-red-600 mt-2`}>
                Failed to load image
              </CustomText>
            </View>
          ) : (
            <Image
              source={{ uri: `${getOndutyImageUrl()}?image=${item.photo}` }}
              style={tw`w-full h-full`}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </View>
      </View>
    );
  };

  const { width } = useWindowDimensions();

  const renderItem = useCallback(({ item }) => (
    <ScrollView 
      style={{ width: width }} 
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[tw`bg-white rounded-xl p-5 mb-4 shadow-md`, { opacity: fadeAnim }]}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`w-12 h-12 rounded-full bg-amber-500 justify-center items-center mr-3`}>
            <MaterialIcons name="person" size={24} color="#fff" />
          </View>
          <View>
            <CustomText style={tw`text-lg font-semibold text-gray-800`}>
              {item?.userdata?.username}
            </CustomText>
            <CustomText style={tw`text-gray-500 mt-1`}>
              {item?.userdata?.Idcard}
            </CustomText>
          </View>
        </View>

        <View style={tw`mb-4`}>
          {renderDetailRow('file-text', 'Doc ID', item?.docid)}
          {renderDetailRow('calendar', 'Date', friendlyDate(item?.docdate))}
          {renderDetailRow('clock', 'Time', friendlyTime(item?.in_time))}
          {renderDetailRow('map-pin', 'Location',  item?.in_location)}

          <View style={tw`mt-3 bg-amber-50 p-3 rounded-lg`}>
            <CustomText style={tw`text-sm font-medium text-amber-700 mb-1`}>
              Reason:
            </CustomText>
            <CustomText style={tw`text-gray-700`}>
              {item?.others || 'No reason provided'}
            </CustomText>
          </View>

          {renderImageSection(item)}

          {item?.in_latitude && item?.in_longtiude && (
            <OpenGoogleMaps 
              latitude={item?.in_latitude} 
              longitude={item?.in_longtiude} 
            />
          )}
        </View>

        <TextInput
          value={reason_reject}
          mode="outlined"
          label="Reject Reason"
          multiline
          onChangeText={setReasonReject}
          placeholder="Enter Your Reject Reason..."
          placeholderTextColor="#aaa"
          style={tw`mb-4 bg-white`}
        />

        <View style={tw`flex-row justify-between`}>
          {renderActionButton({
            icon: 'check',
            text: 'Approve',
            onPress: () => handleAction(item, 'APPROVED'),
            bgColor: '#4CAF50',
            disabled: isLoading
          })}
          
          {renderActionButton({
            icon: 'x',
            text: 'Reject',
            onPress: () => handleAction(item, 'REJECTED'),
            bgColor: '#F44336',
            disabled: isLoading
          })}
          
          {renderActionButton({
            icon: 'phone',
            text: 'Call',
            onPress: () => makeCall(item?.userdata?.phone),
            bgColor: '#2196F3'
          })}
        </View>
      </Animated.View>
    </ScrollView>
  ), [fadeAnim, isLoading, handleAction, makeCall, reason_reject, width]);

  // Status screen
  if (approvalStatus && approvalStatus !== null) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-50`}>
        <View style={[
          tw`p-7 rounded-xl items-center shadow-md`,
          approvalStatus === 'approved' ? tw`bg-green-500` : tw`bg-red-500`
        ]}>
          <Feather 
            name={approvalStatus === 'approved' ? "check-circle" : "x-circle"} 
            size={48} 
            color="#fff" 
          />
          <CustomText style={tw`text-white text-xl font-semibold mt-4`}>
            {approvalStatus === 'approved' ? "OnDuty Approved" : "OnDuty Rejected"}
          </CustomText>
          {/* <CustomText style={tw`text-white mt-2`}>
            {remainingRequests.length} requests remaining
          </CustomText> */}
        </View>
      </View>
    );
  }

  // Main screen
  return (
    <LinearGradient colors={['#f7f9fc', '#eef2f5']} style={tw`flex-1`}>
      <View style={tw`px-5 pt-5 pb-2`}>
        <CustomText style={tw`text-2xl font-bold text-gray-800 text-center`}>
          OnDuty Approval Request
        </CustomText>
        <CustomText style={tw`text-center text-gray-500`}>
          {allRequests.length} requests pending
        </CustomText>
        <View style={tw`h-0.5 bg-gray-200 mx-5 mt-3`} />
      </View>

      {allRequests.length > 0 ? (
        <View style={tw`flex-1`}>
          <FlatList
            data={allRequests}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item?.docid}
            renderItem={renderItem}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={tw`p-4 pb-8`} showsVerticalScrollIndicator={false}>
          <View style={tw`flex-1 justify-center items-center py-16`}>
            <Feather name="inbox" size={48} color="#ccc" />
            <CustomText style={tw`text-gray-500 mt-4`}>
              No pending onduty requests
            </CustomText>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}