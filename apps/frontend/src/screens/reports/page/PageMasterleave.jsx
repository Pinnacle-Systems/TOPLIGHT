import React, { useContext, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AllowedTabs_Filter } from '../../../components/utils/AllowedPagesFiltering';
import { Common_Context } from '../../../context/CommonContext';
import { useAppTheme } from '../../../theme';

const PageMaster_leave = ({ navigation }) => {
    const { theme } = useAppTheme();
    const { width } = useWindowDimensions();
    const { page, admin } = useContext(Common_Context) || {};
    const [selectedCard, setSelectedCard] = useState(null);

    // Responsive 2-column or 3-column layout
    const isTablet = width >= 768;
    const HORIZONTAL_PADDING = 16;
    const CARD_GAP = 12;
    const cardWidth = isTablet 
        ? (width - (HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3 
        : (width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

    const cardLabels = useMemo(() => [
        {
            label: 'Leave Report',
            action: 'leave_report',
            icon: 'calendar-text-outline',
            color: '#10b981',
            softColor: '#ecfdf5',
            description: 'Leave history, balance & logs',
        },
        {
            label: 'Permission Report',
            action: 'per_report',
            icon: 'account-clock-outline',
            color: '#7c3aed',
            softColor: '#f5f3ff',
            description: 'Hourly permission requests log',
        },
        {
            label: 'Onduty Report',
            action: 'onduty_report',
            icon: 'briefcase-outline',
            color: '#f59e0b',
            softColor: '#fffbeb',
            description: 'Field visits & travel records',
        },
        {
            label: 'Attendance Report',
            action: 'ATTENDANCEREPORT',
            icon: 'clipboard-text-outline',
            color: '#2563eb',
            softColor: '#eff6ff',
            description: 'Daily department attendance',
        },
    ], [theme]);

    const handleClick = (label, action) => {
        setSelectedCard(label);
        navigation?.navigate(action);
    };

    const filterCards = admin === 1 || admin === true
        ? cardLabels
        : AllowedTabs_Filter({
            tabs: cardLabels,
            allowedTabs: page,
            tabsPath_key: 'action',
            allowedTabspath_key: 'link',
            condtion: 'isdefault',
        });

    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header / Section Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.titleRow}>
                    {navigation?.canGoBack?.() && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.sectionTitle}>REPORTS DASHBOARD</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{filterCards.length} Available</Text>
                </View>
            </View>

            {/* Grid of Report Cards */}
            <View style={styles.gridContainer}>
                {filterCards.map((item, index) => {
                    const cardColor = item.color || theme.colors.brand;

                    return (
                        <TouchableOpacity
                            key={item.action || index}
                            style={[styles.gridCard, { width: cardWidth }]}
                            onPress={() => handleClick(item.label, item.action)}
                            activeOpacity={0.75}
                        >
                            {/* Top Accent Strip */}
                            <View style={[styles.cardAccent, { backgroundColor: cardColor }]} />

                            <View style={styles.cardTopRow}>
                                <View style={[styles.iconWrapper, { backgroundColor: item.softColor }]}>
                                    <MaterialCommunityIcons
                                        name={item.icon}
                                        size={22}
                                        color={cardColor}
                                    />
                                </View>
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardLabel} numberOfLines={1}>
                                    {item.label}
                                </Text>
                                <Text style={styles.cardDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={[styles.cardFooterText, { color: cardColor }]}>
                                    Open Report
                                </Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={16}
                                    color={cardColor}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const createStyles = theme =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContent: {
            paddingTop: theme.spacing.md || 16,
            paddingBottom: theme.spacing.huge || 40,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: theme.spacing.md || 16,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        backBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sectionTitle: {
            fontSize: theme.fontSizes.xs || 12,
            fontFamily: theme.fontFamilies?.bold || 'System',
            fontWeight: '700',
            color: theme.colors.textSecondary,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },
        countBadge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: theme.radii.pill || 99,
            backgroundColor: theme.colors.surfaceSunken,
        },
        countBadgeText: {
            fontSize: theme.fontSizes.xs || 11.5,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        gridContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            gap: 12,
        },
        gridCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg || 14,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            overflow: 'hidden',
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 10,
            minHeight: 156,
            justifyContent: 'space-between',
            shadowColor: theme.colors.shadow || 'rgba(0,0,0,0.04)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
        cardAccent: {
            height: 4,
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        },
        cardTopRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        iconWrapper: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardContent: {
            flex: 1,
            justifyContent: 'center',
            marginVertical: 4,
        },
        cardLabel: {
            fontSize: theme.fontSizes.sm || 13.5,
            fontFamily: theme.fontFamilies?.bold || 'System',
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 3,
        },
        cardDescription: {
            fontSize: theme.fontSizes.xs || 11,
            fontFamily: theme.fontFamilies?.regular || 'System',
            color: theme.colors.textSecondary,
            lineHeight: 15,
        },
        cardFooter: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSubtle,
        },
        cardFooterText: {
            fontSize: 11.5,
            fontWeight: '600',
        },
    });

export default PageMaster_leave;
