import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import Employee from "./Employee";
import {HeadofDepartMent} from "./Head";

import CustomText from "../../components/Text/CustomText";
import {
    Alert, Animated, PermissionsAndroid,
    Text, TouchableOpacity, View, AppState, StyleSheet
} from "react-native";
import TabView_Wrapper from "../../components/layout/TabNavBar";
import { useDispatch, useSelector } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import notifee from '@notifee/react-native';
import { useUpdate_user_fcmMutation } from "../../store/api/userApi";
import DashboardLoading from "./DashboardLoading";
import { Common_Context } from "../../context/CommonContext";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetMisDashboardOrdersInHandQuery } from "../../store/api/dashboardApi";
import { setCountUnder20DueDays } from "../../store/slices/dueDaysSlice";
import { CustomNavigation } from "../../components/Utils/NavigationRef";
import socket from "../../utils/Socket";
import {TopManagement} from "./TopManage"; 
import MISDashboard from "./MISDashboard";
import { useAppTheme } from "../../theme";

// ─── Dashboard child ──────────────────────────────────────────────────────────
function Index_child({ route, ...props }) {
    const UserId = useSelector((state) => state?.UserDetails);
    const [update_fcm] = useUpdate_user_fcmMutation();
    const context_Data = useContext(Common_Context);
    const dispatch = useDispatch();


    console.log("load",UserId);
    

    // ── FCM token registration ─────────────────────────────────────────────
    useEffect(() => {
        if (!UserId?.UserId) return;
         const request = async () => {
            try {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                const authStatus = await messaging().requestPermission();
                await notifee.requestPermission();

                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    const tk = await messaging().getToken(true);

                    // ✅ Update FCM if not set
                    if (!UserId?.fcm) {
                        await update_fcm({ Idcard: UserId.UserId, fcm: tk });
                    }

                    // ✅ Always update on token refresh
                    messaging().onTokenRefresh(async (newToken) => {
                        await update_fcm({ Idcard: UserId.UserId, fcm: newToken });
                    });
                }
            } catch (error) {
                console.log('[FCM]', error);
                // Alert.alert('Permission Error', error?.message || String(error));
            }
        };

        request();
    }, [UserId?.UserId]);



   
    

    // ── Loading state ──────────────────────────────────────────────────────
    if ((!UserId?.UserId || context_Data?.loading || UserId?.isLoading)  && UserId?.level !== "top" && UserId?.level !== "") {
        return (
            <DashboardLoading />
        );
    }

    // ── ADMIN / TOP MANAGEMENT ────────────────────────────────────────────
    if (UserId?.level === "top" || UserId?.level === "admin" || UserId?.isAdmin === 1 || UserId?.isAdmin === true) {
        return (
            <TabView_Wrapper
                routes={[
                    { key: 'main',     title: 'Main',       icon: 'view-dashboard' },
                    { key: 'hod',      title: 'Company',    icon: 'office-building' },
                    { key: 'employee', title: 'Employees',  icon: 'account-group' },
                ]}
                pages={{
                    main:     MISDashboard,
                    hod:      HeadofDepartMent,
                    employee: Employee,
                }}
            />
        );
    }

    // ── HOD ────────────────────────────────────────────────────────────────
    if (UserId?.level === "hod") {
        return (
            <TabView_Wrapper
                routes={[
                    { key: 'main',     title: 'Main',       icon: 'view-dashboard' },
                    { key: 'hod',      title: 'Department', icon: 'account-group' },
                    { key: 'employee', title: 'My Profile', icon: 'account' },
                ]}
                pages={{
                    main:     MISDashboard,
                    hod:      HeadofDepartMent,
                    employee: Employee,
                }}
            />
        );
    }

    // ── USER / EMPLOYEE DASHBOARD (Default for all regular employees) ─────
    return <Employee {...props} />;
}


