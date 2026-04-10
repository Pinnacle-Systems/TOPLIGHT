import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Modal, 
  Pressable, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ScrollView
} from 'react-native';
import { useChange_passwordMutation, useSend_OtpMutation } from '../../../redux/service/user';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const { width, height } = Dimensions.get('window');

const PassWordChange = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [request_change_password] = useSend_OtpMutation();
  const [change_password] = useChange_passwordMutation()
  const UserSelect = useSelector((state) => state?.UserDetails);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);




  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

const handleOtpChange = (value, index) => {
  const otpArray = otp.split('');
  otpArray[index] = value;
  const updatedOtp = otpArray.join('');
  setOtp(updatedOtp);

  // Move focus to next input if character is entered
  if (value && index < 5) {
    inputRefs.current[index + 1]?.current?.focus();
  }
};

const handleKeyPress = (e, index) => {
  if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
    inputRefs.current[index - 1]?.current?.focus();
  }
};

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      const changeRequest = await request_change_password({
        username: UserSelect?.userName,
        password: currentPassword
      }).unwrap();

      if (changeRequest?.status === 1) {
        setShowOtpModal(true);
      } else {
        Alert.alert('Error', changeRequest?.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.data?.message || 'An error occurred while sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
   var change_pass=await change_password({ username: UserSelect?.userName,
    NewPass:newPassword,otp}).unwrap()

    alert(JSON?.stringify(change_pass))
    
    
    // Here you would typically verify the OTP with your backend
    Alert.alert('Success', '✔ Password changed successfully');
    setShowOtpModal(false);
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
  };

  return (
    <ScrollView>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Secure your account with a new password</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="lock-outline" 
            size={20} 
            color="#666" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="lock-plus" 
            size={20} 
            color="#666" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="New Password (min 8 characters)"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="lock-check" 
            size={20} 
            color="#666" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleChangePassword}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Request OTP</Text>
        </TouchableOpacity>

        {/* OTP Verification Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showOtpModal}
          onRequestClose={() => setShowOtpModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons 
                name="shield-check" 
                size={50} 
                color="#4a90e2" 
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>Verify OTP</Text>
              <Text style={styles.modalSubtitle}>
                We've sent a 6-digit verification code to your registered email/phone
              </Text>
              
              <View style={styles.otpCustomContainer}>
  {Array(6).fill().map((_, index) => (
    <TextInput
      key={index}
      ref={inputRefs.current[index]}
      style={styles.otpBox}
      maxLength={1}
      keyboardType="number-pad"
      value={otp[index] || ''}
      onChangeText={(value) => handleOtpChange(value, index)}
      onKeyPress={(e) => handleKeyPress(e, index)}
      autoFocus={index === 0}
    />
  ))}
</View>
              
              <TouchableOpacity style={styles.resendButton}>
                <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendLink}>Resend</Text></Text>
              </TouchableOpacity>
              
              <View style={styles.modalButtonContainer}>
                <Pressable 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowOtpModal(false)}
                >
                  <Text style={[styles.modalButtonText, {color: '#666'}]}>Cancel</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.modalButton, styles.verifyButton, 
                    otp.length < 6 && styles.disabledButton]} 
                  onPress={handleVerifyOtp}
                  disabled={otp.length < 6}
                >
                  <Text style={styles.modalButtonText}>Verify & Change</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#333',
    fontSize: 16,
  },
  otpCustomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  otpInputView: {
    width: '80%',
    height: 60,
    marginBottom: 20,
  },
  otpInputField: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
  },
  otpHighlight: {
    borderColor: '#4a90e2',
  },
  resendButton: {
    marginBottom: 25,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  verifyButton: {
    backgroundColor: '#4a90e2',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontWeight: '600',
    color: 'white',
  },
});

export default PassWordChange;