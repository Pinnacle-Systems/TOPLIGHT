import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import { useSelector, useDispatch } from 'react-redux';
import { Common_Context } from '../../context/CommonContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setClearAll } from '../../store/slices/userDetailsSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavRef } from '../Utils/NavigationRef';
import { useAppTheme } from '../../theme';

const { width } = Dimensions.get('window');
const drawerWidth = Math.min(width * 0.82, 360);

export default function Sidebar({ openSidebar, setopenSidebar, allowedTabs }) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const dispatch = useDispatch();
    const [activeRouteName, setActiveRouteName] = useState(null);
    const { logout } = useContext(Common_Context);
    const USER = useSelector((state) => state?.UserDetails);
    
    const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

    useEffect(() => {
        const updateActiveRoute = () => {
            setActiveRouteName(NavRef.getCurrentRoute()?.name || null);
        };

        updateActiveRoute();
        const unsubscribe = NavRef.addListener('state', updateActiveRoute);
        return unsubscribe;
    }, []);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: openSidebar ? 0 : -drawerWidth,
            useNativeDriver: true,
            bounciness: 2,
            speed: 20,
        }).start();
    }, [openSidebar, slideAnim]);

    const handleClose = () => setopenSidebar(false);

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('userName');
                            dispatch(setClearAll());
                            setopenSidebar(false);
                            logout?.();
                        } catch (error) {
                            console.error('[Sidebar] Logout failed:', error);
                            Alert.alert('Logout Failed', 'Unable to log out. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true },
        );
    };

    const handleNavigation = (path) => {
        setopenSidebar(false);
        try {
            if (!NavRef.isReady()) return;
            NavRef.navigate(path);
        } catch (e) {
            console.warn("Screen not available yet:", path);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.brand}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.profileSection}>
                <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                        {USER?.userName ? USER.userName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {USER?.userName || USER?.username || 'User'}
                    </Text>
                    <Text style={styles.userRole} numberOfLines={1}>
                        {USER?.GCOMPCODE || USER?.level || 'Employee'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <>
            {/* Backdrop Overlay */}
            {openSidebar && (
                <Pressable 
                    style={StyleSheet.absoluteFill} 
                    onPress={handleClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close navigation menu"
                >
                    <View style={styles.backdrop} />
                </Pressable>
            )}

            {/* Sidebar Drawer */}
            <Animated.View
                pointerEvents={openSidebar ? 'auto' : 'none'}
                style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
            >
                <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
                    
                    {/* Header */}
                    {renderHeader()}

                    {/* Navigation Items */}
                    <View style={styles.navList}>
                        <View style={styles.navHeading}>
                            <Text style={styles.navTitle}>MENU</Text>
                            <View style={styles.navHeadingRule} />
                        </View>
                        <FlatList 
                            data={allowedTabs}
                            keyExtractor={(item) => item.path}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isActive = activeRouteName === item.path;
                                const icon = React.isValidElement(item.icon)
                                    ? React.cloneElement(item.icon, {
                                        size: 21,
                                        color: isActive ? theme.colors.brand : theme.colors.textMuted,
                                    })
                                    : item.icon;

                                return (
                                    <TouchableOpacity
                                        style={[styles.navItem, isActive && styles.navItemActive]}
                                        onPress={() => handleNavigation(item.path)}
                                        activeOpacity={0.7}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isActive }}
                                    >
                                        <View style={[styles.navIconBox, isActive && styles.navIconBoxActive]}>
                                            {icon}
                                        </View>
                                        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                                            {item.name}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={20}
                                            color={isActive ? theme.colors.brand : theme.colors.borderStrong}
                                        />
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>

                    {/* Footer / Logout */}
                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={styles.logoutBtn} 
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Feather name="log-out" size={20} color={theme.colors.danger} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                        <Text style={styles.versionText}>TopLight v2.0</Text>
                    </View>

                </SafeAreaView>
            </Animated.View>
        </>
    );
}

const createStyles = theme => StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: theme.colors.scrim,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: drawerWidth,
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: theme.isDark ? 0.4 : 0.16,
        shadowRadius: 18,
        elevation: 20,
        zIndex: 1000,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xxl - 2,
        backgroundColor: theme.colors.backgroundSubtle,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    brand: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
    },
    logo: {
        width: 112,
        height: 38,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    avatarWrap: {
        width: theme.controlSizes.avatarLg - 10,
        height: theme.controlSizes.avatarLg - 10,
        borderRadius: theme.radii.circle,
        backgroundColor: theme.colors.brand,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        shadowColor: theme.colors.brand,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.isDark ? 0.35 : 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    avatarText: {
        ...theme.typography.h4,
        color: theme.colors.brandContrast,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...theme.typography.subtitle,
        color: theme.colors.text,
        marginBottom: theme.spacing.xxs + 1,
    },
    userRole: {
        ...theme.typography.caption,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.textMuted,
    },
    navList: {
        flex: 1,
        paddingHorizontal: theme.layout.screenGutter,
        paddingTop: theme.spacing.xl,
    },
    navHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 2,
        marginBottom: theme.spacing.sm + 2,
    },
    navTitle: {
        ...theme.typography.overline,
        color: theme.colors.textDisabled,
        letterSpacing: theme.letterSpacing.wider,
        marginRight: theme.spacing.sm + 2,
    },
    navHeadingRule: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.divider,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: theme.controlSizes.minTouchTarget + theme.spacing.sm,
        paddingHorizontal: theme.spacing.sm + 1,
        borderRadius: theme.radii.md,
        marginBottom: theme.spacing.xs,
    },
    navItemActive: {
        backgroundColor: theme.colors.surfaceSelected,
    },
    navIconBox: {
        width: theme.controlSizes.avatarSm + 2,
        height: theme.controlSizes.avatarSm + 2,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surfaceSunken,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    navIconBoxActive: {
        backgroundColor: theme.colors.brandSoft,
    },
    navLabel: {
        flex: 1,
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.textSecondary,
    },
    navLabelActive: {
        color: theme.colors.brandStrong,
        fontWeight: theme.fontWeights.bold,
    },
    footer: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: theme.controlSizes.minTouchTarget,
        paddingVertical: theme.spacing.sm + 3,
        backgroundColor: theme.colors.dangerSoft,
        borderRadius: theme.radii.md,
        marginBottom: theme.spacing.sm + 3,
    },
    logoutText: {
        marginLeft: theme.spacing.sm,
        ...theme.typography.label,
        color: theme.colors.danger,
    },
    versionText: {
        textAlign: 'center',
        ...theme.typography.caption,
        color: theme.colors.textDisabled,
        fontWeight: theme.fontWeights.medium,
    }
});
