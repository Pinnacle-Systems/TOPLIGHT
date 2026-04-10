import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useChange_SettingsMutation, useGet_Change_SettingsQuery } from '../../redux/service/user';
import { BASE_URL, USERS_API } from '../../constants/apiUrl';

const SettingsScreen = () => {
  const UserSelect = useSelector((state) => state?.UserDetails);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("English");
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [change_mutation] = useChange_SettingsMutation();
  const { data: get_settings_data } = useGet_Change_SettingsQuery({ params: { Idcard: UserSelect?.UserId } });
  const settings = get_settings_data?.data || {};

  // Language dropdown state
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownAnim = new Animated.Value(0);

  useEffect(() => {
    setNotificationsEnabled(settings?.Notification);
    setBiometricEnabled(settings?.BioMatrics);
  }, [get_settings_data?.data]);

  const Change_Settings = (name, value, setState) => {
    change_mutation({ 
      Idcard: UserSelect?.UserId, 
      data: { 
        [name]: value, 
        UserId: UserSelect?.UserId, 
        COMPCODE: UserSelect?.GCOMPCODE 
      } 
    });
    setState(value);
  };

  const toggleDropdown = (event, item) => {
    if (item.label === 'Language') {
      event.target.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height + 10,
          left: pageX
        });
        setDropdownVisible(true);
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      });
    } else if (item.action) {
      item.action();
    }
  };

  const selectLanguage = (lang) => {
    setLanguage(lang);
    setDropdownVisible(false);
    // Here you would typically save the language preference to your backend
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    // Add more languages as needed
  ];

  const settingsSections = [
    // {
    //   title: 'Preferences',
    //   items: [
    //     {
    //       icon: <Ionicons name="notifications-outline" size={24} color="#4a6fa5" />,
    //       label: 'Notifications',
    //       toggle: (
    //         <Switch
    //           value={notificationsEnabled}
    //           onValueChange={(e) => Change_Settings("Notification", e, setNotificationsEnabled)}
    //           trackColor={{ false: '#767577', true: '#81b0ff' }}
    //           thumbColor={notificationsEnabled ? '#4a6fa5' : '#f4f3f4'}
    //         />
    //       )
    //     },
    //     // {
    //     //   icon: <Ionicons name="language-outline" size={24} color="#4a6fa5" />,
    //     //   label: 'Language',
    //     //   value: language,
    //     //   action: null // Handled separately
    //     // }
    //   ]
    // },
    {
      title: 'Security',
      items: [
        {
          icon: <Ionicons name="finger-print-outline" size={24} color="#4a6fa5" />,
          label: 'Biometric Login',
          toggle: (
            <Switch
              value={biometricEnabled}
              onValueChange={(e) => Change_Settings("BioMatrics", e, setBiometricEnabled)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={biometricEnabled ? '#4a6fa5' : '#f4f3f4'}
            />
          )
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: `${BASE_URL}/${USERS_API}/getUserImage/${UserSelect?.userName?.toLowerCase()}` }}
            style={styles.profileImage}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{UserSelect?.EMPNAME}</Text>
            <Text style={styles.profileEmail}>{UserSelect?.DEPARTMENT || "-----"}</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItemsContainer}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem
                  ]}
                  onPress={(e) => toggleDropdown(e, item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIcon}>{item.icon}</View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <View style={styles.itemRightContent}>
                    {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                    {item.toggle && item.toggle}
                    {!item.toggle && !item.value && (
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Language Dropdown */}
      <Modal
        transparent={true}
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdownContainer,]}
              
          >
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.dropdownItem,
                  index === languages.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => selectLanguage(lang.name)}
              >
                <Text style={[
                  styles.dropdownItemText,
                  language === lang.name && styles.selectedLanguage
                ]}>
                  {lang.name}
                </Text>
                {language === lang.name && (
                  <Ionicons name="checkmark" size={18} color="#4a6fa5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContainer: {
    paddingBottom: 30
  },
  header: {
    padding: 20,
    paddingBottom: 10
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333'
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth:.3
  },
  profileTextContainer: {
    flex: 1
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3
  },
  profileEmail: {
    fontSize: 14,
    color: '#666'
  },
  sectionContainer: {
    marginBottom: 25,
    marginHorizontal: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 5
  },
  sectionItemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  lastItem: {
    borderBottomWidth: 0
  },
  itemIcon: {
    marginRight: 15,
    width: 30,
    alignItems: 'center'
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  itemRightContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 5
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
    top:"50%",
    left:"30%"
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333'
  },
  selectedLanguage: {
    color: '#4a6fa5',
    fontWeight: '600'
  }
});

export default SettingsScreen;