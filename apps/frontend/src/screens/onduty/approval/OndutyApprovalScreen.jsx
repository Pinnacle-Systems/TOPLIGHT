import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Linking,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_URL } from '@env';
import { showMessage } from 'react-native-flash-message';
import { useRequestOnduty_ApprovalMutation } from '../../../store/api/OndutyApi';
import {
    useGet_refresh_tokenQuery,
    useLazyGet_fcm_tokenQuery,
} from '../../../store/api/UserApi';
import { useGetPermissionRequestQuery } from '../../../store/api/NotificationApi';
import { _FCM_SENDER } from '../../../components/utils/Fcm';
import socket from '../../../utils/Socket';
import { useAppTheme } from '../../../theme';

const getRequests = (params, apiData, processedDocIds) => {
    const requests = [];
    const hasLiveApiData = Array.isArray(apiData?.data);

    if (hasLiveApiData) {
        requests.push(
            ...apiData.data.filter(request => String(request?.group || '').toLowerCase() === 'onduty'),
        );
    } else if (params && typeof params === 'object') {
        const { all, refresh, ...clickedRequest } = params;
        const clickedDocid = clickedRequest?.docid || clickedRequest?.docId;
        if (clickedDocid) requests.push(clickedRequest);

        if (Array.isArray(all)) {
            requests.push(
                ...all.filter(request => String(request?.group || '').toLowerCase() === 'onduty'),
            );
        }
    }

    const seenDocIds = new Set();
    return requests.filter(request => {
        const docid = String(request?.docid || request?.docId || '').trim();
        if (!docid) return false;
        const status = String(request?.approvalStatus || 'pending').toLowerCase();
        if (status !== 'pending') return false;
        if (seenDocIds.has(docid)) return false;
        if (processedDocIds && processedDocIds.has(docid)) return false;
        seenDocIds.add(docid);
        return true;
    });
};

