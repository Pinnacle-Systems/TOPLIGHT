import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  useWindowDimensions,
  Platform 
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const FilterModal = ({
  modalVisible,
  setModalVisible,
  name,
  close,
  children,
  style,
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const modalWidth = isLandscape ? width * 0.7 : width * 0.9;
  const modalMaxHeight = height * 0.8;

  return (
    <View style={[styles.container, style]}>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { width: modalWidth, maxHeight: modalMaxHeight }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <EvilIcons name="close" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{name}</Text>

            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              overScrollMode={"always"}
            >
              {children}
            </ScrollView>

            {close !== 'direct' && (
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.filterButton}
              >
                <Text style={styles.buttonText}>Apply Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  filterButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2ecc71',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 10,
  },
});

export default FilterModal;
