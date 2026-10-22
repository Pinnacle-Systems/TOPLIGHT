import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
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
import { _FCM_SENDER } from '../../components/utils/Fcm';
import socket from '../../utils/Socket';
import { useAppTheme } from '../../theme';

const getPermissionRequests = params => {
    if (!params || typeof params !== 'object') return [];
    const requests = [];
    const selectedRequest = { ...params };
    delete selectedRequest.all;
    delete selectedRequest.refresh;
    if (selectedRequest.docid) requests.push(selectedRequest);
    if (Array.isArray(params.all)) {
        requests.push(...params.all.filter(
            request => String(request?.group || '').toLowerCase() === 'permission',
        ));
    }

    const seenDocIds = new Set();
    return requests.filter(request => {
        const docid = String(request?.docid || '').trim();
        const status = String(request?.approvalStatus || 'pending').toLowerCase();
        if (!docid || status !== 'pending' || seenDocIds.has(docid)) return false;
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

function DetailRow({ label, value, icon, styles, theme }) {
    return (
        <View style={styles.detailRow}>
            <MaterialCommunityIcons name={icon} size={19} color={theme.colors.textMuted} />
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || '—'}</Text>
        </View>
    );
}

function PermissionRequestCard({ item, isBusy, isProcessing, onApprove, onReject, onCall, styles, theme }) {
    const employeeName = item?.userdata?.username || item?.username || 'Employee';
    const employeeId = item?.userdata?.Idcard || item?.userId || item?.IDCARD;
    const phone = item?.userdata?.phone || item?.userdata?.mobile || item?.mobile;

    return (
        <View style={styles.card}>
            <View style={styles.employeeHeader}>
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account-outline" size={25} color={theme.colors.brandContrast} />
                </View>
                <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>{employeeName}</Text>
                    <Text style={styles.mutedText}>{employeeId || 'ID unavailable'}</Text>
                </View>
                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>PENDING</Text>
                </View>
            </View>

            <View style={styles.divider} />
            <DetailRow styles={styles} theme={theme} label="Document" value={item?.docid} icon="file-document-outline" />
            <DetailRow styles={styles} theme={theme} label="Date" value={formatDate(item?.docDate || item?.docdate)} icon="calendar-blank-outline" />
            <DetailRow styles={styles} theme={theme} label="From" value={item?.fTime || item?.ftime} icon="clock-start" />
            <DetailRow styles={styles} theme={theme} label="To" value={item?.tTime || item?.ttime} icon="clock-end" />
            <DetailRow styles={styles} theme={theme} label="Duration" value={item?.thrs || item?.totalHours} icon="timer-outline" />
            {!!(item?.categoryName || item?.category) && (
                <DetailRow
                    styles={styles}
                    theme={theme}
                    label="Category"
                    value={item?.categoryName || item?.category}
                    icon="tag-outline"
                />
            )}

            <View style={styles.reasonBox}>
                <Text style={styles.sectionTitle}>Reason</Text>
                <Text style={styles.reasonText}>{item?.reason || 'No reason provided'}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton, isBusy && styles.disabledButton]}
                    onPress={onApprove}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    {isProcessing ? (
                        <ActivityIndicator color={theme.colors.brandContrast} size="small" />
                    ) : (
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.brandContrast} />
                    )}
                    <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton, isBusy && styles.disabledButton]}
                    onPress={onReject}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    <MaterialCommunityIcons name="close-circle-outline" size={20} color={theme.colors.brandContrast} />
                    <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
            </View>
            {!!phone && (
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={onCall}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                >
                    <MaterialCommunityIcons name="phone-outline" size={19} color={theme.colors.brand} />
                    <Text style={styles.callButtonText}>Call employee</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function PermissionApprovalScreen({ route }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const user = useSelector(state => state.UserDetails);
    const params = route?.params;
    const [requests, setRequests] = useState(() => getPermissionRequests(params));
    const [processingDocId, setProcessingDocId] = useState(null);
    const processingDocIdRef = useRef(null);
    const [updateStatus] = useRequestPermission_ApprovalMutation();
    const { data: refreshTokenData } = useGet_refresh_tokenQuery();
    const [fetchEmployeeToken] = useLazyGet_fcm_tokenQuery();

    useEffect(() => {
        setRequests(getPermissionRequests(params));
    }, [params]);

    const handleAction = useCallback(async (item, status) => {
        const docid = String(item?.docid || '').trim();
        if (!docid || processingDocIdRef.current) return;

        processingDocIdRef.current = docid;
        setProcessingDocId(docid);
        try {
            const response = await updateStatus({
                approval: status,
                docid,
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
                        await _FCM_SENDER(
                            refreshTokenData.data.token,
                            employeeToken,
                            `${savedStatus === 'approved' ? '✔ APPROVED' : '❌ REJECTED'} your permission request`,
                            'Permission Request Update',
                        );
                    }
                } catch (notificationError) {
                    console.warn('[PermissionApprovalScreen] Unable to send approval notification:', notificationError);
                }
            }

            setRequests(previous => previous.filter(request => String(request?.docid) !== docid));
            showMessage({
                message: `Permission request ${savedStatus}`,
                description: `Request ${docid} was ${savedStatus}.`,
                type: savedStatus === 'approved' ? 'success' : 'danger',
            });

            if (typeof params?.refresh === 'function') {
                try {
                    params.refresh({ force: true });
                } catch (refreshError) {
                    console.warn('[PermissionApprovalScreen] Unable to refresh notifications:', refreshError);
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
    }, [fetchEmployeeToken, params, refreshTokenData, updateStatus, user]);

    const callEmployee = useCallback(async item => {
        const number = String(
            item?.userdata?.phone || item?.userdata?.mobile || item?.mobile || '',
        ).replace(/[^\d+]/g, '');
        if (!number) return;
        try {
            const url = `tel:${number}`;
            if (await Linking.canOpenURL(url)) {
                await Linking.openURL(url);
            } else {
                throw new Error('Phone calls are not supported on this device.');
            }
        } catch (error) {
            showMessage({
                message: 'Unable to start a call',
                description: error?.message || 'Please try again.',
                type: 'danger',
            });
        }
    }, []);

    const renderRequest = useCallback(({ item }) => {
        const docid = String(item?.docid || '');
        return (
            <PermissionRequestCard
                item={item}
                isBusy={processingDocId !== null}
                isProcessing={processingDocId === docid}
                onApprove={() => handleAction(item, 'approved')}
                onReject={() => handleAction(item, 'rejected')}
                onCall={() => callEmployee(item)}
                styles={styles}
                theme={theme}
            />
        );
    }, [callEmployee, handleAction, processingDocId, styles, theme]);

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="account-check-outline" size={23} color={theme.colors.brandContrast} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Permission Approval</Text>
                    <Text style={styles.subtitle}>
                        {requests.length} {requests.length === 1 ? 'request' : 'requests'} pending
                    </Text>
                </View>
            </View>

            <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={(item, index) => String(item?.docid || item?.id || index)}
                contentContainerStyle={requests.length ? styles.listContent : styles.emptyContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={(
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="inbox-outline" size={46} color={theme.colors.textDisabled} />
                        <Text style={styles.emptyTitle}>No pending permission requests</Text>
                        <Text style={styles.emptySubtitle}>Open a permission approval notification to review a request.</Text>
                    </View>
                )}
            />
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.backgroundSubtle },
    header: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.brand,
    },
    headerIcon: {
        width: theme.controlSizes.avatarMd,
        height: theme.controlSizes.avatarMd,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.brandSoft,
        marginRight: theme.spacing.md,
    },
    headerText: { flex: 1 },
    title: { ...theme.typography.h4, color: theme.colors.brandContrast },
    subtitle: { ...theme.typography.caption, color: theme.colors.brandContrast, opacity: 0.75, marginTop: theme.spacing.xxs + 1 },
    listContent: { paddingHorizontal: theme.layout.screenGutter, paddingTop: theme.layout.screenGutter, paddingBottom: theme.spacing.xxl + theme.spacing.xs },
    emptyContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xxl, paddingBottom: theme.spacing.xxxl + theme.spacing.xs },
    emptyState: { alignItems: 'center' },
    emptyTitle: { ...theme.typography.h4, color: theme.colors.textSecondary, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs + 2 },
    emptySubtitle: { ...theme.typography.caption, color: theme.colors.textMuted, textAlign: 'center', lineHeight: theme.lineHeights.sm },
    card: {
        ...theme.styles.card,
        ...theme.styles.shadow,
        marginBottom: theme.spacing.lg,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.28 : 0.08,
        shadowRadius: theme.spacing.sm - 2,
    },
    employeeHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: theme.controlSizes.avatarLg - 10,
        height: theme.controlSizes.avatarLg - 10,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brand,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    employeeDetails: { flex: 1 },
    employeeName: { ...theme.typography.title, color: theme.colors.text },
    mutedText: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: theme.spacing.xxs + 1 },
    pendingBadge: { borderRadius: theme.radii.pill, backgroundColor: theme.colors.warningSoft, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs + 1 },
    pendingText: { ...theme.typography.overline, color: theme.colors.warning, letterSpacing: 0 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.divider, marginVertical: theme.spacing.lg },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.md },
    detailLabel: { ...theme.typography.caption, color: theme.colors.textMuted, width: 76, marginLeft: theme.spacing.sm + 1 },
    detailValue: { ...theme.typography.bodySmall, color: theme.colors.text, flex: 1, marginLeft: theme.spacing.xs + 2 },
    reasonBox: { backgroundColor: theme.colors.accentSoft, borderRadius: theme.radii.md, padding: theme.spacing.md, marginTop: theme.spacing.xxs + 1, marginBottom: theme.spacing.md },
    sectionTitle: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing.xs + 1 },
    reasonText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    actions: { flexDirection: 'row', gap: theme.spacing.sm + 2 },
    actionButton: {
        flex: 1,
        minHeight: theme.controlSizes.buttonHeightCompact + theme.spacing.xs + 2,
        borderRadius: theme.radii.sm,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveButton: { backgroundColor: theme.colors.success },
    rejectButton: { backgroundColor: theme.colors.danger },
    disabledButton: { opacity: 0.65 },
    actionText: { ...theme.typography.button, color: theme.colors.brandContrast, marginLeft: theme.spacing.xs + 3 },
    callButton: {
        minHeight: theme.controlSizes.buttonHeightCompact + theme.spacing.xs,
        borderRadius: theme.radii.sm,
        backgroundColor: theme.colors.brandSoft,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.sm + 2,
    },
    callButtonText: { ...theme.typography.label, color: theme.colors.brandStrong, marginLeft: theme.spacing.sm },
});
