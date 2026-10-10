import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useGet_Hod_DetailsQuery } from '../../../redux/service/user';
import { useSelector } from 'react-redux';
import tailwind from 'twrnc';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const UserProfileScreen_Higher = () => {
   const UserSelect = useSelector((state) => state?.UserDetails);
 


  const {data}=useGet_Hod_DetailsQuery({params:{hod:UserSelect?.hod}})
  const user=data?.data || {}

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };


    const makeCall = async (number) => {
      try {
        const url = `tel:${number}`;
        await Linking.openURL(url);
      } catch (error) {
        Alert.alert('Error', 'Could not make the call');
      }
    };

   
  const handleSave = () => {
    // Here you would typically save to your backend
    setIsEditing(false);
  };


  if(!data?.data) return <View style={{flex:1,justifyContent:"center",alignItems:"center",gap:15}}>
    
    <FontAwesome5 name="user-slash" size={40} color="#c0c2c4" />
    <Text style={[tailwind`text-center text-lg`]}>No One Hod User Not Allocated You</Text>
    
    <Text style={[tailwind`text-center text-xs w-45`]}>your Request will  be Pending Without Hod User!</Text>
    </View>

  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`items-center py-6`}>
        {/* Profile Picture */}
        <View style={tw`relative`}>
          <Image
            source={{ uri: user.profileImage }}
            style={tw`w-32 h-32 rounded-full border-4 border-white shadow-lg`}
          />
          {isEditing && (
            <TouchableOpacity
              style={tw`absolute bottom-0 right-0 bg-blue-500 rounded-full p-2`}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Edit/Save Button */}
        <TouchableOpacity
          style={tw`mt-4 px-6 py-2 bg-blue-500 rounded-full flex-row items-center`}
          onPress={()=>makeCall(user?.MOBNO || "123")}
        >
          <Ionicons name="call-outline" size={24} color="white" />
          <Text style={tw`text-white font-semibold`}>
            Call 
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Details */}
      <View style={tw`mx-4 bg-white rounded-xl shadow-md p-6 mb-6`}>
        <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Your HOD Information</Text>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm mb-1`}>Full Name</Text>
          {isEditing ? (
            <TextInput
              value={user.name}
              onChangeText={(text) => setUser({...user, name: text})}
              style={tw`border-b border-gray-200 py-2 text-gray-800`}
            />
          ) : (
            <Text style={tw`text-gray-800 text-lg`}>{user.FNAME}</Text>
          )}
        </View>
        

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm mb-1`}>Email</Text>
          {isEditing ? (
            <TextInput
              value={user.email}
              onChangeText={(text) => setUser({...user, email: text})}
              style={tw`border-b border-gray-200 py-2 text-gray-800`}
              keyboardType="email-address"
            />
          ) : (
            <Text style={tw`text-gray-800 text-lg`}>{user.email}</Text>
          )}
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm mb-1`}>Phone</Text>
          {isEditing ? (
            <TextInput
              value={user.phone}
              onChangeText={(text) => setUser({...user, phone: text})}
              style={tw`border-b border-gray-200 py-2 text-gray-800`}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={tw`text-gray-800 text-lg`}>{user.MOBNO || "-----"}</Text>
          )}
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm mb-1`}>Department</Text>
          {isEditing ? (
            <TextInput
              value={user.location}
              onChangeText={(text) => setUser({...user, location: text})}
              style={tw`border-b border-gray-200 py-2 text-gray-800`}
            />
          ) : (
            <Text style={tw`text-gray-800 text-lg`}>{user.DeptName || "-----"}</Text>
          )}
        </View>

        <View>
          <Text style={tw`text-gray-500 text-sm mb-1`}>Designation</Text>
          {isEditing ? (
            <TextInput
              value={user.bio}
              onChangeText={(text) => setUser({...user, bio: text})}
              style={tw`border-b border-gray-200 py-2 text-gray-800`}
              multiline
            />
          ) : (
            <Text style={tw`text-gray-800 text-lg`}>{user.DESIGNATION}</Text>
          )}
        </View>
      </View>

      
      {/* <View style={tw`mx-4 bg-white rounded-xl shadow-md p-6 mb-6`}>
        <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Preferences</Text>
        
        <View style={tw`flex-row justify-between items-center py-3 border-b border-gray-100`}>
          <Text style={tw`text-gray-700`}>Dark Mode</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={"#f4f3f4"}
            onValueChange={() => {}}
            value={false}
          />
        </View>
        
        <View style={tw`flex-row justify-between items-center py-3`}>
          <Text style={tw`text-gray-700`}>Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={"#f4f3f4"}
            onValueChange={() => {}}
            value={true}
          />
        </View>
      </View> */}

      
      {/* <TouchableOpacity
        style={tw`mx-4 mb-8 py-3 bg-red-500 rounded-lg items-center`}
        onPress={() => console.log('Logout pressed')}
      >
        <Text style={tw`text-white font-semibold text-lg`}>Log Out</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

export default UserProfileScreen_Higher;