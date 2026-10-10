import React, { useState } from 'react';
import { FlatList, View, TextInput, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderListCard from './RenderListCard';

function AttendanceList({ data, onRefresh,isRefreshing }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data?.filter((emp) => {
    const name = (emp.empname || emp.EMPNAME || '').toLowerCase();
    const id   = (emp.idcard  || emp.IDCARD  || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase())
        || id.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <View style={styles.container}>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee name or ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color="#94a3b8"
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => (item.idcard || item.IDCARD || '').toString()}
        renderItem={({ item }) => <RenderListCard item={item} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search" size={48} color="#cbd5e1" />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container      : { flex: 1, backgroundColor: '#f8fafc' },
  searchBar      : {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 15,
    paddingHorizontal: 15, borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  searchInput    : { flex: 1, paddingVertical: 10, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  listContent    : { paddingHorizontal: 15, paddingBottom: 20 },
  emptyContainer : { padding: 50, alignItems: 'center' },
});

export default AttendanceList;