// ─── Main Index ───────────────────────────────────────────────────────────────
function Index(props) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [visible, setVisible] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // ✅ useRef instead of useState for Animated.Value
    const animation = useRef(new Animated.Value(1)).current;
    const dispatch = useDispatch();
    const tooltipShownRef = useRef(false);
    const appState = useRef(AppState.currentState);

    const context_Data = useContext(Common_Context);
    const UserId = useSelector((state) => state?.UserDetails);

    const isInsurance_viewable = context_Data?.page?.find(
        (data) => data?.link === "INSURANCEREPORT"
    );

    const { data: insurancedata, refetch: refetchInsurance } =
        useGetMisDashboardOrdersInHandQuery({ params: {} });

    const countUnder20DueDays = useSelector(
        (state) => state.dueDays.countUnder20DueDays
    );
    const [nearestExpiry, setNearestExpiry] = useState(null);

    // ── Insurance badge logic ──────────────────────────────────────────────
    useEffect(() => {
        if (!insurancedata?.data) return;

        const urgentItems = insurancedata.data.filter((item) => item.dueDays < 30);
        const count = urgentItems.length;

        dispatch(setCountUnder20DueDays(count)); // ✅ dispatch in deps below

        if (count > 0) {
            setVisible(true);

            // ✅ Safe reduce with length guard
            const nearest = urgentItems.reduce((prev, curr) =>
                prev.dueDays < curr.dueDays ? prev : curr
            );
            setNearestExpiry(nearest);

            if (!tooltipShownRef.current) {
                setShowTooltip(true);
            }
        }
    }, [insurancedata, dispatch]); // ✅ dispatch added

    // ── Auto-hide tooltip ──────────────────────────────────────────────────
    useEffect(() => {
        if (!nearestExpiry || !showTooltip) return;
        const timer = setTimeout(() => {
            setShowTooltip(false);
            tooltipShownRef.current = true;
        }, 5000);
        return () => clearTimeout(timer);
    }, [nearestExpiry, showTooltip]);

    // ── App foreground → refetch ───────────────────────────────────────────
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                refetchInsurance();
            }
            appState.current = nextAppState;
        });
        return () => subscription?.remove();
    }, [refetchInsurance]);

    // ── Socket: real-time badge refresh ───────────────────────────────────
    useEffect(() => {
        if (!UserId?.GCOMPCODE) return;

        const ev = `get_Approval_Notifi:${UserId.GCOMPCODE}${UserId.UserId}`;
        const handleApproval = () => refetchInsurance();

        // ✅ Register now and on every reconnect
        socket.on(ev, handleApproval);
        socket.on('connect', () => socket.on(ev, handleApproval));

        return () => {
            socket.off(ev, handleApproval);
            socket.off('connect');
        };
    }, [UserId?.GCOMPCODE, UserId?.UserId, refetchInsurance]);

    // ── Bounce animation ───────────────────────────────────────────────────
    const handlePress = () => {
        CustomNavigation("INSURANCEREPORT", { warning: true });

        Animated.sequence([
            Animated.timing(animation, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(animation, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();

        setShowTooltip(false);
        tooltipShownRef.current = true;
    };

    return (
        <>
            {/* ── Floating Insurance Badge ───────────────────────────────────── */}
            {visible && isInsurance_viewable?.isdefault && (
                <Animated.View
                    style={[
                        styles.insuranceBadge,
                        { transform: [{ scale: animation }] },
                    ]}
                >
                    {/* Tooltip */}
                    {showTooltip && nearestExpiry && (
                        <View
                            style={styles.insuranceTooltip}
                        >
                            <Text style={styles.tooltipTitle}>
                                Insurance Expiring Soon!
                            </Text>
                            <Text style={styles.tooltipBody}>
                                Vehicle: {nearestExpiry.vehName}
                            </Text>
                            <Text style={styles.tooltipWarning}>
                                Expires in: {nearestExpiry.dueDays} days
                            </Text>
                            <Text style={styles.tooltipHint}>
                                Tap to view all expiring soon
                            </Text>
                        </View>
                    )}

                    {/* FAB */}
                    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                        <View
                            style={styles.insuranceCount}
                        >
                            <Text style={styles.insuranceCountText}>
                                {countUnder20DueDays}
                            </Text>
                        </View>
                        <View
                            style={styles.insuranceAction}
                        >
                            <MaterialCommunityIcons name="van-utility" size={24} color={theme.colors.brandContrast} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* ── Dashboard ─────────────────────────────────────────────────── */}
            <Index_child {...props} />
        </>
    );
}

export default Index;

const createStyles = theme => StyleSheet.create({
    insuranceBadge: {
        position: 'absolute',
        zIndex: theme.zIndex.overlay,
        right: theme.spacing.lg,
        bottom: 120,
    },
    insuranceTooltip: {
        position: 'absolute',
        bottom: '100%',
        right: 0,
        marginBottom: theme.spacing.sm,
        width: 256,
        padding: theme.spacing.md,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        ...theme.styles.shadow,
    },
    tooltipTitle: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.danger,
    },
    tooltipBody: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    tooltipWarning: {
        ...theme.typography.caption,
        color: theme.colors.warning,
        fontWeight: theme.fontWeights.semiBold,
        marginTop: theme.spacing.xs,
    },
    tooltipHint: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
    insuranceCount: {
        position: 'absolute',
        top: -theme.spacing.xs,
        right: -theme.spacing.xs,
        width: theme.spacing.xxl,
        height: theme.spacing.xxl,
        borderRadius: theme.radii.circle,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.danger,
        zIndex: theme.zIndex.raised,
    },
    insuranceCountText: {
        ...theme.typography.caption,
        color: theme.colors.danger,
        fontWeight: theme.fontWeights.bold,
    },
    insuranceAction: {
        width: 56,
        height: 56,
        borderRadius: theme.radii.circle,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.danger,
    },
});

