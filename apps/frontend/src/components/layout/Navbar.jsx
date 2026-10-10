import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNRestart from 'react-native-restart';

import { useGetCompanycodeQuery } from '../../store/api/userApi';
import { useGetPermissionRequestQuery } from '../../store/api/notificationApi';
import { setUserDetails } from '../../store/slices/userDetailsSlice';
import socket from '../../utils/Socket';
import { showMessage } from 'react-native-flash-message';
import { Notofication_Approval_handler } from '../../utils/Notification_approval_Handler';
import NotificationModal from '../Modal/NotificationModal';
import { useGetUserMobDataQuery } from '../../store/api/dashboardApi';

// Reanimated for bell
import Animated, {
    useSharedValue, withTiming, Easing,
    useAnimatedStyle, withRepeat, withSequence,
} from 'react-native-reanimated';

const ANGLE = 15;
const TIME = 100;
const EASING = Easing.elastic(1.5);

export default function Navbar({ openSidebar, setopenSidebar }) {
    const dispatch = useDispatch();
    const UserSelect = useSelector((state) => state?.UserDetails);

    const [notificationCount, setNotificationCount] = useState(0);
    const [liveNotifi, setLiveNotifi] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    
    // For the enhanced UI dropdown
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${rotation.value}deg` }],
    }));

    // Data Fetches
    const { data: companyCode } = useGetCompanycodeQuery();
    const { data: mobData, isSuccess } = useGetUserMobDataQuery({
        params: { Idcard: UserSelect?.IDCARD, GCOMPCODE: UserSelect?.GCOMPCODE },
    });
    const { data: notifiData } = useGetPermissionRequestQuery({
        params: (UserSelect?.IDCARD == UserSelect?.hod || UserSelect?.IDCARD == UserSelect?.hr || UserSelect?.level != 'user')
            ? { hod: UserSelect?.IDCARD, hr: UserSelect?.IDCARD }
            : { emp: UserSelect?.IDCARD },
    });

    useEffect(() => {
        if (mobData?.data) {
            dispatch(setUserDetails({ ...mobData.data[0], ...mobData.data }));
        }
    }, [isSuccess]);

    // Initial Notification Count
    useEffect(() => {
        setNotificationCount(notifiData?.data ? Number(notifiData.data.length) : 0);
    }, [notifiData?.data]);

    // Bell Shake Animation
    useEffect(() => {
        if (notificationCount <= 0) return;
        const anim = setInterval(() => {
            rotation.value = withSequence(
                withTiming(-ANGLE, { duration: TIME / 2, easing: EASING }),
                withRepeat(withTiming(ANGLE, { duration: TIME, easing: EASING }), 7, true),
                withTiming(0, { duration: TIME / 2, easing: EASING })
            );
        }, 10000);
        return () => clearInterval(anim);
    }, [notificationCount]);

    // Socket Notifications
    const Get_Notification_handler = (data) => {
        setNotificationCount((c) => c + 1);
        setLiveNotifi(data);
        showMessage({
            message: 'New Notification',
            description: `Request from ${data?.data?.userdata?.username || 'Unknown User'}`,
            type: 'success',
            backgroundColor: '#4CAF50',
            color: '#fff',
            icon: { icon: 'success', position: 'left' },
            style: {
                padding: 16, borderLeftWidth: 5, borderLeftColor: '#2e7d32',
                borderRadius: 8, marginTop: 10, marginHorizontal: 10, elevation: 5,
            },
            titleStyle: { fontSize: 16, fontWeight: 'bold' },
            textStyle: { fontSize: 14 },
            duration: 5000,
        });
    };

    useEffect(() => {
        if (!UserSelect?.UserId || !socket?.connected) return;

        const notifiEvents = {
            [`get_Notifi_permission_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Get_Notification_handler,
            [`get_Notifi_leave_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Get_Notification_handler,
            [`get_Notifi_onduty_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Get_Notification_handler,
            [`get_Notifi_advance_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Get_Notification_handler,
        };

        const approvalEvents = {
            [`get_Approval_Notifi:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Notofication_Approval_handler,
            [`get_leave_Approval_Notifi:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Notofication_Approval_handler,
            [`get_advance_Approval_Notifi:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Notofication_Approval_handler,
            [`get_Onduty_Approval_status:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Notofication_Approval_handler,
        };

        [...Object.entries(notifiEvents), ...Object.entries(approvalEvents)]
            .forEach(([event, handler]) => socket.on(event, handler));

        return () => {
            [...Object.entries(notifiEvents), ...Object.entries(approvalEvents)]
                .forEach(([event, handler]) => socket.off(event, handler));
        };
    }, [UserSelect, socket?.connected]);

    // Global Company Switcher
    const handleCompanySwitch = async (newCompanyCode) => {
        try {
            setDropdownVisible(false);
            if (newCompanyCode === UserSelect?.GCOMPCODE) return;
            
            const result = await AsyncStorage.getItem('userName');
            if (result) {
                const geo = JSON.parse(result);
                const { GCOMPCODE: OLD, ...rest } = geo;
                await AsyncStorage.setItem('userName', JSON.stringify({ ...rest, GCOMPCODE: newCompanyCode }));
                RNRestart.restart();
            }
        } catch (error) {
            console.error("Error switching company:", error);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: '#FFFFFF' }}><View style={styles.headerContainer}>
            {/* Left: Menu Icon + Logo */}
            <View style={styles.leftSection}>
                <Pressable onPress={() => setopenSidebar?.(true)} style={styles.iconBtn}>
                    <AntDesign name="appstore-o" size={26} color="#1E293B" />
                </Pressable>
                
                <Pressable style={styles.logoWrap}>
                    <Image 
                        source={require('../../assets/logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                </Pressable>
            </View>

            {/* Center: Enhanced Company Selector */}
            <View style={styles.centerSection}>
                <Pressable onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.companySelector}>
                    <View style={styles.companyIconWrapper}>
                        <MaterialIcons name="business" size={16} color="#007AFF" />
                    </View>
                    <Text style={styles.companyText}>{UserSelect?.GCOMPCODE || 'Company'}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#64748B" />
                </Pressable>
                
                {/* Minimal Dropdown implementation without external libs */}
                {dropdownVisible && companyCode?.data && (
                    <View style={styles.dropdownMenu}>
                        {companyCode.data.map((comp) => (
                            <Pressable 
                                key={comp.companyid} 
                                style={[
                                    styles.dropdownItem, 
                                    comp.companyCode === UserSelect?.GCOMPCODE && styles.activeDropdownItem
                                ]}
                                onPress={() => handleCompanySwitch(comp.companyCode)}
                            >
                                <Text style={[
                                    styles.dropdownItemText,
                                    comp.companyCode === UserSelect?.GCOMPCODE && styles.activeDropdownItemText
                                ]}>
                                    {comp.companyCode}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>

            {/* Right: Notifications */}
            <View style={styles.rightActions}>
                <Pressable onPress={() => setModalVisible(true)} style={styles.iconBtn}>
                    {notificationCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                        </View>
                    )}
                    <Animated.View style={animatedStyle}>
                        <Ionicons name="notifications" size={26} color="#1E293B" />
                    </Animated.View>
                </Pressable>
            </View>

            {/* Notification Modal Integration */}
            {modalVisible && (
                <NotificationModal
                    close_modal={setModalVisible}
                    modalVisible={modalVisible}
                    livechange_Notifi={liveNotifi}
                />
            )}
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 50,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoWrap: {
        marginLeft: 12,
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 32,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        zIndex: 100, // Important for dropdown overlapping
    },
    companySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    companyIconWrapper: {
        backgroundColor: '#EFF6FF',
        padding: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    companyText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginRight: 4,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 8,
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    activeDropdownItem: {
        backgroundColor: '#EFF6FF',
    },
    dropdownItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    activeDropdownItemText: {
        color: '#007AFF',
        fontWeight: '700',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
