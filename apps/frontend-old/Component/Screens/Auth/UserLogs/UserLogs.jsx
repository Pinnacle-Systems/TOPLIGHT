import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useGetLoginLogsQuery } from '../../../../redux/service/user';


const LoginLogsScreen = () => {
   const {data:logs,isLoading:loading}=useGetLoginLogsQuery();
  
 
  const renderLogItem = ({ item }) => (
    <View style={[
      styles.logItem,
      item.status === 'success' ? styles.successLog : styles.failedLog
    ]}>
      <Text style={styles.logText}>
        {new Date(item?.date).toLocaleString()}
      </Text>
      <Text style={styles.logText}>Mobile Name: {item?.MobileName}</Text>
      <Text style={styles.logText}>Log type: {item?.type}</Text>
      <Text style={styles.logText}>User Name: {item?.User}</Text>
      <Text style={styles.logText}>Attempt Time: {item?.date}</Text>
      {item.error && <Text style={styles.errorText}>Error: {item?.error}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Login Activity</Text>
        {/* <TouchableOpacity  style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Logs</Text>
        </TouchableOpacity> */}
      </View>

      {loading ? (
        <Text>Loading logs...</Text>
      ) : logs.length === 0 ? (
        <Text>No login activity found</Text>
      ) : (
        <FlatList
          data={logs?.data}
          renderItem={renderLogItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 16,
  },
  logItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  successLog: {
    borderLeftWidth: 4,
    borderLeftColor: '#00C851',
  },
  failedLog: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  logText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    marginTop: 4,
  },
});

export default LoginLogsScreen;