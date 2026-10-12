import React, { useEffect, useState, useRef } from 'react';
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
import { useLoginUserMutation, useUpdate_user_fcmMutation } from '../../store/api/userApi';

// Reusable components could go to src/components/common, but for Login completeness we ensure they are handled
// You can extract these into `src/components/common` later
const CustomizeButton = ({ onPress, disabled, style, children }) => (
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
                        Id:        filterdata?.Idcard   ?? 'ADMIN',
                        UserId:    filterdata?.Idcard   ?? 'ADMIN',
                        IDCARD:    filterdata?.Idcard   ?? 'ADMIN',
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
                setId(filterdata?.Idcard);
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

        if (company?.companyid) {
            await AsyncStorage.setItem('userName', JSON.stringify({
                userName: username, 
                Id: Id, 
                UserId: Id,
                IDCARD: Id,
                GCOMPCODE: company?.companyCode, 
                COMPID: company?.companyid,
                hr, 
                hod: head, 
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
            Alert.alert("Failed", "Company Selection Failed");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#090d16" />
            
            <LinearGradient
                colors={['#090d16', '#0f172a', '#1e3a8a']}
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
                            source={require('../../assets/login_logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>Welcome Back</Text>
                        <Text style={styles.appSubtitle}>Sign in to continue to your dashboard</Text>
                    </View>

                    {Global ? (
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            <View style={styles.cardHeader}>
                                <Icon name="business" size={24} color="#3b82f6" />
                                <Text style={styles.selectionTitle}>Select Your Company</Text>
                            </View>
                            <Text style={styles.selectionSubtitle}>Choose the organization to access</Text>
                            <View style={styles.companyList}>
                                {Globaldata.map(comp => (
                                    <TouchableOpacity 
                                        key={comp.companyid || comp.companyCode}
                                        style={styles.companyItem} 
                                        onPress={() => OnSelectCompany(comp.companyCode)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.companyLeft}>
                                            <View style={styles.companyIconBox}>
                                                <Icon name="apartment" size={20} color="#2563eb" />
                                            </View>
                                            <Text style={styles.companyItemText}>{comp.companyCode}</Text>
                                        </View>
                                        <Icon name="arrow-forward" size={20} color="#3b82f6" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    ) : (
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            {error && (
                                <View style={styles.errorBanner}>
                                    <Icon name="error" size={18} color="#ffffff" />
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
                                    <Icon name="person" size={20} color={isFocusedName ? "#2563eb" : "#64748b"} />
                                </View>
                                <TextInput
                                    ref={usernameRef}
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    placeholderTextColor="#94a3b8"
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
                                    <Icon name="lock" size={20} color={isFocusedPass ? "#2563eb" : "#64748b"} />
                                </View>
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#94a3b8"
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
                                        color="#64748b" 
                                    />
                                </TouchableOpacity>
                            </Pressable>
                            
                            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                            
                            {/* Gradient Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.85}
                                style={styles.loginButtonWrapper}
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#2563eb', '#1d4ed8']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 0}}
                                    style={styles.gradientButton}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#ffffff" size="small" />
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Sign In</Text>
                                            <Icon name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 120,
        height: 110,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
    appSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 6,
        letterSpacing: 0.2,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    selectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1e293b',
        marginLeft: 8,
    },
    selectionSubtitle: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 18,
    },
    companyList: {
        maxHeight: 240,
    },
    companyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#f8fafc',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    companyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    companyItemText: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '700',
    },
    errorBanner: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    errorBannerText: {
        color: '#ffffff',
        marginLeft: 8,
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 52,
    },
    focusedInput: {
        borderColor: '#3b82f6',
        backgroundColor: '#ffffff',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
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
        backgroundColor: '#eff6ff',
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#1e293b',
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 0,
        paddingHorizontal: 4,
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 13,
    },
    loginButtonWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    gradientButton: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    footer: {
        marginTop: 24,
        marginBottom: 10,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.55)',
        fontSize: 12,
        fontWeight: '500',
    },
});