const formatDate = (value) => {
    if (!value) return '—';
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const formatTime = (value) => {
    if (!value || String(value).trim() === '' || value === '—' || value === 'null') return '—';
    const parsed = moment(value, ['HH:mm:ss', 'HH:mm', 'h:mm A', 'hh:mm A', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601]);
    return parsed.isValid() ? parsed.format('hh:mm A') : String(value);
};

const getPhotoUri = (photo) => {
    if (!photo || typeof API_URL !== 'string' || !API_URL) return null;
    const baseUrl = API_URL.replace(/\/+$/, '');
    return `${baseUrl}/onduty/Onduty_uploaded_image?image=${encodeURIComponent(photo)}`;
};

const getErrorMessage = (error) => {
    const message = error?.data?.message || error?.data?.error || error?.error || error?.message;
    return typeof message === 'string' && message.trim()
        ? message
        : 'Unable to process this on-duty request. Please try again.';
};

// ── Swipeable Container Component ───────────────────────────────────────────
function SwipeableCard({ children, onSwipeRight, onSwipeLeft, disabled, styles }) {
    const panX = useRef(new Animated.Value(0)).current;
    const threshold = 95;

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    if (disabled) return false;
                    return (
                        Math.abs(gestureState.dx) > 18 &&
                        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
                    );
                },
                onPanResponderMove: (_, gestureState) => {
                    panX.setValue(Math.max(-140, Math.min(140, gestureState.dx)));
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dx > threshold) {
                        Animated.timing(panX, {
                            toValue: 140,
                            duration: 140,
                            useNativeDriver: true,
                        }).start(() => {
                            onSwipeRight?.();
                            Animated.spring(panX, {
                                toValue: 0,
                                bounciness: 4,
                                useNativeDriver: true,
                            }).start();
                        });
                    } else if (gestureState.dx < -threshold) {
                        Animated.timing(panX, {
                            toValue: -140,
                            duration: 140,
                            useNativeDriver: true,
                        }).start(() => {
                            onSwipeLeft?.();
                            Animated.spring(panX, {
                                toValue: 0,
                                bounciness: 4,
                                useNativeDriver: true,
                            }).start();
                        });
                    } else {
                        Animated.spring(panX, {
                            toValue: 0,
                            bounciness: 6,
                            useNativeDriver: true,
                        }).start();
                    }
                },
            }),
        [disabled, onSwipeLeft, onSwipeRight, panX, threshold]
    );

    const approveOpacity = panX.interpolate({
        inputRange: [0, 40, threshold],
        outputRange: [0, 0.4, 1],
        extrapolate: 'clamp',
    });

    const rejectOpacity = panX.interpolate({
        inputRange: [-threshold, -40, 0],
        outputRange: [1, 0.4, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.swipeContainer}>
            {/* Swipe Background: Approve (Right Swipe) */}
            <Animated.View style={[styles.swipeAction, styles.swipeApprove, { opacity: approveOpacity }]}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                <Text style={styles.swipeActionText}>Approve</Text>
            </Animated.View>

            {/* Swipe Background: Reject (Left Swipe) */}
            <Animated.View style={[styles.swipeAction, styles.swipeReject, { opacity: rejectOpacity }]}>
                <Text style={styles.swipeActionText}>Reject</Text>
                <MaterialCommunityIcons name="close-circle" size={24} color="#FFFFFF" />
            </Animated.View>

            {/* Foreground Card */}
            <Animated.View
                style={[
                    styles.swipeForeground,
                    { transform: [{ translateX: panX }] },
                ]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

// ── Compact Request Card Component ──────────────────────────────────────────
function CompactRequestCard({
    item,
    isBusy,
    onApprove,
    onRejectClick,
    onPreviewPhoto,
    styles,
    theme,
}) {
    const rawLatitude = item?.in_latitude ?? item?.inLatitude;
    const rawLongitude = item?.in_longtiude ?? item?.inLongtiude ?? item?.in_longitude ?? item?.inLongitude;
    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);
    const hasCoordinates =
        rawLatitude != null &&
        String(rawLatitude).trim() !== '' &&
        rawLongitude != null &&
        String(rawLongitude).trim() !== '' &&
        Number.isFinite(latitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        Number.isFinite(longitude) &&
        longitude >= -180 &&
        longitude <= 180;

    const rawOutLatitude = item?.out_latitude ?? item?.outLatitude;
    const rawOutLongitude = item?.out_longtiude ?? item?.outLongtiude ?? item?.out_longitude ?? item?.outLongitude;
    const outLatitude = Number(rawOutLatitude);
    const outLongitude = Number(rawOutLongitude);
    const hasOutCoordinates =
        rawOutLatitude != null &&
        String(rawOutLatitude).trim() !== '' &&
        rawOutLongitude != null &&
        String(rawOutLongitude).trim() !== '' &&
        Number.isFinite(outLatitude) &&
        outLatitude >= -90 &&
        outLatitude <= 90 &&
        Number.isFinite(outLongitude) &&
        outLongitude >= -180 &&
        outLongitude <= 180;

    const employeeName =
        item?.userdata?.username ||
        item?.userdata?.userName ||
        item?.userData?.userName ||
        item?.userData?.username ||
        item?.empName ||
        item?.empname ||
        item?.userName ||
        item?.username ||
        'Employee';

    const employeeId =
        item?.userdata?.Idcard ||
        item?.userdata?.idCard ||
        item?.userData?.idCard ||
        item?.userData?.Idcard ||
        item?.idCard ||
        item?.idcard ||
        item?.userId ||
        item?.UserId;

    const docid = item?.docid || item?.docId;
    const docdate = item?.docdate || item?.docDate || item?.createdAt;
    const inTime = item?.in_time || item?.inTime;
    const outTime = item?.out_time || item?.outTime;

    const inLocationRaw = item?.in_location || item?.inLocation || item?.in_address || item?.inAddress;
    const inLocation =
        inLocationRaw ||
        (hasCoordinates ? `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : null) ||
        (item?.others && item.others !== 'ONDUTY' ? item.others : null) ||
        'Location unavailable';

    const outLocationRaw = item?.out_location || item?.outLocation || item?.out_address || item?.outAddress;
    const outLocation =
        (outLocationRaw && outLocationRaw !== 'Location unavailable' && outLocationRaw !== 'null' ? outLocationRaw : null) ||
        (hasOutCoordinates ? `Near ${outLatitude.toFixed(4)}, ${outLongitude.toFixed(4)}` : null) ||
        (item?.inOut === 'OUT' || outTime ? 'Location unavailable' : 'Trip in progress');

    const phone =
        item?.userdata?.phone ||
        item?.userdata?.mobile ||
        item?.userData?.phone ||
        item?.userData?.mobile ||
        item?.mobile ||
        item?.phone;

    const photoUri = getPhotoUri(item?.photo);

    const openInMap = async () => {
        if (!hasCoordinates) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
        try {
            await Linking.openURL(url);
        } catch (error) {
            showMessage({
                message: 'Unable to open map',
                description: error?.message || 'Please try again.',
                type: 'danger',
            });
        }
    };

    const openOutMap = async () => {
        if (!hasOutCoordinates) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${outLatitude},${outLongitude}`)}`;
        try {
            await Linking.openURL(url);
        } catch (error) {
            showMessage({
                message: 'Unable to open map',
                description: error?.message || 'Please try again.',
                type: 'danger',
            });
        }
    };

    const openMap = () => {
        if (hasOutCoordinates) {
            openOutMap();
        } else if (hasCoordinates) {
            openInMap();
        }
    };

    const callEmployee = async () => {
        const number = String(phone || '').replace(/[^\d+]/g, '');
        if (!number) {
            showMessage({
                message: 'Cannot start call',
                description: 'No phone number available for this employee.',
                type: 'warning',
            });
            return;
        }
        try {
            await Linking.openURL(`tel:${number}`);
        } catch (error) {
            showMessage({
                message: 'Unable to start a call',
                description: error?.message || 'Could not open phone dialer on this device.',
                type: 'danger',
            });
        }
    };

    return (
        <SwipeableCard
            disabled={isBusy}
            onSwipeRight={onApprove}
            onSwipeLeft={onRejectClick}
            styles={styles}
            theme={theme}
        >
            <View style={styles.card}>
                {/* 1. Header: Avatar + Employee + ID + Status Pill */}
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="account" size={18} color={theme.colors.brandContrast} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.employeeName} numberOfLines={1}>{employeeName}</Text>
                        <Text style={styles.employeeId}>{employeeId || 'ID unavailable'}</Text>
                    </View>
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>PENDING</Text>
                    </View>
                </View>

                {/* 2. Compact Grid: Document, Date, In/Out Times, In/Out Addresses */}
                <View style={styles.infoGrid}>
                    {/* Doc ID & Date */}
                    <View style={styles.gridRow}>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="file-document-outline" size={15} color={theme.colors.textMuted} />
                            <Text style={styles.gridValue} numberOfLines={1}>{docid || '—'}</Text>
                        </View>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={15} color={theme.colors.textMuted} />
                            <Text style={styles.gridValue} numberOfLines={1}>{formatDate(docdate)}</Text>
                        </View>
                    </View>

                    {/* In Time & Out Time */}
                    <View style={styles.timeCardRow}>
                        <View style={styles.timeBox}>
                            <MaterialCommunityIcons name="login" size={14} color={theme.colors.success} />
                            <Text style={styles.timeLabel}>In Time:</Text>
                            <Text style={styles.timeValue}>{formatTime(inTime)}</Text>
                        </View>
                        <View style={styles.timeDivider} />
                        <View style={styles.timeBox}>
                            <MaterialCommunityIcons name="logout" size={14} color={outTime ? theme.colors.brand : theme.colors.textMuted} />
                            <Text style={styles.timeLabel}>Out Time:</Text>
                            <Text style={[styles.timeValue, !outTime && styles.addressValueMuted]}>
                                {outTime ? formatTime(outTime) : '—'}
                            </Text>
                        </View>
                    </View>

                    {/* In Address & Out Address + Photo */}
                    <View style={styles.addressSection}>
                        <View style={styles.addressList}>
                            {/* In Address */}
                            <TouchableOpacity
                                style={styles.addressRow}
                                onPress={hasCoordinates ? openInMap : undefined}
                                activeOpacity={hasCoordinates ? 0.7 : 1}
                            >
                                <View style={styles.locBadgeIn}>
                                    <MaterialCommunityIcons name="map-marker" size={12} color="#FFFFFF" />
                                </View>
                                <View style={styles.addressTextContainer}>
                                    <View style={styles.addressHeaderRow}>
                                        <Text style={styles.addressLabel}>In Address</Text>
                                        {hasCoordinates && (
                                            <MaterialCommunityIcons name="open-in-new" size={11} color={theme.colors.brand} />
                                        )}
                                    </View>
                                    <Text style={styles.addressValue} numberOfLines={2}>{inLocation}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Out Address */}
                            <TouchableOpacity
                                style={styles.addressRow}
                                onPress={hasOutCoordinates ? openOutMap : undefined}
                                activeOpacity={hasOutCoordinates ? 0.7 : 1}
                            >
                                <View style={[styles.locBadgeOut, (!outLocationRaw && !hasOutCoordinates) && styles.locBadgeOutPending]}>
                                    <MaterialCommunityIcons name="map-marker-check" size={12} color="#FFFFFF" />
                                </View>
                                <View style={styles.addressTextContainer}>
                                    <View style={styles.addressHeaderRow}>
                                        <Text style={styles.addressLabel}>Out Address</Text>
                                        {hasOutCoordinates && (
                                            <MaterialCommunityIcons name="open-in-new" size={11} color={theme.colors.brand} />
                                        )}
                                    </View>
                                    <Text style={[styles.addressValue, (!outLocationRaw && !hasOutCoordinates) && styles.addressValueMuted]} numberOfLines={2}>
                                        {outLocation}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {!!photoUri && (
                            <TouchableOpacity
                                style={styles.photoThumbContainer}
                                onPress={() => onPreviewPhoto(photoUri)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: photoUri }} style={styles.photoThumb} />
                                <View style={styles.thumbBadge}>
                                    <MaterialCommunityIcons name="magnify-plus-outline" size={12} color="#FFFFFF" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Reason snippet */}
                    {!!item?.others && item.others !== 'ONDUTY' && (
                        <View style={styles.reasonRow}>
                            <Text style={styles.reasonTag}>Reason:</Text>
                            <Text style={styles.reasonContent} numberOfLines={1}>{item.others}</Text>
                        </View>
                    )}
                </View>

                {/* 3. Compact Action Bar */}
                <View style={styles.actionBar}>
                    {/* Approve button */}
                    <TouchableOpacity
                        style={[styles.btnApprove, isBusy && styles.btnDisabled]}
                        onPress={onApprove}
                        disabled={isBusy}
                        activeOpacity={0.85}
                    >
                        {isBusy ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                                <Text style={styles.btnApproveText}>Approve</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Reject button */}
                    <TouchableOpacity
                        style={[styles.btnReject, isBusy && styles.btnDisabled]}
                        onPress={onRejectClick}
                        disabled={isBusy}
                        activeOpacity={0.85}
                    >
                        <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
                        <Text style={styles.btnRejectText}>Reject</Text>
                    </TouchableOpacity>

                    {/* Map shortcut */}
                    {(hasCoordinates || hasOutCoordinates) && (
                        <TouchableOpacity
                            style={styles.btnIcon}
                            onPress={openMap}
                            activeOpacity={0.7}
                            accessibilityLabel="View location on map"
                        >
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={theme.colors.brand} />
                        </TouchableOpacity>
                    )}

                    {/* Call shortcut */}
                    {!!phone && (
                        <TouchableOpacity
                            style={styles.btnIcon}
                            onPress={callEmployee}
                            activeOpacity={0.7}
                            accessibilityLabel="Call employee"
                        >
                            <MaterialCommunityIcons name="phone-outline" size={18} color={theme.colors.success} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SwipeableCard>
    );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function OndutyApprovalScreen({ route, navigation }) {
    const user = useSelector(state => state?.UserDetails);
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const params = route?.params;

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'photo' | 'location'

    // Modals state
    const [previewPhotoUri, setPreviewPhotoUri] = useState(null);
    const [rejectModalItem, setRejectModalItem] = useState(null);
    const [rejectReasonInput, setRejectReasonInput] = useState('');

    const isHodOrHr = user?.IDCARD == user?.hod || user?.IDCARD == user?.hr || user?.level != 'user';
    const queryParams = isHodOrHr
        ? { hod: user?.IDCARD, hr: user?.IDCARD }
        : { emp: user?.IDCARD };

    const { data: apiData, isLoading, refetch } = useGetPermissionRequestQuery(
        { params: queryParams },
        { skip: !user?.IDCARD, refetchOnMountOrArgChange: true }
    );

    const processedDocIdsRef = useRef(new Set());
    const [requests, setRequests] = useState(() => getRequests(params, apiData, processedDocIdsRef.current));
    const [processingDocId, setProcessingDocId] = useState(null);
    const processingDocIdRef = useRef(null);
    const [updateStatus] = useRequestOnduty_ApprovalMutation();
    const { data: refreshTokenData } = useGet_refresh_tokenQuery();
    const [fetchEmployeeToken] = useLazyGet_fcm_tokenQuery();

    useEffect(() => {
        setRequests(getRequests(params, apiData, processedDocIdsRef.current));
    }, [params, apiData]);

    const filteredRequests = useMemo(() => {
        return requests.filter(item => {
            if (filterType === 'photo' && !item?.photo) return false;
            if (filterType === 'location') {
                const rawLat = item?.in_latitude ?? item?.inLatitude ?? item?.out_latitude ?? item?.outLatitude;
                const rawLng = item?.in_longtiude ?? item?.inLongtiude ?? item?.in_longitude ?? item?.inLongitude ?? item?.out_longtiude ?? item?.outLongtiude;
                const locStr = String(item?.inLocation || item?.in_location || item?.in_address || '').trim();
                const outLocStr = String(item?.outLocation || item?.out_location || item?.out_address || '').trim();
                const hasLoc = !!(rawLat && rawLng) ||
                    (!!locStr && locStr.toLowerCase() !== 'location unavailable') ||
                    (!!outLocStr && outLocStr.toLowerCase() !== 'location unavailable' && outLocStr.toLowerCase() !== 'trip in progress');
                if (!hasLoc) return false;
            }

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const empName = String(
                item?.userdata?.username ||
                item?.userdata?.userName ||
                item?.userData?.userName ||
                item?.userData?.username ||
                item?.empName ||
                item?.empname ||
                item?.userName ||
                item?.username ||
                ''
            ).toLowerCase();
            const empId = String(
                item?.userdata?.Idcard ||
                item?.userdata?.idCard ||
                item?.userData?.idCard ||
                item?.userData?.Idcard ||
                item?.idCard ||
                item?.idcard ||
                item?.userId ||
                item?.UserId ||
                ''
            ).toLowerCase();
            const doc = String(item?.docid || item?.docId || '').toLowerCase();
            const loc = String(item?.inLocation || item?.in_location || item?.in_address || '').toLowerCase();
            const outLoc = String(item?.outLocation || item?.out_location || item?.out_address || '').toLowerCase();
            const reason = String(item?.others || '').toLowerCase();

            return empName.includes(q) || empId.includes(q) || doc.includes(q) || loc.includes(q) || outLoc.includes(q) || reason.includes(q);
        });
    }, [requests, filterType, searchQuery]);

    const handleAction = useCallback(async (item, status, customReason = '') => {
        const docid = String(item?.docid || item?.docId || '');
        if (!docid || processingDocIdRef.current) return;

        processingDocIdRef.current = docid;
        setProcessingDocId(docid);
        try {
            const response = await updateStatus({
                approval: status,
                docid,
                reject_reason: status === 'rejected' ? customReason : '',
                rejectReason: status === 'rejected' ? customReason : '',
                rejectRemark: status === 'rejected' ? customReason : '',
                approvedBy: status === 'approved' ? user?.UserId : '',
                rejectBy: status === 'rejected' ? user?.UserId : '',
            }).unwrap();

            if (response?.status === 0) {
                throw new Error(response?.message || 'The server did not update this request.');
            }

            const savedStatus = String(response?.data?.approvalStatus || status).toLowerCase();
            try {
                socket.emit('onduty_Approval_Response', {
                    Idcard: item?.userdata?.Idcard || item?.userId || item?.idCard,
                    compcode: user?.GCOMPCODE,
                    status: savedStatus,
                    approved: savedStatus === 'approved',
                });
            } catch (socketError) {
                console.warn('[OndutyApprovalScreen] Unable to emit approval update:', socketError);
            }

            const employeeId = item?.userdata?.Idcard || item?.userId || item?.idCard;
            if (employeeId && refreshTokenData?.data?.token) {
                try {
                    const tokenResponse = await fetchEmployeeToken({ Idcard: employeeId }).unwrap();
                    const employeeToken = tokenResponse?.data?.fcm;
                    if (employeeToken) {
                        await _FCM_SENDER(
                            refreshTokenData.data.token,
                            employeeToken,
                            `${savedStatus === 'approved' ? '✔ APPROVED' : '❌ REJECTED'} your OnDuty request (${docid})`,
                            'OnDuty Request Update',
                        );
                    }
                } catch (notificationError) {
                    console.warn('[OndutyApprovalScreen] Unable to send approval notification:', notificationError);
                }
            }

            processedDocIdsRef.current.add(docid);
            setRequests(previous => previous.filter(request => String(request?.docid || request?.docId) !== docid));
            showMessage({
                message: `On-duty request ${savedStatus}`,
                description: `Request ${docid} was ${savedStatus}.`,
                type: savedStatus === 'approved' ? 'success' : 'danger',
            });

            await refetch?.();

            if (typeof params?.refresh === 'function') {
                try {
                    params.refresh({ force: true });
                } catch (refreshError) {
                    console.warn('[OndutyApprovalScreen] Unable to refresh notifications:', refreshError);
                }
            }

            if (navigation?.setParams) {
                try {
                    navigation.setParams({
                        docid: undefined,
                        docId: undefined,
                        all: Array.isArray(params?.all)
                            ? params.all.filter(r => String(r?.docid || r?.docId) !== docid)
                            : undefined,
                    });
                } catch {}
            }
        } catch (error) {
            showMessage({
                message: 'Unable to update request',
                description: getErrorMessage(error),
                type: 'danger',
            });
        } finally {
            processingDocIdRef.current = null;
            setProcessingDocId(null);
            setRejectModalItem(null);
            setRejectReasonInput('');
        }
    }, [fetchEmployeeToken, navigation, params, refetch, refreshTokenData, updateStatus, user]);

    const handleConfirmReject = useCallback(() => {
        if (!rejectModalItem) return;
        const reason = rejectReasonInput.trim();
        if (!reason) {
            showMessage({
                message: 'Rejection reason required',
                description: 'Please enter a reason before rejecting.',
                type: 'warning',
            });
            return;
        }
        handleAction(rejectModalItem, 'rejected', reason);
    }, [handleAction, rejectModalItem, rejectReasonInput]);

    const renderRequest = useCallback(
        ({ item }) => {
            const docid = String(item?.docid || item?.docId || '');
            return (
                <CompactRequestCard
                    item={item}
                    isBusy={processingDocId === docid}
                    onApprove={() => handleAction(item, 'approved')}
                    onRejectClick={() => {
                        setRejectModalItem(item);
                        setRejectReasonInput('');
                    }}
                    onPreviewPhoto={uri => setPreviewPhotoUri(uri)}
                    styles={styles}
                    theme={theme}
                />
            );
        },
        [handleAction, processingDocId, styles, theme]
    );

    const handleRefresh = useCallback(async () => {
        await refetch?.();
        if (typeof params?.refresh === 'function') {
            try {
                params.refresh({ force: true });
            } catch (err) {
                console.warn('[OndutyApprovalScreen] Refresh callback error:', err);
            }
        }
    }, [params, refetch]);

    const withPhotoCount = useMemo(() => requests.filter(r => !!r?.photo).length, [requests]);
    const withLocationCount = useMemo(
        () =>
            requests.filter(r => {
                const rawLat = r?.in_latitude ?? r?.inLatitude;
                const rawLng = r?.in_longtiude ?? r?.inLongtiude ?? r?.in_longitude ?? r?.inLongitude;
                const locStr = String(r?.inLocation || r?.in_location || '').trim();
                return !!(rawLat && rawLng) || (!!locStr && locStr.toLowerCase() !== 'location unavailable');
            }).length,
        [requests]
    );

    return (
        <View style={styles.screen}>
            {/* 1. Header Banner */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="briefcase-check-outline" size={22} color={theme.colors.brand} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>On-duty Approval</Text>
                    <Text style={styles.subtitle}>
                        {requests.length} {requests.length === 1 ? 'request' : 'requests'} pending • Swipe right to approve
                    </Text>
                </View>
            </View>

            {/* 2. Compact Search & Filter Section */}
            <View style={styles.filterSection}>
                <View style={styles.searchBox}>
                    <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search name, ID, doc, location..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {!!searchQuery ? (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={styles.clearBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Filter Chips */}
                <View style={styles.filterChipsRow}>
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'all' && styles.chipActive]}
                        onPress={() => setFilterType('all')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>
                            All ({requests.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'photo' && styles.chipActive]}
                        onPress={() => setFilterType('photo')}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="camera-outline"
                            size={13}
                            color={filterType === 'photo' ? theme.colors.brandContrast : theme.colors.textSecondary}
                            style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.chipText, filterType === 'photo' && styles.chipTextActive]}>
                            Photo ({withPhotoCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, filterType === 'location' && styles.chipActive]}
                        onPress={() => setFilterType('location')}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="map-marker-outline"
                            size={13}
                            color={filterType === 'location' ? theme.colors.brandContrast : theme.colors.textSecondary}
                            style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.chipText, filterType === 'location' && styles.chipTextActive]}>
                            Location ({withLocationCount})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 3. List of Compact Cards with Swipe Action */}
            <FlatList
                data={filteredRequests}
                renderItem={renderRequest}
                keyExtractor={(item, index) => String(item?.docid || item?.docId || item?.id || index)}
                contentContainerStyle={filteredRequests.length ? styles.listContent : styles.emptyContent}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={[styles.emptySubtitle, { marginTop: 12 }]}>Checking for pending on-duty requests...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="inbox-outline" size={44} color={theme.colors.textDisabled} />
                            <Text style={styles.emptyTitle}>
                                {searchQuery || filterType !== 'all' ? 'No matching requests' : 'No pending on-duty requests'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || filterType !== 'all' ? 'Try adjusting your search query or filter chips.' : 'All on-duty approval requests are up to date.'}
                            </Text>
                        </View>
                    )
                }
            />

            {/* ── Photo Preview Modal ────────────────────────────────────── */}
            <Modal
                visible={!!previewPhotoUri}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPreviewPhotoUri(null)}
            >
                <TouchableWithoutFeedback onPress={() => setPreviewPhotoUri(null)}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={styles.photoModalCard}>
                                <View style={styles.photoModalHeader}>
                                    <Text style={styles.photoModalTitle}>Attached Photo</Text>
                                    <TouchableOpacity onPress={() => setPreviewPhotoUri(null)}>
                                        <MaterialCommunityIcons name="close" size={22} color={theme.colors.text} />
                                    </TouchableOpacity>
                                </View>
                                {!!previewPhotoUri && (
                                    <Image
                                        source={{ uri: previewPhotoUri }}
                                        style={styles.fullPhoto}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ── Rejection Reason Modal ──────────────────────────────────── */}
            <Modal
                visible={!!rejectModalItem}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRejectModalItem(null)}
            >
                <TouchableWithoutFeedback onPress={() => setRejectModalItem(null)}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={styles.rejectModalCard}>
                                <View style={styles.rejectModalHeader}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.colors.danger} />
                                    <Text style={styles.rejectModalTitle}>Reject On-Duty Request</Text>
                                </View>

                                <Text style={styles.rejectModalSubtitle}>
                                    Please specify why you are rejecting request {rejectModalItem?.docid || rejectModalItem?.docId}:
                                </Text>

                                <TextInput
                                    value={rejectReasonInput}
                                    onChangeText={setRejectReasonInput}
                                    placeholder="Remarks"
                                    placeholderTextColor={theme.colors.placeholder}
                                    multiline
                                    autoFocus
                                    textAlignVertical="top"
                                    style={styles.modalRejectInput}
                                />

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalBtnCancel}
                                        onPress={() => setRejectModalItem(null)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalBtnReject}
                                        onPress={handleConfirmReject}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.modalBtnRejectText}>Confirm Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.backgroundSubtle },
    header: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md + 2,
        paddingVertical: theme.spacing.sm + 2,
        backgroundColor: theme.colors.brand,
    },
    headerIcon: {
        width: 38,
        height: 38,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.brandSoft,
        marginRight: theme.spacing.sm + 2,
    },
    headerText: { flex: 1 },
    title: {
        ...theme.typography.h4,
        color: theme.colors.brandContrast,
        fontSize: theme.fontSizes.lg,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },
    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.brandContrast,
        opacity: 0.85,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        marginTop: 2,
    },

    // Search and Filter Section
    filterSection: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.layout?.screenGutter || 16,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
        gap: 6,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.sm + 2,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        paddingHorizontal: theme.spacing.sm + 2,
        height: 36,
    },
    searchIcon: { marginRight: 6 },
    searchInput: {
        ...theme.typography.bodySmall,
        flex: 1,
        paddingVertical: 0,
        fontSize: theme.fontSizes.sm,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.text,
    },
    clearBtn: { padding: 4 },
    filterChipsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    chipActive: {
        backgroundColor: theme.colors.brand,
        borderColor: theme.colors.brand,
    },
    chipText: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamilies.medium,
        fontWeight: theme.fontWeights.medium,
    },
    chipTextActive: {
        color: theme.colors.brandContrast,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },

    listContent: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm + 2,
        paddingBottom: theme.spacing.xxxl,
        gap: theme.spacing.sm + 2,
    },
    emptyContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xxl,
        paddingBottom: theme.spacing.xxxl,
    },
    emptyState: { alignItems: 'center' },
    emptyTitle: {
        ...theme.typography.title,
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semiBold,
        fontFamily: theme.fontFamilies.semiBold,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: theme.lineHeights.sm,
    },

    // ── Swipeable Container Styles ──────────────────────────────────────────
    swipeContainer: {
        position: 'relative',
        borderRadius: theme.radii.md,
        overflow: 'hidden',
    },
    swipeAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        borderRadius: theme.radii.md,
    },
    swipeApprove: {
        backgroundColor: theme.colors.success,
        justifyContent: 'flex-start',
        gap: theme.spacing.sm,
    },
    swipeReject: {
        backgroundColor: theme.colors.danger,
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
    },
    swipeActionText: {
        ...theme.typography.button,
        color: '#FFFFFF',
        fontSize: theme.fontSizes.sm,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },
    swipeForeground: {
        backgroundColor: 'transparent',
    },

    // ── Compact Card Styles ─────────────────────────────────────────────────
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        elevation: 1.5,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.brand,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    headerInfo: { flex: 1 },
    employeeName: {
        ...theme.typography.subtitle,
        fontSize: theme.fontSizes.sm,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    employeeId: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    pendingBadge: {
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.warningSoft,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
    },
    pendingText: {
        ...theme.typography.overline,
        fontSize: theme.fontSizes.micro,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.warning,
    },

    infoGrid: {
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.sm,
        paddingHorizontal: 10,
        paddingVertical: theme.spacing.sm,
        gap: 6,
        marginBottom: 10,
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },
    gridCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flex: 1,
    },
    gridValue: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.medium,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.medium,
    },
    timeCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    timeBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    timeLabel: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.micro,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
    },
    timeValue: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.semiBold,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
    },
    timeDivider: {
        width: 1,
        height: 16,
        backgroundColor: theme.colors.borderSubtle,
    },
    addressSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    addressList: {
        flex: 1,
        gap: 6,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
    },
    locBadgeIn: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    locBadgeOut: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.brand,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    locBadgeOutPending: {
        backgroundColor: theme.colors.textMuted,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addressLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    addressValue: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.text,
        lineHeight: 16,
    },
    addressValueMuted: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    locationText: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    photoThumbContainer: {
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.brand,
        marginTop: 2,
    },
    photoThumb: {
        width: '100%',
        height: '100%',
    },
    thumbBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        padding: 1,
        borderTopLeftRadius: 4,
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingTop: 2,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.borderSubtle,
    },
    reasonTag: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.micro,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
    },
    reasonContent: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.micro,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textSecondary,
        flex: 1,
    },

    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    btnApprove: {
        flex: 1,
        height: 34,
        borderRadius: 6,
        backgroundColor: theme.colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    btnApproveText: {
        ...theme.typography.button,
        color: '#FFFFFF',
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },
    btnReject: {
        flex: 1,
        height: 34,
        borderRadius: 6,
        backgroundColor: theme.colors.danger,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    btnRejectText: {
        ...theme.typography.button,
        color: '#FFFFFF',
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },
    btnIcon: {
        width: 34,
        height: 34,
        borderRadius: 6,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDisabled: { opacity: 0.65 },

    // ── Modals Styles ───────────────────────────────────────────────────────
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    photoModalCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        width: '100%',
        maxWidth: 360,
        overflow: 'hidden',
        padding: theme.spacing.md + 2,
    },
    photoModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    photoModalTitle: {
        ...theme.typography.title,
        fontSize: theme.fontSizes.md,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.text,
    },
    fullPhoto: {
        width: '100%',
        height: 280,
        borderRadius: theme.radii.sm,
        backgroundColor: '#000000',
    },

    rejectModalCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        width: '100%',
        maxWidth: 360,
        padding: theme.spacing.lg,
    },
    rejectModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    rejectModalTitle: {
        ...theme.typography.title,
        fontSize: theme.fontSizes.md,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.danger,
    },
    rejectModalSubtitle: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
        lineHeight: theme.lineHeights.sm,
    },
    modalRejectInput: {
        ...theme.typography.bodySmall,
        minHeight: 80,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: theme.radii.sm,
        padding: 10,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.regular,
        color: theme.colors.text,
        backgroundColor: theme.colors.surfaceSunken,
        marginBottom: theme.spacing.lg,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalBtnCancel: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        backgroundColor: theme.colors.surfaceSunken,
    },
    modalBtnCancelText: {
        ...theme.typography.button,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamilies.semiBold,
        fontWeight: theme.fontWeights.semiBold,
    },
    modalBtnReject: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: theme.colors.danger,
    },
    modalBtnRejectText: {
        ...theme.typography.button,
        fontSize: theme.fontSizes.xs,
        color: '#FFFFFF',
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
    },
});
