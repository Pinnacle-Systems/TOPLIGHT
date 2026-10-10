import React, { useContext, useMemo, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Common_Context } from '../context/CommonContext';
import { APP_ROUTES } from './routes';
import HomeScreen from '../screens/dashboard/HomeScreen';
import { View, Text, ActivityIndicator } from 'react-native';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import SidebarTabs from './SidebarTabs';
import NoAllocatedPage from '../screens/auth/NoAllocatedPage';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
    const { page: rolesOnPage, admin: isAdmin, loading } = useContext(Common_Context);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 1. Get list of allowed route keys based on API response
    const allowedKeys = useMemo(() => {
        if (!rolesOnPage || !Array.isArray(rolesOnPage)) return [];
        return rolesOnPage
            .filter(role => role?.isdefault === 1 || role?.isdefault === true || role?.isdefault === '1' || role?.isdefault === 'true')
            .map(data => data?.link);
    }, [rolesOnPage]);

    // 2. Filter the predefined APP_ROUTES
    const activeRoutes = useMemo(() => {
        if (isAdmin === 1 || isAdmin === true) {
            return APP_ROUTES; // Admin gets access to all registered screens
        }
        return APP_ROUTES.filter(route => 
            route.isDefault || allowedKeys.includes(route.key)
        );
    }, [isAdmin, allowedKeys]);
    
    // Filter Sidebar tabs
    const filterSidebar = useMemo(() => {
        if (isAdmin === 1 || isAdmin === true) return SidebarTabs;
        return SidebarTabs.filter(tab => allowedKeys.includes(tab.path) || tab.path === "HOME");
    }, [isAdmin, allowedKeys]);

    // 0. Show a loader while the RTK Query for roles is in flight
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // 3. Fallback screen if user has 0 roles and is not admin
    if (isAdmin === 0 && (!rolesOnPage || rolesOnPage.length === 0)) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="NoRoles" component={NoAllocatedPage} />
            </Stack.Navigator>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Navbar openSidebar={sidebarOpen} setopenSidebar={setSidebarOpen} />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {activeRoutes.map(route => (
                    <Stack.Screen 
                        key={route.name} 
                        name={route.name} 
                        component={route.component} 
                    />
                ))}
            </Stack.Navigator>
            <Sidebar 
                openSidebar={sidebarOpen} 
                setopenSidebar={setSidebarOpen} 
                allowedTabs={filterSidebar}
            />
        </View>
    );
}
