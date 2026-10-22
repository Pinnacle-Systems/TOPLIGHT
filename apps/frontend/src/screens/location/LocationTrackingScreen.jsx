import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { DateInput } from '../../components/reusable_components/Inputs';
import {
    useGet_history_locationQuery,
    useGet_live_locationQuery,
    useGet_tracking_usersQuery,
} from '../../store/api/OndutyApi';
import { useAppTheme } from '../../theme';

const isValidPoint = point =>
    Number.isFinite(Number(point?.latitude)) &&
    Number.isFinite(Number(point?.longitude)) &&
    Math.abs(Number(point.latitude)) <= 90 &&
    Math.abs(Number(point.longitude)) <= 180;

function createMapHtml(points, mode) {
    const safePoints = points.filter(isValidPoint).map(point => ({
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        timestamp: point.timestamp == null ? point.createdAt : Number(point.timestamp),
        accuracy: point.accuracy == null ? null : Number(point.accuracy),
    }));
    const serializedPoints = JSON.stringify(safePoints).replace(/</g, '\\u003c');

    return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; background: #e9eef5; }
    .leaflet-control-attribution { font-size: 10px; }
    .pin { width: 18px; height: 18px; border: 3px solid white; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(15, 23, 42, .35); }
    .pin-live { background: #2563eb; }
    .pin-start { background: #15803d; }
    .pin-end { background: #b91c1c; }
    .leaflet-popup-content-wrapper { border-radius: 10px; }
  </style>
</head>
<body>
  <div id="map" role="application" aria-label="${mode === 'live' ? 'Live employee location' : 'Employee route history'}"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      const points = ${serializedPoints};
      if (!points.length || !window.L) return;
      const map = L.map('map', { zoomControl: true, preferCanvas: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(map);
      const coords = points.map(point => [point.latitude, point.longitude]);
      const line = L.polyline(coords, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      const marker = (point, kind, label) => {
        const icon = L.divIcon({
          className: '',
          html: '<div class="pin pin-' + kind + '"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const locationMarker = L.marker([point.latitude, point.longitude], { icon }).addTo(map);
        const time = point.timestamp ? new Date(point.timestamp).toLocaleString() : 'Time unavailable';
        locationMarker.bindPopup('<strong>' + label + '</strong><br>' + time);
      };
      if (points.length === 1) {
        marker(points[0], 'live', '${mode === 'live' ? 'Latest location' : 'Location'}');
        map.setView(coords[0], 16);
      } else {
        marker(points[0], 'start', 'Start');
        marker(points[points.length - 1], 'end', '${mode === 'live' ? 'Latest location' : 'End'}');
        map.fitBounds(line.getBounds(), { padding: [32, 32], maxZoom: 16 });
      }
      setTimeout(() => map.invalidateSize(), 200);
    })();
  </script>
</body>
</html>`;
}

function distanceKm(points) {
    if (points.length < 2) return 0;
    const radians = value => (value * Math.PI) / 180;
    let distance = 0;

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const latitudeDelta = radians(current.latitude - previous.latitude);
        const longitudeDelta = radians(current.longitude - previous.longitude);
        const a = Math.sin(latitudeDelta / 2) ** 2 +
            Math.cos(radians(previous.latitude)) *
            Math.cos(radians(current.latitude)) *
            Math.sin(longitudeDelta / 2) ** 2;
        distance += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return distance;
}

export default function LocationTrackingScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const user = useSelector(state => state?.UserDetails);
    const selfId = String(user?.UserId || user?.IDCARD || '');
    const [selectedUserId, setSelectedUserId] = useState(selfId);
    const [mode, setMode] = useState('live');
    const [date, setDate] = useState(new Date());
    const [selectedDocId, setSelectedDocId] = useState(null);

    const { data: staffResponse, isLoading: staffLoading, isError: staffError, refetch } =
        useGet_tracking_usersQuery();
    const staff = staffResponse?.data || [];
    const selectedStaff = staff.find(person => String(person.UserId) === selectedUserId);

    const {
        data: liveResponse,
        isLoading: liveLoading,
        isFetching: liveFetching,
        isError: liveError,
        refetch: refreshLive,
    } = useGet_live_locationQuery(
        { userId: selectedUserId },
        { skip: mode !== 'live' || !selectedUserId, pollingInterval: 10000 },
    );
    const livePoint = Array.isArray(liveResponse) ? liveResponse.find(isValidPoint) : null;

    const historyDate = moment(date).format('YYYY-MM-DD');
    const {
        data: historyResponse,
        isLoading: historyLoading,
        isFetching: historyFetching,
        isError: historyError,
    } = useGet_history_locationQuery(
        { date: historyDate, userId: selectedUserId },
        { skip: mode !== 'history' || !selectedUserId },
    );

    const trips = useMemo(() => {
        const grouped = historyResponse?.data?.[0] || {};
        return Object.entries(grouped)
            .map(([docId, points]) => [docId, Array.isArray(points) ? points.filter(isValidPoint) : []])
            .filter(([, points]) => points.length > 0);
    }, [historyResponse]);

    useEffect(() => {
        if (!selectedUserId && staff.length) {
            setSelectedUserId(String(staff[0].UserId));
        }
    }, [selectedUserId, staff]);

    useEffect(() => {
        setSelectedDocId(trips[0]?.[0] || null);
    }, [selectedUserId, historyDate, trips]);

    const historyPoints = trips.find(([docId]) => docId === selectedDocId)?.[1] || [];
    const mapPoints = mode === 'live' ? (livePoint ? [livePoint] : []) : historyPoints;
    const isFetching = mode === 'live' ? liveFetching : historyFetching;
    const isLoading = mode === 'live' ? liveLoading : historyLoading;
    const hasError = mode === 'live' ? liveError : historyError;
    const routeDistance = distanceKm(historyPoints).toFixed(2);
    const lastUpdate = livePoint?.createdAt || livePoint?.timestamp;
    const liveAgeMinutes = lastUpdate ? moment().diff(moment(lastUpdate), 'minutes') : null;

    const openMapApp = async () => {
        const point = mapPoints[mapPoints.length - 1];
        if (!point) return;
        const url = `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=16/${point.latitude}/${point.longitude}`;
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('[LocationTracking] Unable to open map link:', error);
        }
    };

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.titleRow}>
                    <View style={styles.titleIcon}>
                        <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color={theme.colors.brand} />
                    </View>
                    <View style={styles.titleCopy}>
                        <Text style={styles.title}>Location tracking</Text>
                        <Text style={styles.subtitle}>Live activity and on-duty route history</Text>
                    </View>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Refresh employee list"
                        onPress={() => {
                            refetch();
                            if (mode === 'live') refreshLive();
                        }}
                        style={styles.refreshButton}
                    >
                        <MaterialCommunityIcons name="refresh" size={21} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.modeSwitch}>
                    {[
                        { key: 'live', label: 'Live map', icon: 'access-point' },
                        { key: 'history', label: 'History', icon: 'map-clock-outline' },
                    ].map(item => (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.modeButton, mode === item.key && styles.modeButtonActive]}
                            onPress={() => setMode(item.key)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: mode === item.key }}
                        >
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={18}
                                color={mode === item.key ? theme.colors.brandContrast : theme.colors.textSecondary}
                            />
                            <Text style={[styles.modeText, mode === item.key && styles.modeTextActive]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.staffSection}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>{staff.length > 1 ? 'Your team' : 'Your location'}</Text>
                        {!!selectedStaff && (
                            <View style={[styles.liveStatus, selectedStaff.isLive && styles.liveStatusActive]}>
                                <View style={[styles.statusDot, selectedStaff.isLive && styles.statusDotActive]} />
                                <Text style={[styles.liveStatusText, selectedStaff.isLive && styles.liveStatusTextActive]}>
                                    {selectedStaff.isLive ? 'On duty' : 'Off duty'}
                                </Text>
                            </View>
                        )}
                    </View>
                    {staffLoading ? (
                        <ActivityIndicator color={theme.colors.brand} style={styles.staffLoader} />
                    ) : staffError ? (
                        <Text style={styles.inlineError}>Could not load your permitted employee list. Please refresh.</Text>
                    ) : staff.length ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffList}>
                            {staff.map(person => {
                                const isSelected = String(person.UserId) === selectedUserId;
                                return (
                                    <TouchableOpacity
                                        key={person.UserId}
                                        style={[styles.staffChip, isSelected && styles.staffChipSelected]}
                                        onPress={() => setSelectedUserId(String(person.UserId))}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isSelected }}
                                    >
                                        <MaterialCommunityIcons
                                            name={person.isLive ? 'account-voice' : 'account-outline'}
                                            size={18}
                                            color={isSelected ? theme.colors.brandContrast : theme.colors.textSecondary}
                                        />
                                        <Text style={[styles.staffName, isSelected && styles.staffNameSelected]} numberOfLines={1}>
                                            {person.empname || person.UserId}
                                        </Text>
                                        {person.isLive && <View style={styles.chipLiveDot} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <Text style={styles.emptyStaff}>No employee records are available for your account.</Text>
                    )}
                </View>

                {mode === 'history' && (
                    <View style={styles.historyControls}>
                        <DateInput date={date} setDate={setDate} />
                        {trips.length > 1 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripList}>
                                {trips.map(([docId], index) => (
                                    <TouchableOpacity
                                        key={docId}
                                        onPress={() => setSelectedDocId(docId)}
                                        style={[styles.tripChip, selectedDocId === docId && styles.tripChipSelected]}
                                    >
                                        <Text style={[styles.tripText, selectedDocId === docId && styles.tripTextSelected]}>
                                            Trip {index + 1}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}

                <View style={styles.mapCard}>
                    <View style={styles.mapHeading}>
                        <View>
                            <Text style={styles.mapTitle}>
                                {mode === 'live' ? 'Live employee location' : 'On-duty route'}
                            </Text>
                            <Text style={styles.mapSubtitle} numberOfLines={1}>
                                {selectedStaff?.empname || selectedUserId || 'Select an employee'}
                            </Text>
                        </View>
                        {mode === 'live' && selectedStaff?.isLive && (
                            <View style={styles.livePill}>
                                <View style={styles.statusDotActive} />
                                <Text style={styles.livePillText}>LIVE</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.mapFrame}>
                        {isLoading && !mapPoints.length ? (
                            <View style={styles.mapPlaceholder}>
                                <ActivityIndicator size="large" color={theme.colors.brand} />
                                <Text style={styles.placeholderText}>
                                    {mode === 'live' ? 'Finding the latest location…' : 'Loading route history…'}
                                </Text>
                            </View>
                        ) : hasError ? (
                            <View style={styles.mapPlaceholder}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={38} color={theme.colors.danger} />
                                <Text style={styles.placeholderTitle}>Could not load location data</Text>
                                <Text style={styles.placeholderText}>Check your connection and try again.</Text>
                                <TouchableOpacity
                                    onPress={mode === 'live' ? refreshLive : () => {}}
                                    style={styles.retryButton}
                                >
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : mapPoints.length ? (
                            <>
                                <WebView
                                    key={`${mode}-${selectedUserId}-${selectedDocId || historyDate}-${mapPoints.length}`}
                                    originWhitelist={['*']}
                                    source={{ html: createMapHtml(mapPoints, mode) }}
                                    style={styles.map}
                                    javaScriptEnabled
                                    domStorageEnabled
                                    setSupportMultipleWindows={false}
                                    accessibilityLabel={mode === 'live' ? 'Live location map' : 'Route history map'}
                                />
                                <TouchableOpacity onPress={openMapApp} style={styles.openMapButton}>
                                    <MaterialCommunityIcons name="open-in-new" size={16} color={theme.colors.brand} />
                                    <Text style={styles.openMapText}>Open map</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.mapPlaceholder}>
                                <MaterialCommunityIcons
                                    name={mode === 'live' ? 'map-marker-off-outline' : 'map-outline'}
                                    size={42}
                                    color={theme.colors.textMuted}
                                />
                                <Text style={styles.placeholderTitle}>
                                    {mode === 'live'
                                        ? selectedStaff?.isLive ? 'Waiting for a GPS update' : 'No active on-duty tracking'
                                        : 'No route history for this date'}
                                </Text>
                                <Text style={styles.placeholderText}>
                                    {mode === 'live'
                                        ? 'Only active on-duty sessions share live locations.'
                                        : 'Choose another date or employee to view recorded routes.'}
                                </Text>
                            </View>
                        )}
                        {isFetching && !!mapPoints.length && (
                            <View style={styles.refreshingBadge}>
                                <ActivityIndicator size="small" color={theme.colors.brand} />
                            </View>
                        )}
                    </View>

                    {mode === 'live' && livePoint && (
                        <View style={styles.statsRow}>
                            <View style={styles.statCell}>
                                <MaterialCommunityIcons name="clock-outline" size={17} color={theme.colors.textMuted} />
                                <Text style={styles.statText}>
                                    {lastUpdate ? `Updated ${moment(lastUpdate).fromNow()}` : 'Update time unavailable'}
                                </Text>
                            </View>
                            {liveAgeMinutes !== null && liveAgeMinutes > 5 && (
                                <Text style={styles.staleNote}>Location may be stale</Text>
                            )}
                        </View>
                    )}
                    {mode === 'history' && historyPoints.length > 0 && (
                        <View style={styles.statsRow}>
                            <View style={styles.statCell}>
                                <MaterialCommunityIcons name="map-marker-path" size={17} color={theme.colors.textMuted} />
                                <Text style={styles.statText}>{historyPoints.length} location points</Text>
                            </View>
                            <Text style={styles.distance}>{routeDistance} km</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.privacyNote}>
                    Location visibility is limited to your own account and employees assigned to your HR/HOD account.
                </Text>
                <Text style={styles.mapAttribution}>Map data © OpenStreetMap contributors</Text>
            </ScrollView>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.layout.screenGutter, paddingBottom: theme.spacing.xxxl },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
    titleIcon: {
        width: 46, height: 46, borderRadius: theme.radii.md, alignItems: 'center',
        justifyContent: 'center', backgroundColor: theme.colors.brandSoft,
    },
    titleCopy: { flex: 1, marginLeft: theme.spacing.md },
    title: { ...theme.typography.h3, color: theme.colors.text },
    subtitle: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 2 },
    refreshButton: {
        width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
        borderRadius: theme.radii.md, backgroundColor: theme.colors.surface,
        borderWidth: 1, borderColor: theme.colors.borderSubtle,
    },
    modeSwitch: {
        flexDirection: 'row', backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md, padding: theme.spacing.xs, marginBottom: theme.spacing.lg,
    },
    modeButton: {
        flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', borderRadius: theme.radii.sm, gap: theme.spacing.xs,
    },
    modeButtonActive: { backgroundColor: theme.colors.brand, ...theme.styles.shadow },
    modeText: { ...theme.typography.label, color: theme.colors.textSecondary },
    modeTextActive: { color: theme.colors.brandContrast },
    staffSection: {
        paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface,
        borderWidth: 1, borderColor: theme.colors.borderSubtle, marginBottom: theme.spacing.md,
    },
    sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { ...theme.typography.title, color: theme.colors.text },
    liveStatus: {
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceSunken,
    },
    liveStatusActive: { backgroundColor: theme.colors.successSoft },
    statusDot: { width: 7, height: 7, borderRadius: theme.radii.circle, backgroundColor: theme.colors.textMuted },
    statusDotActive: { width: 7, height: 7, borderRadius: theme.radii.circle, backgroundColor: theme.colors.success },
    liveStatusText: { ...theme.typography.caption, color: theme.colors.textMuted },
    liveStatusTextActive: { color: theme.colors.success, fontWeight: theme.fontWeights.semiBold },
    staffLoader: { marginVertical: theme.spacing.md },
    staffList: { paddingTop: theme.spacing.md, gap: theme.spacing.sm },
    staffChip: {
        maxWidth: 210, minHeight: 42, flexDirection: 'row', alignItems: 'center',
        gap: theme.spacing.xs, paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1, borderColor: theme.colors.borderSubtle,
    },
    staffChipSelected: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
    staffName: { ...theme.typography.caption, color: theme.colors.text, maxWidth: 145 },
    staffNameSelected: { color: theme.colors.brandContrast, fontWeight: theme.fontWeights.semiBold },
    chipLiveDot: { width: 7, height: 7, borderRadius: theme.radii.circle, backgroundColor: theme.colors.success },
    emptyStaff: { ...theme.typography.bodySmall, color: theme.colors.textMuted, marginTop: theme.spacing.md },
    inlineError: { ...theme.typography.bodySmall, color: theme.colors.danger, marginTop: theme.spacing.md },
    historyControls: {
        backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderSubtle,
        borderRadius: theme.radii.lg, paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md,
    },
    tripList: { gap: theme.spacing.sm, paddingBottom: theme.spacing.md },
    tripChip: {
        borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surfaceSunken, borderWidth: 1, borderColor: theme.colors.borderSubtle,
    },
    tripChipSelected: { backgroundColor: theme.colors.brandSoft, borderColor: theme.colors.brand },
    tripText: { ...theme.typography.caption, color: theme.colors.textSecondary },
    tripTextSelected: { color: theme.colors.brand, fontWeight: theme.fontWeights.semiBold },
    mapCard: {
        overflow: 'hidden', borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface,
        borderWidth: 1, borderColor: theme.colors.borderSubtle, ...theme.styles.shadow,
    },
    mapHeading: {
        minHeight: 68, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    },
    mapTitle: { ...theme.typography.title, color: theme.colors.text },
    mapSubtitle: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 3, maxWidth: 240 },
    livePill: {
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill, backgroundColor: theme.colors.successSoft,
    },
    livePillText: { ...theme.typography.overline, color: theme.colors.success },
    mapFrame: { height: 360, backgroundColor: theme.colors.surfaceSunken },
    map: { flex: 1, backgroundColor: theme.colors.surfaceSunken },
    mapPlaceholder: {
        flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xl,
    },
    placeholderTitle: { ...theme.typography.title, color: theme.colors.text, textAlign: 'center', marginTop: theme.spacing.md },
    placeholderText: {
        ...theme.typography.bodySmall, color: theme.colors.textMuted, textAlign: 'center',
        marginTop: theme.spacing.xs, lineHeight: 20,
    },
    retryButton: {
        marginTop: theme.spacing.md, paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm, backgroundColor: theme.colors.brandSoft,
        borderRadius: theme.radii.pill,
    },
    retryText: { ...theme.typography.label, color: theme.colors.brand },
    openMapButton: {
        position: 'absolute', right: theme.spacing.md, bottom: theme.spacing.md,
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
        backgroundColor: theme.colors.surface, borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
        borderWidth: 1, borderColor: theme.colors.borderSubtle,
    },
    openMapText: { ...theme.typography.caption, color: theme.colors.brand, fontWeight: theme.fontWeights.semiBold },
    refreshingBadge: {
        position: 'absolute', top: theme.spacing.md, right: theme.spacing.md,
        width: 32, height: 32, borderRadius: theme.radii.circle,
        alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface,
    },
    statsRow: {
        minHeight: 48, paddingHorizontal: theme.spacing.md, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm,
    },
    statCell: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, flexShrink: 1 },
    statText: { ...theme.typography.caption, color: theme.colors.textSecondary },
    staleNote: { ...theme.typography.caption, color: theme.colors.warning },
    distance: { ...theme.typography.label, color: theme.colors.text },
    privacyNote: {
        ...theme.typography.caption, textAlign: 'center', color: theme.colors.textMuted,
        marginTop: theme.spacing.lg, lineHeight: 18,
    },
    mapAttribution: {
        ...theme.typography.caption, fontSize: 10, color: theme.colors.textMuted,
        textAlign: 'center', marginTop: theme.spacing.xs,
    },
});
