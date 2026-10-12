import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 160 });
    const selectorRef = useRef(null);

    const openDropdown = () => {
        if (selectorRef.current) {
            selectorRef.current.measureInWindow((x, y, width, height) => {
                setDropdownPosition({
                    top: y + height + 6,
                    left: x + width / 2 - 80, // center the 160px dropdown under the button
                    width: Math.max(width, 160),
                });
                setDropdownVisible(true);
            });
        } else {
            setDropdownVisible(true);
        }
    };

    const rotation = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${rotation.value}deg` }],
    }));

    const isCompanyRestrictedLevel =
        UserSelect?.isAdmin !== 1 &&
        UserSelect?.isAdmin !== true &&
        ['user', 'hod', 'hr'].includes(String(UserSelect?.level || '').toLowerCase());

    // Data Fetches
    const { data: companyCode } = useGetCompanycodeQuery(
        isCompanyRestrictedLevel ? { Idcard: UserSelect?.IDCARD } : undefined,
        { skip: isCompanyRestrictedLevel && !UserSelect?.IDCARD },
    );
    const { data: mobData, isSuccess } = useGetUserMobDataQuery({
        params: { Idcard: UserSelect?.IDCARD, GCOMPCODE: UserSelect?.GCOMPCODE },
    });
    const { data: notifiData } = useGetPermissionRequestQuery({
        params: (UserSelect?.IDCARD == UserSelect?.hod || UserSelect?.IDCARD == UserSelect?.hr || UserSelect?.level != 'user')
            ? { hod: UserSelect?.IDCARD, hr: UserSelect?.IDCARD }
            : { emp: UserSelect?.IDCARD },
    });
    const storedAllocatedCompanies = (UserSelect?.Companies || [])
        .filter(company => company?.companyCode)
        .map(company => ({
            id: company.companyCode,
            value: company.companyCode,
            COMPID: company.companyid,
        }));
    const allocatedCompanyList = storedAllocatedCompanies.length > 0
        ? storedAllocatedCompanies
        : companyCode?.data || [];
    const allocatedCompanyCodes = new Set(
        allocatedCompanyList
            .map(company => String(company?.value || '').trim().toUpperCase())
            .filter(Boolean),
    );
    const allCompanies = companyCode?.data || [];
    const availableCompanies = isCompanyRestrictedLevel
        ? allCompanies.filter(company =>
            allocatedCompanyCodes.has(String(company?.value || '').trim().toUpperCase()),
        )
        : allCompanies;

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
            if (
                isCompanyRestrictedLevel &&
                !availableCompanies.some(company => company?.value === newCompanyCode)
            ) {
                showMessage({
                    message: 'Company Not Assigned',
                    description: 'You can only switch to a company assigned to your account.',
                    type: 'warning',
                });
                return;
            }
            
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
        <>
        <View style={styles.headerWrapper}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.headerContainer}>
                    {/* Left: Menu Icon + Logo */}
                    <View style={styles.leftSection}>
                        <Pressable 
                            onPress={() => setopenSidebar?.(true)} 
                            style={({ pressed }) => [
                                styles.iconBtn,
                                pressed && styles.iconBtnPressed
                            ]}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <View style={styles.hamburgerWrap}>
                                <View style={styles.hamburgerLineTop} />
                                <View style={styles.hamburgerLineMid} />
                                <View style={styles.hamburgerLineBottom} />
                            </View>
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
                        <Pressable
                            ref={selectorRef}
                            collapsable={false}
                            onPress={openDropdown}
                            style={styles.companySelector}
                        >
                            <View style={styles.companyIconWrapper}>
                                <MaterialIcons name="business" size={16} color="#007AFF" />
                            </View>
                            <Text style={styles.companyText}>{UserSelect?.GCOMPCODE || 'Company'}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color="#64748B" />
                        </Pressable>
                    </View>

                    {/* Right: Notifications */}
                    <View style={styles.rightActions}>
                        <Pressable 
                            onPress={() => setModalVisible(true)} 
                            style={({ pressed }) => [
                                styles.iconBtn,
                                pressed && styles.iconBtnPressed
                            ]}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            {notificationCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                                </View>
                            )}
                            <Animated.View style={animatedStyle}>
                                <Ionicons name="notifications" size={24} color="#1E293B" />
                            </Animated.View>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </View>

        {/* Notification Modal - outside header so it is never clipped */}
        <NotificationModal
            close_modal={setModalVisible}
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            livedata={liveNotifi}
        />

        {/* Company Dropdown - rendered in a transparent Modal so it floats above all content */}
        <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
                <View style={styles.dropdownOverlay}>
                    <View
                        style={[
                            styles.dropdownMenu,
                            {
                                position: 'absolute',
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                            },
                        ]}
                    >
                        {availableCompanies.length > 0 ? (
                            availableCompanies.map((comp) => (
                                <Pressable
                                    key={comp.COMPID || comp.id}
                                    style={[
                                        styles.dropdownItem,
                                        comp.value === UserSelect?.GCOMPCODE && styles.activeDropdownItem,
                                    ]}
                                    onPress={() => handleCompanySwitch(comp.value)}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            comp.value === UserSelect?.GCOMPCODE && styles.activeDropdownItemText,
                                        ]}
                                    >
                                        {comp.value}
                                    </Text>
                                </Pressable>
                            ))
                        ) : (
                            <Text style={[styles.dropdownItemText, { padding: 8, color: '#94a3b8' }]}>
                                Loading...
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerWrapper: {
        backgroundColor: '#F8FAFC',
        zIndex: 50,
    },
    safeArea: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 6,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#F1F5F9',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 14,
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
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBtnPressed: {
        backgroundColor: '#F1F5F9',
        transform: [{ scale: 0.96 }],
    },
    hamburgerWrap: {
        width: 20,
        height: 14,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    hamburgerLineTop: {
        width: 19,
        height: 2.2,
        borderRadius: 2,
        backgroundColor: '#1E293B',
    },
    hamburgerLineMid: {
        width: 12,
        height: 2.2,
        borderRadius: 2,
        backgroundColor: '#1E293B',
    },
    hamburgerLineBottom: {
        width: 16,
        height: 2.2,
        borderRadius: 2,
        backgroundColor: '#1E293B',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
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
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdownMenu: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
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
