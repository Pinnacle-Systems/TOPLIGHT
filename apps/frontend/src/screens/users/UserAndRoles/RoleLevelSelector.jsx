import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text, Avatar } from 'react-native-paper';

/**
 * RoleLevelSelector
 * A radio-style checkbox group for selecting a user's access level
 * during user creation. Only one level can be active at a time.
 *
 * Levels: Top Management | Admin | Department HOD | User
 */

const ROLE_LEVELS = [
  { id: 'top',   label: 'Top Management',   icon: 'chess-queen',  color: '#e3af02' },
  { id: 'admin', label: 'Admin',            icon: 'account-cog',  color: '#5c6bc0' },
  { id: 'hod',   label: 'Department HOD',   icon: 'account-tie',  color: '#26a69a' },
  { id: 'user',  label: 'User',             icon: 'account',      color: '#42a5f5' },
];

const RoleLevelSelector = ({ selected, setSelected }) => {
  const handleToggle = (id) => {
    // Radio behavior: selecting the same item deselects it
    setSelected(selected === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select User Level</Text>
      {ROLE_LEVELS.map((level) => (
        <View key={level.id} style={styles.item}>
          <Avatar.Icon
            size={36}
            icon={level.icon}
            color={level.color}
            style={styles.icon}
          />
          <Checkbox.Item
            label={level.label}
            status={selected === level.id ? 'checked' : 'unchecked'}
            onPress={() => handleToggle(level.id)}
            color="#007BFF"
            position="leading"
            labelStyle={styles.label}
            style={styles.checkbox}
          />
        </View>
      ))}
    </View>
  );
};

export default RoleLevelSelector;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    letterSpacing: 0.3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
    backgroundColor: '#f0f4ff',
  },
  label: {
    fontSize: 15,
    color: '#333',
  },
  checkbox: {
    flex: 1,
  },
});
