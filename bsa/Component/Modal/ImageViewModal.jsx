import React, { useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet,Image } from 'react-native';
import  Ionicons  from 'react-native-vector-icons/Ionicons'; // or any other icon library


const ImageViewModal = ({ image, visible, setVisible ,direct}) => {

  const [ImageUri,setImageUri]=useState("")


  useEffect(()=>{
  const uniqueUri = `${image}?t=${new Date().getTime()}`;
  setImageUri(direct || uniqueUri);
  },[direct,image])
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.backdrop}>
      
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setVisible(false)}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

       
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri:ImageUri}}
           
            cachePolicy={"none"}
            
           
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: .5, // Maintain square aspect ratio (adjust as needed)
    maxHeight: '90%',
    minHeight:"90%",
    height:"100%",
    padding:10
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
    padding:10,
    margin:"auto"
  },
});

export default ImageViewModal;