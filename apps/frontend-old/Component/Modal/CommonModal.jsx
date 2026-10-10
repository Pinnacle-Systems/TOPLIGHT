import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  useWindowDimensions,
  Platform
} from 'react-native';
import CustomText from '../Text/CustomText';
import tailwind from 'twrnc';

const CommonModal = ({
  isModalVisible,
  setIsModalVisible,
  height,
  Title = "Modal",
  swidth,
  BodyComponent,
  disabledclose,
  maxHeightPercentage = 0.8 // 80% of screen height by default
}) => {
  const { width, height: screenHeight } = useWindowDimensions();
  const isLandscape = width > screenHeight;

  // Calculate responsive dimensions
  const modalWidth = isLandscape ? width * 0.9 : swidth || width * 0.9;
  const modalHeight = height || 
    (isLandscape 
      ? Math.min(screenHeight * 0.8, screenHeight - 40) 
      : Math.min(screenHeight * maxHeightPercentage, screenHeight - 40));

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      width: modalWidth,
      maxWidth: Platform.OS === 'web' ? 600 : '100%', // For web compatibility
      height: modalHeight,
      maxHeight: screenHeight * maxHeightPercentage,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      backgroundColor:"#FFFF"
     
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
      
    },
    closeButton: {
      padding: 5,
      position: 'absolute',
      right: 10,
      top: 5,
      zIndex: 1,
      
    },
    closeButtonText: {
      color: 'red',
      fontSize: 24,
      fontWeight: 'bold',
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 15,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });

  const closeModal = () => setIsModalVisible(false);

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
    
      onRequestClose={closeModal}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.header,tailwind`rounded-ms  shadow-md mb-2`]}>
            <Text style={styles.modalTitle}>{Title}</Text>

            {  !disabledclose &&
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeModal}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

}
          </View>
          
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{paddingBottom: 15}}>
              {BodyComponent}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CommonModal;