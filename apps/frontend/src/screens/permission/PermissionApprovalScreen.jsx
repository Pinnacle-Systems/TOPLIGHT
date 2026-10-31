import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
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
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import { useRequestPermission_ApprovalMutation } from '../../store/api/PermissionApi';
import {
    useGet_refresh_tokenQuery,
    useLazyGet_fcm_tokenQuery,
} from '../../store/api/UserApi';
import { useGetPermissionRequestQuery } from '../../store/api/NotificationApi';
import { useGet__per_categoryQuery } from '../../store/api/PermissionApi';
import { _FCM_SENDER } from '../../components/utils/Fcm';
import socket from '../../utils/Socket';
import { useAppTheme } from '../../theme';

const getPermissionRequests = (params, apiData, processedDocIds) => {
    const requests = [];
    const hasLiveApiData = Array.isArray(apiData?.data);

    if (hasLiveApiData) {
        requests.push(...apiData.data.filter(
            request => String(request?.group || '').toLowerCase() === 'permission',
        ));
    } else if (params && typeof params === 'object') {
        const selectedRequest = { ...params };
        delete selectedRequest.all;
        delete selectedRequest.refresh;
        const clickedDocid = selectedRequest?.docid || selectedRequest?.docId;
        if (clickedDocid) requests.push(selectedRequest);
        if (Array.isArray(params.all)) {
            requests.push(...params.all.filter(
                request => String(request?.group || '').toLowerCase() === 'permission',
            ));
        }
    }

    const seenDocIds = new Set();
    return requests.filter(request => {
        const docid = String(request?.docid || request?.docId || '').trim();
        const status = String(request?.approvalStatus || 'pending').toLowerCase();
        if (!docid || status !== 'pending' || seenDocIds.has(docid)) return false;
        if (processedDocIds && processedDocIds.has(docid)) return false;
        seenDocIds.add(docid);
        return true;
    });
};

