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
  SafeAreaView
} from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import { useSelector, useDispatch } from 'react-redux';
import { Common_Context } from '../../context/CommonContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setClearAll } from '../../store/slices/userDetailsSlice';

const { width, height } = Dimensions.get('window');
const drawerWidth = width * 0.8; // Professional slightly narrower sidebar

export default function Sidebar({ openSidebar, setopenSidebar, allowedTabs }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const USER = useSelector((state) => state?.UserDetails);
    
    // Animation for sliding in from the right
    const slideAnim = useRef(new Animated.Value(drawerWidth)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: openSidebar ? 0 : drawerWidth,
            useNativeDriver: true,
            bounciness: 0,
            speed: 18,
        }).start();
    }, [openSidebar]);

    const handleClose = () => setopenSidebar(false);

    const handleLogout = async () => {
        setopenSidebar(false);
        await AsyncStorage.clear();
        dispatch(setClearAll());
        // Will automatically unmount MainNavigator since isAuthenticated becomes false
    };

    const handleNavigation = (path) => {
        setopenSidebar(false);
        try {
            navigation.navigate(path);
        } catch (e) {
            console.warn("Screen not available yet:", path);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Image 
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <View style={styles.profileSection}>
                <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                        {USER?.userName ? USER.userName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{USER?.userName || 'User'}</Text>
                    <Text style={styles.userRole}>{USER?.GCOMPCODE || 'Employee'}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <>
            {/* Backdrop Overlay */}
            {openSidebar && (
                <Pressable 
                    style={StyleSheet.absoluteFill} 
                    onPress={handleClose}
                >
                    <View style={styles.backdrop} />
                </Pressable>
            )}

            {/* Sidebar Drawer */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                <SafeAreaView style={styles.safeArea}>
                    
                    {/* Header */}
                    {renderHeader()}

                    {/* Navigation Items */}
                    <View style={styles.navList}>
                        <Text style={styles.navTitle}>MENU</Text>
                        <FlatList 
                            data={allowedTabs}
                            keyExtractor={(item) => item.path}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.navItem}
                                    onPress={() => handleNavigation(item.path)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.navIconBox}>
                                        {item.icon}
                                    </View>
                                    <Text style={styles.navLabel}>{item.name}</Text>
                                    <AntDesign name="right" size={14} color="#CBD5E1" style={styles.chevron} />
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    {/* Footer / Logout */}
                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={styles.logoutBtn} 
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Feather name="log-out" size={20} color="#EF4444" />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                        <Text style={styles.versionText}>TopLight v2.0</Text>
                    </View>

                </SafeAreaView>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: drawerWidth,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 1000,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#F8FAFC',
    },
    logo: {
        width: 130,
        height: 40,
        marginBottom: 24,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
    },
    navList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    navTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 1.2,
        marginBottom: 16,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        marginBottom: 8,
    },
    navIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    navLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    chevron: {
        marginLeft: 'auto',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        marginBottom: 16,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '700',
        color: '#EF4444',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    }
});
