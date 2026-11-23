import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { DateInput, Dropdown } from '../../components/reusable_components/Inputs';
import {
    useGet_history_locationQuery,
    useGet_live_locationQuery,
    useGet_tracking_usersQuery,
} from '../../store/api/OndutyApi';
import { useAppTheme } from '../../theme';
import socket from '../../utils/Socket';

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
        label: point.label || null,
        location: point.address || point.location || point.locationName || null,
        isLive: Boolean(point.isLive),
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
        const loc = point.location ? '<br><span style="font-size:11px;color:#475569">' + point.location + '</span>' : '';
        locationMarker.bindPopup('<strong>' + label + '</strong><br>' + time + loc);
      };
      const isSingle = points.length === 1 || coords.every(c => Math.abs(c[0] - coords[0][0]) < 0.0001 && Math.abs(c[1] - coords[0][1]) < 0.0001);
      if (isSingle) {
        marker(points[0], 'live', points[0].label || '${mode === 'live' ? 'Latest recorded location' : 'Location'}');
        map.setView(coords[0], 16);
      } else {
        marker(points[0], 'start', points[0].label || 'Start');
        marker(points[points.length - 1], 'end', points[points.length - 1].label || '${mode === 'live' ? 'Latest location' : 'End'}');
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

    // Filter controls
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('live');

    const { data: staffResponse, isLoading: staffLoading, isError: staffError, refetch } =
        useGet_tracking_usersQuery();
    const staff = staffResponse?.data || [];
    const liveStaff = useMemo(() => staff.filter(person => Boolean(person.isLive)), [staff]);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'live') {
            setStatusFilter('live');
        } else {
            setStatusFilter('all');
        }
    };

    const employeeOptions = useMemo(() => {
        const list = staff.map(person => {
            const id = String(person.UserId || person.userId || person.idCard || '');
            const name = person.empName || person.empname || person.userName || id;
            return {
                label: `${name} (${id})`,
                value: id,
                name,
                id,
                isLive: Boolean(person.isLive),
            };
        });

        const filteredList = (mode === 'live' && statusFilter === 'live')
            ? list.filter(p => p.isLive)
            : list;

        return {
            data: [
                { label: mode === 'live' ? 'All Live Employees' : 'All Employees', value: '' },
                ...filteredList,
            ],
        };
    }, [staff, mode, statusFilter]);

    const statusOptions = useMemo(() => {
        if (mode === 'live') {
            return {
                data: [
                    { label: 'Live On-Duty Only', value: 'live' },
                    { label: 'All Team Members', value: 'all' },
                    { label: 'Off Duty Only', value: 'offduty' },
                ],
            };
        }
        return {
            data: [
                { label: 'All Employees', value: 'all' },
                { label: 'Currently On-Duty', value: 'live' },
                { label: 'Currently Off-Duty', value: 'offduty' },
            ],
        };
    }, [mode]);

    const displayedStaff = useMemo(() => {
        let list = staff;

        if (statusFilter === 'live') {
            list = list.filter(person => Boolean(person.isLive));
        } else if (statusFilter === 'offduty') {
            list = list.filter(person => !person.isLive);
        } else if (mode === 'live' && !statusFilter) {
            list = list.filter(person => Boolean(person.isLive));
        }

        if (employeeFilter) {
            list = list.filter(person => String(person.UserId || person.userId || person.idCard) === String(employeeFilter));
        }

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(person => {
                const id = String(person.UserId || person.userId || person.idCard || '').toLowerCase();
                const name = String(person.empName || person.empname || person.userName || '').toLowerCase();
                return id.includes(q) || name.includes(q);
            });
        }

        return list;
    }, [staff, mode, statusFilter, employeeFilter, searchQuery]);

    const hasActiveFilters = Boolean(
        searchQuery.trim() ||
        employeeFilter ||
        (mode === 'live' ? statusFilter !== 'live' : (statusFilter && statusFilter !== 'all'))
    );

    const clearFilters = () => {
        setSearchQuery('');
        setEmployeeFilter('');
        setStatusFilter(mode === 'live' ? 'live' : 'all');
    };

    const selectedStaff = displayedStaff.find(person => String(person.UserId || person.userId || person.idCard) === selectedUserId)
        || staff.find(person => String(person.UserId || person.userId || person.idCard) === selectedUserId);

    const isSelectedLive = Boolean(selectedStaff?.isLive);
    const [socketPoint, setSocketPoint] = useState(null);

    // Reset socket point on employee or mode switch
    useEffect(() => {
        setSocketPoint(null);
    }, [selectedUserId, mode]);

    // Real-time WebSocket movement listener
    useEffect(() => {
        if (mode !== 'live' || !selectedUserId) return;

        const onLiveUpdate = (data) => {
            if (!data) return;
            const updateUserId = String(data.userId || data.UserId || data.idCard || '');
            if (updateUserId === String(selectedUserId) && isValidPoint(data)) {
                const liveAddr = data.address || data.locationName || null;
                setSocketPoint({
                    ...data,
                    latitude: Number(data.latitude),
                    longitude: Number(data.longitude),
                    address: liveAddr,
                    locationName: liveAddr,
                    isLive: true,
                    timestamp: data.timeStamp || data.timestamp || Date.now(),
                    timeStamp: data.timeStamp || data.timestamp || Date.now(),
                });
            }
        };

        socket.on('location_update', onLiveUpdate);
        socket.on(`location_update:${selectedUserId}`, onLiveUpdate);

        return () => {
            socket.off('location_update', onLiveUpdate);
            socket.off(`location_update:${selectedUserId}`, onLiveUpdate);
        };
    }, [mode, selectedUserId]);

    const {
        data: liveResponse,
        isLoading: liveLoading,
        isFetching: liveFetching,
        isError: liveError,
        refetch: refreshLive,
    } = useGet_live_locationQuery(
        { userId: selectedUserId },
        { skip: mode !== 'live' || !selectedUserId || !isSelectedLive, pollingInterval: 10000 },
    );
    const livePoint = socketPoint || (Array.isArray(liveResponse) ? liveResponse.find(isValidPoint) : null);

    const historyDate = moment(date).format('YYYY-MM-DD');
    const {
        data: historyResponse,
        isLoading: historyLoading,
        isFetching: historyFetching,
        isError: historyError,
        refetch: refreshHistory,
    } = useGet_history_locationQuery(
        { date: historyDate, userId: selectedUserId },
        { skip: mode !== 'history' || !selectedUserId },
    );

    const availableDates = historyResponse?.availableDates || [];

    const trips = useMemo(() => {
        const grouped = historyResponse?.data?.[0] || {};
        return Object.entries(grouped)
            .map(([docId, points]) => [docId, Array.isArray(points) ? points.filter(isValidPoint) : []])
            .filter(([, points]) => points.length > 0);
    }, [historyResponse]);

    const handleRefresh = useCallback(() => {
        try {
            if (!staffLoading && typeof refetch === 'function') {
                refetch();
            }
        } catch (_) {}

        if (mode === 'live' && selectedUserId && isSelectedLive) {
            try {
                if (!liveLoading && typeof refreshLive === 'function') {
                    refreshLive();
                }
            } catch (_) {}
        } else if (mode === 'history' && selectedUserId) {
            try {
                if (!historyLoading && typeof refreshHistory === 'function') {
                    refreshHistory();
                }
            } catch (_) {}
        }
    }, [mode, selectedUserId, isSelectedLive, staffLoading, liveLoading, historyLoading, refetch, refreshLive, refreshHistory]);

    useEffect(() => {
        if (displayedStaff.length > 0) {
            const isSelectedPresent = displayedStaff.some(
                person => String(person.UserId || person.userId || person.idCard) === selectedUserId
            );
            if (!isSelectedPresent) {
                setSelectedUserId(String(displayedStaff[0].UserId || displayedStaff[0].userId || displayedStaff[0].idCard));
            }
        } else {
            setSelectedUserId(null);
        }
    }, [displayedStaff, selectedUserId]);

    useEffect(() => {
        setSelectedDocId(trips[0]?.[0] || null);
    }, [selectedUserId, historyDate, trips]);

    useEffect(() => {
        if (mode === 'history' && trips.length === 0 && availableDates.length > 0) {
            const currentFormatted = moment(date).format('YYYY-MM-DD');
            if (!availableDates.includes(currentFormatted)) {
                setDate(moment(availableDates[0], 'YYYY-MM-DD').toDate());
            }
        }
    }, [selectedUserId, availableDates, mode, trips.length]);

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
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Toggle filter options"
                            onPress={() => setShowFilters(prev => !prev)}
                            style={[
                                styles.headerBtn,
                                showFilters && styles.headerBtnActive,
                                hasActiveFilters && styles.headerBtnBadge,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={showFilters ? "filter-remove" : "filter-variant"}
                                size={20}
                                color={showFilters ? theme.colors.danger : (hasActiveFilters ? theme.colors.brand : theme.colors.textSecondary)}
                            />
                            {hasActiveFilters && !showFilters && <View style={styles.headerBtnDot} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Refresh employee list"
                            onPress={handleRefresh}
                            style={styles.headerBtn}
                        >
                            <MaterialCommunityIcons name="refresh" size={21} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.modeSwitch}>
                    {[
                        { key: 'live', label: 'Live map', icon: 'access-point' },
                        { key: 'history', label: 'History', icon: 'map-clock-outline' },
                    ].map(item => (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.modeButton, mode === item.key && styles.modeButtonActive]}
                            onPress={() => handleModeChange(item.key)}
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

                {/* Active Filters Pill Bar (when filter panel is closed) */}
                {hasActiveFilters && !showFilters && (
                    <View style={styles.activeFiltersPillBar}>
                        <View style={styles.activeFiltersLeft}>
                            <MaterialCommunityIcons name="filter-check-outline" size={14} color={theme.colors.brand} />
                            <Text style={styles.activeFiltersPillText} numberOfLines={1}>
                                {searchQuery ? `"${searchQuery}" • ` : ''}
                                {employeeFilter ? `${staff.find(p => String(p.UserId || p.userId || p.idCard) === employeeFilter)?.empName || employeeFilter} • ` : ''}
                                {statusFilter === 'live' ? 'Live on-duty' : (statusFilter === 'offduty' ? 'Off duty' : 'All team')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersPillBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <MaterialCommunityIcons name="close" size={14} color={theme.colors.textMuted} />
                            <Text style={styles.clearFiltersPillText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Filter Panel (when showFilters is true) */}
                {showFilters && (
                    <View style={styles.filterCard}>
                        <View style={styles.filterCardHeader}>
                            <View style={styles.filterCardHeaderLeft}>
                                <MaterialCommunityIcons name="filter-variant" size={18} color={theme.colors.brand} />
                                <Text style={styles.filterCardTitle}>Filter Options</Text>
                                {hasActiveFilters && (
                                    <View style={styles.filterActiveBadge}>
                                        <Text style={styles.filterActiveBadgeText}>Active</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setShowFilters(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <MaterialCommunityIcons name="close" size={20} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View style={styles.searchBar}>
                            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={styles.searchInput}
                                placeholder="Search employee name or ID..."
                                placeholderTextColor={theme.colors.placeholder || "#999"}
                                returnKeyType="search"
                            />
                            {Boolean(searchQuery) && (
                                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filter by Employee Dropdown */}
                        <View style={styles.filterDropdownRow}>
                            <Dropdown
                                selected={employeeFilter}
                                setSelected={val => {
                                    const value = typeof val === 'object' && val !== null ? val.value : val;
                                    setEmployeeFilter(value || '');
                                }}
                                options={employeeOptions}
                                label="Filter by Employee"
                                _label="label"
                                _value="value"
                                placeholder={mode === 'live' ? "Select Employee (Live Only)" : "Select Employee"}
                                zIndex={300}
                                searchable
                                searchPlaceholder="Search employees..."
                            />
                        </View>

                        {/* Filter by Status Dropdown */}
                        <View style={styles.filterDropdownRow}>
                            <Dropdown
                                selected={statusFilter}
                                setSelected={val => {
                                    const value = typeof val === 'object' && val !== null ? val.value : val;
                                    setStatusFilter(value || (mode === 'live' ? 'live' : 'all'));
                                }}
                                options={statusOptions}
                                label="Filter by Status"
                                _label="label"
                                _value="value"
                                placeholder="Filter duty status"
                                zIndex={290}
                            />
                        </View>

                        {/* Filter Action Buttons */}
                        <View style={styles.filterActionsRow}>
                            <TouchableOpacity
                                onPress={clearFilters}
                                style={[styles.clearFilterBtn, !hasActiveFilters && styles.filterBtnDisabled]}
                                disabled={!hasActiveFilters}
                            >
                                <MaterialCommunityIcons
                                    name="filter-remove-outline"
                                    size={16}
                                    color={hasActiveFilters ? theme.colors.danger : theme.colors.textMuted}
                                />
                                <Text style={[styles.clearFilterText, !hasActiveFilters && styles.filterBtnDisabledText]}>
                                    Clear Filters
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowFilters(false)}
                                style={styles.applyFilterBtn}
                            >
                                <MaterialCommunityIcons name="check" size={16} color={theme.colors.brandContrast} />
                                <Text style={styles.applyFilterText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.staffSection}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>
                            {mode === 'live' && statusFilter === 'live'
                                ? 'Active on-duty team'
                                : (displayedStaff.length > 1 ? 'Your team' : 'Your location')}
                            {displayedStaff.length > 0 && ` (${displayedStaff.length})`}
                        </Text>
                        {mode === 'live' && statusFilter === 'live' ? (
                            <View style={[styles.liveStatus, displayedStaff.length > 0 && styles.liveStatusActive]}>
                                <View style={[styles.statusDot, displayedStaff.length > 0 && styles.statusDotActive]} />
                                <Text style={[styles.liveStatusText, displayedStaff.length > 0 && styles.liveStatusTextActive]}>
                                    {displayedStaff.length > 0 ? `${displayedStaff.length} on live duty` : 'No live duty'}
                                </Text>
                            </View>
                        ) : (
                            !!selectedStaff && (
                                <View style={[styles.liveStatus, selectedStaff.isLive && styles.liveStatusActive]}>
                                    <View style={[styles.statusDot, selectedStaff.isLive && styles.statusDotActive]} />
                                    <Text style={[styles.liveStatusText, selectedStaff.isLive && styles.liveStatusTextActive]}>
                                        {selectedStaff.isLive ? 'On duty' : 'Off duty'}
                                    </Text>
                                </View>
                            )
                        )}
                    </View>
                    {staffLoading ? (
                        <ActivityIndicator color={theme.colors.brand} style={styles.staffLoader} />
                    ) : staffError ? (
                        <Text style={styles.inlineError}>Could not load your permitted employee list. Please refresh.</Text>
                    ) : displayedStaff.length ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffList}>
                            {displayedStaff.map((person, index) => {
                                const personId = String(person.UserId || person.userId || person.idCard || index);
                                const isSelected = personId === selectedUserId;
                                return (
                                    <TouchableOpacity
                                        key={personId}
                                        style={[styles.staffChip, isSelected && styles.staffChipSelected]}
                                        onPress={() => setSelectedUserId(personId)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isSelected }}
                                    >
                                        <MaterialCommunityIcons
                                            name={person.isLive ? 'account-voice' : 'account-outline'}
                                            size={18}
                                            color={isSelected ? theme.colors.brandContrast : theme.colors.textSecondary}
                                        />
                                        <Text style={[styles.staffName, isSelected && styles.staffNameSelected]} numberOfLines={1}>
                                            {person.empName || person.empname || person.userName || personId}
                                        </Text>
                                        {person.isLive && <View style={styles.chipLiveDot} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <View style={styles.noLiveBox}>
                            <MaterialCommunityIcons
                                name={hasActiveFilters ? "filter-off-outline" : "account-clock-outline"}
                                size={22}
                                color={theme.colors.textMuted}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.emptyStaff}>
                                    {hasActiveFilters
                                        ? 'No employees match your filter criteria.'
                                        : (mode === 'live'
                                            ? 'No employees are currently on live on-duty.'
                                            : 'No employee records are available for your account.')}
                                </Text>
                                {hasActiveFilters && (
                                    <TouchableOpacity onPress={clearFilters} style={styles.resetFilterInlineBtn}>
                                        <Text style={styles.resetFilterInlineText}>Reset filters</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {mode === 'history' && (
                    <View style={styles.historyControls}>
                        <DateInput date={date} setDate={setDate} />
                        {trips.length > 1 && (
                            <View style={styles.tripSectionWrap}>
                                <Text style={styles.availableDatesTitle}>Select trip session:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripList}>
                                    {trips.map(([docId, points], index) => {
                                        const firstPoint = points[0];
                                        const pointTime = firstPoint?.timestamp || firstPoint?.timeStamp || firstPoint?.createdAt;
                                        const timeStr = pointTime ? moment(pointTime).format('hh:mm A') : '';
                                        const shortDoc = docId && docId.includes('/') ? docId.split('/').pop() : docId;
                                        const isSelected = selectedDocId === docId;
                                        return (
                                            <TouchableOpacity
                                                key={docId || `trip-${index}`}
                                                onPress={() => setSelectedDocId(docId)}
                                                style={[styles.tripChip, isSelected && styles.tripChipSelected]}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isSelected }}
                                            >
                                                <MaterialCommunityIcons
                                                    name="map-marker-distance"
                                                    size={14}
                                                    color={isSelected ? theme.colors.brand : theme.colors.textSecondary}
                                                />
                                                <Text style={[styles.tripText, isSelected && styles.tripTextSelected]}>
                                                    Trip {index + 1}{timeStr ? ` (${timeStr})` : (shortDoc ? ` (#${shortDoc})` : '')}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}
                        {availableDates.length > 0 && (
                            <View style={styles.availableDatesWrap}>
                                <Text style={styles.availableDatesTitle}>Available trip dates:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.availableDatesScroll}>
                                    {availableDates.map(dateStr => {
                                        const isSelected = dateStr === historyDate;
                                        return (
                                            <TouchableOpacity
                                                key={dateStr}
                                                onPress={() => setDate(moment(dateStr, 'YYYY-MM-DD').toDate())}
                                                style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                                            >
                                                <MaterialCommunityIcons
                                                    name="calendar"
                                                    size={12}
                                                    color={isSelected ? theme.colors.brandContrast : theme.colors.brand}
                                                />
                                                <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                                                    {moment(dateStr, 'YYYY-MM-DD').format('DD MMM')}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.mapCard}>
                    <View style={styles.mapHeading}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.mapTitle}>
                                {mode === 'live'
                                    ? 'Live employee location'
                                    : 'On-duty route'}
                            </Text>
                            <Text style={styles.mapSubtitle} numberOfLines={1}>
                                {mode === 'live' && !displayedStaff.length
                                    ? (hasActiveFilters ? 'No matching live duty records' : 'No active live duty records')
                                    : (selectedStaff?.empName || selectedStaff?.empname || selectedStaff?.userName || selectedUserId || 'Select an employee')}
                            </Text>
                        </View>
                        {mode === 'live' && livePoint && (
                            <View style={styles.livePill}>
                                <View style={styles.statusDotActive} />
                                <Text style={styles.livePillText}>{socketPoint ? 'LIVE • REALTIME' : 'LIVE'}</Text>
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
                                    onPress={handleRefresh}
                                    style={styles.retryButton}
                                >
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : mapPoints.length ? (
                            <>
                                <WebView
                                    key={`${mode}-${selectedUserId}-${selectedDocId || historyDate}-${mapPoints.length}-${livePoint?.timestamp || ''}`}
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
                        ) : mode === 'live' && !displayedStaff.length ? (
                            <View style={styles.mapPlaceholder}>
                                <MaterialCommunityIcons
                                    name={hasActiveFilters ? "filter-off-outline" : "map-marker-off-outline"}
                                    size={46}
                                    color={theme.colors.textMuted}
                                />
                                <Text style={styles.placeholderTitle}>
                                    {hasActiveFilters ? 'No Matching Records' : 'No Active Live Duty Records'}
                                </Text>
                                <Text style={styles.placeholderText}>
                                    {hasActiveFilters
                                        ? 'No employees match your filter criteria. Adjust or clear filters to view more.'
                                        : 'Only employees currently on live on-duty are displayed on the live map. Switch to History to view past routes and trips.'}
                                </Text>
                                {hasActiveFilters ? (
                                    <TouchableOpacity
                                        onPress={clearFilters}
                                        style={styles.switchHistoryButton}
                                    >
                                        <MaterialCommunityIcons name="filter-remove" size={18} color={theme.colors.brandContrast} />
                                        <Text style={styles.switchHistoryButtonText}>Clear Filters</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => handleModeChange('history')}
                                        style={styles.switchHistoryButton}
                                    >
                                        <MaterialCommunityIcons name="history" size={18} color={theme.colors.brandContrast} />
                                        <Text style={styles.switchHistoryButtonText}>View Route History</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <View style={styles.mapPlaceholder}>
                                <MaterialCommunityIcons
                                    name={mode === 'live' ? 'map-marker-off-outline' : 'map-outline'}
                                    size={42}
                                    color={theme.colors.textMuted}
                                />
                                <Text style={styles.placeholderTitle}>
                                    {mode === 'live'
                                        ? 'Waiting for GPS location…'
                                        : 'No route history for this date'}
                                </Text>
                                <Text style={styles.placeholderText}>
                                    {mode === 'live'
                                        ? 'Live tracking is active. Waiting for initial coordinates from device.'
                                        : 'Choose another date or employee above to view recorded routes.'}
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
                        <View style={styles.statsContainer}>
                            <View style={styles.statsRow}>
                                <View style={styles.statCell}>
                                    <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textMuted} />
                                    <Text style={styles.statText}>
                                        {lastUpdate ? `Recorded ${moment(lastUpdate).calendar()} (${moment(lastUpdate).fromNow()})` : 'Update time unavailable'}
                                    </Text>
                                </View>
                                {liveAgeMinutes !== null && liveAgeMinutes > 15 && (
                                    <Text style={styles.staleNote}>Off-duty / Stationary</Text>
                                )}
                            </View>
                            {Boolean(livePoint.address || livePoint.locationName) && (
                                <View style={styles.locationRow}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={15} color={theme.colors.brand} />
                                    <Text style={styles.locationText} numberOfLines={2}>
                                        {livePoint.address || livePoint.locationName}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                    {mode === 'history' && historyPoints.length > 0 && (
                        <View style={styles.statsRow}>
                            <View style={styles.statCell}>
                                <MaterialCommunityIcons name="map-marker-path" size={17} color={theme.colors.textMuted} />
                                <Text style={styles.statText}>
                                    {selectedDocId ? `${selectedDocId} • ` : ''}{historyPoints.length} location points
                                </Text>
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
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    headerBtn: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    headerBtnActive: {
        borderColor: theme.colors.brand,
        backgroundColor: theme.colors.brandSoft,
    },
    headerBtnBadge: {
        borderColor: theme.colors.brand,
    },
    headerBtnDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: theme.colors.brand,
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
    tripSectionWrap: {
        marginBottom: 4,
    },
    tripList: { gap: theme.spacing.sm, paddingBottom: theme.spacing.md },
    tripChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
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
    lastKnownPill: {
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    lastKnownPillText: {
        color: theme.colors.textSecondary,
    },
    statusDotMuted: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.textMuted,
    },
    availableDatesWrap: {
        paddingTop: theme.spacing.xs,
        paddingBottom: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderSubtle,
        marginTop: theme.spacing.xs,
    },
    availableDatesTitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        marginBottom: 6,
        fontSize: 11,
    },
    availableDatesScroll: {
        gap: 6,
    },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.brandSoft,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    dateChipSelected: {
        backgroundColor: theme.colors.brand,
        borderColor: theme.colors.brand,
    },
    dateChipText: {
        fontSize: 11,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.brand,
    },
    dateChipTextSelected: {
        color: theme.colors.brandContrast,
        fontWeight: theme.fontWeights.semiBold,
    },
    statsContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingBottom: 6,
    },
    locationText: {
        fontSize: 12,
        color: theme.colors.text,
        flex: 1,
    },
    switchHistoryButton: {
        marginTop: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.brand,
        borderRadius: theme.radii.pill,
    },
    switchHistoryButtonText: {
        ...theme.typography.label,
        color: theme.colors.brandContrast,
    },
    noLiveBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
    },
    activeFiltersPillBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.brandSoft,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 7,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    activeFiltersLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        marginRight: 8,
    },
    activeFiltersPillText: {
        fontSize: 12,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.medium,
    },
    clearFiltersPillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.surface,
    },
    clearFiltersPillText: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeights.medium,
    },
    filterCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.styles.shadow,
    },
    filterCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    filterCardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    filterCardTitle: {
        ...theme.typography.title,
        color: theme.colors.text,
        fontSize: 15,
    },
    filterActiveBadge: {
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radii.pill,
    },
    filterActiveBadgeText: {
        fontSize: 10,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        paddingHorizontal: theme.spacing.sm,
        height: 42,
        marginBottom: theme.spacing.sm,
    },
    searchIcon: {
        marginRight: theme.spacing.xs,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 13,
        paddingVertical: 0,
    },
    filterDropdownRow: {
        marginBottom: theme.spacing.sm,
    },
    filterActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.xs,
    },
    clearFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    filterBtnDisabled: {
        opacity: 0.5,
    },
    clearFilterText: {
        ...theme.typography.caption,
        color: theme.colors.danger,
        fontWeight: theme.fontWeights.medium,
    },
    filterBtnDisabledText: {
        color: theme.colors.textMuted,
    },
    applyFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.brand,
    },
    applyFilterText: {
        ...theme.typography.caption,
        color: theme.colors.brandContrast,
        fontWeight: theme.fontWeights.semiBold,
    },
    resetFilterInlineBtn: {
        marginTop: 4,
    },
    resetFilterInlineText: {
        fontSize: 12,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.medium,
    },
});
