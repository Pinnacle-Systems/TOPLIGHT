import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';

export default function CameraModal({ visible, setVisible, onPictureTaken }) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isUpload, setUpload] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [currentCamera, setCurrentCamera] = useState('back'); // 'back' or 'front'
  const cameraRef = useRef(null);
  const devices = useCameraDevices();

  // Get the appropriate camera device based on currentCamera state
  const device = useMemo(() => {
    if (!devices) return null;
    return currentCamera === 'back' ? devices[0] : devices[1];
  }, [devices, currentCamera]);

  // Debugging logs
  useEffect(() => {
    console.log('Camera State:', {
      visible,
      hasPermission,
      device: device?.id,
      isActive,
      error: cameraError,
      currentCamera
    });
  }, [visible, hasPermission, device, isActive, cameraError, currentCamera]);

  useEffect(() => {
    console.log('Available camera devices:', devices);
  }, [devices]);

  // Camera initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!visible) {
          setIsActive(false);
          return;
        }

        // 1. Check/request permission
        if (!hasPermission) {
          const granted = await requestPermission();
          if (!granted) {
            throw new Error('Camera permission denied');
          }
        }

        // 2. Verify device
        if (!device) {
          throw new Error('No camera device available');
        }

        // 3. Activate camera
        setIsActive(true);
        setCameraError(null);

      } catch (error) {
        console.error('Initialization error:', error);
        setCameraError(error.message);
        setIsActive(false);
      }
    };

    initialize();

    return () => setIsActive(false);
  }, [visible, hasPermission, device]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    }
  }, []);

  const takePicture = async () => {
    try {
      if (!cameraRef.current) throw new Error('Camera not ready');
      
      setUpload(true);
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        skipMetadata: true,
      });
      

      onPictureTaken(`file://${photo.path}`);
      setVisible(false);

    } catch (error) {
      console.error('Capture error:', error);
      setCameraError(error.message);
    } finally {
      setUpload(false);
    }
  };

  const flipCamera = () => {
    setCurrentCamera(prev => prev === 'back' ? 'front' : 'back');
  };

  if (!visible) return null;

  // Error state
  if (cameraError) {
    return (
      <Modal transparent visible>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{cameraError}</Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // Loading state
  if (!device || !hasPermission) {
    return (
      <Modal transparent visible>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>{!device ? 'Loading camera...' : 'Requesting permissions...'}</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide">
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          photo={true}
          orientation="portrait"
          enableZoomGesture
          onError={(error) => {
            console.error('Camera runtime error:', error);
            setCameraError(error.message);
            setIsActive(false);
          }}
        />

        {!isUpload && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
              disabled={!isActive}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            {/* Flip Camera Button */}
          
              <TouchableOpacity 
                style={styles.flipButton} 
                onPress={flipCamera}
              >
                <Text style={styles.flipButtonText}>↻</Text>
              </TouchableOpacity>
         
          </View>
        )}

        {isUpload && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.uploadingText}>Processing...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    padding: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 24,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  flipButton: {
    position: 'absolute',
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 20,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  uploadingText: {
    color: 'white',
    marginTop: 10,
  },
});