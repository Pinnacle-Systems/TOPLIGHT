import * as React from 'react';
import { useWindowDimensions, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TabView } from 'react-native-tab-view'; // ✅ removed SceneMap import
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { useAppTheme } from '../../theme';

export default function BottomTabView_Wrapper({ pages, routes }) {
  const { theme } = useAppTheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // ✅ Safe renderScene — guards against undefined components
  const renderScene = ({ route }) => {
    const Component = pages[route.key];
    if (!Component) {
      console.warn(`[TabView] No component found for route key: "${route.key}"`);
      return (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-red-500 font-bold`}>
            Missing component for "{route.key}"
          </Text>
        </View>
      );
    }
    return <Component />;
  };

  const renderTabBar = () => {
    return (
      <View
        style={styles.tabBar}
      >
        <View style={styles.segmentedControl}>
        {routes.map((route, i) => {
          const focused = i === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tab, focused && styles.activeTab]}
              activeOpacity={0.7}
              onPress={() => setIndex(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={route.title}
            >
              <Icon
                name={route.icon}
                size={18}
                color={focused ? theme.colors.brandContrast : theme.colors.textMuted}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused && styles.activeTabLabel,
                ]}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </View>
    );
  };

  return (
    <View style={tw`flex-1`}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={true}
        animationEnabled={true}
      />
    </View>
  );
}

const createStyles = theme => StyleSheet.create({
  tabBar: {
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  segmentedControl: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tab: {
    minHeight: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: theme.colors.brand,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    marginRight: 5,
  },
  tabLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: theme.colors.brandContrast,
    fontWeight: '700',
  },
});