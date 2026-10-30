import React, { useState, useContext, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import { useNavigation } from '@react-navigation/native';
import { Common_Context } from '../../context/CommonContext';
import {
    useGetAttendanceStatusQuery,
    usePunchInMutation,
    usePunchOutMutation,
} from '../../store/api/AttendanceApi';
import { useGetEmployeeIdsWithAttQuery } from '../../store/api/UserApi';
import { getAddressFromOSM, getCurrentLocation } from '../../components/utils/CustomLocation';
import EmployeeAttendanceList from './EmployeeAttendanceList';
import { useAppTheme } from '../../theme';
import useLocationWatcher from '../../components/custom_hooks/useLocationWatcher';

const { width } = Dimensions.get('window');
const formatTime = (t) => t || '--:--';

export default function AttendanceScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const navigation = useNavigation();
    const { admin } = useContext(Common_Context);
    const user = useSelector((state) => state.UserDetails);
    const [address, setAddress] = useState(null);
    const locationWatcher = useLocationWatcher({ enable: true });

    const userIdcard = user?.IDCARD || user?.UserId || user?.Id;
    const normalizedUserId = String(userIdcard || '').trim().toUpperCase();
    const isAdmin = admin === 1 || admin === true || String(admin) === '1';
    const isHOD =
        String(user?.level || '').toUpperCase() === 'HOD' ||
        (normalizedUserId && normalizedUserId === String(user?.hod || '').trim().toUpperCase()) ||
        isAdmin;

    const [activeTab, setActiveTab] = useState('SELF');
    const [isPunching, setIsPunching] = useState(false);

    // ── API ─────────────────────────────────────────────────────────────────────
    const { data: statusData, isFetching: statusFetching, refetch: refetchStatus } =
        useGetAttendanceStatusQuery();
    const {
        data: employeeAttendanceData,
        error: employeeAttendanceError,
        isError: employeeAttendanceHasError,
        isFetching: employeesFetching,
        isLoading: employeesLoading,
        refetch: refetchEmployees,
    } = useGetEmployeeIdsWithAttQuery(
        { hod: userIdcard },
        { skip: activeTab !== 'EMPLOYEE' || !isHOD || !userIdcard },
    );
    const [punchIn] = usePunchInMutation();
    const [punchOut] = usePunchOutMutation();
    const refreshActiveTab = activeTab === 'EMPLOYEE' ? refetchEmployees : refetchStatus;

    const attendanceStatus = statusData?.data;
    const status = (attendanceStatus?.status || attendanceStatus?.STATUS || '').toUpperCase();
    const isPunchedIn = status === 'IN';

     // ── Location Watcher ─────────────────────────────────────────────────────
    const { location, error: locationError } = locationWatcher;

    useEffect(() => {
        if (locationError) {
            showMessage({
                message: 'Location Error',
                description: locationError?.message || 'Could not capture location.',
                type: 'danger',
            });
            setAddress(null);
        }
    }, [locationError]);

    useEffect(() => {
        let cancelled = false;
        const fetchAddress = async () => {
        if (location) {
            if (cancelled) return;
            const { formatted } = await getAddressFromOSM(location.latitude, location.longitude);
            setAddress(formatted);
         }

        }
        fetchAddress();
        return () => {
            setAddress(null);
        };
    }, [location]);


    // ── Punch Handler ────────────────────────────────────────────────────────────
    const handlePunch = useCallback(async () => {
        setIsPunching(true);
        try {
            const coords = await new Promise((resolve, reject) => {
                getCurrentLocation(({ coords }) => resolve(coords), reject);
            });

            const payload = {
                empname: user?.EMPNAME || user?.userName,
                latitude: String(coords.latitude),
                longitude: String(coords.longitude),
                location: 'Captured via Mobile',
            };

            const res = isPunchedIn
                ? await punchOut(payload).unwrap()
                : await punchIn(payload).unwrap();

            if (res?.status === 1) {
                showMessage({
                    message: isPunchedIn ? '✅ Punched Out' : '✅ Punched In',
                    description: `Time: ${res?.data?.time || 'Recorded'}`,
                    type: 'success',
                });
                refetchStatus();
            } else {
                Alert.alert('Attendance', res?.message || 'Action failed. Please retry.');
            }
        } catch (err) {
            showMessage({
                message: 'Error',
                description: err?.message || 'Could not capture location or record punch.',
                type: 'danger',
            });
        } finally {
            setIsPunching(false);
        }
    }, [isPunchedIn, punchIn, punchOut, refetchStatus, user]);



    // ── Punch Button ─────────────────────────────────────────────────────────────
    const PunchButton = () => {
        if (statusFetching || isPunching) {
            return (
                <View style={styles.punchRing}>
                    <ActivityIndicator size="large" color={theme.colors.brandContrast} />
                </View>
            );
        }

        const isOut = !status || status === 'NONE' || status === 'OUT';
        const btnColor = isOut ? theme.colors.success : theme.colors.danger;
        const btnLabel = isOut ? 'PUNCH IN' : 'PUNCH OUT';
        const btnIcon  = isOut ? 'login' : 'logout';

        return (
            <TouchableOpacity
                style={[styles.punchRing, { backgroundColor: btnColor }]}
                onPress={handlePunch}
                activeOpacity={0.85}
            >
                <View style={[styles.punchInnerRing, { borderColor: theme.colors.brandContrast }]}>
                    <MaterialCommunityIcons name={btnIcon} size={36} color={theme.colors.brandContrast} />
                    <Text style={styles.punchLabel}>{btnLabel}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.isDark ? 'dark-content' : 'light-content'}
                backgroundColor={theme.colors.brand}
            />

            {/* ── Header ────────────────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.brand} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Attendance</Text>
                    <Text style={styles.headerSub}>Track your daily in / out time</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={refreshActiveTab} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.brand} />
                </TouchableOpacity>
            </View>

            {/* ── Tab Bar (HOD / Admin only) ─────────────────────────────── */}
            {isHOD && (
                <View style={styles.tabBar}>
                    {['SELF', 'EMPLOYEE'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={tab === 'SELF' ? 'account' : 'account-group'}
                                size={16}
                                color={activeTab === tab ? theme.colors.brand : theme.colors.textMuted}
                            />
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab === 'SELF' ? 'My Attendance' : 'Employees'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* ── SELF Tab ──────────────────────────────────────────────────── */}
            {activeTab === 'SELF' ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollBody}
                    refreshControl={
                    <RefreshControl refreshing={statusFetching} onRefresh={refetchStatus} colors={[theme.colors.brand]} />
                    }
                >
                    {/* Today Status Banner */}
                    <View style={[
                        styles.statusBanner,
                        { backgroundColor: isPunchedIn ? theme.colors.successSoft : theme.colors.surfaceSunken }
                    ]}>
                        <View style={[styles.statusDot, { backgroundColor: isPunchedIn ? theme.colors.success : theme.colors.textDisabled }]} />
                        <Text style={[styles.statusBannerText, { color: isPunchedIn ? theme.colors.success : theme.colors.textMuted }]}>
                            {isPunchedIn ? 'Currently Punched In' : status === 'OUT' ? 'Punched Out Today' : 'Not Yet Punched In'}
                        </Text>
                    </View>

                    {/* Today's Times */}
                    <View style={styles.timesCard}>
                        <Text style={styles.timesCardTitle}>Today's Record</Text>
                        <View style={styles.timesRow}>
                            <View style={styles.timeBlock}>
                                <View style={[styles.timeIconWrap, { backgroundColor: theme.colors.successSoft }]}>
                                    <MaterialCommunityIcons name="clock-in" size={24} color={theme.colors.success} />
                                </View>
                                <Text style={styles.timeLabel}>Punch In</Text>
                                <Text style={styles.timeValue}>
                                    {formatTime(attendanceStatus?.punchIn || attendanceStatus?.PUNCHIN)}
                                </Text>
                            </View>

                            <View style={styles.timeDivider} />

                            <View style={styles.timeBlock}>
                                <View style={[styles.timeIconWrap, { backgroundColor: theme.colors.dangerSoft }]}>
                                    <MaterialCommunityIcons name="clock-out" size={24} color={theme.colors.danger} />
                                </View>
                                <Text style={styles.timeLabel}>Punch Out</Text>
                                <Text style={styles.timeValue}>
                                    {formatTime(attendanceStatus?.punchOut || attendanceStatus?.PUNCHOUT)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Punch Button */}
                    <View style={styles.punchSection}>
                        <Text style={styles.punchHint}>
                            {isPunchedIn ? 'Tap to record Punch Out' : 'Tap to record Punch In'}
                        </Text>
                        <PunchButton />
                        <Text style={styles.locationHint}>
                            {address ? `Location: ${address}` : 'Capturing location...'}
                        </Text>
                    </View>

                 
                </ScrollView>
            ) : (
                /* ── EMPLOYEE Tab ───────────────────────────────────────────── */
                <View style={styles.employeeTab}>
                    <View style={styles.empNote}>
                        <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.info} />
                        <Text style={styles.empNoteText}>Today's attendance for employees allocated to you</Text>
                    </View>
                    <EmployeeAttendanceList
                        employees={employeeAttendanceData?.data}
                        isFetching={employeesFetching}
                        isLoading={employeesLoading}
                        isError={employeeAttendanceHasError}
                        error={employeeAttendanceError}
                        onRefresh={refetchEmployees}
                    />
                </View>
            )}
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    // Header
    header: {
        backgroundColor: theme.colors.brand,
        paddingHorizontal: theme.layout.screenGutter,
        paddingVertical: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    backBtn: {
        width: theme.controlSizes.avatarMd - 6,
        height: theme.controlSizes.avatarMd - 6,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center', justifyContent: 'center',
    },
    headerText: { flex: 1 },
    headerTitle: { ...theme.typography.h3, color: theme.colors.brandContrast },
    headerSub: { ...theme.typography.caption, color: theme.colors.brandContrast, opacity: 0.72, marginTop: theme.spacing.xxs },
    refreshBtn: {
        width: theme.controlSizes.avatarMd - 6,
        height: theme.controlSizes.avatarMd - 6,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.brandSoft,
        alignItems: 'center', justifyContent: 'center',
    },

    // Tabs
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        paddingHorizontal: theme.layout.screenGutter,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: theme.spacing.md, gap: theme.spacing.xs + 2,
        borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomColor: theme.colors.brand },
    tabText: { ...theme.typography.label, color: theme.colors.textMuted },
    activeTabText: { color: theme.colors.brand },

    // Scroll body
    scrollBody: { padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge },

    // Status banner
    statusBanner: {
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm + 2,
        borderRadius: theme.radii.md, marginBottom: theme.spacing.md,
    },
    statusDot: { width: theme.spacing.sm, height: theme.spacing.sm, borderRadius: theme.radii.circle },
    statusBannerText: { ...theme.typography.caption, fontWeight: theme.fontWeights.semiBold },

    // Times card
    timesCard: {
        ...theme.styles.card,
        ...theme.styles.shadow,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    timesCardTitle: { ...theme.typography.subtitle, color: theme.colors.text, marginBottom: theme.spacing.lg, textAlign: 'center' },
    timesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    timeBlock: { alignItems: 'center', flex: 1 },
    timeIconWrap: { width: theme.controlSizes.avatarLg - 4, height: theme.controlSizes.avatarLg - 4, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.sm },
    timeLabel: { ...theme.typography.caption, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium },
    timeValue: { ...theme.typography.h3, color: theme.colors.text, marginTop: theme.spacing.xs },
    timeDivider: { width: 1, height: 50, backgroundColor: theme.colors.divider },

    // Punch section
    punchSection: { alignItems: 'center', paddingVertical: theme.spacing.xxl, marginBottom: theme.spacing.md },
    punchHint: { ...theme.typography.bodySmall, color: theme.colors.textMuted, marginBottom: theme.spacing.xxl },
    punchRing: {
        width: 160, height: 160, borderRadius: theme.radii.circle,
        alignItems: 'center', justifyContent: 'center',
        elevation: theme.elevation.lg, shadowColor: theme.colors.shadow, shadowOpacity: theme.isDark ? 0.35 : 0.25, shadowRadius: theme.spacing.lg, shadowOffset: { width: 0, height: 6 },
        backgroundColor: theme.colors.success,
    },
    punchInnerRing: {
        width: 140, height: 140, borderRadius: theme.radii.circle,
        borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    punchLabel: { ...theme.typography.label, color: theme.colors.brandContrast, fontWeight: theme.fontWeights.extraBold, marginTop: theme.spacing.xs + 2, letterSpacing: theme.letterSpacing.wide },
    locationHint: { ...theme.typography.caption, color: theme.colors.textDisabled, marginTop: theme.spacing.lg },

    // Summary stats
    summarySection: { marginBottom: theme.spacing.md },
    sectionTitle: { ...theme.typography.subtitle, color: theme.colors.text, marginBottom: theme.spacing.md },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm + 2 },
    statCard: {
        flex: 1, minWidth: (width - 52) / 2 - 10,
        ...theme.styles.card,
        ...theme.styles.shadow,
        alignItems: 'center',
        borderTopWidth: 3,
    },
    statValue: { ...theme.typography.h2, color: theme.colors.text, marginTop: theme.spacing.sm },
    statLabel: { ...theme.typography.overline, color: theme.colors.textMuted, marginTop: theme.spacing.xxs + 1 },

    // Employee tab
    empNote: {
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs + 2,
        backgroundColor: theme.colors.infoSoft, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm + 2,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    empNoteText: { ...theme.typography.caption, color: theme.colors.info, flex: 1 },

    employeeTab: { flex: 1, backgroundColor: theme.colors.background },
});
