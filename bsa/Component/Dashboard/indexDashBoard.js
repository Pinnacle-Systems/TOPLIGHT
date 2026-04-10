import React, { useState, useEffect, useContext, useRef } from "react";
import Employee from "./Employee";
import {HeadofDepartMent} from "./Head";

import CustomText from "../Text/CustomText";
import {
    Alert, Animated, PermissionsAndroid,
    Text, TouchableOpacity, View, AppState
} from "react-native";
import TabView_Wrapper from "../TabNavBar";
import { useDispatch, useSelector } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import notifee from '@notifee/react-native';
import { useUpdate_user_fcmMutation } from "../../redux/service/user";
import ProgressPopup from "../Utils/PopupLoading";
import { Common_Context } from "../../Context/Common_Context";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { useGetMisDashboardOrdersInHandQuery } from "../../redux/service/misDashboardService";
import { setCountUnder20DueDays } from "../../redux/Slices/dueDaysSlice";
import { CustomNavigation } from "../Utils/NavigationRef";
import socket from "../Utils/Socket";
import {TopManagement} from "./TopManage"; 
import MISDashboard from "./MISDashboard";

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
            <ProgressPopup
                box={false}
                sync={true}
                // ✅ removed || true
                visible={context_Data?.loading || UserId?.isLoading || false}
                message="Syncing your dashboard..."
            />
        );
    }

    // ── ADMIN ──────────────────────────────────────────────────────────────
  

    // ── USER ───────────────────────────────────────────────────────────────
    if (UserId?.level === "user") {
        return <Employee {...props} />;
    }



     if (UserId?.level === "top" ) {
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

    // ✅ Catch-all fallback — always returns something
    return (
        <View style={tw`flex-1 justify-center items-center`}>
            <CustomText style={tw`text-lg text-gray-700`}>
                No Dashboard Loaded!
            </CustomText>
            <CustomText style={tw`text-sm text-gray-400 mt-2`}>
                Level: {UserId?.level || 'undefined'}
            </CustomText>
        </View>
    );
}


// ─── Main Index ───────────────────────────────────────────────────────────────
function Index(props) {
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
                        tw`absolute z-50 right-4 bottom-30`,
                        { transform: [{ scale: animation }] },
                    ]}
                >
                    {/* Tooltip */}
                    {showTooltip && nearestExpiry && (
                        <View
                            style={tw`absolute bottom-full right-0 mb-2 w-64 bg-white p-3 rounded-xl border border-gray-200`}
                        >
                            <Text style={tw`font-bold text-red-500 text-sm`}>
                                Insurance Expiring Soon!
                            </Text>
                            <Text style={tw`mt-1 text-gray-700 text-xs`}>
                                Vehicle: {nearestExpiry.vehName}
                            </Text>
                            <Text style={tw`mt-1 text-orange-500 text-xs font-semibold`}>
                                Expires in: {nearestExpiry.dueDays} days
                            </Text>
                            <Text style={tw`mt-1 text-xs text-gray-400`}>
                                Tap to view all expiring soon
                            </Text>
                        </View>
                    )}

                    {/* FAB */}
                    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                        <View
                            style={tw`absolute -top-2 -right-2 bg-white w-6 h-6 rounded-full justify-center items-center border-2 border-red-500 z-10`}
                        >
                            <Text style={tw`text-red-500 font-bold text-xs`}>
                                {countUnder20DueDays}
                            </Text>
                        </View>
                        <View
                            style={tw`bg-red-500 w-14 h-14 rounded-full justify-center items-center`}
                        >
                            <MaterialCommunityIcons name="van-utility" size={24} color="white" />
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