import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, SafeAreaView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../../components/text/CustomText';

import RoleAllocation from './RoleAllocation';
import UserCreationForm from './UserCreationForm';
import AdvancedSettings from './AdvancedSettings';
import { useAppTheme } from '../../../theme';

export default function UserAndRoles() {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
        outputRange: ['1%', '42%', '83%'],
    });

    const indicatorWidth = indicatorAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['39%', '39%', '16%'],
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
                        color={activeTab === 'allocate' ? theme.colors.brandContrast : theme.colors.textMuted}
                    />
                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === 'allocate' && styles.activeTabText
                        ]}
                        numberOfLines={1}
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
                        color={activeTab === 'create' ? theme.colors.brandContrast : theme.colors.textMuted}
                    />
                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === 'create' && styles.activeTabText
                        ]}
                        numberOfLines={1}
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
                        color={activeTab === 'settings' ? theme.colors.brandContrast : theme.colors.textMuted}
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

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    tabContainer: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radii.lg,
        marginHorizontal: theme.layout.screenGutter,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        padding: 4,
        position: 'relative',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    activeIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: theme.colors.brand,
        borderRadius: theme.radii.md,
        elevation: 3,
        shadowColor: theme.colors.brand,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    tabButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderRadius: theme.radii.md,
        zIndex: 1,
        paddingHorizontal: 4,
    },
    settingsTabButton: {
        flex: 0.9,
    },
    activeTabButton: {
        // styled by activeIndicator underneath
    },
    tabText: {
        ...theme.typography.caption,
        fontSize: 13,
        fontWeight: theme.fontWeights.semiBold,
        marginLeft: 6,
        color: theme.colors.textMuted,
    },
    activeTabText: {
        color: theme.colors.brandContrast,
        fontWeight: theme.fontWeights.bold,
    },
    contentContainer: {
        flex: 1,
    },
});