const formatDate = value => {
    if (!value) return '—';
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const getErrorMessage = error => {
    const message = error?.data?.message || error?.data?.error || error?.error || error?.message;
    return typeof message === 'string' && message.trim()
        ? message
        : 'Unable to update this permission request. Please try again.';
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
            <Animated.View style={[styles.swipeAction, styles.swipeApprove, { opacity: approveOpacity }]}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                <Text style={styles.swipeActionText}>Approve</Text>
            </Animated.View>

            <Animated.View style={[styles.swipeAction, styles.swipeReject, { opacity: rejectOpacity }]}>
                <Text style={styles.swipeActionText}>Reject</Text>
                <MaterialCommunityIcons name="close-circle" size={24} color="#FFFFFF" />
            </Animated.View>

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

// ── Compact Permission Request Card ─────────────────────────────────────────
function CompactPermissionCard({
    item,
    categoryMap,
    isBusy,
    onApprove,
    onReject,
    onCall,
    styles,
    theme,
}) {
    const employeeName =
        item?.userdata?.username ||
        item?.userdata?.userName ||
        item?.userData?.userName ||
        item?.userName ||
        item?.username ||
        item?.empName ||
        item?.empname ||
        'Employee';
    const employeeId =
        item?.userdata?.Idcard ||
        item?.userdata?.idCard ||
        item?.userData?.idCard ||
        item?.idCard ||
        item?.idcard ||
        item?.userId ||
        item?.IDCARD;
    const docid = item?.docid || item?.docId;
    const docdate = item?.docDate || item?.docdate || item?.createdAt;
    const phone =
        item?.userdata?.phone ||
        item?.userdata?.mobile ||
        item?.userData?.phone ||
        item?.userData?.mobile ||
        item?.mobile ||
        item?.phone;

    const rawCategory = item?.categoryName || item?.categoryData?.name || item?.category;
    const categoryDisplay =
        item?.categoryName ||
        item?.categoryData?.name ||
        (rawCategory != null && categoryMap?.[String(rawCategory)]) ||
        (item?.category != null && categoryMap?.[String(item?.category)]) ||
        (rawCategory != null && isNaN(Number(rawCategory)) ? String(rawCategory) : null);

    const fTime = item?.fTime || item?.ftime;
    const tTime = item?.tTime || item?.ttime;
    const duration = item?.thrs || item?.totalHours || item?.totalHrs;

    return (
        <SwipeableCard
            disabled={isBusy}
            onSwipeRight={onApprove}
            onSwipeLeft={onReject}
            styles={styles}
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
                    {!!categoryDisplay && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText} numberOfLines={1}>{categoryDisplay}</Text>
                        </View>
                    )}
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>PENDING</Text>
                    </View>
                </View>

                {/* 2. Compact Grid: Document, Date, Time Window, Duration */}
                <View style={styles.infoGrid}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="file-document-outline" size={15} color={theme.colors.textMuted} />
                            <Text style={styles.gridValue} numberOfLines={1}>{docid || '—'}</Text>
                        </View>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="calendar-outline" size={15} color={theme.colors.textMuted} />
                            <Text style={styles.gridValue} numberOfLines={1}>{formatDate(docdate)}</Text>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={[styles.gridCol, { flex: 1.4 }]}>
                            <MaterialCommunityIcons name="clock-time-four-outline" size={15} color={theme.colors.textMuted} />
                            <Text style={styles.gridValue} numberOfLines={1}>
                                {fTime || '—'} → {tTime || '—'}
                            </Text>
                        </View>
                        {!!duration && (
                            <View style={[styles.gridCol, { flex: 0.8 }]}>
                                <MaterialCommunityIcons name="timer-outline" size={15} color={theme.colors.brand} />
                                <Text style={styles.durationText} numberOfLines={1}>{duration}</Text>
                            </View>
                        )}
                    </View>

                    {/* Reason snippet */}
                    {!!item?.reason && (
                        <View style={styles.reasonRow}>
                            <Text style={styles.reasonTag}>Reason:</Text>
                            <Text style={styles.reasonContent} numberOfLines={1}>{item.reason}</Text>
                        </View>
                    )}
                </View>

                {/* 3. Action Bar */}
                <View style={styles.actionBar}>
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

                    <TouchableOpacity
                        style={[styles.btnReject, isBusy && styles.btnDisabled]}
                        onPress={onReject}
                        disabled={isBusy}
                        activeOpacity={0.85}
                    >
                        <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
                        <Text style={styles.btnRejectText}>Reject</Text>
                    </TouchableOpacity>

                    {!!phone && (
                        <TouchableOpacity
                            style={styles.btnIcon}
                            onPress={onCall}
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
export default function PermissionApprovalScreen({ route, navigation }) {
    const user = useSelector(state => state?.UserDetails);
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const params = route?.params;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const isHodOrHr = user?.IDCARD == user?.hod || user?.IDCARD == user?.hr || user?.level != 'user';
    const queryParams = isHodOrHr
        ? { hod: user?.IDCARD, hr: user?.IDCARD }
        : { emp: user?.IDCARD };

    const { data: apiData, isLoading, refetch } = useGetPermissionRequestQuery(
        { params: queryParams },
        { skip: !user?.IDCARD, refetchOnMountOrArgChange: true }
    );

    const { data: catApiData } = useGet__per_categoryQuery({ type: 'permission' });

    const categoryMap = useMemo(() => {
        const map = {};
        (catApiData?.data || []).forEach(cat => {
            const id = cat?.value ?? cat?.id;
            const name = cat?.label ?? cat?.name;
            if (id != null && name) {
                map[String(id)] = name;
            }
        });
        return map;
    }, [catApiData?.data]);

    const processedDocIdsRef = useRef(new Set());
    const [requests, setRequests] = useState(() => getPermissionRequests(params, apiData, processedDocIdsRef.current));
    const [processingDocId, setProcessingDocId] = useState(null);
    const processingDocIdRef = useRef(null);

    // Rejection reason modal state
    const [rejectModalItem, setRejectModalItem] = useState(null);
    const [rejectReasonInput, setRejectReasonInput] = useState('');
    const [updateStatus] = useRequestPermission_ApprovalMutation();
    const { data: refreshTokenData } = useGet_refresh_tokenQuery();
    const [fetchEmployeeToken] = useLazyGet_fcm_tokenQuery();

    useEffect(() => {
        setRequests(getPermissionRequests(params, apiData, processedDocIdsRef.current));
    }, [params, apiData]);

    // Unique categories from current requests for filter chips
    const uniqueCategories = useMemo(() => {
        const set = new Set();
        (requests || []).forEach(r => {
            const rawCat = r?.categoryName || r?.categoryData?.name || r?.category;
            const catName =
                r?.categoryName ||
                r?.categoryData?.name ||
                (rawCat != null && categoryMap?.[String(rawCat)]) ||
                (rawCat != null && isNaN(Number(rawCat)) ? String(rawCat) : null);
            if (catName) set.add(catName);
        });
        return Array.from(set);
    }, [requests, categoryMap]);

    const filteredRequests = useMemo(() => {
        return requests.filter(item => {
            const rawCat = item?.categoryName || item?.categoryData?.name || item?.category;
            const catName =
                item?.categoryName ||
                item?.categoryData?.name ||
                (rawCat != null && categoryMap?.[String(rawCat)]) ||
                (rawCat != null && isNaN(Number(rawCat)) ? String(rawCat) : null);

            if (selectedCategory !== 'all' && catName !== selectedCategory) {
                return false;
            }

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const empName = String(
                item?.userdata?.username ||
                item?.userdata?.userName ||
                item?.userData?.userName ||
                item?.userName ||
                item?.username ||
                item?.empName ||
                item?.empname ||
                ''
            ).toLowerCase();
            const empId = String(
                item?.userdata?.Idcard ||
                item?.userdata?.idCard ||
                item?.userData?.idCard ||
                item?.idCard ||
                item?.idcard ||
                item?.userId ||
                item?.IDCARD ||
                ''
            ).toLowerCase();
            const doc = String(item?.docid || item?.docId || '').toLowerCase();
            const reason = String(item?.reason || '').toLowerCase();
            const cat = String(catName || '').toLowerCase();

            return empName.includes(q) || empId.includes(q) || doc.includes(q) || reason.includes(q) || cat.includes(q);
        });
    }, [requests, selectedCategory, searchQuery, categoryMap]);

    const handleAction = useCallback(async (item, status, customReason = '') => {
        const docid = String(item?.docid || item?.docId || '').trim();
        if (!docid || processingDocIdRef.current) return;

        processingDocIdRef.current = docid;
        setProcessingDocId(docid);
        try {
            const response = await updateStatus({
                approval: status,
                docid,
                rejectRemark: status === 'rejected' ? customReason : '',
                reject_reason: status === 'rejected' ? customReason : '',
                rejectReason: status === 'rejected' ? customReason : '',
                approvedBy: status === 'approved' ? user?.UserId : '',
                rejectBy: status === 'rejected' ? user?.UserId : '',
            }).unwrap();

            if (Number(response?.status) !== 1) {
                throw new Error(response?.message || 'The server did not update this request.');
            }

            const savedStatus = String(response?.data?.approvalStatus || status).toLowerCase();
            const employeeId = item?.userdata?.Idcard || item?.userId || item?.IDCARD;
            try {
                socket.emit('Approval_Response', {
                    Idcard: employeeId,
                    compcode: user?.GCOMPCODE,
                    status: savedStatus,
                    approved: savedStatus === 'approved',
                });
            } catch (socketError) {
                console.warn('[PermissionApprovalScreen] Unable to emit approval update:', socketError);
            }

            if (employeeId && refreshTokenData?.data?.token) {
                try {
                    const tokenResponse = await fetchEmployeeToken({ Idcard: employeeId }).unwrap();
                    const employeeToken = tokenResponse?.data?.fcm;
                    if (employeeToken) {
                        const notifBody = savedStatus === 'approved'
                            ? '✔ APPROVED your permission request'
                            : `❌ REJECTED your permission request${customReason ? `: ${customReason}` : ''}`;
                        await _FCM_SENDER(
                            refreshTokenData.data.token,
                            employeeToken,
                            notifBody,
                            'Permission Request Update',
                        );
                    }
                } catch (notificationError) {
                    console.warn('[PermissionApprovalScreen] Unable to send approval notification:', notificationError);
                }
            }

            processedDocIdsRef.current.add(docid);
            setRequests(previous => previous.filter(request => String(request?.docid || request?.docId) !== docid));
            showMessage({
                message: `Permission request ${savedStatus}`,
                description: `Request ${docid} was ${savedStatus}.`,
                type: savedStatus === 'approved' ? 'success' : 'danger',
            });

            await refetch?.();

            if (typeof params?.refresh === 'function') {
                try {
                    params.refresh({ force: true });
                } catch (refreshError) {
                    console.warn('[PermissionApprovalScreen] Unable to refresh notifications:', refreshError);
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
        setRejectModalItem(null);
        handleAction(rejectModalItem, 'rejected', reason);
    }, [handleAction, rejectModalItem, rejectReasonInput]);

    const callEmployee = useCallback(async item => {
        const rawPhone =
            item?.userdata?.phone ||
            item?.userdata?.mobile ||
            item?.userData?.phone ||
            item?.userData?.mobile ||
            item?.mobile ||
            item?.phone ||
            '';
        const number = String(rawPhone).replace(/[^\d+]/g, '');
        if (!number) {
            showMessage({
                message: 'Cannot start call',
                description: 'No phone number available for this employee.',
                type: 'warning',
            });
            return;
        }
        try {
            const url = `tel:${number}`;
            await Linking.openURL(url);
        } catch (error) {
            showMessage({
                message: 'Unable to start a call',
                description: error?.message || 'Could not open phone dialer on this device.',
                type: 'danger',
            });
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        await refetch?.();
        if (typeof params?.refresh === 'function') {
            try {
                params.refresh({ force: true });
            } catch (err) {
                console.warn('[PermissionApprovalScreen] Refresh callback error:', err);
            }
        }
    }, [params, refetch]);

    const renderRequest = useCallback(({ item }) => {
        const docid = String(item?.docid || item?.docId || '');
        return (
            <CompactPermissionCard
                item={item}
                categoryMap={categoryMap}
                isBusy={processingDocId === docid}
                onApprove={() => handleAction(item, 'approved')}
                onReject={() => {
                    setRejectModalItem(item);
                    setRejectReasonInput('');
                }}
                onCall={() => callEmployee(item)}
                styles={styles}
                theme={theme}
            />
        );
    }, [callEmployee, categoryMap, handleAction, processingDocId, styles, theme]);

    return (
        <View style={styles.screen}>
            {/* 1. Header Banner */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="account-check-outline" size={22} color={theme.colors.brand} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Permission Approval</Text>
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
                        placeholder="Search name, ID, doc, category..."
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
                        style={[styles.chip, selectedCategory === 'all' && styles.chipActive]}
                        onPress={() => setSelectedCategory('all')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive]}>
                            All ({requests.length})
                        </Text>
                    </TouchableOpacity>
                    {uniqueCategories.map(cat => {
                        const count = requests.filter(r => {
                            const rawCat = r?.categoryName || r?.categoryData?.name || r?.category;
                            return (
                                r?.categoryName === cat ||
                                r?.categoryData?.name === cat ||
                                categoryMap?.[String(rawCat)] === cat ||
                                (isNaN(Number(rawCat)) && String(rawCat) === cat)
                            );
                        }).length;
                        const isSelected = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, isSelected && styles.chipActive]}
                                onPress={() => setSelectedCategory(isSelected ? 'all' : cat)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                    {cat} ({count})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
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
                            <Text style={[styles.emptySubtitle, { marginTop: 12 }]}>Checking for pending permission requests...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="inbox-outline" size={44} color={theme.colors.textDisabled} />
                            <Text style={styles.emptyTitle}>
                                {searchQuery || selectedCategory !== 'all' ? 'No matching requests' : 'No pending permission requests'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || selectedCategory !== 'all' ? 'Try adjusting your search query or filters.' : 'All permission requests are up to date.'}
                            </Text>
                        </View>
                    )
                }
            />

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
                                    <Text style={styles.rejectModalTitle}>Reject Permission Request</Text>
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
        flexWrap: 'wrap',
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
    categoryBadge: {
        borderRadius: theme.radii.xs,
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 6,
        maxWidth: 100,
    },
    categoryBadgeText: {
        ...theme.typography.overline,
        fontSize: theme.fontSizes.micro,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brandStrong,
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
    durationText: {
        ...theme.typography.caption,
        fontSize: theme.fontSizes.xs,
        fontFamily: theme.fontFamilies.bold,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.brand,
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

    // ── Rejection Reason Modal Styles ────────────────────────────────────────
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
