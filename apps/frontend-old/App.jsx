import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from 'react-native';
import { useGetUserRolesOnPageQuery } from "./redux/service/user";
import { NavRef } from "./Component/Utils/NavigationRef";
import NavBar from "./Component/Navbar";
import CustomDrawer from "./Component/SideBar";
import tabs from "./Component/tabIndex";
import LoginScreen from "./Component/Login";
import { Easing } from "react-native-reanimated";
import SiderBarTabs from "./SideBardTabs/SidebarTabs";
import FlashMessage from "react-native-flash-message";
import { ThemeProvider } from "react-native-paper";
import Splash from "./Component/Splash";
import { Common_Context } from "./Context/Common_Context";
import { useNetInfo } from '@react-native-community/netinfo';
import { NetworkErrorView } from "./Component/Utils/NoIntertNetPage";
import { AllowedTabs_Filter } from "./Component/Utils/AllowedPagesFiltering";
import NoAllocatedPage from "./Component/Common/NoAllocatedPage";
import { requestLocationPermission } from "./Component/Utils/CustomLocation";
import { ensureLocationEnabled } from "./Component/Utils/EnsureLocation";
import LightModeProvider from "./LightModeProvider";
import { BASE_DOMAIN } from "./constants/apiUrl";

const Stack = createNativeStackNavigator();

// ─── Transition Config ───────────────────────────────────────────────────────

const customTransitionSpec = {
  open: {
    animation: 'timing',
    config: {
      duration: 700,
      easing: Easing.out(Easing.exp),
    },
  },
  close: {
    animation: 'timing',
    config: {
      duration: 500,
      easing: Easing.in(Easing.circle),
    },
  },
};

const screenCardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        }),
      },
      {
        rotate: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '0deg'],
        }),
      },
    ],
  },
});

// ─── Main App ────────────────────────────────────────────────────────────────

const App = () => {
  const [tempUser, setTempUser]       = useState("");
  const [compcode, setCompcode]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("LOGIN");
  const [isAdmin, setIsAdmin]         = useState(0);
  const [dnsResolved, setDnsResolved] = useState(true);

  const netInfo = useNetInfo();


  // 2. Load stored user + request location permission
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const storedUser = await AsyncStorage.getItem("userName");
        const parsed = JSON.parse(storedUser);
        setIsAdmin(parsed?.isAdmin || 0);
        setCompcode(parsed?.GCOMPCODE || "");
        setTempUser(parsed?.roleId || "");
      } catch (error) {
        console.error('[App] Failed to load stored user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    requestLocationPermission();
  }, []);

  // 3. Derived role ID
  const userRoleId = useMemo(
    () => `${tempUser?.split("@")[0]}@${compcode}`,
    [compcode, tempUser],
  );

  const { data: rolesOnPage, isLoading, isError } = useGetUserRolesOnPageQuery(
    { RoleId: userRoleId },
    { skip: !userRoleId || !dnsResolved }, // wait for DNS before firing API calls
  );

  const roles = rolesOnPage?.data || [];

  // 4. Build filtered tab list
  const pages = roles.length > 0
    ? roles.filter(role => role?.isdefault === true).map(data => data?.link)
    : tabs.map(tab => tab.link);

  const filteredTabs = useMemo(() => [
    ...(pages.length > 0 && isAdmin === 0
      ? tabs.filter(tab => pages.includes(tab?.key))
      : tabs.filter(tab => tab.name !== "LOGIN" && tab.name !== "SPLASH")
    ),
    { name: "LOGIN", component: LoginScreen },
    { name: "SPLASH", component: Splash },
  ], [pages, isAdmin]);

  const filterSidebar = AllowedTabs_Filter({
    tabs: SiderBarTabs,
    allowedTabs: filteredTabs,
    tabsPath_key: "path",
    allowedTabspath_key: "name",
  });

  // 5. Navigation state handler
  const handleStateChange = useCallback((state) => {
    const current = state?.routes[state.index]?.name;
    setCurrentRoute(current);
  }, []);

  // 6. Guards
  if (!ensureLocationEnabled()) {
    return <Text>Enable Location</Text>;
  }

  if (!netInfo?.isConnected) {
    return <NetworkErrorView isnet={!netInfo?.isConnected} />;
  }

  // 7. Don't render navigation until DNS is resolved
  if (!dnsResolved) {
    return <Splash />;
  }

  const activeTabSet = isAdmin === 1 ? tabs : filteredTabs;
  const showNoRolesScreen = isAdmin === 0 && !rolesOnPage?.data?.length;

  return (
    <Common_Context.Provider
      value={{
        page: rolesOnPage?.data || [],
        loading: isLoading || loading,
        admin: isAdmin,
      }}
    >
      <NavigationContainer ref={NavRef} onStateChange={handleStateChange}>

        {currentRoute !== "LOGIN" && currentRoute !== "SPLASH" && (
          <>
            <NavBar
              openSidebar={sidebarOpen}
              setopenSidebar={setSidebarOpen}
            />
            <CustomDrawer
              activeRoute={currentRoute}
              tabs={filterSidebar}
              openSidebar={sidebarOpen}
              setopenSidebar={setSidebarOpen}
            />
          </>
        )}

        <ThemeProvider>
          <Stack.Navigator
            initialRouteName="SPLASH"
            screenOptions={{
              cardStyleInterpolator: screenCardStyleInterpolator,
              transitionSpec: customTransitionSpec,
            }}
          >
            {activeTabSet.map((item) => (
              <Stack.Screen
                key={item?.name}
                name={item?.name}
                component={item?.component}
                options={{ headerShown: false }}
              />
            ))}

            {showNoRolesScreen && (
              <Stack.Screen
                name="DashBoard"
                component={NoAllocatedPage}
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </ThemeProvider>

      </NavigationContainer>
    </Common_Context.Provider>
  );
};

// ─── Root Component ──────────────────────────────────────────────────────────

export default function RootComponent() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <FlashMessage position="top" />
        <LightModeProvider>
          <App />
        </LightModeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}