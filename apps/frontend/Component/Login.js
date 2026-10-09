import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Image,
    TouchableOpacity,
    Animated,
    StatusBar,
    PermissionsAndroid,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { useLoginUserMutation, useUpdate_user_fcmMutation } from '../redux/service/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomizeButton from './Buttons/CustomizeButton';
import { useNavigation } from '@react-navigation/native';
import { screenWidth } from './Utils/Screens';
import RNRestart from 'react-native-restart';
import CustomText from './Text/CustomText';
import ForgotPasswordScreen from './Authunticate/ForgotScreen';
import CommonModal from './Modal/CommonModal';
import { Dropdown } from '../ReusableComponents/inputs';
import messaging from "@react-native-firebase/messaging";
import notifee from '@notifee/react-native';
import Custom_Notification from './Utils/Custom_Notification';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [Global, setGlobal] = useState(false);
    const [Id, setId] = useState();
    const [Globaldata, setGlobalData] = useState([]);
    const [forgotpassword_Modal, setforgotPassword_Modal] = useState(false);
    const [error, setError] = useState(null);
    const [loginUser, { isLoading }] = useLoginUserMutation();
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation_use = useNavigation();
    const [GlobalSelected, setGlobalSelected] = useState();
    const [head, setHead] = useState();
    const [hr, sethr] = useState();
    const [roleid, setrolid] = useState();
    const [update_fcm] = useUpdate_user_fcmMutation();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocusedName, setIsFocusedName] = useState(false);
    const [isFocusedPass, setIsFocusedPass] = useState(false);

    const OnSelectCompany = async () => {
        if (!GlobalSelected) return alert("Select Company");
        var company = Globaldata?.find((data) => data?.companyCode == GlobalSelected);

        if (company?.companyid) {
            await AsyncStorage.setItem('userName', JSON.stringify({
                userName: username, Id: Id, GCOMPCODE: company?.companyCode, COMPID: company?.companyid,hr, hod: head, roleId: roleid
            }));
            
            try {
                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                const authStatus = await messaging().requestPermission();
                await notifee.requestPermission();

                const enabled =
                    authStatus === messaging?.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging?.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    await messaging().onTokenRefresh(async (token) => {
                        token && Id ? await update_fcm({ Idcard: Id, fcm: token }) : { data: {} }
                    });
                }
            } catch (error) {
                console.log(error);
            }
            RNRestart.restart();
        } else {
            Custom_Notification(100, { title: "Failed", message: "Company Selection Failed" });
        }
    };

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

        var MobileDevice = await DeviceInfo.getDeviceName();
        var MobileIP = await DeviceInfo.getIpAddress();

        try {
            const data = await loginUser({ 
                username: username.trim(), 
                password, 
                deviceName: MobileDevice, 
                MobileIP, 
                COMPCODE: GlobalSelected 
            }).unwrap();

            if (data.message === 'Login Successfull') {
                var filterdata = data?.data;

                if (filterdata?.isAdmin == 1) {
                    await AsyncStorage.setItem('userName', JSON.stringify({
                        userName: username, Id: Id, hod: head, approval: filterdata?.approval, hr: hr, roleId: roleid, isAdmin: 1
                    }));
                    RNRestart.restart();
                    return;
                }
                setrolid(filterdata?.roleId);
                setGlobal(true);
                sethr(filterdata?.hr);
                
                var addComp = [];
                var filterunique = filterdata?.Companies.filter((data) => {
                    if (!addComp.includes(data?.companyCode)) {
                        addComp.push(data?.companyCode);
                        return data;
                    }
                });

                setGlobalData(filterunique);
                setId(filterdata?.Idcard);
                setHead(filterdata?.hod);
            } else {
                setError(data.message || 'Login failed, please try again.');
            }
        } catch (error) {
            console.log("Login Error:", error);
            if (error.status === 'FETCH_ERROR') {
                setError('Network error: Unable to connect to the server.');
            } else if (error.status === 'TIMEOUT_ERROR') {
                setError('Connection Timeout: The server took too long to respond. Please check your internet connection.');
            } else if (error.data && error.data.message) {
                setError(error.data.message);
            } else {
                setError(error.message || 'An unexpected error occurred.');
            }
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
                    <Image
                        style={styles.logo}
                        source={require('./img/logo.png')}
                    />
                    <Text style={styles.appName}>Welcome Back</Text>
                    <Text style={styles.appSubtitle}>Sign in to your account</Text>
                </View>

                {Global ? (
                    <View style={styles.companySelectionContainer}>
                        <Text style={styles.selectionTitle}>Select Your Company</Text>
                        <Dropdown
                            selected={GlobalSelected}
                            label={<Text style={styles.dropdownLabel}>Company</Text>}
                            _label={"companyCode"}
                            _value={"companyCode"}
                            setSelected={setGlobalSelected}
                            options={{ data: Globaldata }}
                            zIndex={300}
                            style={styles.dropdown}
                        />
                        <CustomizeButton 
                            style={styles.selectButton} 
                            onPress={OnSelectCompany}
                        >
                            Continue
                        </CustomizeButton>
                    </View>
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
                        
                        <TouchableOpacity 
                            style={styles.forgotPassword} 
                            onPress={() => setforgotPassword_Modal(true)}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                        
                        <CustomizeButton 
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                'Login'
                            )}
                        </CustomizeButton>
                    </Animated.View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>@ 2025 Pinnacle Systems All right reserved</Text>
                    {/* <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Sign up</Text>
                    </TouchableOpacity> */}
                </View>
            </LinearGradient>

            <CommonModal 
                height={"60%"}  
                isModalVisible={forgotpassword_Modal} 
                Title='Forgot Password' 
                BodyComponent={
                    <ForgotPasswordScreen  
                        navigation={navigation} 
                        setforgotPassword_Modal={setforgotPassword_Modal}
                    />
                } 
                setIsModalVisible={setforgotPassword_Modal}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        fontFamily: 'Roboto-Bold',
    },
    appSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Roboto-Regular',
    },
    card: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 24,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 55,
        backgroundColor: '#f8fafc',
    },
    focusedInput: {
        borderColor: '#3b82f6',
        backgroundColor: '#fff',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontFamily: 'Roboto-Regular',
    },
    eyeIcon: {
        padding: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#2563eb',
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
    },
    loginButton: {
        ButtonOuter: {
            backgroundColor: '#1e3a8a',
            borderRadius: 12,
            height: 55,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#1e3a8a',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
            width: '100%',
        },
        ButtonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Roboto-Bold',
        },
    },
    errorBanner: {
        backgroundColor: '#ef4444',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorBannerText: {
        color: 'white',
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'Roboto-Medium',
        flex: 1,
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'Roboto-Medium',
    },
    companySelectionContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    selectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Roboto-Bold',
    },
    dropdownLabel: {
        color: '#1a365d',
        marginBottom: 5,
        fontFamily: 'Roboto-Medium',
    },
    dropdown: {
        marginBottom: 25,
    },
    selectButton: {
        ButtonOuter: {
            backgroundColor: '#1a365d',
            borderRadius: 30,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#1a365d',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
        },
        ButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Roboto-Bold',
        },
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    footerText: {
        color: 'rgba(255,255,255,0.8)',
        marginRight: 5,
        fontFamily: 'Roboto-Regular',
        width:210,
        textAlign:"center"
    },
    footerLink: {
        color: 'white',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        fontFamily: 'Roboto-Bold',
    },
});

export default LoginScreen;