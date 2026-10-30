import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Animated,
    StatusBar,
    PermissionsAndroid,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNRestart from 'react-native-restart';
import messaging from "@react-native-firebase/messaging";
import notifee from '@notifee/react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Store imports
import { useLoginUserMutation, useUpdate_user_fcmMutation } from '../../store/api/UserApi';
import { useAppTheme } from '../../theme';

// Reusable components could go to src/components/common, but for Login completeness we ensure they are handled
// You can extract these into `src/components/common` later
const CustomizeButton = ({ styles, onPress, disabled, style, children }) => (
    <TouchableOpacity 
        style={[styles.button, style, disabled && styles.buttonDisabled]} 
        onPress={onPress} 
        disabled={disabled}
        activeOpacity={0.8}
    >
        <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
);

export default function LoginScreen() {
    const navigation = useNavigation();
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [loginUser, { isLoading }] = useLoginUserMutation();
    const [update_fcm] = useUpdate_user_fcmMutation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Multi-company states
    const [Global, setGlobal] = useState(false);
    const [Globaldata, setGlobalData] = useState([]);
    const [GlobalSelected, setGlobalSelected] = useState();
    
    // User data states to save after company selection
    const [Id, setId] = useState();
    const [head, setHead] = useState();
    const [hr, sethr] = useState();
    const [roleid, setrolid] = useState();
    const [userRecord, setUserRecord] = useState(null);

    const [fadeAnim] = useState(new Animated.Value(0));
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocusedName, setIsFocusedName] = useState(false);
    const [isFocusedPass, setIsFocusedPass] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleLogin = async () => {
        setError(null);
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        try {
            const MobileDevice = await DeviceInfo.getDeviceName();
            const MobileIP = await DeviceInfo.getIpAddress();

            const data = await loginUser({ 
                username: username.trim(), 
                password, 
                deviceName: MobileDevice, 
                MobileIP, 
                COMPCODE: GlobalSelected // initially undefined
            }).unwrap();

            if (data.message === 'Login Successfull') {
                const filterdata = data?.data;

                // ── Super Admin path ───────────────────────────────────────────
                // A super-admin has isAdmin === 1 OR is the reserved 'admin' account.
                // They have no company / employee ID — bypass company selection entirely.
                const isSuperAdmin =
                    filterdata?.isAdmin === 1 ||
                    username.trim().toLowerCase() === 'admin';

                if (isSuperAdmin) {
                    await AsyncStorage.setItem('userName', JSON.stringify({
                        userName:  username,
                        Id:        filterdata?.idCard   ?? 'ADMIN',
                        UserId:    filterdata?.idCard   ?? 'ADMIN',
                        IDCARD:    filterdata?.idCard  ?? 'ADMIN',
                        hod:       filterdata?.hod      ?? null,
                        approval:  filterdata?.approval ?? null,
                        hr:        filterdata?.hr       ?? null,
                        roleId:    filterdata?.roleId   ?? null,
                        isAdmin:   1,
                        level:     filterdata?.level || 'top',
                        GCOMPCODE: 'SUPERADMIN', // sentinel value — no real company needed
                    }));
                    RNRestart.restart();
                    return;
                }
                // ──────────────────────────────────────────────────────────────

                setUserRecord(filterdata);
                setrolid(filterdata?.roleId);
                sethr(filterdata?.hr);
                setId(filterdata?.idCard);
                setHead(filterdata?.hod);
                
                const addComp = [];
                const filterunique = filterdata?.Companies?.filter((d) => {
                    if (!addComp.includes(d?.companyCode)) {
                        addComp.push(d?.companyCode);
                        return d;
                    }
                });

                if (filterunique && filterunique.length > 0) {
                    setGlobalData(filterunique);
                    setGlobal(true);
                } else {
                    setError('No companies assigned to this user.');
                }
            } else {
                setError(data.message || 'Login failed, please try again.');
            }
        } catch (err) {
            console.log("Login Error:", err);
            if (err.status === 'FETCH_ERROR') setError('Network error: Unable to connect to the server.');
            else if (err.status === 'TIMEOUT_ERROR') setError('Connection Timeout: The server took too long to respond.');
            else if (err.data && err.data.message) setError(err.data.message);
            else setError(err.message || 'An unexpected error occurred.');
        }
    };

    const OnSelectCompany = async (companyCode) => {
        if (!companyCode) return Alert.alert("Error", "Select Company");
        
        const company = Globaldata?.find((d) => d?.companyCode === companyCode);
        if (company?.companyId) {
            await AsyncStorage.setItem('userName', JSON.stringify({
                userName: username, 
                Id: Id, 
                UserId: Id,
                IDCARD: Id,
                GCOMPCODE: company?.companyCode, 
                COMPID: company?.companyId,
                hr, 
                hod: head, 
                approval: userRecord?.approval || 'HOD',
                roleId: roleid,
                level: userRecord?.level || (userRecord?.isAdmin ? 'admin' : 'user'),
                isAdmin: userRecord?.isAdmin === 1 || userRecord?.isAdmin === true ? 1 : 0,
                Companies: Globaldata,
            }));
            
            try {
                if (Platform.OS === 'android') {
                    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                }
                const authStatus = await messaging().requestPermission();
                await notifee.requestPermission();

                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    const token = await messaging().getToken();
                    if (token && Id) {
                        await update_fcm({ Idcard: Id, fcm: token });
                    }
                    messaging().onTokenRefresh(async (newToken) => {
                        if (newToken && Id) {
                            await update_fcm({ Idcard: Id, fcm: newToken });
                        }
                    });
                }
            } catch (err) {
                console.log("FCM setup error:", err);
            }
            
            // Exact original functionality triggers a restart upon successful login.
            // On reload, the root component will check AsyncStorage and redirect via RoleOnPage.
            RNRestart.restart();
        } else {
          //  Alert.alert("Failed", "Company Selection Failed");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.statusBar} />
            
            <LinearGradient
                colors={theme.isDark
                    ? [theme.colors.background, theme.colors.surface, theme.colors.brandSoft]
                    : [theme.colors.brandStrong, theme.colors.brand, theme.colors.secondary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.background}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Branding & Logo Header */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/login-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>Welcome Back</Text>
                        <Text style={styles.appSubtitle}>Sign in to continue to your dashboard</Text>
                    </View>

                    {Global ? (
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            <View style={styles.cardHeader}>
                                <Icon name="business" size={24} color={theme.colors.brand} />
                                <Text style={styles.selectionTitle}>Select Your Company</Text>
                            </View>
                            <Text style={styles.selectionSubtitle}>Choose the organization to access</Text>
                            <ScrollView 
                                style={styles.companyList}
                                contentContainerStyle={styles.companyListContent}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={true}
                                bounces={true}
                            >
                                {Globaldata.map(comp => (
                                    <TouchableOpacity 
                                        key={comp.companyid || comp.companyCode}
                                        testID={`company-${comp.companyCode}`}
                                        accessibilityLabel={comp.companyCode}
                                        accessibilityRole="button"
                                        style={styles.companyItem} 
                                        onPress={() => OnSelectCompany(comp.companyCode)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.companyLeft}>
                                            <View style={styles.companyIconBox}>
                                                <Icon name="apartment" size={20} color={theme.colors.brand} />
                                            </View>
                                            <Text style={styles.companyItemText}>{comp.companyCode}</Text>
                                        </View>
                                        <Icon name="arrow-forward" size={20} color={theme.colors.brand} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    ) : (
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            {error && (
                                <View style={styles.errorBanner}>
                                    <Icon name="error" size={18} color={theme.colors.danger} />
                                    <Text style={styles.errorBannerText}>{error}</Text>
                                </View>
                            )}
                            
                            {/* Username Input */}
                            <Text style={styles.inputLabel}>Username</Text>
                            <Pressable 
                                style={[styles.inputContainer, isFocusedName && styles.focusedInput]}
                                onPress={() => usernameRef.current?.focus()}
                            >
                                <View pointerEvents="none" style={[styles.iconWrapper, isFocusedName && styles.activeIconWrapper]}>
                                    <Icon name="person" size={20} color={isFocusedName ? theme.colors.brand : theme.colors.textMuted} />
                                </View>
                                <TextInput
                                    testID="usernameInput"
                                    accessibilityLabel="Username"
                                    ref={usernameRef}
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    placeholderTextColor={theme.colors.placeholder}
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setIsFocusedName(true)}
                                    onBlur={() => setIsFocusedName(false)}
                                />
                            </Pressable>
                            
                            {/* Password Input */}
                            <Text style={styles.inputLabel}>Password</Text>
                            <Pressable 
                                style={[styles.inputContainer, isFocusedPass && styles.focusedInput]}
                                onPress={() => passwordRef.current?.focus()}
                            >
                                <View pointerEvents="none" style={[styles.iconWrapper, isFocusedPass && styles.activeIconWrapper]}>
                                    <Icon name="lock" size={20} color={isFocusedPass ? theme.colors.brand : theme.colors.textMuted} />
                                </View>
                                <TextInput
                                    testID="passwordInput"
                                    accessibilityLabel="Password"
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={theme.colors.placeholder}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!isPasswordVisible}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setIsFocusedPass(true)}
                                    onBlur={() => setIsFocusedPass(false)}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon} 
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    activeOpacity={0.7}
                                >
                                    <Icon 
                                        name={isPasswordVisible ? "visibility" : "visibility-off"} 
                                        size={20} 
                                        color={theme.colors.textMuted} 
                                    />
                                </TouchableOpacity>
                            </Pressable>
                            {/* Gradient Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.85}
                                testID="signInButton"
                                accessibilityLabel="Sign In"
                                accessibilityRole="button"
                                style={styles.loginButtonWrapper}
                            >
                                <LinearGradient
                                    colors={[theme.colors.brand, theme.colors.brandStrong, theme.colors.secondary]}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 0}}
                                    style={styles.gradientButton}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={theme.colors.brandContrast} size="small" />
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Sign In</Text>
                                            <Icon name="arrow-forward" size={18} color={theme.colors.brandContrast} style={{ marginLeft: 6 }} />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2026 Pinnacle Systems • All rights reserved</Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        paddingHorizontal: theme.layout.screenGutterWide,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logo: {
        width: 120,
        height: 110,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    appName: {
        ...theme.typography.h1,
        color: theme.colors.white,
        letterSpacing: theme.letterSpacing.wide,
    },
    appSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.white,
        opacity: 0.75,
        marginTop: theme.spacing.xs,
        letterSpacing: theme.letterSpacing.normal,
    },
    card: {
        ...theme.styles.card,
        ...theme.styles.shadow,
        borderRadius: theme.radii.xxl,
        padding: theme.spacing.xxl,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: theme.isDark ? 0.35 : 0.18,
        shadowRadius: theme.spacing.xxl,
        elevation: theme.elevation.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xs,
    },
    selectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        marginLeft: theme.spacing.sm,
    },
    selectionSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    companyList: {
        maxHeight: 290,
    },
    companyListContent: {
        paddingBottom: 4,
    },
    companyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.backgroundSubtle,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    companyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyIconBox: {
        width: theme.controlSizes.avatarSm + 4,
        height: theme.controlSizes.avatarSm + 4,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.brandSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    companyItemText: {
        ...theme.typography.subtitle,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.bold,
    },
    errorBanner: {
        flexDirection: 'row',
        backgroundColor: theme.colors.dangerSoft,
        padding: theme.spacing.md,
        borderRadius: theme.radii.md,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
    },
    errorBannerText: {
        ...theme.typography.caption,
        color: theme.colors.danger,
        marginLeft: theme.spacing.sm,
        fontWeight: theme.fontWeights.semiBold,
        flex: 1,
    },
    inputLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        letterSpacing: theme.letterSpacing.normal,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.radii.md,
        marginBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1.5,
        borderColor: theme.colors.inputBorder,
        height: theme.controlSizes.inputHeight + theme.spacing.xs,
    },
    focusedInput: {
        borderColor: theme.colors.inputBorderFocused,
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.brand,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.24 : 0.12,
        shadowRadius: 6,
        elevation: 2,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    activeIconWrapper: {
        backgroundColor: theme.colors.brandSoft,
    },
    input: {
        flex: 1,
        height: '100%',
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontWeight: theme.fontWeights.medium,
        paddingVertical: 0,
        paddingHorizontal: 4,
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.xl,
    },
    forgotPasswordText: {
        ...theme.typography.caption,
        color: theme.colors.brand,
        fontWeight: theme.fontWeights.semiBold,
    },
    loginButtonWrapper: {
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        shadowColor: theme.colors.brand,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: theme.isDark ? 0.25 : 0.35,
        shadowRadius: 10,
        elevation: theme.elevation.md,
    },
    gradientButton: {
        height: theme.controlSizes.buttonHeight + theme.spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radii.md,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...theme.typography.button,
        color: theme.colors.brandContrast,
        letterSpacing: theme.letterSpacing.wide,
    },
    footer: {
        marginTop: theme.spacing.xxl,
        marginBottom: theme.spacing.sm + 2,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.caption,
        color: theme.colors.white,
        opacity: 0.65,
        fontWeight: theme.fontWeights.medium,
    },
});
