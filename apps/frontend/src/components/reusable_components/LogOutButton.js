import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCustomFonts } from '../CustomHooks/useFonts';

const LogoutButton = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState(null);
    const {fontsLoaded}=useCustomFonts()

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = await AsyncStorage.getItem('userName');
            setUsername(storedUser); // Set the username in state
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userName'); // Remove username from storage
        setUsername(null); // Clear username in state
        navigation.navigate('LOGIN'); // Navigate to login screen
    };

    console.log(username, "user"); // Now username will display correctly

    return (
        <TouchableOpacity onPress={handleLogout} style={{ paddingTop: 7,paddingBottom:8,paddingRight:10,paddingLeft:10, borderWidth:.5 ,borderColor:"white",backgroundColor:"#f76880",borderRadius:30}}>
          <Text style={{ color: "white",fontFamily:"Dosis-Regular",fontWeight:"semibold" }}>Logout <MaterialCommunityIcons name="logout-variant" size={15} color="white" /></Text>
        </TouchableOpacity>
    );
};

export default LogoutButton;

