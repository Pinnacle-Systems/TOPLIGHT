import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, SafeAreaView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../../components/Text/CustomText';

import RoleAllocation from './RoleAllocation';
import UserCreationForm from './UserCreationForm';
import AdvancedSettings from './AdvancedSettings';

export default function UserAndRoles() {
    const [activeTab, setActiveTab] = useState('allocate'); // 'allocate' | 'create' | 'settings'
    const indicatorAnim = useRef(new Animated.Value(0)).current;

    const handleTabChange = (tab, toValue) => {
        setActiveTab(tab);
        Animated.timing(indicatorAnim, {
            toValue,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const indicatorLeft = indicatorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['2%', '36%', '70%'],
    });

    const indicatorWidth = indicatorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['32%', '32%', '28%'],
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Tab Bar */}
            <View style={styles.tabContainer}>
                <Animated.View
                    style={[
                        styles.activeIndicator,
                        { left: indicatorLeft, width: indicatorWidth }
                    ]}
                />

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'allocate' && styles.activeTabButton]}
                    onPress={() => handleTabChange('allocate', 0)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="security"
                        size={18}
                        color={activeTab === 'allocate' ? '#ffffff' : '#64748b'}
                    />
                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === 'allocate' && styles.activeTabText
                        ]}
                    >
                        Allocate Role
                    </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'create' && styles.activeTabButton]}
                    onPress={() => handleTabChange('create', 1)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="person-add"
                        size={18}
                        color={activeTab === 'create' ? '#ffffff' : '#64748b'}
                    />
                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === 'create' && styles.activeTabText
                        ]}
                    >
                        Create User
                    </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, styles.settingsTabButton, activeTab === 'settings' && styles.activeTabButton]}
                    onPress={() => handleTabChange('settings', 2)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="settings"
                        size={20}
                        color={activeTab === 'settings' ? '#ffffff' : '#64748b'}
                    />
                </TouchableOpacity>
            </View>

            {/* Screen Content */}
            <View style={styles.contentContainer}>
                {activeTab === 'allocate' && <RoleAllocation />}
                {activeTab === 'create' && <UserCreationForm />}
                {activeTab === 'settings' && <AdvancedSettings />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    tabContainer: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        padding: 4,
        position: 'relative',
        alignItems: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: '#3b82f6',
        borderRadius: 9,
        elevation: 2,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderRadius: 8,
        zIndex: 1,
    },
    settingsTabButton: {
        flex: 0.7,
    },
    activeTabButton: {
        // styled by activeIndicator underneath
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
        color: '#64748b',
    },
    activeTabText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    contentContainer: {
        flex: 1,
    },
});
