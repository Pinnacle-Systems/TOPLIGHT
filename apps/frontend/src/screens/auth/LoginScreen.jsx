import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
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

                if (filterdata?.isAdmin === 1) {
                    await AsyncStorage.setItem('userName', JSON.stringify({
                        userName: username, Id: filterdata?.Idcard, hod: filterdata?.hod, approval: filterdata?.approval, hr: filterdata?.hr, roleId: filterdata?.roleId, isAdmin: 1
                    }));
                    RNRestart.restart();
                    return;
                }

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
                GCOMPCODE: company?.companyCode, 
                COMPID: company?.companyid,
                hr, 
                hod: head, 
                roleId: roleid
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.background}
            >
                <View style={styles.logoContainer}>
                    {/* Fallback to text if image fails to load/not copied yet */}
                    <Text style={styles.appName}>Welcome Back</Text>
                    <Text style={styles.appSubtitle}>Sign in to your account</Text>
                </View>

                {Global ? (
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        <Text style={styles.selectionTitle}>Select Your Company</Text>
                        <View style={styles.companyList}>
                            {Globaldata.map(comp => (
                                <TouchableOpacity 
                                    key={comp.companyid}
                                    style={styles.companyItem} 
                                    onPress={() => OnSelectCompany(comp.companyCode)}
                                >
                                    <Text style={styles.companyItemText}>{comp.companyCode}</Text>
                                    <Icon name="chevron-right" size={24} color="#94a3b8" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <Icon name="error-outline" size={18} color="#fff" />
                                <Text style={styles.errorBannerText}>{error}</Text>
                            </View>
                        )}
                        
                        <View style={[styles.inputContainer, isFocusedName && styles.focusedInput]}>
                            <Icon name="person" size={20} color={isFocusedName ? "#3b82f6" : "#94a3b8"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#94a3b8"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                onFocus={() => setIsFocusedName(true)}
                                onBlur={() => setIsFocusedName(false)}
                            />
                        </View>
                        
                        <View style={[styles.inputContainer, isFocusedPass && styles.focusedInput]}>
                            <Icon name="lock" size={20} color={isFocusedPass ? "#3b82f6" : "#94a3b8"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                                onFocus={() => setIsFocusedPass(true)}
                                onBlur={() => setIsFocusedPass(false)}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                <Icon 
                                    name={isPasswordVisible ? "visibility" : "visibility-off"} 
                                    size={20} 
                                    color="#94a3b8" 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                        
                        <CustomizeButton 
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="white" /> : 'Login'}
                        </CustomizeButton>
                    </Animated.View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>@ 2026 Pinnacle Systems All right reserved</Text>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1, justifyContent: 'center', padding: 20 },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    appName: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    appSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
    card: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    errorBanner: { flexDirection: 'row', backgroundColor: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
    errorBannerText: { color: 'white', marginLeft: 8, fontSize: 14, flex: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: 'transparent' },
    focusedInput: { borderColor: '#3b82f6', backgroundColor: '#fff' },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, height: 50, color: '#1e293b', fontSize: 16 },
    eyeIcon: { padding: 8 },
    forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
    forgotPasswordText: { color: '#3b82f6', fontWeight: '600' },
    button: { backgroundColor: '#3b82f6', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#94a3b8' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    loginButton: { marginTop: 8 },
    selectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
    companyList: { maxHeight: 200 },
    companyItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    companyItemText: { fontSize: 16, color: '#1e293b', fontWeight: '600' },
    footer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
    footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 }
});
