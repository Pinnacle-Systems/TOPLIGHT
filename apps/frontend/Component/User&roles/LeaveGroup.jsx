import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text, Avatar } from 'react-native-paper';

const roles = [
   { id: 'top', label: 'Top ManageMent', icon: 'chess-queen',color:"#e3af02" },
  { id: 'admin', label: 'Admin', icon: 'account-cog' },
  { id: 'hod', label: 'Department Hod ', icon: 'account-tie' },
  { id: 'user', label: 'User', icon: 'account' },
  
];

const CheckboxLevelGroup = ({ selected, setSelected }) => {
  const toggleSelection = (id) => {
    // If already selected, deselect
    if (selected === id) {
      setSelected(null);
    } else {
      setSelected(id); // Select only this one
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select User Role</Text>
      {roles.map((role) => (
        <View key={role.id} style={styles.item}>
          <Avatar.Icon size={36} icon={role.icon} color={role?.color} style={styles.icon} />
          <Checkbox.Item
            label={role.label}
            status={selected === role.id ? 'checked' : 'unchecked'}
            onPress={() => toggleSelection(role.id)}
            color={"#007BFF"}
            position="leading"
            labelStyle={styles.label}
            style={styles.checkbox}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
    backgroundColor: '#e3f2fd',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    flex: 1,
  },
});

export default CheckboxLevelGroup;
