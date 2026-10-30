import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
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

const getRequests = (params, apiData) => {
    const requests = [];

    if (params && typeof params === 'object') {
        const { all, refresh, ...clickedRequest } = params;
        const clickedDocid = clickedRequest?.docid || clickedRequest?.docId;
        if (clickedDocid) requests.push(clickedRequest);

        if (Array.isArray(all)) {
            requests.push(
                ...all.filter(request => String(request?.group || '').toLowerCase() === 'onduty'),
            );
        }
    }

    if (Array.isArray(apiData?.data)) {
        requests.push(
            ...apiData.data.filter(request => String(request?.group || '').toLowerCase() === 'onduty'),
        );
    }

    const seenDocIds = new Set();
    return requests.filter(request => {
        const docid = String(request?.docid || request?.docId || '').trim();
        if (!docid) return false;
        const status = String(request?.approvalStatus || 'pending').toLowerCase();
        if (status !== 'pending') return false;
        if (seenDocIds.has(docid)) return false;
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
    if (!value) return '—';
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

function ApprovalPhoto({ photo }) {
    const [hasError, setHasError] = useState(false);
    const uri = getPhotoUri(photo);

    useEffect(() => {
        setHasError(false);
    }, [uri]);

    if (!photo) return null;

    return (
        <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Attached photo</Text>
            {uri && !hasError ? (
                <Image
                    source={{ uri }}
                    style={styles.photo}
                    resizeMode="contain"
                    onError={() => setHasError(true)}
                    accessibilityLabel="On-duty request attachment"
                />
            ) : (
                <View style={[styles.photo, styles.photoFallback]}>
                    <MaterialCommunityIcons name="image-off-outline" size={28} color="#64748B" />
                    <Text style={styles.mutedText}>Photo unavailable</Text>
                </View>
            )}
        </View>
    );
}

function DetailRow({ label, value, icon }) {
    return (
        <View style={styles.detailRow}>
            <MaterialCommunityIcons name={icon} size={19} color="#64748B" />
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || '—'}</Text>
        </View>
    );
}

function RequestCard({ item, rejectionReason, setRejectionReason, isBusy, onApprove, onReject }) {
    const rawLatitude = item?.in_latitude ?? item?.inLatitude;
    const rawLongitude = item?.in_longtiude ?? item?.inLongtiude ?? item?.in_longitude ?? item?.inLongitude;
    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);
    const hasCoordinates = rawLatitude != null && String(rawLatitude).trim() !== ''
        && rawLongitude != null && String(rawLongitude).trim() !== ''
        && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
        && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;

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
    const inLocation =
        item?.in_location ||
        item?.inLocation ||
        (hasCoordinates ? `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : null) ||
        (item?.others && item.others !== 'ONDUTY' ? item.others : null) ||
        'Location unavailable';

    const phone =
        item?.userdata?.phone ||
        item?.userdata?.mobile ||
        item?.userData?.phone ||
        item?.userData?.mobile ||
        item?.mobile ||
        item?.phone;

    const openMap = async () => {
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
        <View style={styles.card}>
            <View style={styles.employeeHeader}>
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account-outline" size={26} color="#FFFFFF" />
                </View>
                <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>{employeeName}</Text>
                    {!!employeeId && <Text style={styles.mutedText}>{employeeId}</Text>}
                </View>
                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>PENDING</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <DetailRow label="Document" value={docid} icon="file-document-outline" />
            <DetailRow label="Date" value={formatDate(docdate)} icon="calendar-blank-outline" />
            <DetailRow label="Time" value={formatTime(inTime)} icon="clock-outline" />
            <DetailRow label="Location" value={inLocation} icon="map-marker-outline" />

            <View style={styles.reasonBox}>
                <Text style={styles.sectionTitle}>Reason</Text>
                <Text style={styles.reasonText}>{item?.others || 'No reason provided'}</Text>
            </View>

            <ApprovalPhoto photo={item?.photo} />

            {hasCoordinates && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={openMap}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Open request location in map"
                >
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={19} color="#1D4ED8" />
                    <Text style={styles.secondaryButtonText}>View location on map</Text>
                </TouchableOpacity>
            )}

            {!!phone && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={callEmployee}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${employeeName}`}
                >
                    <MaterialCommunityIcons name="phone-outline" size={19} color="#1D4ED8" />
                    <Text style={styles.secondaryButtonText}>Call employee</Text>
                </TouchableOpacity>
            )}

            <TextInput
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Reason for rejection (required to reject)"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                editable={!isBusy}
                accessibilityLabel="Reason for rejection"
                style={styles.rejectInput}
            />

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton, isBusy && styles.disabledButton]}
                    onPress={onApprove}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    {isBusy ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.actionText}>Approve</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton, isBusy && styles.disabledButton]}
                    onPress={onReject}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    <MaterialCommunityIcons name="close-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function OndutyApprovalScreen({ route }) {
    const user = useSelector(state => state.UserDetails);
    const params = route?.params;

    const isHodOrHr = user?.IDCARD == user?.hod || user?.IDCARD == user?.hr || user?.level != 'user';
    const queryParams = isHodOrHr
        ? { hod: user?.IDCARD, hr: user?.IDCARD }
        : { emp: user?.IDCARD };

    const { data: apiData, isLoading, refetch } = useGetPermissionRequestQuery(
        { params: queryParams },
        { skip: !user?.IDCARD, refetchOnMountOrArgChange: true }
    );

    const [requests, setRequests] = useState(() => getRequests(params, apiData));
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [processingDocId, setProcessingDocId] = useState(null);
    const processingDocIdRef = useRef(null);
    const [updateStatus] = useRequestOnduty_ApprovalMutation();
    const { data: refreshTokenData } = useGet_refresh_tokenQuery();
    const [fetchEmployeeToken] = useLazyGet_fcm_tokenQuery();

    useEffect(() => {
        setRequests(getRequests(params, apiData));
        setRejectionReasons({});
    }, [params, apiData]);

    const handleAction = useCallback(async (item, status) => {
        const docid = String(item?.docid || item?.docId || '');
        if (!docid || processingDocIdRef.current) return;

        const rejectionReason = String(rejectionReasons[docid] || '').trim();
        if (status === 'rejected' && !rejectionReason) {
            showMessage({
                message: 'Rejection reason required',
                description: 'Enter a reason before rejecting this request.',
                type: 'warning',
            });
            return;
        }

        processingDocIdRef.current = docid;
        setProcessingDocId(docid);
        try {
            const response = await updateStatus({
                approval: status,
                docid,
                reject_reason: status === 'rejected' ? rejectionReason : '',
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

            setRequests(previous => previous.filter(request => String(request?.docid || request?.docId) !== docid));
            setRejectionReasons(previous => ({ ...previous, [docid]: '' }));
            showMessage({
                message: `On-duty request ${savedStatus}`,
                description: `Request ${docid} was ${savedStatus}.`,
                type: savedStatus === 'approved' ? 'success' : 'danger',
            });

            refetch?.();

            if (typeof params?.refresh === 'function') {
                try {
                    params.refresh({ force: true });
                } catch (refreshError) {
                    console.warn('[OndutyApprovalScreen] Unable to refresh notifications:', refreshError);
                }
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
    }, [fetchEmployeeToken, params, refetch, refreshTokenData, rejectionReasons, updateStatus, user]);

    const renderRequest = useCallback(({ item }) => {
        const docid = String(item?.docid || item?.docId || '');
        return (
            <RequestCard
                item={item}
                rejectionReason={rejectionReasons[docid] || ''}
                setRejectionReason={value => setRejectionReasons(previous => ({
                    ...previous,
                    [docid]: value,
                }))}
                isBusy={processingDocId !== null}
                onApprove={() => handleAction(item, 'approved')}
                onReject={() => handleAction(item, 'rejected')}
            />
        );
    }, [handleAction, processingDocId, rejectionReasons]);

    return (
        <LinearGradient colors={['#F8FAFC', '#EEF2F7']} style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.title}>On-duty approval</Text>
                <Text style={styles.subtitle}>
                    {requests.length} {requests.length === 1 ? 'request' : 'requests'} pending
                </Text>
            </View>

            <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={(item, index) => String(item?.docid || item?.docId || item?.id || index)}
                contentContainerStyle={requests.length ? styles.listContent : styles.emptyContent}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={refetch}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={[styles.mutedText, { marginTop: 12 }]}>Checking for pending on-duty requests...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="inbox-outline" size={46} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No pending on-duty requests</Text>
                            <Text style={styles.mutedText}>All on-duty approval requests are up to date.</Text>
                        </View>
                    )
                }
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        alignItems: 'center',
    },
    title: {
        color: '#0F172A',
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 28,
    },
    emptyContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 36,
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyTitle: {
        color: '#334155',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 14,
        marginBottom: 6,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    employeeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#D97706',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    employeeDetails: {
        flex: 1,
    },
    employeeName: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '700',
    },
    mutedText: {
        color: '#64748B',
        fontSize: 13,
        marginTop: 3,
    },
    pendingBadge: {
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    pendingText: {
        color: '#92400E',
        fontSize: 10,
        fontWeight: '700',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    detailLabel: {
        color: '#64748B',
        fontSize: 13,
        width: 76,
        marginLeft: 9,
    },
    detailValue: {
        color: '#1E293B',
        fontSize: 14,
        flex: 1,
        marginLeft: 6,
    },
    reasonBox: {
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        padding: 12,
        marginTop: 3,
        marginBottom: 14,
    },
    sectionTitle: {
        color: '#92400E',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 5,
    },
    reasonText: {
        color: '#334155',
        fontSize: 14,
        lineHeight: 20,
    },
    photoSection: {
        marginBottom: 14,
    },
    photo: {
        width: '100%',
        height: 190,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    photoFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButton: {
        minHeight: 42,
        borderRadius: 9,
        backgroundColor: '#EFF6FF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    secondaryButtonText: {
        color: '#1D4ED8',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    rejectInput: {
        minHeight: 78,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 9,
        paddingHorizontal: 12,
        paddingTop: 10,
        color: '#0F172A',
        fontSize: 14,
        marginTop: 6,
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: '#15803D',
    },
    rejectButton: {
        backgroundColor: '#B91C1C',
    },
    disabledButton: {
        opacity: 0.65,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 7,
    },
});
