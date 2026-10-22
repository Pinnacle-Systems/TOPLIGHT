import React, { useContext, useEffect, useMemo, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    StatusBar, 
    TouchableOpacity, 
    Dimensions 
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// App imports
import { Common_Context } from '../../context/CommonContext';
import { HOME_CARDS } from '../../constants/HomeCards';
import { filterAllowedCards } from '../../utils/NavigationUtils';
import { useAppTheme } from '../../theme';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

export default function HomeScreen() {
    const navigation = useNavigation();
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    
    // Retrieve user details from Redux state
    const { userName, isAdmin, Role } = useSelector(state => state.UserDetails);
    
    // Retrieve roles/pages from Context
    const { page } = useContext(Common_Context);
    
    const [filteredCards, setFilteredCards] = useState([]);

    // Compute allowed cards
    useEffect(() => {
        const allowed = filterAllowedCards(HOME_CARDS, page, isAdmin);
        setFilteredCards(allowed);
    }, [page, isAdmin]);

    const handleCardPress = (action) => {
        navigation.navigate(action);
    };

    // Formatted name and avatar initial
    const formattedName = userName 
        ? (userName.trim().charAt(0).toUpperCase() + userName.trim().slice(1).toLowerCase()) 
        : 'User';

    const avatarInitial = (formattedName.charAt(0) || 'U').toUpperCase();

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.surface}
            />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Clean, Modern Welcome Header Card */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeTextGroup}>
                        <Text style={styles.welcomeGreeting}>Welcome back 👋</Text>
                        <Text style={styles.welcomeName} numberOfLines={1}>
                            {formattedName}
                        </Text>
                        {isAdmin === 1 || isAdmin === true ? (
                            <View style={styles.roleChip}>
                                <MaterialCommunityIcons name="shield-crown-outline" size={13} color={theme.colors.brand} />
                                <Text style={styles.roleChipText}>Administrator</Text>
                            </View>
                        ) : Role ? (
                            <View style={styles.roleChip}>
                                <MaterialCommunityIcons name="account-outline" size={13} color={theme.colors.textMuted} />
                                <Text style={styles.roleChipSecondaryText}>{Role}</Text>
                            </View>
                        ) : null}
                    </View>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{avatarInitial}</Text>
                    </View>
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>WORKSPACE MODULES</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{filteredCards.length} Available</Text>
                    </View>
                </View>

                {/* Modules Grid */}
                <View style={styles.gridContainer}>
                    {filteredCards.length > 0 ? (
                        filteredCards.map((card, index) => (
                            <TouchableOpacity 
                                key={card.action || index} 
                                style={[styles.gridCard, { width: CARD_WIDTH }]} 
                                onPress={() => handleCardPress(card.action)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cardTopRow}>
                                    <View style={[styles.iconWrapper, { backgroundColor: `${theme.colors.chart[index % theme.colors.chart.length]}14` }]}>
                                        <MaterialCommunityIcons 
                                            name={card.icon} 
                                            size={24} 
                                                color={theme.colors.chart[index % theme.colors.chart.length]}
                                        />
                                    </View>
                                    <View style={styles.arrowBadge}>
                                        <MaterialCommunityIcons 
                                            name="arrow-top-right" 
                                            size={14} 
                                            color={theme.colors.textDisabled}
                                        />
                                    </View>
                                </View>
                                
                                <View style={styles.cardBottomRow}>
                                    <Text style={styles.cardLabel} numberOfLines={2}>
                                        {card.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBox}>
                                <MaterialCommunityIcons name="view-grid-plus-outline" size={36} color={theme.colors.textDisabled} />
                            </View>
                            <Text style={styles.emptyTitle}>No Modules Available</Text>
                            <Text style={styles.emptySubtitle}>
                                You do not have permission to access any modules at this time.
                            </Text>
                        </View>
                    )}
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
    scrollContent: {
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.huge,
    },
    welcomeCard: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: HORIZONTAL_PADDING,
        marginBottom: theme.spacing.lg + 2,
        borderRadius: theme.radii.xl,
        paddingHorizontal: theme.spacing.lg + 2,
        paddingVertical: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.isDark ? 0.3 : 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    welcomeTextGroup: {
        flex: 1,
        paddingRight: theme.spacing.md,
    },
    welcomeGreeting: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xxs,
    },
    welcomeName: {
        ...theme.typography.h2,
        color: theme.colors.text,
        letterSpacing: theme.letterSpacing.tight,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.brandSoft,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs + 1,
        borderRadius: theme.radii.md,
        alignSelf: 'flex-start',
        marginTop: theme.spacing.sm - 2,
        borderWidth: 1,
        borderColor: theme.colors.brandSoft,
        gap: theme.spacing.xs,
    },
    roleChipText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.brand,
    },
    roleChipSecondaryText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textMuted,
    },
    avatarCircle: {
        width: theme.controlSizes.avatarLg - 8,
        height: theme.controlSizes.avatarLg - 8,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brandSoft,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.brandSoft,
    },
    avatarText: {
        ...theme.typography.h3,
        color: theme.colors.brand,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenGutter,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.overline,
        color: theme.colors.textMuted,
    },
    countBadge: {
        backgroundColor: theme.colors.surfaceSunken,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs + 1,
        borderRadius: theme.radii.sm,
    },
    countBadgeText: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textMuted,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: CARD_GAP,
        paddingHorizontal: HORIZONTAL_PADDING,
    },
    gridCard: {
        height: 116,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md + 2,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.isDark ? 0.3 : 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconWrapper: {
        width: theme.controlSizes.avatarMd,
        height: theme.controlSizes.avatarMd,
        borderRadius: theme.radii.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowBadge: {
        width: theme.controlSizes.iconMd + 4,
        height: theme.controlSizes.iconMd + 4,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.backgroundSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    cardBottomRow: {
        marginTop: theme.spacing.sm - 2,
    },
    cardLabel: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
    },
    emptyContainer: {
        width: '100%',
        paddingVertical: theme.spacing.giant,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        marginTop: theme.spacing.sm,
    },
    emptyIconBox: {
        width: theme.controlSizes.avatarXl - 8,
        height: theme.controlSizes.avatarXl - 8,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.backgroundSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    emptyTitle: {
        ...theme.typography.title,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textMuted,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.xxl,
    },
});
