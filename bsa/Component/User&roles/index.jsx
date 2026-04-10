import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useGetUserDetQuery, useGetUsersQuery } from '../../redux/service/user';
import UserCreation from './UserCreation';
import Form from './Form';


import { useCustomFonts } from '../CustomHooks/useFonts';
import CustomText from '../Text/CustomText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AdvancedSettingsScreen from './AdvanceSettings';


export default function UserAndRoles() {
    const [role, setRole] = useState(true);
    const [others,setothers]=useState(false);
    const {fontsLoaded}=useCustomFonts()

    const { data: userDet } = useGetUserDetQuery();
    const handleCreateUserPress = () =>[setRole(true), setothers(false) ]
    const indicatorAnim = useRef(new Animated.Value(role ? 0 : 1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handleRolePress = () => {
        animateButton();
        Animated.timing(indicatorAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
        setRole(false);
        setothers(false)
    };

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
    };

    // Calculate indicator position
    const indicatorLeft = indicatorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%']
    });

    return (<>
        <View style={styles.tabContainer}>
                <Animated.View style={[styles.activeIndicator, { left: indicatorLeft }]} />
                
                <TouchableOpacity
                    onPress={handleCreateUserPress}
                    activeOpacity={0.8}
                >
                    <Animated.View 
                        style={[
                            styles.tabButton,
                            role && role!="others" && styles.activeTab,
                            { transform: [{ scale: buttonScale }] }
                        ]}
                    >
                        <MaterialIcons 
                            name="display-settings" 
                            size={24} 
                            color={role  && role!="others" ? '#fff' : '#555'} 
                        />
                        <CustomText style={[
                            styles.tabButtonText,
                            role && role!="others" && styles.activeTabText
                        ]}>
                            Allocate Role
                        </CustomText>
                    </Animated.View>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={handleRolePress}
                    activeOpacity={0.8}
                >
                    <Animated.View 
                        style={[
                            styles.tabButton,
                            !role && role!="others" && styles.activeTab,
                            { transform: [{ scale: buttonScale }] }
                        ]}
                    >
                        <MaterialIcons 
                            name="settings" 
                            size={24} 
                            color={!role && role!="others" ? '#fff' : '#555'} 
                        />
                        <CustomText style={[
                            styles.tabButtonText,
                            !role && role!="others" && styles.activeTabText
                        ]}>
                            Create User
                        </CustomText>
                    </Animated.View>
                </TouchableOpacity>


                <TouchableOpacity
                    onPress={()=>{
                        setothers(true) 
                        setRole("others")
                    }}
                    activeOpacity={0.8}
                >
                    <Animated.View 
                        style={[
                            styles.tabButton,
                            others && styles.activeTab,
                            { transform: [{ scale: buttonScale }] }
                        ]}
                    >
                        <MaterialIcons 
                            name="app-settings-alt" 
                            size={24} 
                            color={others ? '#fff' : '#555'} 
                        />
                        <CustomText style={[
                            styles.tabButtonText,
                            !others && styles.activeTabText
                        ]}>
                           
                        </CustomText>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {role  && role!="others" ? (
                    <UserCreation userDet={userDet} />
                ) :   role!="others" && (
                    <Form userDet={userDet} />
                )}


                {

                    others && <AdvancedSettingsScreen></AdvancedSettingsScreen>
                }
            </View>
     
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    tabContainer: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
        marginBottom: 0,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    activeTab: {
        backgroundColor: '#7999f2',
    },
    activeTabText: {
        color: '#fff',
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
        color: '#555',
    },
    activeIndicator: {
        position: 'absolute',
        width: '50%',
        height: 4,
        backgroundColor: '#1483e3',
        bottom: 0,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
});
