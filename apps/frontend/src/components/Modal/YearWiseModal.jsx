import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../constants/Colors'; // Make sure this path is correct

const SelectYearModal = ({ 
  isModalVisible, 
  setIsModalVisible, 
  selectedYear, 
  setSelectedYear, 
  confirm 
}) => {
  const startYear = 1900;
  const endYear = new Date().getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();

  const handleValueChange = (value) => {
    setSelectedYear(value);
    if (!confirm) {
      setIsModalVisible(false);
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleConfirm = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={toggleModal}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={toggleModal}
      >
        <Pressable 
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Select Year</Text>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={handleValueChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor={Colors.primary}
            >
              <Picker.Item 
                label="Select a year..." 
                value={null} 
                color={Colors.gray}
              />
              {years.map((year) => (
                <Picker.Item 
                  key={year} 
                  label={`${year}`} 
                  value={year} 
                  color={Colors.dark}
                />
              ))}
            </Picker>
          </View>

          {confirm && (
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    padding: 10
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'center',
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectYearModal;