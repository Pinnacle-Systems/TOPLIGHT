import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LogoutModal from './Modal/LogutModal';
import { handleLogout } from './Utils/Logout';
import { CustomNavigation } from './Utils/NavigationRef';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Common_Context } from '../Context/Common_Context';
import { BASE_URL, USERS_API } from '../constants/apiUrl';
import { useSelector } from 'react-redux';
import  LinearGradient  from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const drawerWidth = width * 0.85;

const CustomDrawer = ({ tabs, activeRoute, openSidebar, setopenSidebar }) => {
  const Page_list = useContext(Common_Context);
  const [openLogoutModal, setLogoutModal] = useState(false);
  const USER = useSelector((state) => state?.UserDetails);
  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: openSidebar ? 0 : drawerWidth,
      speed: 18,
      bounciness: 0,
      useNativeDriver: true,
    }).start(() => {
      if (!openSidebar) setopenSidebar(false);
    });
  }, [openSidebar]);

  const handleCloseDrawer = () => {
    Animated.spring(slideAnim, {
      toValue: drawerWidth,
      speed: 18,
      bounciness: 0,
      useNativeDriver: true,
    }).start(() => setopenSidebar(false));
  };

  const renderItem = ({ item }) => {
    const isActive = activeRoute === item.path;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.drawerItem,
          isActive && styles.activeItem,
        ]}
        onPress={() => {
          CustomNavigation(item?.path);
          handleCloseDrawer();
        }}
      >
        <View style={styles.itemRow}>
          <View style={[
            styles.iconContainer,
            isActive && styles.activeIconContainer
          ]}>
            {React.cloneElement(item?.icon, {
              color: isActive ? '#FFF' : '#2036c5',
              size: 20,
            })}
          </View>
          <Text style={[
            styles.drawerText,
            isActive && styles.activeText
          ]}>
            {item.label || item.name}
          </Text>
          {isActive && (
            <View style={styles.activeIndicator}/>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {openSidebar && (
        <Pressable 
          style={styles.backdrop} 
          onPress={handleCloseDrawer} 
        />
      )}
      
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F7FAFF']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleCloseDrawer}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color="#2036c5" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:  `${BASE_URL}/${USERS_API}/getUserImage/${USER?.userName?.toLowerCase()}`,
                }}
                cachePolicy={"none"}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator}/>
            </View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{USER?.userName || 'User'}</Text>
            <Text style={styles.userRole}>{USER?.role || 'Employee'}</Text>
          </View>

          <View style={styles.divider} />

          <FlatList
            data={tabs}
            renderItem={renderItem}
            keyExtractor={(item) => item?.name}
            contentContainerStyle={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={() => setLogoutModal(true)} 
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <View style={styles.logoutRow}>
                <MaterialCommunityIcons 
                  name="logout" 
                  size={20} 
                  color="#FF3D71" 
                /> 
                <Text style={styles.logoutText}>Sign Out</Text>
              </View>
            </TouchableOpacity>

            <LogoutModal
              isModalVisible={openLogoutModal}
              confirm={() => {
                handleLogout(CustomNavigation);
                setLogoutModal(false);
                setopenSidebar(false);
              }}
              cancel={() => setLogoutModal(false)}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
  drawerContainer: {
    width: drawerWidth,
    height: '100%',
    position: 'absolute',
    right: 0,
    zIndex: 100,
    elevation: 20,
    shadowColor: '#5E72E4',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  gradientBackground: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 25,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2036c5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#5E72E4',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#8F9BB3',
    marginBottom: 2,
    fontFamily: 'Roboto-Regular',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222B45',
    marginBottom: 4,
    fontFamily: 'Roboto-Bold',
  },
  userRole: {
    fontSize: 14,
    color: '#5E72E4',
    fontFamily: 'Roboto-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF1F7',
    marginBottom: 15,
  },
  menuContainer: {
    paddingVertical: 10,
  },
  drawerItem: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    position: 'relative',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDF2FF',
  },
  activeIconContainer: {
    backgroundColor: '#5E72E4',
  },
  drawerText: {
    fontSize: 16,
    color: '#8F9BB3',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'Roboto-Medium',
  },
  activeItem: {
    backgroundColor: '#EDF2FF',
  },
  activeText: {
    color: '#5E72E4',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 24,
    backgroundColor: '#5E72E4',
    borderRadius: 2,
    position: 'absolute',
    right: -15,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#EDF1F7',
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3D71',
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
});

export default CustomDrawer;