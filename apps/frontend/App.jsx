import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import { ThemeProvider } from 'react-native-paper';
import { Common_Context } from './src/context/CommonContext';
import { AppThemeProvider, useAppTheme } from './src/theme';
import { useGetUserRolesOnPageQuery } from './src/store/api/UserApi';
import LoginScreen from './src/screens/auth/LoginScreen';
import SplashScreen from './src/screens/auth/SplashScreen';
import MainNavigator from './src/navigation/MainNavigator';
import { NavRef } from './src/components/utils/NavigationRef';
import { NetworkErrorView } from './src/components/utils/NoIntertNetPage';


const Stack = createNativeStackNavigator();



const MainApp = () => {
    const { theme } = useAppTheme();
    // We use null to represent the "loading/splashing" state
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        if (isAuthenticated !== true) return undefined;

        const handleHardwareBack = () => {
            if (!NavRef.isReady() || NavRef.canGoBack()) return false;

            Alert.alert(
                'Close app',
                'Do you want to close the app?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Close', style: 'destructive', onPress: () => BackHandler.exitApp() },
                ],
                { cancelable: true },
            );
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
        return () => subscription.remove();
    }, [isAuthenticated]);
    
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

    const handleLogout = React.useCallback(() => {
        setIsAuthenticated(false);
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
                logout: handleLogout,
            }}
        >
            <NavigationContainer ref={NavRef} theme={theme.navigation}>
                <ThemeProvider theme={theme.paper}>
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
                <NetworkErrorView />
                <AppThemeProvider>
                    <MainApp />
                </AppThemeProvider>
            </Provider>
        </SafeAreaProvider>
    );
}
