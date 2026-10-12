import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
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
    useGetAttendanceSummaryQuery,
    usePunchInMutation,
    usePunchOutMutation,
} from '../../store/api/attendanceApi';
import { getCurrentLocation } from '../../components/Utils/CustomLocation';

const { width } = Dimensions.get('window');
const formatTime = (t) => t || '--:--';

export default function AttendanceScreen() {
    const navigation = useNavigation();
    const { admin } = useContext(Common_Context);
    const user = useSelector((state) => state.UserDetails);

    const userIdcard = user?.IDCARD || user?.UserId || user?.Id;
    const isHOD =
        user?.level?.toUpperCase() === 'HOD' ||
        (userIdcard && user?.hod && userIdcard.toUpperCase() === user?.hod?.toUpperCase()) ||
        admin === 1;

    const [activeTab, setActiveTab] = useState('SELF');
    const [isPunching, setIsPunching] = useState(false);

    // ── API ─────────────────────────────────────────────────────────────────────
    const { data: statusData, isFetching: statusFetching, refetch: refetchStatus } =
        useGetAttendanceStatusQuery();
    const { data: summaryData } = useGetAttendanceSummaryQuery();
    const [punchIn] = usePunchInMutation();
    const [punchOut] = usePunchOutMutation();

    const attendanceStatus = statusData?.data;
    const summary = summaryData?.data;
    const status = (attendanceStatus?.status || attendanceStatus?.STATUS || '').toUpperCase();
    const isPunchedIn = status === 'IN';

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
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            );
        }

        const isOut = !status || status === 'NONE' || status === 'OUT';
        const btnColor = isOut ? '#16A34A' : '#DC2626';
        const btnLabel = isOut ? 'PUNCH IN' : 'PUNCH OUT';
        const btnIcon  = isOut ? 'login' : 'logout';

        return (
            <TouchableOpacity
                style={[styles.punchRing, { backgroundColor: btnColor }]}
                onPress={handlePunch}
                activeOpacity={0.85}
            >
                <View style={[styles.punchInnerRing, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                    <MaterialCommunityIcons name={btnIcon} size={36} color="#FFFFFF" />
                    <Text style={styles.punchLabel}>{btnLabel}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ── Stats Cards ──────────────────────────────────────────────────────────────
    const StatCard = ({ icon, label, value, color }) => (
        <View style={[styles.statCard, { borderTopColor: color }]}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
            <Text style={styles.statValue}>{value ?? '--'}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

            {/* ── Header ────────────────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Attendance</Text>
                    <Text style={styles.headerSub}>Track your daily in / out time</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={refetchStatus} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
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
                                color={activeTab === tab ? '#007AFF' : '#64748B'}
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
                        <RefreshControl refreshing={statusFetching} onRefresh={refetchStatus} colors={['#007AFF']} />
                    }
                >
                    {/* Today Status Banner */}
                    <View style={[
                        styles.statusBanner,
                        { backgroundColor: isPunchedIn ? '#DCFCE7' : '#F1F5F9' }
                    ]}>
                        <View style={[styles.statusDot, { backgroundColor: isPunchedIn ? '#16A34A' : '#94A3B8' }]} />
                        <Text style={[styles.statusBannerText, { color: isPunchedIn ? '#15803D' : '#64748B' }]}>
                            {isPunchedIn ? 'Currently Punched In' : status === 'OUT' ? 'Punched Out Today' : 'Not Yet Punched In'}
                        </Text>
                    </View>

                    {/* Today's Times */}
                    <View style={styles.timesCard}>
                        <Text style={styles.timesCardTitle}>Today's Record</Text>
                        <View style={styles.timesRow}>
                            <View style={styles.timeBlock}>
                                <View style={[styles.timeIconWrap, { backgroundColor: '#DCFCE7' }]}>
                                    <MaterialCommunityIcons name="clock-in" size={24} color="#16A34A" />
                                </View>
                                <Text style={styles.timeLabel}>Punch In</Text>
                                <Text style={styles.timeValue}>
                                    {formatTime(attendanceStatus?.punchIn || attendanceStatus?.PUNCHIN)}
                                </Text>
                            </View>

                            <View style={styles.timeDivider} />

                            <View style={styles.timeBlock}>
                                <View style={[styles.timeIconWrap, { backgroundColor: '#FEE2E2' }]}>
                                    <MaterialCommunityIcons name="clock-out" size={24} color="#DC2626" />
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
                            📍 Location will be captured automatically
                        </Text>
                    </View>

                    {/* Monthly Summary Stats */}
                    {summary && (
                        <View style={styles.summarySection}>
                            <Text style={styles.sectionTitle}>This Month</Text>
                            <View style={styles.statsGrid}>
                                <StatCard icon="check-circle-outline" label="Present" value={summary?.present} color="#16A34A" />
                                <StatCard icon="close-circle-outline" label="Absent" value={summary?.absent} color="#DC2626" />
                                <StatCard icon="clock-alert-outline" label="Late" value={summary?.late} color="#D97706" />
                                <StatCard icon="home-clock-outline" label="Half Day" value={summary?.halfDay} color="#7C3AED" />
                            </View>
                        </View>
                    )}
                </ScrollView>
            ) : (
                /* ── EMPLOYEE Tab ───────────────────────────────────────────── */
                <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    <View style={styles.empNote}>
                        <MaterialCommunityIcons name="information-outline" size={16} color="#007AFF" />
                        <Text style={styles.empNoteText}>Manage employee attendance as HOD / Admin</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-group-outline" size={54} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>Employee List</Text>
                        <Text style={styles.emptySubtitle}>Pull down to refresh employee attendance data.</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerText: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    refreshBtn: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Tabs
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingHorizontal: 16,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, gap: 6,
        borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomColor: '#007AFF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    activeTabText: { color: '#007AFF' },

    // Scroll body
    scrollBody: { padding: 16, paddingBottom: 40 },

    // Status banner
    statusBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 12, marginBottom: 14,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    statusBannerText: { fontSize: 13, fontWeight: '600' },

    // Times card
    timesCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16,
        padding: 20, marginBottom: 14,
        borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    },
    timesCardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16, textAlign: 'center' },
    timesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    timeBlock: { alignItems: 'center', flex: 1 },
    timeIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    timeLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    timeValue: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 4 },
    timeDivider: { width: 1, height: 50, backgroundColor: '#E2E8F0' },

    // Punch section
    punchSection: { alignItems: 'center', paddingVertical: 24, marginBottom: 14 },
    punchHint: { fontSize: 14, color: '#64748B', marginBottom: 24 },
    punchRing: {
        width: 160, height: 160, borderRadius: 80,
        alignItems: 'center', justifyContent: 'center',
        elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
        backgroundColor: '#16A34A',
    },
    punchInnerRing: {
        width: 140, height: 140, borderRadius: 70,
        borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    punchLabel: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginTop: 6, letterSpacing: 0.5 },
    locationHint: { fontSize: 12, color: '#94A3B8', marginTop: 16 },

    // Summary stats
    summarySection: { marginBottom: 14 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
        flex: 1, minWidth: (width - 52) / 2 - 10,
        backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
        alignItems: 'center',
        borderTopWidth: 3,
        borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    },
    statValue: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginTop: 8 },
    statLabel: { fontSize: 11, color: '#64748B', marginTop: 3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Employee tab
    empNote: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#BFDBFE',
    },
    empNoteText: { fontSize: 12, color: '#1D4ED8', flex: 1 },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
