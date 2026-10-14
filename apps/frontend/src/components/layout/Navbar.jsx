import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { useAppTheme } from '../../theme';

// Reanimated for bell
import Animated, {
    useSharedValue, withTiming, Easing,
    useAnimatedStyle, withRepeat, withSequence,
} from 'react-native-reanimated';

const ANGLE = 15;
const TIME = 100;
const EASING = Easing.elastic(1.5);

const normalizeCompanyCode = (value) => String(value || '').trim().toUpperCase();

const removeDuplicateCompanies = (companies) => {
    const seenCodes = new Set();
    return companies.filter(company => {
        const code = normalizeCompanyCode(company?.value);
        if (!code || seenCodes.has(code)) return false;
        seenCodes.add(code);
        return true;
    });
};

export default function Navbar({ openSidebar, setopenSidebar }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
    const { data: notifiData, refetch: refetchNotifications } = useGetPermissionRequestQuery({
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
    const filteredCompanies = isCompanyRestrictedLevel
        ? allCompanies.filter(company =>
            allocatedCompanyCodes.has(normalizeCompanyCode(company?.value)),
        )
        : allCompanies;
    const availableCompanies = removeDuplicateCompanies(filteredCompanies);

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
            backgroundColor: theme.colors.success,
            color: theme.colors.brandContrast,
            icon: { icon: 'success', position: 'left' },
            style: {
                padding: theme.spacing.lg, borderLeftWidth: 5, borderLeftColor: theme.colors.success,
                borderRadius: 8, marginTop: 10, marginHorizontal: 10, elevation: 5,
            },
            titleStyle: { ...theme.typography.title, color: theme.colors.brandContrast },
            textStyle: { ...theme.typography.bodySmall, color: theme.colors.brandContrast },
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
            if (normalizeCompanyCode(newCompanyCode) === normalizeCompanyCode(UserSelect?.GCOMPCODE)) return;
            if (
                isCompanyRestrictedLevel &&
                !availableCompanies.some(company =>
                    normalizeCompanyCode(company?.value) === normalizeCompanyCode(newCompanyCode),
                )
            ) {
                showMessage({
                    message: 'Company Not Assigned',
                    description: 'You can only switch to a company assigned to your account.',
                    type: 'warning',
                    backgroundColor: theme.colors.warning,
                    color: theme.colors.brandContrast,
                    titleStyle: { ...theme.typography.title, color: theme.colors.brandContrast },
                    textStyle: { ...theme.typography.bodySmall, color: theme.colors.brandContrast },
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
                                <MaterialIcons name="business" size={16} color={theme.colors.brand} />
                            </View>
                            <Text style={styles.companyText}>{UserSelect?.GCOMPCODE || 'Company'}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.colors.textMuted} />
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
                                <Ionicons name="notifications" size={24} color={theme.colors.text} />
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
            data={notifiData}
            refresh={refetchNotifications}
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
                            <Text style={[styles.dropdownItemText, styles.loadingDropdownText]}>
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

const createStyles = theme => StyleSheet.create({
    headerWrapper: {
        backgroundColor: theme.colors.background,
        zIndex: 50,
    },
    safeArea: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.radii.xxl,
        borderBottomRightRadius: theme.radii.xxl,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: theme.isDark ? 0.3 : 0.08,
        shadowRadius: 14,
        elevation: 6,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.layout.screenGutter,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md + 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoWrap: {
        marginLeft: theme.spacing.md,
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 32,
    },
    iconBtn: {
        width: theme.controlSizes.avatarMd - 2,
        height: theme.controlSizes.avatarMd - 2,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.backgroundSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.24 : 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBtnPressed: {
        backgroundColor: theme.colors.surfaceSunken,
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
        backgroundColor: theme.colors.text,
    },
    hamburgerLineMid: {
        width: 12,
        height: 2.2,
        borderRadius: 2,
        backgroundColor: theme.colors.text,
    },
    hamburgerLineBottom: {
        width: 16,
        height: 2.2,
        borderRadius: 2,
        backgroundColor: theme.colors.text,
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    companySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundSubtle,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    companyIconWrapper: {
        backgroundColor: theme.colors.brandSoft,
        padding: theme.spacing.xs,
        borderRadius: theme.radii.md,
        marginRight: theme.spacing.sm,
    },
    companyText: {
        ...theme.typography.subtitle,
        color: theme.colors.text,
        marginRight: theme.spacing.xs,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdownMenu: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.sm,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: theme.isDark ? 0.35 : 0.15,
        shadowRadius: 20,
        elevation: 20,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    dropdownItem: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radii.md,
    },
    activeDropdownItem: {
        backgroundColor: theme.colors.surfaceSelected,
    },
    dropdownItemText: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textSecondary,
    },
    activeDropdownItemText: {
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.bold,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: theme.colors.danger,
        borderRadius: theme.radii.pill,
        minWidth: theme.spacing.xl,
        height: theme.spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        paddingHorizontal: theme.spacing.xs,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    badgeText: {
        color: theme.colors.brandContrast,
        ...theme.typography.overline,
        letterSpacing: 0,
    },
    loadingDropdownText: {
        padding: theme.spacing.sm,
        color: theme.colors.textDisabled,
    },
});
