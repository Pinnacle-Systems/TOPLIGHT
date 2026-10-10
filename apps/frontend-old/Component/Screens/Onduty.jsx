import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import {
  NativeModules, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Image,
  useWindowDimensions, Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
const { LocationTracker } = NativeModules;

import { useDispatch, useSelector } from 'react-redux';
import { setInput } from '../../redux/Slices/inputsHandler';
import { showMessage } from 'react-native-flash-message';
import { useGet_hod_tokenQuery, useGet_refresh_tokenQuery } from '../../redux/service/user';
import { _FCM_SENDER } from '../Utils/FCM';
import OndutyRTk, {
  useGet__vechilekmQuery, useGet__VechileQuery,
  useGet_all_Onduty_reasonQuery, useGet_reachedQuery,
  useGetDocIDQuery, useGetInQuery,
  useRequestOndutyOutMutation, useRequestReachedOutMutation, useStTrackMutation
} from '../../redux/service/Onduty';
import CameraModal from '../Modal/CameraModal';
import LongPressButton from './Widget/Button';
import InputWraper from './InputWraper';
import { onduty_Meta } from '../../redux/States/Transactions/OnDuty_Meta';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrentLocation } from '../Utils/CustomLocation';
import ProgressPopup from '../Utils/PopupLoading';
import { formattedDate } from '../Utils/FormatedDate';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';
import { BASE_URL, onduty } from '../../constants/apiUrl';
import socket from '../Utils/Socket';
import { screenWidth } from '../Utils/Screens';
import { Checkbox } from 'react-native-paper';
import { Common_Context } from '../../Context/Common_Context';
import Entypo from 'react-native-vector-icons/Entypo';
import CommonModal from '../Modal/CommonModal';
import Onduty_ALL_EDIT from './Modification_Screens/Modal/OndutyMODIFYModal';
import { RestartApi } from '../Utils/RestartApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDropdownInput from '../Inputs/DropDownCustom';
import moment from 'moment';

// ─── Constants ────────────────────────────────────────────────────────────────
const IMAGE_CONFIG = {
  maxWidth: 1024, maxHeight: 1024, quality: 80,
  format: 'JPEG', maxFileSize: 2 * 1024 * 1024,
};
const LOCATION_CONFIG = { interval: 3000, fastestInterval: 1000, priority: 100 };

// ─── Today display (non-changeable) ──────────────────────────────────────────
function getTodayDisplay() {
  const now    = new Date();
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return {
    day:   days[now.getDay()],
    date:  now.getDate(),
    month: months[now.getMonth()],
    year:  now.getFullYear(),
    time:  now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

// Backend stores IST directly — parse as-is, NO UTC→local conversion.
const parseISTTime = (timeStr) => {
  if (!timeStr) return null;
  // "HH:mm:ss" only — combine with today's date for full moment object
  if (typeof timeStr === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    return moment(timeStr, 'HH:mm:ss');
  }
  // Full datetime string — parse directly (already IST, no offset shift)
  return moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true).isValid()
    ? moment(timeStr, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601])
    : moment(timeStr);
};

// ── User-Friendly Date/Time UI Formatter ─────────────────────────────────────
const friendlyDateTime = (timeStr) => {
  if (!timeStr) return '—';
  const m = parseISTTime(timeStr);
  return m && m.isValid() ? m.format('DD MMM YYYY, hh:mm A') : timeStr;
};

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE MINI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Pill badge
const Chip = ({ label, color, bg, icon }) => (
  <View style={[chip.wrap, { backgroundColor: bg }]}>
    {icon && <MaterialCommunityIcons name={icon} size={11} color={color} style={{ marginRight: 4 }} />}
    <Text style={[chip.text, { color }]}>{label}</Text>
  </View>
);
const chip = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
});

// Detail row
const Detail = ({ icon, label, value, mono }) => (
  <View style={dt.row}>
    <Text style={dt.icon}>{icon}</Text>
    <View style={dt.body}>
      <Text style={dt.label}>{label}</Text>
      <Text style={[dt.value, mono && { fontFamily: 'monospace', color: '#1d4ed8' }]} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  </View>
);
const dt = StyleSheet.create({
  row:   { flexDirection: 'row', marginBottom: 12 },
  icon:  { fontSize: 16, width: 26, marginTop: 1 },
  body:  { flex: 1 },
  label: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 2, letterSpacing: 0.4 },
  value: { fontSize: 13, color: '#1e293b', fontWeight: '600' },
});

