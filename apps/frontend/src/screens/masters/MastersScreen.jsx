import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useGet_all_Onduty_reasonQuery } from '../../store/api/OndutyApi';
import { useGet_all_Permission_reasonQuery } from '../../store/api/PermissionApi';
import { useGet_all_roleQuery } from '../../store/api/RoleOnApi';

import OndutyMasterScreen from './OndutyMasterScreen';
import PermissionMasterScreen from './PermissionMasterScreen';
import RoleMasterScreen from './RoleMasterScreen';
import { MASTER_TABS } from './MasterConfig';
import { useAppTheme } from '../../theme';

export default function MastersScreen() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const navigation = useNavigation();
    const route = useRoute();
    const UserSelect = useSelector(state => state.UserDetails);

    // Initial tab can optionally come from navigation route params
    const initialTab = route?.params?.initialTab || 'overview';
    const [selectedTab, setSelectedTab] = useState(initialTab);

    // ── Live Query Counts for Overview ─────────────────────────────────────────
    const { data: ondutyData } = useGet_all_Onduty_reasonQuery();
    const { data: permissionData } = useGet_all_Permission_reasonQuery();
    const { data: rolesData } = useGet_all_roleQuery({ where: UserSelect?.GCOMPCODE });

    const ondutyCount = ondutyData?.data?.length || 0;
    const permissionCount = permissionData?.data?.length || 0;
    const rolesCount = rolesData?.data?.length || 0;
    const totalCount = ondutyCount + permissionCount + rolesCount;

    const getModuleCount = (tabId) => {
        switch (tabId) {
            case 'onduty': return `${ondutyCount} items`;
            case 'permission': return `${permissionCount} items`;
            case 'role': return `${rolesCount} roles`;
            default: return '';
        }
    };

    // ── If a specific Master tab is selected, render it directly ──────────────
    if (selectedTab === 'onduty') {
        return (
            <View style={styles.container}>
                <OndutyMasterScreen navigation={{
                    ...navigation,
                    goBack: () => setSelectedTab('overview'),
                }} />
            </View>
        );
    }

    if (selectedTab === 'permission') {
        return (
            <View style={styles.container}>
                <PermissionMasterScreen navigation={{
                    ...navigation,
                    goBack: () => setSelectedTab('overview'),
                }} />
            </View>
        );
    }

    if (selectedTab === 'role') {
        return (
            <View style={styles.container}>
                <RoleMasterScreen navigation={{
                    ...navigation,
                    goBack: () => setSelectedTab('overview'),
                }} />
            </View>
        );
    }

    // ── Overview Hub View ──────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.surfaceRaised}
            />

            {/* Hero Header */}
            <View style={styles.heroHeader}>
                <View style={styles.heroTopRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.heroText}>
                        <Text style={styles.heroTitle}>Masters Hub</Text>
                        <Text style={styles.heroSubtitle}>Configure system-wide categories & roles</Text>
                    </View>
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalBadgeText}>{totalCount} Total</Text>
                    </View>
                </View>

                {/* Segmented Tab Switcher Bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabItem, styles.tabItemActive]}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="view-dashboard-outline" size={15} color={theme.colors.brandContrast} />
                        <Text style={[styles.tabText, styles.tabTextActive]}>Overview</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => setSelectedTab('onduty')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="clock-check-outline" size={15} color={theme.colors.textMuted} />
                        <Text style={styles.tabText}>OnDuty</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => setSelectedTab('permission')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="account-clock-outline" size={15} color={theme.colors.textMuted} />
                        <Text style={styles.tabText}>Permissions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabItem}
                        onPress={() => setSelectedTab('role')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="shield-account-outline" size={15} color={theme.colors.textMuted} />
                        <Text style={styles.tabText}>Roles</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>AVAILABLE MASTER SCREENS</Text>
                    <Text style={styles.sectionSub}>Select a master to view & manage records</Text>
                </View>

                {/* Master Cards shown one by one */}
                {MASTER_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={styles.masterCard}
                        onPress={() => setSelectedTab(tab.id)}
                        activeOpacity={0.75}
                    >
                        {/* Left Color Stripe */}
                        <View style={[styles.colorStripe, { backgroundColor: getTabColors(theme, tab.id).accent }]} />

                        {/* Icon */}
                        <View style={[styles.iconWrap, { backgroundColor: getTabColors(theme, tab.id).background }]}>
                            <MaterialCommunityIcons name={tab.icon} size={26} color={getTabColors(theme, tab.id).accent} />
                        </View>

                        {/* Content */}
                        <View style={styles.cardBody}>
                            <View style={styles.cardTitleRow}>
                                <Text style={styles.cardTitle} numberOfLines={1}>{tab.title}</Text>
                                <View style={[styles.badgePill, { backgroundColor: getTabColors(theme, tab.id).background }]}>
                                    <Text style={[styles.badgePillText, { color: getTabColors(theme, tab.id).accent }]}>
                                        {getModuleCount(tab.id)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.cardSubtitle} numberOfLines={2}>{tab.subtitle}</Text>

                            <View style={styles.cardFooter}>
                                <Text style={[styles.manageLink, { color: getTabColors(theme, tab.id).accent }]}>
                                    Open {tab.shortTitle} Master →
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.brand} />
                    <Text style={styles.infoText}>
                        Master categories and roles define the options available in OnDuty, Attendance, Permissions, and user role allocation.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    heroHeader: {
        backgroundColor: theme.colors.surfaceRaised,
        paddingHorizontal: theme.layout.screenGutter,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: theme.colors.surfaceSunken,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroText: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: theme.letterSpacing.tight,
    },
    heroSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        opacity: 0.78,
        marginTop: 2,
    },
    totalBadge: {
        backgroundColor: theme.colors.surfaceSunken,
        paddingHorizontal: theme.spacing.md - 2,
        paddingVertical: theme.spacing.xs + 1,
        borderRadius: theme.radii.md,
    },
    totalBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.text,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.md,
        padding: theme.spacing.xs,
        gap: theme.spacing.xs,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radii.sm,
        gap: theme.spacing.xs + 1,
    },
    tabItemActive: {
        backgroundColor: theme.colors.brand,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textMuted,
    },
    tabTextActive: {
        color: theme.colors.brandContrast,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: theme.layout.screenGutter,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.huge,
    },
    sectionHeader: {
        marginBottom: theme.spacing.md + 2,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.textDisabled,
        letterSpacing: 1.2,
    },
    sectionSub: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    masterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.3 : 0.05,
        shadowRadius: 4,
    },
    colorStripe: {
        width: 5,
        alignSelf: 'stretch',
    },
    iconWrap: {
        width: 50,
        height: 50,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 14,
        marginRight: 12,
    },
    cardBody: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 14,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text,
        flex: 1,
    },
    badgePill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    badgePillText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    cardSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        lineHeight: 17,
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    manageLink: {
        fontSize: 12,
        fontWeight: '700',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.brandSoft,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md + 2,
        gap: theme.spacing.sm + 2,
        marginTop: theme.spacing.sm - 2,
        borderWidth: 1,
        borderColor: theme.colors.brand,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.brandStrong,
        lineHeight: 18,
    },
});

const getTabColors = (theme, tabId) => {
    switch (tabId) {
        case 'permission':
            return { accent: theme.colors.accent, background: theme.colors.accentSoft };
        case 'role':
            return { accent: theme.colors.secondary, background: theme.colors.secondarySoft };
        default:
            return { accent: theme.colors.brand, background: theme.colors.brandSoft };
    }
};
