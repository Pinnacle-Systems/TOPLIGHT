import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Linking,
    Modal,
    PanResponder,
    RefreshControl,
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
import { useGetEmployeeIdsWithAttQuery } from '../../store/api/UserApi';
import { useGetAttendanceApprovalListQuery, useRequestAttendance_ApprovalMutation } from '../../store/api/AttendanceApi';
import { useAppTheme } from '../../theme';
import socket from '../../utils/Socket';

const formatTimeIST = (val) => {
    if (!val || val === '--:--' || val === '-' || val === 'null' || val === 'undefined') return '--:--';
    const str = String(val).trim();
    if (/am|pm/i.test(str)) return str.toUpperCase();
    const parts = str.split(':');
    if (parts.length >= 2) {
        let h = parseInt(parts[0], 10);
        const m = String(parts[1]).padStart(2, '0');
        if (isNaN(h)) return str;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }
    const parsed = moment(str, [
        'HH:mm:ss',
        'HH:mm',
        'H:m:s',
        'H:m',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss',
        moment.ISO_8601,
    ]);
    if (parsed.isValid()) {
        return parsed.format('hh:mm A');
    }
    return str;
};

const formatHumanDuration = (val, totalPunches = 1) => {
    if (!val || val === '--:--' || val === '-' || val === 'null' || val === 'undefined') {
        return totalPunches === 0 ? '--' : '0m';
    }
    let totalSec = 0;
    if (typeof val === 'number') {
        totalSec = val;
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (/[hm]/i.test(trimmed) && !trimmed.includes(':')) return trimmed;
        const parts = trimmed.split(':').map(Number);
        if (parts.length === 3) {
            totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        } else if (parts.length === 2) {
            totalSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60;
        } else {
            const num = Number(trimmed);
            if (!isNaN(num)) totalSec = num;
        }
    }
    if (totalSec <= 0) return totalPunches === 0 ? '--' : '0m';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0 && m === 0) return `${h}h 0m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
};

const displayTime = (val) => formatTimeIST(val);

const formatDisplayDate = (d) => {
    if (!d) return 'Today';
    const m = moment(d);
    if (!m.isValid()) return String(d);
    if (m.isSame(moment(), 'day')) return `Today, ${m.format('DD MMM')}`;
    if (m.isSame(moment().subtract(1, 'day'), 'day')) return `Yesterday, ${m.format('DD MMM')}`;
    return m.format('DD MMM YYYY');
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
                            bounciness: 5,
                            useNativeDriver: true,
                        }).start();
                    }
                },
            }),
        [disabled, onSwipeRight, onSwipeLeft, styles],
    );

    return (
        <View style={styles.swipeContainer}>
            <View style={[styles.swipeAction, styles.swipeApprove]}>
                <MaterialCommunityIcons name="check-bold" size={24} color="#FFFFFF" />
                <Text style={styles.swipeActionText}>Approve</Text>
            </View>
            <View style={[styles.swipeAction, styles.swipeReject]}>
                <Text style={styles.swipeActionText}>Reject</Text>
                <MaterialCommunityIcons name="close-thick" size={24} color="#FFFFFF" />
            </View>
            <Animated.View
                style={[styles.swipeForeground, { transform: [{ translateX: panX }] }]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

// ── Attendance Item Card ────────────────────────────────────────────────────
function AttendanceCard({
    item,
    isBusy,
    onApprove,
    onReject,
    onCall,
    styles,
    theme,
}) {
    const [expanded, setExpanded] = useState(false);

    const employeeName =
        item?.empname ||
        item?.empName ||
        item?.userName ||
        item?.username ||
        item?.userdata?.username ||
        item?.userdata?.userName ||
        'Employee';

    const employeeId =
        item?.idcard ||
        item?.idCard ||
        item?.IDCARD ||
        item?.userId ||
        '—';

    const deptName = item?.deptname || item?.deptName || item?.DEPTNAME || '';
    const compCode = item?.compcode || item?.compCode || item?.COMPCODE || '';
    const punches = Array.isArray(item?.punches) ? item.punches : [];
    const lastInout = item?.lastInout == null ? null : String(item.lastInout);
    const isPunchedIn = lastInout === '1';
    const isPunchedOut = lastInout === '0';

    const statusText = isPunchedIn
        ? 'PUNCHED IN'
        : isPunchedOut
            ? 'PUNCHED OUT'
            : 'NO PUNCHES';

    const statusBg = isPunchedIn
        ? theme.colors.successSoft
        : isPunchedOut
            ? theme.colors.warningSoft
            : theme.colors.surfaceSunken;

    const statusColor = isPunchedIn
        ? theme.colors.success
        : isPunchedOut
            ? theme.colors.warning
            : theme.colors.textMuted;

    const totalPunches = Number(item?.totalPunches ?? punches.length);
    const punchIn = formatTimeIST(item?.punchIn || item?.PUNCHIN || item?.inTime);
    const punchOut = formatTimeIST(item?.punchOut || item?.PUNCHOUT || item?.outTime);
    const totalTime = formatHumanDuration(item?.totalTimeFormatted || '00:00', totalPunches);
    const phone = item?.phone || item?.mobile || item?.userdata?.phone || item?.userdata?.mobile;
    const displayDate = formatDisplayDate(
        item?.dateStr || item?.attDateStr || item?.date || item?.docdate || item?.docDate || item?.createdAt
    );

    return (
        <SwipeableCard
            disabled={isBusy}
            onSwipeRight={onApprove}
            onSwipeLeft={onReject}
            styles={styles}
        >
            <View style={styles.card}>
                {/* 1. Header: Avatar + Employee Name + ID + Department + Date + Status Badge */}
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="account" size={18} color={theme.colors.brandContrast} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.employeeName} numberOfLines={1}>{employeeName}</Text>
                        <View style={styles.subInfoRow}>
                            <Text style={styles.employeeId}>
                                {employeeId}{compCode ? ` · ${compCode}` : ''}
                            </Text>
                            <View style={styles.dateBadge}>
                                <MaterialCommunityIcons name="calendar-clock" size={12} color={theme.colors.brand} />
                                <Text style={styles.dateBadgeText}>{displayDate}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                </View>

                {/* 2. Compact Metrics Grid: In, Out, Total Worked, Punches */}
                <View style={styles.infoGrid}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="clock-in" size={15} color={theme.colors.success} />
                            <Text style={styles.gridLabel}>In:</Text>
                            <Text style={styles.gridValue} numberOfLines={1}>{punchIn}</Text>
                        </View>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="clock-out" size={15} color={theme.colors.danger} />
                            <Text style={styles.gridLabel}>Out:</Text>
                            <Text style={styles.gridValue} numberOfLines={1}>{punchOut}</Text>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="timer-outline" size={15} color={theme.colors.brand} />
                            <Text style={styles.gridLabel}>Worked:</Text>
                            <Text style={styles.durationText} numberOfLines={1}>{totalTime}</Text>
                        </View>
                        <View style={styles.gridCol}>
                            <MaterialCommunityIcons name="format-list-numbered" size={15} color={theme.colors.textMuted} />
                            <Text style={styles.gridLabel}>Punches:</Text>
                            <Text style={styles.gridValue} numberOfLines={1}>{totalPunches}</Text>
                        </View>
                    </View>

                    {/* Expandable Punches Breakdown */}
                    {punches.length > 0 && (
                        <TouchableOpacity
                            style={styles.expandHeader}
                            onPress={() => setExpanded(!expanded)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.expandHeaderText}>
                                {expanded ? 'Hide Punch Log' : `View Punch Log (${punches.length})`}
                            </Text>
                            <MaterialCommunityIcons
                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={theme.colors.brand}
                            />
                        </TouchableOpacity>
                    )}

                    {expanded && punches.length > 0 && (
                        <View style={styles.punchesContainer}>
                            {punches.map((p, idx) => {
                                const isPunchIn = Number(p?.inout) === 1;
                                return (
                                    <View key={idx} style={styles.punchItem}>
                                        <View style={styles.punchTypeWrap}>
                                            <MaterialCommunityIcons
                                                name={isPunchIn ? 'login' : 'logout'}
                                                size={13}
                                                color={isPunchIn ? theme.colors.success : theme.colors.danger}
                                            />
                                            <Text
                                                style={[
                                                    styles.punchTypeText,
                                                    { color: isPunchIn ? theme.colors.success : theme.colors.danger },
                                                ]}
                                            >
                                                {isPunchIn ? 'IN' : 'OUT'}
                                            </Text>
                                        </View>
                                        <Text style={styles.punchTimeText}>{formatTimeIST(p?.atttime)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* 3. Action Bar: Approve, Reject, Call */}
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

// ── Main Attendance Approval Screen ─────────────────────────────────────────
export default function AttendanceApprovalScreen({ route, navigation }) {
    const user = useSelector(state => state?.UserDetails);
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const params = route?.params;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('all'); // 'all' | 'in' | 'out' | deptName
    const [processedIds, setProcessedIds] = useState(new Set());
    const [processingId, setProcessingId] = useState(null);

    // Reject Modal state
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectTargetItem, setRejectTargetItem] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const userIdcard = user?.IDCARD || user?.UserId || user?.Id;
    const isHodOrHr = user?.IDCARD == user?.hod || user?.IDCARD == user?.hr || user?.level != 'user';

    const {
        data: attendanceApprovalData,
        isFetching,
        isLoading,
        refetch,
    } = useGetAttendanceApprovalListQuery(undefined, { refetchOnMountOrArgChange: true });

    const [updateAttendanceApproval, { isLoading: isApprovalSubmitting }] = useRequestAttendance_ApprovalMutation();

    const {
        data: employeeAttendanceData,
    } = useGetEmployeeIdsWithAttQuery(
        { hod: userIdcard, hr: userIdcard },
        { skip: !userIdcard }
    );

    // Strictly consolidate & group attendance records by Employee and Date
    const consolidatedList = useMemo(() => {
        const sourceList = [];
        if (Array.isArray(attendanceApprovalData?.data) && attendanceApprovalData.data.length > 0) {
            sourceList.push(...attendanceApprovalData.data);
        }

        // Only accept items belonging to attendance group from params (exclude leave/permission/onduty)
        const isAtt = (item) => {
            const g = String(item?.group || '').toLowerCase();
            return g === 'attendance' || g === 'att';
        };

        if (params && typeof params === 'object') {
            if (isAtt(params)) {
                sourceList.push(params);
            }
            if (Array.isArray(params.all)) {
                params.all.filter(isAtt).forEach(p => sourceList.push(p));
            }
        }

        // Consolidate by Employee + Date
        const grouped = {};
        sourceList.forEach(item => {
            if (!item) return;
            const empId = String(item.idcard || item.idCard || item.IDCARD || item.userId || '').trim();
            if (!empId) return;

            // Normalize date to YYYY-MM-DD
            const rawDate = item.dateStr || item.attDateStr || item.date || item.docdate || item.docDate || item.createdAt;
            const dateStr = rawDate ? moment(rawDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
            const groupKey = `${empId}_${dateStr}`;

            if (!grouped[groupKey]) {
                grouped[groupKey] = {
                    ...item,
                    id: item.id || `ATT-${empId}-${dateStr}`,
                    docid: item.docid || item.docId || `ATT-${empId}-${dateStr}`,
                    idcard: empId,
                    idCard: empId,
                    dateStr: dateStr,
                    attDateStr: dateStr,
                    docdate: item.docdate || dateStr,
                    punches: Array.isArray(item.punches) ? [...item.punches] : [],
                };
            } else {
                // Merge punches if any
                const existingPunches = grouped[groupKey].punches || [];
                const newPunches = Array.isArray(item.punches) ? item.punches : [];
                const seenPunch = new Set(existingPunches.map(p => `${p.atttime}_${p.pmno ?? p.inout}`));
                newPunches.forEach(p => {
                    const pk = `${p.atttime}_${p.pmno ?? p.inout}`;
                    if (!seenPunch.has(pk)) {
                        seenPunch.add(pk);
                        existingPunches.push(p);
                    }
                });
                grouped[groupKey].punches = existingPunches;
            }
        });

        const list = Object.values(grouped).map(item => {
            const punches = item.punches || [];
            punches.sort((a, b) => {
                const parseT = (t) => {
                    if (!t) return 0;
                    const parts = String(t).split(':').map(Number);
                    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                };
                return parseT(a.atttime) - parseT(b.atttime);
            });

            const firstIn = punches.find(p => Number(p.pmno) === 1 || Number(p.inout) === 1);
            const lastOut = [...punches].reverse().find(p => Number(p.pmno) === 2 || Number(p.inout) === 0);
            const lastPunch = punches[punches.length - 1];

            if (firstIn && (!item.punchIn || item.punchIn === '--:--')) item.punchIn = firstIn.atttime;
            if (lastOut && (!item.punchOut || item.punchOut === '--:--')) item.punchOut = lastOut.atttime;
            if (lastPunch) {
                const isPunchIn = Number(lastPunch.pmno) === 1 || Number(lastPunch.inout) === 1;
                item.lastInout = isPunchIn ? 1 : 0;
            }
            item.totalPunches = punches.length;

            return item;
        });

        // Sort by date DESC, then employee name / id
        list.sort((a, b) => {
            const dA = a.dateStr || a.attDateStr || '';
            const dB = b.dateStr || b.attDateStr || '';
            if (dA !== dB) return dB.localeCompare(dA);
            return String(a.empname || a.idcard).localeCompare(String(b.empname || b.idcard));
        });

        return list;
    }, [attendanceApprovalData?.data, params]);

    // Filter out locally processed (approved/rejected) items
    const pendingList = useMemo(() => {
        return consolidatedList.filter(item => {
            const idKey = String(item?.id || item?.idcard || item?.docid || '').trim();
            if (!idKey || processedIds.has(idKey)) return false;
            return true;
        });
    }, [consolidatedList, processedIds]);

    // Unique departments for filter chips
    const departments = useMemo(() => {
        const set = new Set();
        pendingList.forEach(item => {
            const d = item?.deptname || item?.deptName || item?.DEPTNAME;
            if (d && String(d).trim()) set.add(String(d).trim());
        });
        return Array.from(set);
    }, [pendingList]);

    // Filtered attendance list by search & tab
    const filteredList = useMemo(() => {
        return pendingList.filter(item => {
            const lastInout = item?.lastInout == null ? null : String(item.lastInout);
            const dept = String(item?.deptname || item?.deptName || item?.DEPTNAME || '').trim();
            const rawDate = item?.dateStr || item?.attDateStr || item?.docdate || '';
            const isToday = rawDate ? moment(rawDate).isSame(moment(), 'day') : false;

            if (selectedTab === 'in' && lastInout !== '1') return false;
            if (selectedTab === 'out' && lastInout !== '0') return false;
            if (selectedTab === 'today' && !isToday) return false;
            if (
                selectedTab !== 'all' &&
                selectedTab !== 'in' &&
                selectedTab !== 'out' &&
                selectedTab !== 'today' &&
                dept !== selectedTab
            ) {
                return false;
            }

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const empName = String(item?.empname || item?.empName || item?.userName || '').toLowerCase();
            const empId = String(item?.idcard || item?.idCard || item?.IDCARD || '').toLowerCase();
            const comp = String(item?.compcode || item?.COMPCODE || '').toLowerCase();
            const department = dept.toLowerCase();
            const dateStr = String(item?.dateStr || item?.attDateStr || '').toLowerCase();
            const formattedDate = formatDisplayDate(rawDate).toLowerCase();

            return (
                empName.includes(q) ||
                empId.includes(q) ||
                comp.includes(q) ||
                department.includes(q) ||
                dateStr.includes(q) ||
                formattedDate.includes(q)
            );
        });
    }, [pendingList, selectedTab, searchQuery]);

    // Handle Approve Action (Updates APPROVAL_STATUS in PSSATT)
    const handleApprove = useCallback(async (item) => {
        const idKey = String(item?.id || item?.idcard || item?.docid || '').trim();
        if (!idKey) return;

        setProcessingId(idKey);
        try {
            const punchUnqids = (item?.punches || []).map(p => p.unqid).filter(Boolean);
            const approverIdcard = String(user?.IDCARD || user?.UserId || user?.idCard || user?.Id || '').trim();
            await updateAttendanceApproval({
                idcard: item?.idcard || item?.idCard,
                attdate: item?.dateStr || item?.attDateStr || item?.docdate,
                unqids: punchUnqids,
                approval: 'approved',
                approvedBy: approverIdcard || user?.userName || 'Approver',
                compcode: user?.GCOMPCODE || item?.compcode,
            }).unwrap();

            setProcessedIds(prev => new Set([...prev, idKey]));
            refetch?.();

            const empName = item?.empname || item?.empName || item?.idcard || 'Employee';
            showMessage({
                message: 'Attendance Approved',
                description: `Attendance record approved for ${empName}`,
                type: 'success',
                backgroundColor: theme.colors.success,
                color: '#FFFFFF',
                icon: { icon: 'success', position: 'left' },
                duration: 3500,
            });

            // Emit socket if available
            try {
                socket.emit('Attendance_Approval_Response', {
                    Idcard: item?.idcard,
                    compcode: user?.GCOMPCODE,
                    status: 'approved',
                    approved: true,
                });
            } catch (err) {
                console.warn('[AttendanceApprovalScreen] Socket emit error:', err);
            }
        } catch (err) {
            console.error('[AttendanceApprovalScreen] Approve error:', err);
            showMessage({
                message: 'Approval Failed',
                description: err?.data?.message || err?.message || 'Could not update approval status.',
                type: 'danger',
            });
        } finally {
            setProcessingId(null);
        }
    }, [theme, user, updateAttendanceApproval, refetch]);

    // Open Reject Modal
    const handleOpenRejectModal = useCallback((item) => {
        setRejectTargetItem(item);
        setRejectReason('');
        setRejectModalVisible(true);
    }, []);

    // Confirm Rejection (Updates APPROVAL_STATUS and REJECTED_REASON in PSSATT)
    const handleConfirmReject = useCallback(async () => {
        if (!rejectTargetItem) return;
        const idKey = String(rejectTargetItem?.id || rejectTargetItem?.idcard || rejectTargetItem?.docid || '').trim();
        if (!idKey) return;

        const empName = rejectTargetItem?.empname || rejectTargetItem?.empName || rejectTargetItem?.idcard || 'Employee';
        setRejectModalVisible(false);
        setProcessingId(idKey);

        try {
            const punchUnqids = (rejectTargetItem?.punches || []).map(p => p.unqid).filter(Boolean);
            const rejecterIdcard = String(user?.IDCARD || user?.UserId || user?.idCard || user?.Id || '').trim();
            await updateAttendanceApproval({
                idcard: rejectTargetItem?.idcard || rejectTargetItem?.idCard,
                attdate: rejectTargetItem?.dateStr || rejectTargetItem?.attDateStr || rejectTargetItem?.docdate,
                unqids: punchUnqids,
                approval: 'rejected',
                rejectBy: rejecterIdcard || user?.userName || 'Approver',
                rejectRemark: rejectReason || 'Rejected by supervisor',
                compcode: user?.GCOMPCODE || rejectTargetItem?.compcode,
            }).unwrap();

            setProcessedIds(prev => new Set([...prev, idKey]));
            refetch?.();

            showMessage({
                message: 'Attendance Rejected',
                description: `Attendance record rejected for ${empName}${rejectReason ? `: ${rejectReason}` : ''}`,
                type: 'danger',
                backgroundColor: theme.colors.danger,
                color: '#FFFFFF',
                icon: { icon: 'danger', position: 'left' },
                duration: 3500,
            });

            // Emit socket if available
            try {
                socket.emit('Attendance_Approval_Response', {
                    Idcard: rejectTargetItem?.idcard,
                    compcode: user?.GCOMPCODE,
                    status: 'rejected',
                    approved: false,
                    reason: rejectReason,
                });
            } catch (err) {
                console.warn('[AttendanceApprovalScreen] Socket emit error:', err);
            }
        } catch (err) {
            console.error('[AttendanceApprovalScreen] Reject error:', err);
            showMessage({
                message: 'Rejection Failed',
                description: err?.data?.message || err?.message || 'Could not update rejection status.',
                type: 'danger',
            });
        } finally {
            setProcessingId(null);
            setRejectTargetItem(null);
            setRejectReason('');
        }
    }, [rejectTargetItem, rejectReason, theme, user, updateAttendanceApproval, refetch]);

    // Handle Phone Call
    const handleCall = useCallback((phone) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`).catch(() => {
            showMessage({
                message: 'Unable to Call',
                description: 'Could not open phone dialer on this device.',
                type: 'warning',
            });
        });
    }, []);

    const renderItem = ({ item }) => {
        const idKey = String(item?.id || item?.idcard || item?.docid || '').trim();
        const isBusy = processingId === idKey;
        const phone = item?.phone || item?.mobile || item?.userdata?.phone || item?.userdata?.mobile;

        return (
            <AttendanceCard
                item={item}
                isBusy={isBusy}
                onApprove={() => handleApprove(item)}
                onReject={() => handleOpenRejectModal(item)}
                onCall={() => handleCall(phone)}
                styles={styles}
                theme={theme}
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* 1. Header Bar */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    accessibilityLabel="Go back"
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.brandContrast} />
                </TouchableOpacity>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name="fingerprint" size={20} color={theme.colors.brand} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Attendance Approval</Text>
                    <Text style={styles.subtitle}>
                        {pendingList.length} {pendingList.length === 1 ? 'record' : 'records'} pending · Swipe right to approve
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => {
                        setProcessedIds(new Set());
                        refetch?.();
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel="Refresh"
                >
                    <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.brandContrast} />
                </TouchableOpacity>
            </View>

            {/* 2. Search & Filter Bar */}
            <View style={styles.filterSection}>
                <View style={styles.searchBox}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={18}
                        color={theme.colors.textMuted}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search name, ID, date..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                    {!!searchQuery && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                            <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <View style={styles.filterChipsRow}>
                    <TouchableOpacity
                        style={[styles.chip, selectedTab === 'all' && styles.chipActive]}
                        onPress={() => setSelectedTab('all')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, selectedTab === 'all' && styles.chipTextActive]}>
                            All ({pendingList.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, selectedTab === 'today' && styles.chipActive]}
                        onPress={() => setSelectedTab('today')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, selectedTab === 'today' && styles.chipTextActive]}>
                            Today ({pendingList.filter(i => moment(i.dateStr || i.attDateStr || i.docdate).isSame(moment(), 'day')).length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, selectedTab === 'in' && styles.chipActive]}
                        onPress={() => setSelectedTab('in')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, selectedTab === 'in' && styles.chipTextActive]}>
                            Punched In ({pendingList.filter(i => String(i?.lastInout) === '1').length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, selectedTab === 'out' && styles.chipActive]}
                        onPress={() => setSelectedTab('out')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, selectedTab === 'out' && styles.chipTextActive]}>
                            Punched Out ({pendingList.filter(i => String(i?.lastInout) === '0').length})
                        </Text>
                    </TouchableOpacity>


                </View>
            </View>

            {/* 3. List or Empty State */}
            {isLoading || isFetching ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={theme.colors.brand} />
                    <Text style={styles.loadingText}>Fetching attendance records...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredList}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => String(item?.id || item?.idcard || item?.docid || index)}
                    contentContainerStyle={filteredList.length === 0 ? styles.emptyContent : styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={() => {
                                setProcessedIds(new Set());
                                refetch?.();
                            }}
                            colors={[theme.colors.brand]}
                            tintColor={theme.colors.brand}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="check-decagram-outline"
                                size={56}
                                color={theme.colors.brandSoft}
                            />
                            <Text style={styles.emptyTitle}>All Caught Up!</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || selectedTab !== 'all'
                                    ? 'No attendance records match your search or filter.'
                                    : 'There are no attendance records awaiting your review.'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* 4. Reject Confirmation Modal */}
            <Modal
                visible={rejectModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setRejectModalVisible(false)}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalCard}>
                                <View style={styles.modalHeader}>
                                    <MaterialCommunityIcons
                                        name="alert-circle-outline"
                                        size={24}
                                        color={theme.colors.danger}
                                        style={styles.modalHeaderIcon}
                                    />
                                    <Text style={styles.modalTitle}>Reject Attendance Request</Text>
                                </View>
                                <Text style={styles.modalSubtitle}>
                                    Please specify why you are rejecting attendance for{' '}
                                    <Text style={{ fontWeight: 'bold' }}>
                                        {rejectTargetItem?.empname || rejectTargetItem?.empName || rejectTargetItem?.idcard || 'this employee'}
                                    </Text>
                                    :
                                </Text>
                                <TextInput
                                    style={styles.modalTextInput}
                                    placeholder="Remarks"
                                    placeholderTextColor={theme.colors.textMuted}
                                    multiline={true}
                                    numberOfLines={3}
                                    value={rejectReason}
                                    onChangeText={setRejectReason}
                                    textAlignVertical="top"
                                    autoFocus={true}
                                />
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalCancelBtn}
                                        onPress={() => setRejectModalVisible(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalConfirmBtn}
                                        onPress={handleConfirmReject}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.modalConfirmText}>Confirm Reject</Text>
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

