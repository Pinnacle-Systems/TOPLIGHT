import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from '../../ReusableComponents/inputs';
import { useGetEmployeeidsQuery } from '../../redux/service/user';
import CustomizeButton from '../Buttons/CustomizeButton';

const AdvancedSettingsScreen = () => {
  // State for various settings
  const [selectedEmply, setSelectedEmply] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [cacheSize, setCacheSize] = useState('1.2 GB');
  const [email, setEmail] = useState('user@example.com');
  const [editMode, setEditMode] = useState(false);
  const [volume, setVolume] = useState(70);
   const { data: employee,isLoading:employeeLoading, refetch: employeecoderef } = useGetEmployeeidsQuery()

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Japanese', value: 'ja' },
  ];

  const clearCache = () => {
    // Simulate cache clearing
    setCacheSize('0 MB');
    setTimeout(() => {
      alert('Cache cleared successfully!');
    }, 500);
  };

  const handleSave = () => {
    setEditMode(false);
    // Here you would typically save to backend
    alert('Settings saved!');
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

{/* 
<View style={[styles.section, darkMode && styles.darkSection]}>

  <Text>Approval Allocation</Text>
                     <Dropdown
                        selected={selectedEmply}
                        label="Select Employees"
                        isLoading={employeeLoading}
                        setSelected={setSelectedEmply}
                        options={employee}
                        zIndex={300}
                        style={styles.dropdown}
                    />


                    <Dropdown
                        selected={selectedEmply}
                        label="Select HR"
                        multiple={true}
                        isLoading={employeeLoading}
                        setSelected={setSelectedEmply}
                        options={employee}
                        zIndex={300}
                        style={styles.dropdown}
                    />


                    <CustomizeButton 
                                          bg={"#28a64e"} 
                                                
                                            >
                                                Allocate Now
                                            </CustomizeButton>

                    
</View> */}


        {/* Header */}
        {/* <View style={styles.header}>
          <Text style={[styles.headerText, darkMode && styles.darkHeaderText]}>Settings</Text>
          {editMode ? (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <Icon name="edit" size={24} color={darkMode ? '#fff' : '#007AFF'} />
            </TouchableOpacity>
          )}
        </View> */}

        {/* Profile Section */}
        {/* <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>Profile</Text>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
              style={styles.profileImage}
            />
            {editMode ? (
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.profileEmail, darkMode && styles.darkText]}>{email}</Text>
            )}
          </View>
        </View> */}

        {/* App Preferences Section */}
        {/* <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>App Preferences</Text>
          
          <SettingItem
            icon="brightness-6"
            name="Dark Mode"
            darkMode={darkMode}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                trackColor={{ true: '#007AFF', false: '#ccc' }}
              />
            }
          />
          
          <SettingItem
            icon="language"
            name="Language"
            darkMode={darkMode}
            rightComponent={
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={setSelectedLanguage}
                style={[styles.picker, darkMode && styles.darkPicker]}
                dropdownIconColor={darkMode ? '#fff' : '#000'}
                enabled={editMode}
              >
                {languages.map(lang => (
                  <Picker.Item 
                    key={lang.value} 
                    label={lang.label} 
                    value={lang.value} 
                    color={darkMode ? '#fff' : '#000'}
                  />
                ))}
              </Picker>
            }
          />
          
          <SettingItem
            icon="notifications"
            name="Notifications"
            darkMode={darkMode}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                trackColor={{ true: '#007AFF', false: '#ccc' }}
              />
            }
          />
          
          <SettingItem
            icon="volume-up"
            name="Volume"
            darkMode={darkMode}
            rightComponent={
              <Text style={[styles.volumeText, darkMode && styles.darkText]}>{volume}%</Text>
            }
          />
          {editMode && (
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, darkMode && styles.darkText]}>Adjust volume:</Text>
              <View style={styles.slider}>
                {[0, 25, 50, 75, 100].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sliderTick,
                      value <= volume && styles.activeSliderTick,
                      value === volume && styles.currentSliderTick
                    ]}
                    onPress={() => setVolume(value)}
                  />
                ))}
              </View>
            </View>
          )}
        </View> */}

        {/* Security Section */}
        {/* <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>Security</Text>
          
          <SettingItem
            icon="fingerprint"
            name="Biometric Authentication"
            darkMode={darkMode}
            rightComponent={
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                trackColor={{ true: '#007AFF', false: '#ccc' }}
              />
            }
          />
          
          <SettingItem
            icon="lock"
            name="Change Password"
            darkMode={darkMode}
            rightComponent={
              <Icon name="chevron-right" size={24} color={darkMode ? '#fff' : '#ccc'} />
            }
            onPress={() => alert('Navigate to change password screen')}
          />
        </View> */}

        {/* Storage Section */}
        {/* <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>Storage</Text>
          
          <SettingItem
            icon="storage"
            name="Cache"
            darkMode={darkMode}
            rightComponent={
              <Text style={[styles.cacheText, darkMode && styles.darkText]}>{cacheSize}</Text>
            }
          />
          
          <TouchableOpacity
            style={[styles.clearCacheButton, darkMode && styles.darkClearCacheButton]}
            onPress={clearCache}
          >
            <Text style={styles.clearCacheText}>Clear Cache</Text>
          </TouchableOpacity>
        </View> */}

        {/* About Section */}
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>About</Text>
          
          <SettingItem
            icon="info"
            name="Version"
            darkMode={darkMode}
            rightComponent={
              <Text style={[styles.versionText, darkMode && styles.darkText]}>2.0</Text>
            }
          />
          
          {/* <SettingItem
            icon="help"
            name="Help & Support"
            darkMode={darkMode}
            rightComponent={
              <Icon name="chevron-right" size={24} color={darkMode ? '#fff' : '#ccc'} />
            }
            onPress={() => alert('Navigate to help screen')}
          />
          
          <SettingItem
            icon="privacy-tip"
            name="Privacy Policy"
            darkMode={darkMode}
            rightComponent={
              <Icon name="chevron-right" size={24} color={darkMode ? '#fff' : '#ccc'} />
            }
            onPress={() => alert('Navigate to privacy policy')}
          /> */}


        </View>

        {/* Sign Out Button */}
        {/* <TouchableOpacity
          style={[styles.signOutButton, darkMode && styles.darkSignOutButton]}
          onPress={() => alert('Sign out logic here')}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Setting Item Component
const SettingItem = ({ icon, name, darkMode, rightComponent, onPress }) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={onPress}
    activeOpacity={onPress ? 0.5 : 1}
  >
    <View style={styles.settingLeft}>
      <Icon name={icon} size={24} color={darkMode ? '#fff' : '#007AFF'} />
      <Text style={[styles.settingName, darkMode && styles.darkText]}>{name}</Text>
    </View>
    {rightComponent}
  </TouchableOpacity>
);




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingBottom: 20,
  },selectButton:{
    backgroundColor:"#121212"
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkHeader: {
    borderBottomColor: '#333',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  darkHeaderText: {
    color: '#fff',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  darkSectionTitle: {
    color: '#fff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginLeft: 15,
    color: '#000',
  },
  darkInput: {
    borderColor: '#444',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkSettingItem: {
    borderBottomColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingName: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  picker: {
    width: 150,
    height: 40,
    color: '#000',
  },
  darkPicker: {
    color: '#fff',
    backgroundColor: '#1e1e1e',
  },
  volumeText: {
    color: '#666',
    fontSize: 14,
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 20,
    alignItems: 'center',
  },
  sliderTick: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  activeSliderTick: {
    backgroundColor: '#007AFF',
  },
  currentSliderTick: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  cacheText: {
    color: '#666',
    fontSize: 14,
  },
  clearCacheButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  darkClearCacheButton: {
    backgroundColor: '#333',
  },
  clearCacheText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  versionText: {
    color: '#666',
    fontSize: 14,
  },
  signOutButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
  },
  darkSignOutButton: {
    backgroundColor: '#d32f2f',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdvancedSettingsScreen;