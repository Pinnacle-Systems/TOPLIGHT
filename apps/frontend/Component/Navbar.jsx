import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCustomFonts } from './CustomHooks/useFonts';
import NotificationModal from './Modal/NotificationModal';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { setUserDetails } from '../redux/Slices/UserDetails';
import MisDashboard, { useGetCommonDataQuery, useGetUserMobDataQuery } from '../redux/service/misDashboardService';
import Animated, {
  useSharedValue, withTiming, Easing,
  useAnimatedStyle, withRepeat, withSequence,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetPermissionRequestQuery } from '../redux/service/Notification';
import socket from './Utils/Socket';
import { showMessage } from 'react-native-flash-message';
import { Notofication_Approval_handler } from './Utils/Notification_approval_Handler';
import { TextOnlyDropdown } from '../ReusableComponents/TextOnlyDropDown';
import UsersApi, { useGetCompanycodeQuery } from '../redux/service/user';
import { RestartApi } from './Utils/RestartApi';
import AdvanceData from '../redux/service/Advance';
import { permission } from '../redux/service';
import { Common_Context } from '../Context/Common_Context';
import { CustomNavigation } from './Utils/NavigationRef';
import tailwind from 'twrnc';
import OndutyRTk from '../redux/service/Onduty';
import RoleOnSevices from '../redux/service/RoleOn';

const ANGLE   = 10;
const TIME    = 100;
const EASING  = Easing.elastic(1.5);

export default function NavBar({ openSidebar, setopenSidebar }) {
  const { fontsLoaded }   = useCustomFonts();
  const dispatch          = useDispatch();
  const navigation        = useNavigation();
  const UserSelect        = useSelector((state) => state?.UserDetails);
  const commoncontext     = useContext(Common_Context);

  const [notification_Count, setNotification_count] = useState(0);
  const [livechange_Notifi,  setLivechange_Notifi]  = useState();
  const [GlobalSelected,     setGlobalSelected]     = useState();
  const [modalVisible,       setModalVisible]       = useState(false);
  const [User,               setUserName]           = useState();

  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const { data: companyCode }                          = useGetCompanycodeQuery();
  const { data: getUserRole }                          = useGetCommonDataQuery({
    table  : 'MOBILEUSER m,GTDESIGNATIONMAST g,HREMPLOYDETAILS d',
    fields : 'm.ROLE,d.DEPTNAME,d.HOSTEL,d.PF,d.IDCARD,d.VEHICLE,d.SALTYPE,d.ESI,d.DOJ,g.DESIGNATION',
    where  : `d.IDCARD=m.ID and d.DESIGNATION=g.GTDESIGNATIONMASTID and m.ID='${UserSelect?.UserId}'`,
  });
  const { data: mobData, isSuccess, isLoading, error } = useGetUserMobDataQuery({
    params: { Idcard: UserSelect.IDCARD, GCOMPCODE: UserSelect?.GCOMPCODE },
  });
  const { data: notifidata, refetch: notifyref }       = useGetPermissionRequestQuery({
    params: UserSelect.IDCARD == UserSelect.hod || UserSelect.IDCARD == UserSelect.hr || UserSelect?.level != 'user'
      ? { hod: UserSelect.IDCARD, hr: UserSelect.IDCARD }
      : { emp: UserSelect.IDCARD },
  });

  // ── Notification count ────────────────────────────────────────────────────
  useEffect(() => {
    setNotification_count(notifidata?.data ? Number(notifidata.data.length) : 0);
  }, [notifidata?.data]);

  // ── Bell shake animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (notification_Count <= 0) return;
    const anim = setInterval(() => {
      rotation.value = withSequence(
        withTiming(-ANGLE, { duration: TIME / 2, easing: EASING }),
        withRepeat(withTiming(ANGLE, { duration: TIME, easing: EASING }), 7, true),
        withTiming(0, { duration: TIME / 2, easing: EASING })
      );
    }, 10000);
    return () => clearInterval(anim);
  }, [notification_Count]);

  // ── Socket notifications ──────────────────────────────────────────────────
  const Get_Notification_handler = (data) => {
    setNotification_count((c) => c + 1);
    setLivechange_Notifi(data);
    showMessage({
      message        : '🔔 New Notification',
      description    : `📩 Request from ${data?.data?.userdata?.username}`,
      type           : 'success',
      backgroundColor: '#4CAF50',
      color          : '#fff',
      icon           : { icon: 'success', position: 'left' },
      style          : {
        padding: 16, borderLeftWidth: 5, borderLeftColor: '#2e7d32',
        borderRadius: 8, marginTop: 10, marginHorizontal: 10, elevation: 5,
      },
      titleStyle: { fontSize: 16, fontWeight: 'bold' },
      textStyle : { fontSize: 14 },
      duration  : 5000,
    });
  };

  useEffect(() => {
    if (!UserSelect?.UserId || !socket?.connected) return;

    const notifiEvents = {
      [`get_Notifi_permission_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`] : Get_Notification_handler,
      [`get_Notifi_leave_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]      : Get_Notification_handler,
      [`get_Notifi_onduty_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]     : Get_Notification_handler,
      [`get_Notifi_advance_id:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]    : Get_Notification_handler,
    };

    const approvalEvents = {
      [`get_Approval_Notifi:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]        : Notofication_Approval_handler,
      [`get_leave_Approval_Notifi:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]  : Notofication_Approval_handler,
      [`get_advance_Approval_Notifi:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`]: Notofication_Approval_handler,
      [`get_Onduty_Approval_status:${UserSelect?.GCOMPCODE}${UserSelect?.UserId}`] : Notofication_Approval_handler,
    };

    [...Object.entries(notifiEvents), ...Object.entries(approvalEvents)]
      .forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      [...Object.entries(notifiEvents), ...Object.entries(approvalEvents)]
        .forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [UserSelect, socket?.connected]);

  // ── Redux / loading state ─────────────────────────────────────────────────
  useEffect(() => {
    if (error) dispatch(setUserDetails({ error }));
    else       dispatch(setUserDetails({ isLoading }));
  }, [isLoading]);

  useEffect(() => {
    if (mobData?.data) dispatch(setUserDetails({ ...mobData.data[0], ...mobData.data }));
  }, [isSuccess]);

  // ── Global company switch ─────────────────────────────────────────────────
  useEffect(() => {
    if (!GlobalSelected) return;
    AsyncStorage.getItem('userName', (error, result) => {
      if (!error) {
        const geo = JSON.parse(result);
        const { GCOMPCODE: OLD, ...rest } = geo;
        AsyncStorage.setItem('userName', JSON.stringify({ ...rest, GCOMPCODE: GlobalSelected }))
          .finally(() => {
            dispatch(setUserDetails({
              userName: geo.userName, UserId: geo.Id, IDCARD: geo.Id,
              GCOMPCODE: GlobalSelected, COMPID: geo.COMPID,
              hod: geo.hod, approval: geo.approval, hr: geo.hr,
              Role: getUserRole?.data[0]?.ROLE,
            }));
          });
      }
    }).finally(() => {
      RestartApi([AdvanceData, UsersApi, MisDashboard, permission, OndutyRTk, RoleOnSevices], dispatch);
    });
  }, [GlobalSelected]);

  useEffect(() => {
    if (GlobalSelected) return;
    AsyncStorage.getItem('userName', (error, result) => {
      if (!error) {
        const geo = JSON.parse(result);
        setUserName(geo.userName);
        dispatch(setUserDetails({
          userName: geo.userName, UserId: geo.Id, IDCARD: geo.Id,
          GCOMPCODE: geo.GCOMPCODE, COMPID: geo.COMPID,
          hod: geo.hod, approval: geo.approval, hr: geo.hr,
          Role: getUserRole?.data[0]?.ROLE,
        }));
      }
    });
  }, [User, GlobalSelected]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>

        {/* ── LEFT: Logo + company dropdown ── */}
        <TouchableOpacity
          onPress={() => CustomNavigation('HOME')}
          style={styles.logoWrap}
          activeOpacity={0.8}
        >
          <Image
            style={styles.logo}
            resizeMode="contain"
            source={require('./../assets/logo.png')}
          />
        </TouchableOpacity>

        {commoncontext?.admin == 1 && (
          <TextOnlyDropdown
            selected={GlobalSelected}
            disabled={false}
            auto_open={GlobalSelected || UserSelect?.GCOMPCODE}
            label={<Text style={styles.companyLabel}>{GlobalSelected || UserSelect?.GCOMPCODE}</Text>}
            setSelected={setGlobalSelected}
            labelstyle={styles.companyLabel}
            options={companyCode}
            zIndex={300}
          />
        )}

        {/* ── RIGHT: Notification bell + menu ── */}
        <View style={styles.rightActions}>

          {/* Notification bell */}
          <Pressable onPress={() => setModalVisible(true)} style={styles.iconBtn}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notification_Count}</Text>
            </View>
            <Animated.View style={animatedStyle}>
              <Ionicons name="notifications-outline" size={22} color="#2036c5" />
            </Animated.View>
          </Pressable>

          {/* Menu / sidebar */}
          <Pressable onPress={() => setopenSidebar(true)} style={styles.iconBtn}>
            <AntDesign name="bars" size={22} color="#2036c5" />
          </Pressable>

        </View>
      </View>

      {/* Notification modal — outside row so it doesn't affect layout */}
      <NotificationModal
        close_modal={setModalVisible}
        data={notifidata}
        livedata={livechange_Notifi}
        refresh={notifyref}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor : '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    elevation        : 3,
    shadowColor      : '#000',
    shadowOffset     : { width: 0, height: 1 },
    shadowOpacity    : 0.08,
    shadowRadius     : 3,
  },

  navbar: {
    flexDirection   : 'row',
    alignItems      : 'center',
    justifyContent  : 'space-between',
    paddingHorizontal: 14,
    paddingVertical  : 6,             // ✅ compact vertical padding
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoWrap: {
    justifyContent: 'center',
  },
  logo: {
    width : 110,                      // ✅ responsive navbar logo size
    height: 38,
  },

  // ── Company label ─────────────────────────────────────────────────────────
  companyLabel: {
    fontSize    : 13,
    fontWeight  : '600',
    color       : '#57575e',
    letterSpacing: 1,
  },

  // ── Right action buttons ──────────────────────────────────────────────────
  rightActions: {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 10,
  },

  iconBtn: {
    padding        : 8,
    borderRadius   : 10,
    backgroundColor: '#f4f6ff',
    elevation      : 1,
    position       : 'relative',
  },

  // ── Notification badge ────────────────────────────────────────────────────
  badge: {
    position       : 'absolute',
    top            : -4,
    right          : -4,
    backgroundColor: '#2036c5',
    width          : 16,
    height         : 16,
    borderRadius   : 8,
    justifyContent : 'center',
    alignItems     : 'center',
    zIndex         : 10,
  },

  badgeText: {
    color     : '#ffffff',
    fontSize  : 10,
    fontWeight: 'bold',
  },
});