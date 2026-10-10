import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import Feather from 'react-native-vector-icons/Feather';
import LeaveList from './LeaveList';



export default function LeaveReport() {
   


  return (
    <>
      

      <LeaveList></LeaveList>
     
    </>
  );
}

const styles = StyleSheet.create({
    title: { fontSize: 18, fontWeight: 'bold', margin: 10 },
    row: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: '#f2f2f2',
      marginVertical: 5,
      borderRadius: 8,
      alignItems: 'center'
    },
    cellLarge: { flex: 2 },
    cell: { flex: 1, alignItems: 'center' },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    approved: { backgroundColor: 'green' },
    rejected: { backgroundColor: 'red' },
    pending: { backgroundColor: 'orange' },
    actions: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center'
    },
    approveBtn: {
      padding: 6, backgroundColor: '#4CAF50', borderRadius: 4
    },
    rejectBtn: {
      padding: 6, backgroundColor: '#F44336', borderRadius: 4
    },
    callBtn: {
      padding: 6, backgroundColor: '#2196F3', borderRadius: 4
    },
    empty: { textAlign: 'center', marginTop: 20 }
  });
  