// Section card
const Section = ({ title, icon, children, accent = '#3b82f6' }) => (
  <View style={[sec.card, { borderLeftColor: accent }]}>
    <View style={sec.head}>
      <View style={[sec.iconBox, { backgroundColor: accent + '18' }]}>
        <MaterialCommunityIcons name={icon} size={15} color={accent} />
      </View>
      <Text style={sec.title}>{title}</Text>
    </View>
    {children}
  </View>
);
const sec = StyleSheet.create({
  card:    { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, borderLeftWidth: 3, elevation: 2, shadowColor: '#64748b', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  head:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  title:   { fontSize: 14, fontWeight: '800', color: '#0f172a', letterSpacing: 0.2 },
});

// Primary button
const PrimaryBtn = ({ label, icon, color, onPress, disabled, outline }) => (
  <TouchableOpacity
    onPress={onPress} disabled={disabled} activeOpacity={0.8}
    style={[
      pb.btn,
      { backgroundColor: outline ? 'transparent' : color },
      outline && { borderWidth: 2, borderColor: color },
      disabled && pb.disabled,
    ]}
  >
    <MaterialCommunityIcons name={icon} size={19} color={outline ? color : '#fff'} style={{ marginRight: 8 }} />
    <Text style={[pb.label, outline && { color }]}>{label}</Text>
  </TouchableOpacity>
);
const pb = StyleSheet.create({
  btn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, marginTop: 6 },
  label:    { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  disabled: { opacity: 0.4 },
});

// Animated live pulse dot
const PulseDot = ({ anim, color = '#10b981' }) => (
  <Animated.View style={{
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: color, marginRight: 6,
    transform: [{ scale: anim }],
  }} />
);

// ── 🔒 Non-editable Date Banner ───────────────────────────────────────────────
const DateBanner = () => {
  const d = getTodayDisplay();
  return (
    <View style={db.wrap}>
      <View style={db.left}>
        <Text style={db.bigNum}>{d.date}</Text>
        <View>
          <Text style={db.monthYear}>{d.month} {d.year}</Text>
          <Text style={db.dayName}>{d.day}</Text>
        </View>
      </View>
      <View style={db.divider} />
      <View style={db.right}>
        <Text style={db.time}>{d.time}</Text>
        <View style={db.lockRow}>
          <MaterialCommunityIcons name="lock-outline" size={11} color="#94a3b8" />
          <Text style={db.lockNote}>Date auto-set, not editable</Text>
        </View>
      </View>
    </View>
  );
};
const db = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 14 },
  left:      { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  bigNum:    { fontSize: 40, fontWeight: '900', color: '#1e3a8a', lineHeight: 44 },
  monthYear: { fontSize: 13, fontWeight: '700', color: '#334155' },
  dayName:   { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 1 },
  divider:   { width: 1, height: 40, backgroundColor: '#e2e8f0', marginHorizontal: 14 },
  right:     { alignItems: 'flex-end' },
  time:      { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  lockRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  lockNote:  { fontSize: 10, color: '#94a3b8' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const OndutyEntry = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const navigation = useNavigation();

  const [photo, setPhoto]                     = useState(null);
  const [compressedPhoto, setCompressedPhoto] = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [uploadProgress, setUploadProgress]   = useState(0);
  const [vkm, setvkm]                         = useState(null);
  const [isCameraModal, setIsCameraModal]     = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [Isgo_onduty, setIsgo_onduty]         = useState(false);
  const [out_refetch]                         = useState('');
  const [latitude, setLatitude]               = useState(11.77);
  const [longitude, setLongitude]             = useState(77.3433);
  const [OPEN_MODIFIED_MODAL, SET_OPEN_MODIFIED_MODAL] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const isSubmittingRef = useRef(false);

  // ✅ Removed: onduty_is state — no vehicle confirm modal anymore

  const commoncontext = useContext(Common_Context);
  const dispatch      = useDispatch();
  const InputState    = useSelector(st => st?.Input?.Onduty_state);
  const UserSelect    = useSelector(st => st?.UserDetails);

  const { data: dociddata,  refetch: dcoidrefetch }                 = useGetDocIDQuery();
  const { data: data_IN, error: error_IN, refetch: get_In_Refresh } = useGetInQuery();
  const { data: ref_token }                                         = useGet_refresh_tokenQuery();
  const { data: hodfcm }                                            = useGet_hod_tokenQuery({ params: { hod: UserSelect?.hod } });
  const [stTracking]                                                = useStTrackMutation();
  const { data: all_Onduty_reasons }                                = useGet_all_Onduty_reasonQuery();
  const [add_requestOndutyOut]                                      = useRequestOndutyOutMutation();
  const [Request_ReachedKm]                                         = useRequestReachedOutMutation();
  const { data: get_all_vechile, refetch: get_vechile_refresh }     = useGet__VechileQuery({
    params: { where: JSON?.stringify({ USEDBY: UserSelect?.EMPNAME }) }
  });
  const vechile_one_number = get_all_vechile?.data;
  const { data: get_km }   = useGet__vechilekmQuery({
    VEHICLENO: vechile_one_number?.length === 1 ? vechile_one_number[0]?.vechileno : ''
  });
  const { data: reached_Data } = useGet_reachedQuery();

  // ── Pulse animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── DocID init — date locked, never editable ─────────────────────────────────
  useEffect(() => {
    if (dociddata?.data?.count) {
      const paddedCount = dociddata.data.count.toString().padStart(6, '0');
      dispatch(setInput({
        docid:   `${UserSelect?.GCOMPCODE}/OND-${paddedCount}`,
        docdate: formattedDate,    // ✅ locked once — user cannot change
        idcard:  UserSelect?.UserId,
        empname: UserSelect?.EMPNAME,
        id:      'Onduty_state',
      }));
    }
  }, [dociddata, UserSelect]);

  // ✅ Removed: get_onduty_is_Ready — was only used to open vehicle modal

  // ── Vehicle dropdown init ────────────────────────────────────────────────────
  useEffect(() => {
    if (get_all_vechile?.data?.length > 0) {
      dispatch(setInput({ category_vechileno: get_all_vechile?.data, id: 'Onduty_state' }));
      if (get_all_vechile?.data?.length === 1) {
        const [{ vechileno }] = get_all_vechile?.data;
        dispatch(setInput({ vechileno, id: 'Onduty_state' }));
      }
    }
  }, [get_all_vechile]);

  useEffect(() => { setvkm(get_km?.data?.km); }, [get_km?.data]);

  useEffect(() => {
    if (all_Onduty_reasons?.data?.length > 0)
      dispatch(setInput({ category_options: all_Onduty_reasons?.data, id: 'Onduty_state' }));
    fetchAddress();
  }, [out_refetch, all_Onduty_reasons]);

  // ── Image processing ─────────────────────────────────────────────────────────
  const handleImageProcessing = async (imageUri) => {
    try {
      setLoading(true);
      const fileInfo = await RNFetchBlob.fs.stat(imageUri);
      if (fileInfo.size <= IMAGE_CONFIG.maxFileSize) return imageUri;
      const ratio = Math.sqrt(IMAGE_CONFIG.maxFileSize / fileInfo.size);
      const tW = Math.floor(IMAGE_CONFIG.maxWidth  * ratio);
      const tH = Math.floor(IMAGE_CONFIG.maxHeight * ratio);
      const resized = await ImageResizer.createResizedImage(
        imageUri, tW, tH, IMAGE_CONFIG.format, IMAGE_CONFIG.quality, 0, null, false, { mode: 'stretch' }
      );
      const newInfo = await RNFetchBlob.fs.stat(resized.uri);
      if (newInfo.size > IMAGE_CONFIG.maxFileSize) {
        const further = await ImageResizer.createResizedImage(
          resized.uri, tW, tH, IMAGE_CONFIG.format,
          Math.floor(IMAGE_CONFIG.quality * 0.7), 0, null, false, { mode: 'stretch' }
        );
        return further.uri;
      }
      return resized.uri;
    } catch (e) { throw e; }
    finally { setLoading(false); }
  };

  // ── Location fetch ───────────────────────────────────────────────────────────
  const fetchAddress = async () => {
    try {
      setLoading(true);
      const coords = await new Promise((res, rej) =>
        getCurrentLocation(({ coords }) => res(coords), rej)
      );
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      
      const placeholder = `Address retrieved on submission`;
      dispatch(setInput({ address: placeholder, id: 'Onduty_state' }));
      return { latitude: coords.latitude, longitude: coords.longitude, address: placeholder };
    } catch {
      const fallback = { latitude, longitude, address: `Location unavailable` };
      dispatch(setInput({ address: fallback.address, id: 'Onduty_state' }));
      return fallback;
    } finally { setLoading(false); }
  };

  // ── Reached office ───────────────────────────────────────────────────────────
 const Reached_office = async () => {
  setIsSubmitting(true);
  try {
    const response = await Request_ReachedKm({
      docid:      reached_Data?.data?.docid,
      Evechilekm: '0',
      VEHICLENO:  reached_Data?.data?.vechileno,
    }).unwrap();

    if (response?.status === 1) {
      showMessage({
        message:     'OnDuty Complete',
        description: 'Trip completed successfully!',
        type:        'success',
      });

      await LocationTracker.stopTracking();
      await LocationTracker.stopService();
      await AsyncStorage?.removeItem('onduty');

      dispatch(setInput({ category: '', others: '', docid: '', id: 'Onduty_state' }));

      await _FCM_SENDER(
        ref_token?.data?.token,
        hodfcm?.data?.fcm,
        `OnDuty Reached: ${UserSelect?.EMPNAME}`
      );

      // Fetch fresh DocID so it's ready for next entry
      await Promise.all([get_In_Refresh(), get_vechile_refresh(), dcoidrefetch()]);

    } else {
      Alert.alert('Error', response?.message || 'Failed');
    }
  } catch (e) {
    showMessage({ message: 'Error', description: e.message, type: 'danger' });
  } finally {
    setIsSubmitting(false); 
  }
};

  // ── Submit OUT ───────────────────────────────────────────────────────────────
const SubmitOut = async (to_onduty_flag, overrideDocid = null) => {
  try {
    setIsSubmitting(true);
    const coords = await fetchAddress();
    const response = await add_requestOndutyOut({
      docid:         overrideDocid || data_IN?.data?.docid,
      out_latitude:  String(coords.latitude),
      out_longtiude: String(coords.longitude),
      out_location:  String(coords.address),
      end_km:        '0',
      inout:         'OUT',
      to_onduty:     !!to_onduty_flag?.to_onduty,
    }).unwrap();

    if (response?.status === 1) {
      showMessage({
        message:     'Checked Out',
        description: 'OnDuty OUT recorded successfully',
        type:        'success',
      });

      // ✅ No next_docid from backend anymore — always stop tracking on OUT
      // If going to another onduty, tracker will restart fresh on next IN submit
      await LocationTracker.stopTracking();
      await LocationTracker.stopService();

      setCompressedPhoto('');
      dispatch(setInput({ category: '', others: '', docid: '', id: 'Onduty_state' }));

      await _FCM_SENDER(
        ref_token?.data?.token,
        hodfcm?.data?.fcm,
        `OnDuty Out: ${UserSelect?.EMPNAME}`
      );

      // Fetch fresh DocID so it's ready for next entry
      await Promise.all([get_In_Refresh(), get_vechile_refresh(), dcoidrefetch()]);

    } else {
      Alert.alert('Error', response?.message || 'Failed');
    }
  } catch (e) {
    showMessage({ message: 'Error', description: e.message, type: 'danger' });
  } finally {
    setIsSubmitting(false);
  }
};
  const handlePictureTaken = async (imageUri) => {
    try {
      setLoading(true);
      const processedUri = await handleImageProcessing(imageUri);
      setPhoto(imageUri);
      setCompressedPhoto(processedUri);
      setIsCameraModal(false);
    } catch {
      showMessage({ message: 'Image Error', description: 'Failed to process image.', type: 'danger' });
    } finally { setLoading(false); }
  };

  // ── Socket listener ──────────────────────────────────────────────────────────
  const Get_Notification_handler = () => { get_In_Refresh(); };
  useEffect(() => {
    if (!UserSelect?.UserId || !socket?.connected) return;
    const ev = 'get_Onduty_Approval_status:' + UserSelect?.GCOMPCODE + UserSelect?.UserId;
    socket.on(ev, Get_Notification_handler);
    return () => socket.off(ev, Get_Notification_handler);
  }, [UserSelect, socket?.connected]);

  // ── Another onduty alert ─────────────────────────────────────────────────────
  const Request_Another_onduty = () => {
    if (!Isgo_onduty)
      Alert.alert(
        'Another OnDuty',
        'Are you going to another OnDuty?',
        [{ text: 'Cancel' }, { text: 'Yes', onPress: () => SubmitOut({ to_onduty: true }) }],
        { cancelable: false }
      );
  };

  // ── Start tracker — NO modal, direct start ───────────────────────────────────
  const enable_Tracker_onduty = async (currentDocid) => {
    try {
      const tracker = await stTracking({ docid: currentDocid });
      if (tracker?.data?.data) {
        LocationTracker.startService();
        LocationTracker.updateTrackingConfig({
          ...LOCATION_CONFIG,
          userId:   UserSelect?.UserId,
          docId:    currentDocid,
          COMPCODE: UserSelect?.GCOMPCODE,
        });
        LocationTracker.startTracking({
          userId:   UserSelect?.UserId,
          docId:    currentDocid,
          COMPCODE: UserSelect?.GCOMPCODE,
        });
      }
      // ✅ Removed: setonduty_is(true) — never show vehicle confirm modal
    } catch (e) {
      console.error('Tracker start error:', e);
    }
  };

  // ── Main submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // ── Layer 1: Instant ref lock ────────────────────────────────────────────
    if (isSubmittingRef.current) return;

    // ── Layer 2: Photo check ─────────────────────────────────────────────────
    if (!compressedPhoto) {
      showMessage({ message: 'Photo Required', description: 'Please capture a photo first.', type: 'warning' });
      return;
    }

    // ── Layer 5: AsyncStorage lock ───────────────────────────────────────────
    const alreadySubmitting = await AsyncStorage.getItem('onduty_submitting');
    if (alreadySubmitting === 'true') {
      showMessage({ message: 'Already Submitting', description: 'Please wait...', type: 'warning' });
      return;
    }

    // ── Lock ─────────────────────────────────────────────────────────────────
    isSubmittingRef.current = true;
    await AsyncStorage.setItem('onduty_submitting', 'true');
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const data_ = JSON?.parse(await AsyncStorage?.getItem('onduty'));
      const formData = new FormData();

      // Approval routing
      if (UserSelect?.approval === 'HOD') {
        formData.append('hod', String(UserSelect?.hod) || '0');
      } else if (UserSelect?.approval === 'HR') {
        formData.append('hr', String(UserSelect?.hr) || '0');
      } else {
        formData.append('hod', String(UserSelect?.hod) || '0');
        formData.append('hr',  String(UserSelect?.hr)  || '0');
      }

      formData.append('userId',       UserSelect?.UserId    || '0');
      formData.append('idcard',       UserSelect?.UserId    || '0');
      // Reverted to ISO-8601 string to satisfy Prisma DateTime
      formData.append('docdate',      new Date().toISOString()); 
      formData.append('others',       InputState?.others    || 'No reason provided');
      formData.append('create',       '1');
      // ── Refetch fresh doc ID instantly to prevent sequence race conditions ──
      const latestDocQuery = await dcoidrefetch();
      const latestCount = latestDocQuery?.data?.data?.count || dociddata?.data?.count || 0;
      let finalDocId = InputState?.docid || 'DOC_ID';
      
      if (latestCount) {
        const paddedCount = latestCount.toString().padStart(6, '0');
        finalDocId = `${UserSelect?.GCOMPCODE}/OND-${paddedCount}`;
      }

      formData.append('docid',        finalDocId);
      formData.append('vechileno',    InputState?.vechileno || '');
      formData.append('start_km',     InputState?.start_km  || '0');
      formData.append('bunk',         InputState?.bunk      || '');
      formData.append('compCode',     UserSelect?.GCOMPCODE || 'COM_CODE');
      formData.append('inout',        'IN');
      formData.append('Svechilekm',   data_?.skm || '0');
      formData.append('empname',      InputState?.empname   || 'Employee');
      formData.append('category',     InputState?.category  || 0);
      formData.append('in_location',  InputState?.address   || 'Location not available');
      formData.append('in_latitude',  String(latitude));
      formData.append('in_longtiude', String(longitude));
      formData.append('docCount',     String(Number(latestCount)));

      const safeName = String(UserSelect?.EMPNAME).replace(/\s/g, '_');
      formData.append('file', {
        uri:  compressedPhoto,
        type: 'image/jpeg',
        name: `${UserSelect?.GCOMPCODE}_${safeName}_onduty.jpg`,
      });

      const response = await fetch(`${BASE_URL}/${onduty}/requestOnduty`, {
        method:  'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'compcode':     UserSelect?.GCOMPCODE,
          'Idcard':       UserSelect?.UserId,
        },
        body: formData,
      });

      const data = await response.json();

      if (data?.status === 1) {
        showMessage({ message: 'OnDuty Started', description: 'Your request was submitted!', type: 'success' });

        // Notify HOD via socket
        socket.emit('onduty_request', {
          hod:      UserSelect?.hod,
          compcode: UserSelect?.GCOMPCODE,
          userdata: {
            email:    '',
            username: UserSelect?.userName,
            Idcard:   UserSelect?.UserId,
            mobile:   UserSelect?.MOBNO,
          },
          ...data?.data,
        });

      
        await enable_Tracker_onduty(finalDocId);

        // Reset form
        dispatch(setInput({
          category: '', others: '', docid: '',
          vechileno: '', start_km: '', in_location: '',
          id: 'Onduty_state',
        }));
        setCompressedPhoto('');

        await _FCM_SENDER(ref_token?.data?.token, hodfcm?.data?.fcm, `OnDuty By: ${UserSelect?.EMPNAME}`);
        await Promise.all([get_In_Refresh(), get_vechile_refresh(), dcoidrefetch()]);

      } else {
        if (data?.message?.includes('active on-duty session')) {
          Alert.alert(
            'Active Session Found',
            data?.message,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout App', onPress: async () => {
                  try {
                    await AsyncStorage.removeItem('userName');
                    navigation.navigate('LOGIN');
                  } catch (e) { console.error('Logout error', e); }
              }},
              { text: 'Close Session', onPress: () => {
                  if (data?.docid) {
                    SubmitOut({ to_onduty: false }, data.docid);
                  } else {
                    Alert.alert('Error', 'Session ID not found on server.');
                  }
              }}
            ]
          );
        } else {
          Alert.alert('Error', data?.message || 'Request failed');
        }
      }
    } catch (e) {
      RestartApi([OndutyRTk], dispatch);
      showMessage({ message: 'Error', description: e.message || 'Failed to submit', type: 'danger' });
    } finally {
      // ── Always unlock ──────────────────────────────────────────────────────
      isSubmittingRef.current = false;
      await AsyncStorage.removeItem('onduty_submitting'); // ✅ always clears
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [compressedPhoto, InputState, UserSelect]);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER STATES
  // ════════════════════════════════════════════════════════════════════════════

  if (isSubmitting) {
    return (
      <View style={s.center}>
        <View style={s.loadCard}>
          <View style={s.loadIconWrap}>
            <ActivityIndicator size="large" color="#1d4ed8" />
          </View>
          <Text style={s.loadTitle}>Submitting OnDuty</Text>
          <Text style={s.loadSub}>Please wait a moment...</Text>
          <View style={s.progBg}>
            <View style={[s.progFill, { width: `${Math.max(uploadProgress, 8)}%` }]} />
          </View>
        </View>
      </View>
    );
  }

  if (error_IN) {
    return (
      <View style={s.center}>
        <View style={s.errorCard}>
          <MaterialCommunityIcons name="wifi-off" size={48} color="#ef4444" />
          <Text style={s.errTitle}>Connection Error</Text>
          <Text style={s.errSub}>Unable to load OnDuty data. Check your network.</Text>
        </View>
      </View>
    );
  }

  if (loading) return (
    <ProgressPopup box sync visible={loading}
      message={photo ? 'Processing image...' : 'Getting your location...'} />
  );

  // ── REACHED OFFICE ──────────────────────────────────────────────────────────
  if (reached_Data?.data?.docid && !Isgo_onduty && reached_Data?.data?.inout === 'OUT') {
    return (
      <ScrollView style={s.bg} contentContainerStyle={s.pad}>

        <View style={[s.hero, { borderLeftColor: '#10b981' }]}>
          <View style={[s.heroIcon, { backgroundColor: '#d1fae5' }]}>
            <MaterialCommunityIcons name="home-map-marker" size={30} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroTitle}>Back at Office!</Text>
            <Text style={s.heroSub}>Your trip is almost done. Confirm your return.</Text>
            <Chip label="TRIP ENDING" color="#10b981" bg="#d1fae5" icon="flag-checkered" />
          </View>
        </View>

        {/* 🔒 Non-editable date */}
        <DateBanner />

        <Section title="Trip Summary" icon="clipboard-check-outline" accent="#10b981">
          <Detail icon="🗂️" label="DOCUMENT ID"    value={reached_Data?.data?.docid}       mono />
          <Detail icon="📍" label="DEPARTURE"       value={reached_Data?.data?.in_location} />
          {/* <Detail icon="🚗" label="VEHICLE"          value={reached_Data?.data?.vechileno} /> */}
        </Section>

        <Section title="Complete Your Trip" icon="check-decagram" accent="#10b981">
          <Text style={s.hintText}>
            Tap below to confirm you've returned to office and complete the OnDuty trip.
          </Text>
          <PrimaryBtn
            label="Confirm Reached Office"
            icon="check-circle-outline"
            color="#10b981"
            onPress={Reached_office}
            disabled={isSubmitting}
          />
        </Section>

      </ScrollView>
    );
  }

  // ── OUT SCREEN ──────────────────────────────────────────────────────────────
  if (data_IN?.data?.docid && !Isgo_onduty && data_IN?.data?.inout === 'IN') {
    return (
      <ScrollView style={s.bg} contentContainerStyle={s.pad}>

        <View style={[s.hero, { borderLeftColor: '#3b82f6' }]}>
          <View style={[s.heroIcon, { backgroundColor: '#dbeafe' }]}>
            <MaterialCommunityIcons name="map-marker-path" size={30} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <PulseDot anim={pulseAnim} color="#3b82f6" />
              <Text style={[s.liveLabel, { color: '#3b82f6' }]}>LIVE TRACKING</Text>
            </View>
            <Text style={s.heroTitle}>Active OnDuty Trip</Text>
            <Text style={s.heroSub}>You're currently on duty. Check out when you return.</Text>
          </View>
        </View>

        {/* 🔒 Non-editable date */}
        <DateBanner />

        <Section title="Active Trip Details" icon="briefcase-clock-outline" accent="#3b82f6">
          <Detail icon="🗂️" label="DOCUMENT ID" value={data_IN?.data?.docid}        mono />
          <Detail icon="📍" label="DEPARTURE"    value={data_IN?.data?.in_location} />
          <Detail icon="🕒" label="START TIME"   value={friendlyDateTime(data_IN?.data?.in_time)} />
          {/* <Detail icon="🚗" label="START KM"
            value={data_IN?.data?.start_km ? `${data_IN?.data?.start_km} KM` : null} /> */}
        </Section>

        <View style={s.checkWrap}>
          <MaterialCommunityIcons name="map-marker-plus-outline" size={18} color="#3b82f6" />
          <Checkbox.Item
            label="Going to another OnDuty?"
            status={Isgo_onduty ? 'checked' : 'unchecked'}
            onPress={Request_Another_onduty}
            color="#3b82f6" position="leading"
            labelStyle={s.checkLabel} style={{ flex: 1, paddingVertical: 0 }} />
        </View>

        <Section title="Check Out" icon="logout" accent="#ef4444">
          <Text style={s.hintText}>
            Your current location will be captured automatically when you check out.
          </Text>
          <PrimaryBtn
            label="Check OUT Now"
            icon="logout-variant"
            color="#ef4444"
            onPress={() => SubmitOut()}
            disabled={isSubmitting}
          />
        </Section>

      </ScrollView>
    );
  }

  // ── MAIN FORM ────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={s.bg} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">

      {/* ✅ Only Browse/Modification modal — vehicle confirm modal REMOVED */}
      <View style={{ position: 'absolute' }}>
        <CommonModal
          maxHeightPercentage={0.9}
          height={isLandscape ? '90%' : '90%'}
          isModalVisible={OPEN_MODIFIED_MODAL}
          BodyComponent={<Onduty_ALL_EDIT />}
          setIsModalVisible={SET_OPEN_MODIFIED_MODAL}
          Title="OnDuty Modification"
        />
      </View>

      {/* Camera modal */}
      <View style={{ position: 'absolute' }}>
        <CameraModal
          visible={isCameraModal}
          onDismiss={() => setIsCameraModal(false)}
          setVisible={setIsCameraModal}
          onPictureTaken={handlePictureTaken}
        />
      </View>

      {/* Page Header */}
      <View style={s.pageTop}>
        <View>
          <Text style={s.pageTitle}>OnDuty Entry</Text>
          <Text style={s.pageSub}>Fill in details to start your trip</Text>
        </View>
        {commoncontext?.admin == 1 && (
          <TouchableOpacity
            style={s.browseBtn}
            onPress={() => SET_OPEN_MODIFIED_MODAL(true)}
            activeOpacity={0.8}
          >
            <Entypo name="browser" size={15} color="#2563EB" />
            <Text style={s.browseTxt}>Browse</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔒 Non-editable Date Banner */}
      <DateBanner />

      {/* DocID pill */}
      {InputState?.docid && (
        <View style={s.docidRow}>
          <MaterialCommunityIcons name="file-document-outline" size={16} color="#1d4ed8" />
          <Text style={s.docidText}>{InputState?.docid}</Text>
          <Chip label="AUTO" color="#1d4ed8" bg="#dbeafe" />
        </View>
      )}

      {/* Active trip info banner */}
      {data_IN?.data && (
        <View style={s.tripBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <PulseDot anim={pulseAnim} />
            <Text style={s.liveLabel}>IN PROGRESS</Text>
          </View>
          <Text style={s.tripDoc}>💼 {data_IN?.data?.docid}</Text>
          <Detail icon="📍" label="UNIT"    value={data_IN?.data?.in_location} />
          <Detail icon="🕒" label="STARTED" value={friendlyDateTime(data_IN?.data?.in_time)} />
        </View>
      )}

      {/* Another onduty toggle */}
      {(data_IN?.data?.approvalStatus === 'approved' ||
        data_IN?.data?.approvalStatus === 'pending' ||
        Isgo_onduty) && (
        <View style={s.checkWrap}>
          <MaterialCommunityIcons name="map-marker-plus-outline" size={18} color="#3b82f6" />
          <Checkbox.Item
            label="Is Another OnDuty?"
            status={Isgo_onduty ? 'checked' : 'unchecked'}
            onPress={() => setIsgo_onduty(!Isgo_onduty)}
            color="#3b82f6" position="leading"
            labelStyle={s.checkLabel} style={{ flex: 1, paddingVertical: 0 }} />
        </View>
      )}

      {/* Form fields */}
      <Section title="Trip Details" icon="form-textbox" accent="#3b82f6">
        <InputWraper gap={2} states={onduty_Meta} />
      </Section>

      {/* Photo capture */}
      <Section title="Location Photo *" icon="camera-outline" accent="#8b5cf6">
        {compressedPhoto ? (
          <View style={s.photoWrap}>
            <Image source={{ uri: compressedPhoto }} resizeMode="cover" style={s.photoImg} />
            <View style={s.photoBar}>
              <Chip label="✓  PHOTO CAPTURED" color="#fff" bg="rgba(16,185,129,0.85)" />
              <TouchableOpacity style={s.retakeBtn} onPress={() => setIsCameraModal(true)}>
                <MaterialCommunityIcons name="camera-retake-outline" size={17} color="#fff" />
                <Text style={s.retakeTxt}>Retake</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.camPlaceholder} onPress={() => setIsCameraModal(true)} activeOpacity={0.8}>
            <View style={s.camCircle}>
              <Feather name="camera" size={28} color="#8b5cf6" />
            </View>
            <Text style={s.camTitle}>Tap to Capture</Text>
            <Text style={s.camSub}>A selfie or location photo is required</Text>
          </TouchableOpacity>
        )}
      </Section>

      {/* Submit */}
      <View style={s.submitArea}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !compressedPhoto}
          style={[s.submitBtn, (isSubmitting || !compressedPhoto) && { backgroundColor: '#94a3b8' }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="car-brake-low-pressure"
              size={20} color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={s.submitTxt}>
              {isSubmitting ? 'SUBMITTING...' : 'START ONDUTY  (IN)'}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={s.submitHint}>
          {isSubmitting ? 'Processing your request...' : 'Hold the button to confirm your submission'}
        </Text>
      </View>

    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  bg:  { flex: 1, backgroundColor: '#f1f5f9' },
  pad: { padding: 16, paddingBottom: 52 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 24 },

  // Loading card
  loadCard:     { backgroundColor: '#fff', borderRadius: 22, padding: 32, alignItems: 'center', width: '100%', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14 },
  loadIconWrap: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadTitle:    { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  loadSub:      { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  progBg:       { width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 6, overflow: 'hidden' },
  progFill:     { height: '100%', backgroundColor: '#3b82f6', borderRadius: 6 },

  // Error card
  errorCard: { backgroundColor: '#fff', borderRadius: 22, padding: 32, alignItems: 'center', width: '100%', elevation: 3 },
  errTitle:  { fontSize: 17, fontWeight: '800', color: '#0f172a', marginTop: 14 },
  errSub:    { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 6, lineHeight: 20 },

  // Hero strip
  hero:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, borderLeftWidth: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, gap: 14 },
  heroIcon:  { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  heroSub:   { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 8 },
  hintText:  { fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 18 },
  liveLabel: { fontSize: 10, fontWeight: '900', color: '#10b981', letterSpacing: 1.2 },

  // Page header
  pageTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  pageSub:   { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  browseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#bfdbfe', gap: 5 },
  browseTxt: { fontSize: 13, fontWeight: '700', color: '#2563EB' },

  // DocID
  docidRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#bfdbfe', gap: 8 },
  docidText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1d4ed8', fontFamily: 'monospace' },

  // Active trip banner
  tripBanner: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#3b82f6', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  tripDoc:    { fontSize: 13, fontWeight: '800', color: '#1e40af', marginBottom: 10 },

  // Checkbox row
  checkWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, gap: 4 },
  checkLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },

  // Photo
  photoWrap:      { borderRadius: 14, overflow: 'hidden', height: 230 },
  photoImg:       { width: '100%', height: '100%' },
  photoBar:       { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
  retakeBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
  retakeTxt:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  camPlaceholder: { borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#c4b5fd', backgroundColor: '#faf5ff', alignItems: 'center', paddingVertical: 36 },
  camCircle:      { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  camTitle:       { fontSize: 15, fontWeight: '800', color: '#5b21b6' },
  camSub:         { fontSize: 12, color: '#a78bfa', marginTop: 4 },

  // Submit
  submitArea: { marginTop: 4, marginBottom: 16,margin:"auto" },
  submitTxt:  { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  submitHint: { textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 8 },
  submitBtn:{
  backgroundColor: '#3b82f6',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: 'center',
  }
});

export default OndutyEntry;