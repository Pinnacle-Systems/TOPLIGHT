import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import Employee from "./Employee";
import {HeadofDepartMent} from "./Head";

import CustomText from "../../components/text/CustomText";
import {
    Alert, Animated, PermissionsAndroid,
    Text, TouchableOpacity, View, AppState, StyleSheet
} from "react-native";
import TabView_Wrapper from "../../components/layout/TabNavBar";
import { useDispatch, useSelector } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import notifee from '@notifee/react-native';
import { useUpdate_user_fcmMutation } from "../../store/api/UserApi";
import DashboardLoading from "./DashboardLoading";
import { Common_Context } from "../../context/CommonContext";
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
    return <Index_child {...props} />;
}

export default Index;

