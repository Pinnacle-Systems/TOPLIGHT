import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import CustomText from '../Text/CustomText';
import { useGetUserBasicDetailsQuery } from '../../redux/service/user';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewModal from '../Modal/ImageViewModal';
import SkeletonLoader from '../SkeletonLoader/Skeleton';
import { LinearGradient } from 'react-native-linear-gradient';
import { BASE_URL, USERS_API } from '../../constants/apiUrl';
import { useSelector } from 'react-redux';
import { Current_moment_dataformat } from '../Utils/FormatedDate';
import { useGetInQuery } from '../../redux/service/Onduty';
import tw from 'twrnc';
import { CustomNavigation } from '../Utils/NavigationRef';

export function UserProfileCard({ USER, picture, openCamera }) {
  const { data: data_IN } = useGetInQuery();
  const { data, isLoading, isError } = useGetUserBasicDetailsQuery({ 
    Idcard: USER?.UserId ? USER?.UserId : USER 
  });
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [openImageModal, setOpenImageModal] = useState(false);
  const EmployeeDetail = data?.data;
  const Onduty_IN = data_IN?.data;

  if (isLoading) return <SkeletonLoader role="card" height={120} />;
  if (isError) return <CustomText style={tw`text-red-500`}>Server could not connect</CustomText>;

  return (
    <View style={tw`w-full p-1 my-1`}>
      <View style={tw`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden`}>
        {/* Status Badge */}
        {Onduty_IN?.approvalStatus === "approved" ? (
          <TouchableOpacity onPress={()=>CustomNavigation("onduty")} style={tw`absolute bottom-2 left-7 z-10`}>
            <Text style={tw`bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full`}>
              On Duty
            </Text>
          </TouchableOpacity>
        ) : UserSelect?.INTIME ? (
          <View style={tw`absolute bottom-2 left-7 z-10`}>
            <Text style={tw`bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full`}>
              In Office
            </Text>
          </View>
        ) : (
          <View style={tw`absolute bottom-2 left-7 z-10`}>
            <Text style={tw`bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full`}>
              Not Present
            </Text>
          </View>
        )}

        <View style={tw`p-5 flex-row items-center`}>
          {/* Profile Image Section */}
          <TouchableOpacity 
            onPress={() => setOpenImageModal(true)} 
            style={tw`relative mr-4`}
          >
            <LinearGradient
              colors={['#1063b5', '#137feb']}
              style={tw`w-20 h-20 rounded-full p-0.5`}
            >
              <Image
                source={{
                  uri:picture ||  `${BASE_URL}/${USERS_API}/getUserImage/${USER?.userName?.toLowerCase()}`,
                }}
                cachePolicy={"none"}
                style={tw`w-full h-full rounded-full border-2 border-white`}
              />
            </LinearGradient>
            <TouchableOpacity 
              style={tw`absolute bottom-0 right-0 bg-[#1a75ff] w-8 h-8 rounded-full justify-center items-center border-2 border-white shadow`}
              onPress={() => openCamera(true)}
            >
              <MaterialCommunityIcons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* User Details Section */}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              <CustomText 
                style={tw`text-lg font-bold text-gray-800 mr-2 flex-shrink`} 
                numberOfLines={1}
              >
                {EmployeeDetail?.Name}
              </CustomText>
              <View style={tw`bg-blue-50 px-2 py-1 rounded-full`}>
                <CustomText style={tw`text-xs text-blue-600 font-bold`}>
                  ID: {EmployeeDetail?.EmpId}
                </CustomText>
              </View>
            </View>
            
            <CustomText 
              style={tw`text-sm text-gray-600 font-medium mb-0.5`} 
              numberOfLines={1}
            >
              {EmployeeDetail?.Designation}
            </CustomText>
            
            <CustomText 
              style={tw`text-xs text-gray-500 mb-3`} 
              numberOfLines={1}
            >
              {EmployeeDetail?.Department}
            </CustomText>

            {/* Stats Row */}
            <View style={tw`flex-row items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200`}>
              <View style={tw`flex-row items-center`}>
                <MaterialCommunityIcons name="calendar" size={14} color="#667EEA" />
                <CustomText style={tw`text-xs font-medium text-gray-700 ml-1`}>
                  {Current_moment_dataformat("MMM DD")}
                </CustomText>
              </View>
              
              <View style={tw`w-px h-4 bg-gray-300 mx-1`} />
              
              <View style={tw`flex-row items-center`}>
                <MaterialCommunityIcons name="login" size={14} color="#48BB78" />
                <CustomText style={tw`text-xs font-medium text-green-600 ml-1`}>
                  {UserSelect?.INTIME || '--:--'}
                </CustomText>
              </View>
              
              <View style={tw`w-px h-4 bg-gray-300 mx-1`} />
              
              <View style={tw`flex-row items-center`}>
                <MaterialCommunityIcons name="logout" size={14} color="#F56565" />
                <CustomText style={tw`text-xs font-medium text-red-500 ml-1`}>
                  {UserSelect?.OUTTIME || '--:--'}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ImageViewModal
        direct={picture}
        image={picture || `${BASE_URL}/${USERS_API}/getUserImage/${USER?.userName}`}
        visible={openImageModal}
        setVisible={setOpenImageModal}
      />
    </View>
  );
}

export default UserProfileCard;