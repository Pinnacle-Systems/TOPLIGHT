import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DepartmentListView = ({ 
  departments, 
  onSelectDepartment,
  selectedDepartmentId,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <SectionList
        sections={departments}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.name}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              selectedDepartmentId === item.id && styles.selectedItem
            ]}
            onPress={() => onSelectDepartment(item)}
          >
            <View style={styles.itemContent}>
              <Icon 
                name={item.icon || 'business'} 
                size={22} 
                style={styles.itemIcon} 
              />
              <Text style={styles.itemLabel}>{item.name}</Text>
            </View>
            <Text style={styles.employeeCount}>
              {item.employeeCount} {item.employeeCount === 1 ? 'member' : 'members'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
    color: '#555',
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
  },
  employeeCount: {
    fontSize: 12,
    color: '#777',
  },
});

export default DepartmentListView;