// ── Stylesheet ──────────────────────────────────────────────────────────────
const createStyles = theme =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            backgroundColor: theme.colors.brand,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.layout?.screenGutter || 16,
            paddingVertical: theme.spacing.md,
            elevation: 3,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: theme.radii.sm,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.xs,
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
        refreshBtn: {
            width: 36,
            height: 36,
            borderRadius: theme.radii.sm,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Filter Section
        filterSection: {
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.layout?.screenGutter || 16,
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
            gap: 8,
        },
        searchBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.sm + 2,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            paddingHorizontal: theme.spacing.sm + 2,
            height: 38,
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
            gap: theme.spacing.xs + 2,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 4.5,
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

        // List Styles
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
        loadingWrap: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
        },
        loadingText: {
            ...theme.typography.bodySmall,
            color: theme.colors.textMuted,
        },

        // Swipeable
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

        // Card Styles
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
        },
        subInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 2,
            gap: 6,
        },
        dateBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.brandSoft,
            paddingHorizontal: 6,
            paddingVertical: 1.5,
            borderRadius: theme.radii.xs,
            gap: 3,
        },
        dateBadgeText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.brand,
        },
        deptBadge: {
            backgroundColor: theme.colors.surfaceSunken,
            paddingHorizontal: 8,
            paddingVertical: 2.5,
            borderRadius: theme.radii.xs,
            marginRight: theme.spacing.xs,
            maxWidth: 100,
        },
        deptBadgeText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.medium,
            color: theme.colors.textSecondary,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 7,
            paddingVertical: 2.5,
            borderRadius: theme.radii.xs,
            gap: 4,
        },
        statusDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
        },
        statusText: {
            ...theme.typography.caption,
            fontSize: 10,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
        },

        // Info Grid
        infoGrid: {
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.sm,
            padding: theme.spacing.sm,
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.sm,
        },
        gridRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        gridCol: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        gridLabel: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.textMuted,
            fontFamily: theme.fontFamilies.medium,
        },
        gridValue: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            fontFamily: theme.fontFamilies.semiBold,
            color: theme.colors.text,
        },
        durationText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.xs,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.brand,
        },

        // Expandable Punch Log
        expandHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 4,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSubtle,
            marginTop: 2,
        },
        expandHeaderText: {
            ...theme.typography.caption,
            fontSize: theme.fontSizes.micro,
            fontFamily: theme.fontFamilies.semiBold,
            color: theme.colors.brand,
        },
        punchesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            paddingTop: 4,
        },
        punchItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: theme.radii.xs,
            paddingHorizontal: 6,
            paddingVertical: 2,
            gap: 4,
        },
        punchTypeWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
        },
        punchTypeText: {
            fontSize: 9,
            fontWeight: 'bold',
        },
        punchTimeText: {
            fontSize: 10,
            color: theme.colors.text,
        },

        // Action Bar
        actionBar: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        btnApprove: {
            flex: 1,
            backgroundColor: theme.colors.success,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 9,
            borderRadius: theme.radii.sm,
            gap: 5,
        },
        btnApproveText: {
            ...theme.typography.button,
            color: '#FFFFFF',
            fontSize: theme.fontSizes.sm,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
        },
        btnReject: {
            flex: 1,
            backgroundColor: theme.colors.danger,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 9,
            borderRadius: theme.radii.sm,
            gap: 5,
        },
        btnRejectText: {
            ...theme.typography.button,
            color: '#FFFFFF',
            fontSize: theme.fontSizes.sm,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
        },
        btnDisabled: {
            opacity: 0.6,
        },
        btnIcon: {
            width: 36,
            height: 36,
            borderRadius: theme.radii.sm,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.surfaceSunken,
        },

        // Reject Modal Styles
        modalBackdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
        },
        modalCard: {
            width: '100%',
            maxWidth: 380,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.lg,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        modalHeaderIcon: {
            marginRight: theme.spacing.xs,
        },
        modalTitle: {
            ...theme.typography.title,
            fontSize: theme.fontSizes.md,
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
            color: theme.colors.danger,
        },
        modalSubtitle: {
            ...theme.typography.bodySmall,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.md,
            lineHeight: 18,
        },
        modalTextInput: {
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radii.sm,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            padding: theme.spacing.sm,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text,
            minHeight: 80,
            marginBottom: theme.spacing.lg,
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
        },
        modalCancelBtn: {
            paddingVertical: 9,
            paddingHorizontal: 16,
            borderRadius: theme.radii.sm,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalCancelText: {
            ...theme.typography.button,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamilies.medium,
            fontWeight: theme.fontWeights.medium,
        },
        modalConfirmBtn: {
            paddingVertical: 9,
            paddingHorizontal: 16,
            borderRadius: theme.radii.sm,
            backgroundColor: theme.colors.danger,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalConfirmText: {
            ...theme.typography.button,
            fontSize: theme.fontSizes.sm,
            color: '#FFFFFF',
            fontFamily: theme.fontFamilies.bold,
            fontWeight: theme.fontWeights.bold,
        },
    });

