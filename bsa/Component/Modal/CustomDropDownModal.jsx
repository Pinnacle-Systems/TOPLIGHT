import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import CustomText from '../Text/CustomText';
import RNPickerSelect from 'react-native-picker-select';

const CustomDropDownModal = ({isModalVisible,setIsModalVisible,Title="Modal",BodyComponent}) => {
  // Generate years from 1900 to the current year

  // Function to handle value change
  const handleValueChange = (value) => {
    setSelectedYear(value);
    setIsModalVisible(false); // Close the modal after selection
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const cancel=()=>{
    setIsModalVisible(false)
  }

  return (
    <View style={styles.container}>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{Title}</Text>
         <View style={{flexDirection:"row",gap:10}}>
               {/* <TouchableOpacity style={[styles.closeButton,{backgroundColor:"red"}]} onPress={confirm}>
              <Text style={[styles.closeButtonText,{backgroundColor:"red"}]}>Confirm</Text>
            </TouchableOpacity> */}
              {BodyComponent}
            <TouchableOpacity style={[styles.closeButton,{backgroundColor:"gray"}]} onPress={cancel}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 19,

  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#5a99e6',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

// Styling the picker input


export default CustomDropDownModal;
