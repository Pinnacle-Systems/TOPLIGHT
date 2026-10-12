import React, { useContext, useEffect, useState } from 'react';
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
import { HOME_CARDS } from '../../constants/homeCards';
import { filterAllowedCards } from '../../utils/navigationUtils';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

export default function HomeScreen() {
    const navigation = useNavigation();
    
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
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
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
                                <MaterialCommunityIcons name="shield-crown-outline" size={13} color="#007AFF" />
                                <Text style={styles.roleChipText}>Administrator</Text>
                            </View>
                        ) : Role ? (
                            <View style={styles.roleChip}>
                                <MaterialCommunityIcons name="account-outline" size={13} color="#64748B" />
                                <Text style={[styles.roleChipText, { color: '#64748B' }]}>{Role}</Text>
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
                                    <View style={[styles.iconWrapper, { backgroundColor: card.bg + '14' }]}>
                                        <MaterialCommunityIcons 
                                            name={card.icon} 
                                            size={24} 
                                            color={card.bg} 
                                        />
                                    </View>
                                    <View style={styles.arrowBadge}>
                                        <MaterialCommunityIcons 
                                            name="arrow-top-right" 
                                            size={14} 
                                            color="#94A3B8" 
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
                                <MaterialCommunityIcons name="view-grid-plus-outline" size={36} color="#94A3B8" />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingTop: 12,
        paddingBottom: 40,
    },
    welcomeCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: HORIZONTAL_PADDING,
        marginBottom: 18,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    welcomeTextGroup: {
        flex: 1,
        paddingRight: 12,
    },
    welcomeGreeting: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 2,
    },
    welcomeName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        gap: 4,
    },
    roleChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#007AFF',
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DBEAFE',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#007AFF',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    countBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    countBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: CARD_GAP,
        paddingHorizontal: HORIZONTAL_PADDING,
    },
    gridCard: {
        height: 116,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardBottomRow: {
        marginTop: 6,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        lineHeight: 18,
    },
    emptyContainer: {
        width: '100%',
        paddingVertical: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginTop: 8,
    },
    emptyIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
});
