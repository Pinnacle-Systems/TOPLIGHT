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

export default function HomeScreen() {
    const navigation = useNavigation();
    
    // Retrieve user details from Redux state (which we set in Login)
    const { userName, isAdmin } = useSelector(state => state.UserDetails);
    
    // Retrieve the roles/pages from Context (which are fetched via RTK query in App/RoleOnPage)
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.username}>
                        {userName ? userName : 'User'}
                    </Text>
                </View>
            </View>

            {/* Dashboard Cards Section */}
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cardsWrapper}>
                    {filteredCards.length > 0 ? (
                        filteredCards.map((card, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.card} 
                                onPress={() => handleCardPress(card.action)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: card.bg + '15' }]}>
                                    <MaterialCommunityIcons 
                                        name={card.icon} 
                                        size={28} 
                                        color={card.bg} 
                                    />
                                </View>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardText}>{card.label}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No access granted for any modules.</Text>
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
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        backgroundColor: '#0f172a',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    headerContent: {
        alignItems: 'flex-start',
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    username: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        marginTop: 4,
    },
    scrollContainer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    cardsWrapper: {
        width: width,
        paddingHorizontal: 20,
        flexDirection: 'column',
        gap: 12,
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTextContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyStateText: {
        color: '#64748b',
        fontSize: 16,
    }
});






