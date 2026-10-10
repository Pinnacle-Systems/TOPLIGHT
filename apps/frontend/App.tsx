import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import { ThemeProvider } from 'react-native-paper';

import { Common_Context } from './src/context/CommonContext';
import LightModeProvider from './src/context/LightModeProvider';
import { useGetUserRolesOnPageQuery } from './src/store/api/userApi';

import LoginScreen from './src/screens/auth/LoginScreen';
import SplashScreen from './src/screens/auth/SplashScreen';
import HomeScreen from './src/screens/dashboard/HomeScreen';
import MainNavigator from './src/navigation/MainNavigator';

const Stack = createNativeStackNavigator();



const MainApp = () => {
    // We use null to represent the "loading/splashing" state
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    
    // UserDetails are populated inside SplashScreen from AsyncStorage
    const { isAdmin, GCOMPCODE, roleId } = useSelector(state => state.UserDetails);

    // Derived role ID matching old app logic
    const userRoleId = useMemo(
        () => `${roleId?.split("@")[0]}@${GCOMPCODE}`,
        [GCOMPCODE, roleId],
    );

    // Fetch user roles using RTK query only if authenticated
    const { data: rolesOnPage, isLoading: isRolesLoading } = useGetUserRolesOnPageQuery(
        { RoleId: userRoleId },
        { skip: isAuthenticated !== true || (!userRoleId && isAdmin === 0) } 
    );

    const handleAuthResolved = React.useCallback((isAuth) => {
        setIsAuthenticated(isAuth);
    }, []);

    // Guard: If we are still determining auth state (animating Splash, checking biometrics, etc.)
    if (isAuthenticated === null) {
        return <SplashScreen onAuthResolved={handleAuthResolved} />;
    }

    

    return (
        <Common_Context.Provider
            value={{
                page: rolesOnPage?.data || [],
                loading: isRolesLoading,
                admin: isAdmin,
            }}
        >
            <NavigationContainer>
                <ThemeProvider>
                    {!isAuthenticated ? (
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="Login" component={LoginScreen} />
                        </Stack.Navigator>
                    ) : (
                        <MainNavigator />
                    )}
                </ThemeProvider>
            </NavigationContainer>
        </Common_Context.Provider>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <Provider store={store}>
                <FlashMessage position="top" />
                <LightModeProvider>
                    <MainApp />
                </LightModeProvider>
            </Provider>
        </SafeAreaProvider>
    );
}
