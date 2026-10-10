import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Alert,
  Dimensions
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useChange_passwordMutation, useSend_OtpMutation,  } from '../../redux/service/user';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation, setforgotPassword_Modal }) => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [request_change_password] = useSend_OtpMutation();
  const [change_password] = useChange_passwordMutation()
  const inputRefs = useRef([]);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleOtpChange = (value, index) => {
    const otpArray = otp.split('');
    otpArray[index] = value;
    const updatedOtp = otpArray.join('');
    setOtp(updatedOtp);

    // Move focus to next input if character is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showMessage({ type: 'warning', message: 'Please enter your email' });
      return;
    }

    try {
      const changeRequest = await request_change_password({
        username: email,  
        reset: true
      }).unwrap();

      if (changeRequest?.status === 1) {
        setShowOtpModal(true);
        showMessage({
          type: 'success',
          message: 'OTP sent successfully!',
          description: 'Please check your email',
          style: { zIndex: 1000 }
        });
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

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      const result = await change_password({ 
        username: email,
        NewPass: newPassword,
        otp 
      }).unwrap();

      if (result?.status === 1) {
        Alert.alert('Success', '✔ Password changed successfully');
        setShowOtpModal(false);
        setforgotPassword_Modal(false);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result?.message || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', error.data?.message || 'An error occurred while changing password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you an OTP to reset your password
          </Text>

          <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
            <Icon name="mail" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email / Username"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleForgotPassword}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => setforgotPassword_Modal(false)}
          >
            <Text style={styles.loginLinkText}>
              Remember your password? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
              We've sent a 6-digit verification code to your registered email
            </Text>
            
            <View style={styles.otpContainer}>
              {Array(6).fill().map((_, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
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

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.resendText}>
                Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
              </Text>
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
                  (otp.length < 6 || !newPassword || !confirmPassword) && styles.disabledButton]} 
                onPress={handleVerifyOtp}
                disabled={otp.length < 6 || !newPassword || !confirmPassword}
              >
                <Text style={styles.modalButtonText}>Reset Password</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  inputFocused: {
    borderColor: '#4a90e2',
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignSelf: 'center',
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkBold: {
    fontWeight: '600',
    color: '#4a90e2',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordContainer: {
    width: '100%',
    marginBottom: 20,
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  resendButton: {
    marginBottom: 20,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  resendLink: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
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
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default ForgotPasswordScreen;