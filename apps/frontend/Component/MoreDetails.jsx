import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

const MoreUserDetails = ({data}) => {
 // const Users=useSelector((state=>state?.UserDetails))

  // Render each user's details
  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem}>
      <Text style={styles.userName}>{item.FNAME}</Text>
     
      <View style={styles.userDetail}>
      {item.GENDER=="MALE" && <MaterialCommunityIcons name="face-man" size={24} color="blue" />}
      {item.GENDER=="FEMALE" && <MaterialCommunityIcons name="face-woman" size={24} color="blue" />}
        <Text style={styles.userText}>{item.GENDER}</Text>
      </View>
      <View style={styles.userDetail}>
      <Ionicons name="language" size={24} color="blue" />
        <Text style={styles.userText}>{item.LANGUAGE}</Text>
      </View>

      <View style={styles.userDetail}>
      <FontAwesome5 name="mobile-alt" size={24} color="blue" />
          <Text style={styles.userText}>{item.CONTACTNO || "----"}</Text>
      </View>

      <View style={styles.userDetail}>
      <FontAwesome name="hotel" size={24} color="blue" />
        <Text style={styles.userText}>HOSTEL - {item.HOSTEL}</Text>
      </View>

      <View style={styles.userDetail}>
      <FontAwesome6 name="money-bill-transfer" size={24} color="blue" />
        <Text style={styles.userText}>ESI - {item.ESI}</Text>
      </View>

      <View style={styles.userDetail}>
      <FontAwesome6 name="money-bill-transfer" size={24} color="blue" />
        <Text style={styles.userText}>PF - {item.PF}</Text>
      </View>

      <View style={styles.userDetail}>
      <FontAwesome6 name="handshake" size={24} color="blue" />
        <Text style={styles.userText}>Date of Joining-{item.DOJ}</Text>
      </View>

      <View style={styles.userDetail}>
      <FontAwesome name="bank" size={24} color="blue" />
        <Text style={styles.userText}>Salary By - {item.SALBY}</Text>
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.IDCARD}
        renderItem={renderUserItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 15,
   flex:1
  },
  userItem: {
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor:"white",
    // For Android shadow
    
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    margin:10,
    backgroundColor:"#e4edf5",
    padding:5,
    borderRadius:30,
    paddingLeft:30,
    paddingVertical:12
    
  },
  userText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'blue',
    
  },
});

export default MoreUserDetails;
