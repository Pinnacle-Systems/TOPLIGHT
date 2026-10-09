import * as React from 'react';
import { useWindowDimensions, Animated, View, TouchableOpacity, Text } from 'react-native';
import { TabView } from 'react-native-tab-view'; // ✅ removed SceneMap import
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@react-navigation/native';
import tw from 'twrnc';

export default function BottomTabView_Wrapper({ pages, routes }) {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

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

  const ACTIVE_COLOR     = "#e53935";
  const INDICATOR_COLOR  = "#ffebee";
  const BORDER_COLOR     = "#ef9a9a";

  const indicatorPosition = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: index,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const renderTabBar = () => {
    const tabWidth = layout.width / routes.length;
    return (
      <View
        style={[
          tw`flex-row pt-0.5 pb-2 shadow-lg border-b`,
          { backgroundColor: colors.card, borderBottomColor: BORDER_COLOR },
        ]}
      >
        <Animated.View
          style={[
            tw`absolute bottom-2 rounded-t-lg`,
            {
              width: tabWidth - 60,
              height: 44,
              backgroundColor: INDICATOR_COLOR,
              marginLeft: '5.6%',
              borderWidth: 1.5,
              borderColor: BORDER_COLOR,
              borderRadius: 10,
              transform: [
                {
                  translateX: indicatorPosition.interpolate({
                    inputRange: [0, routes.length - 1],
                    outputRange: [10, (routes.length - 1) * tabWidth + 10],
                  }),
                },
              ],
            },
          ]}
        />

        {routes.map((route, i) => {
          const focused = i === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[
                tw`flex-1 flex-row gap-1.5 items-center justify-center py-4 mx-1`,
                focused && { borderBottomWidth: 2, borderBottomColor: ACTIVE_COLOR },
              ]}
              activeOpacity={0.7}
              onPress={() => setIndex(i)}
            >
              <Icon
                name={route.icon}
                size={24}
                color={focused ? ACTIVE_COLOR : colors.text}
                style={{ opacity: focused ? 1 : 0.5 }}
              />
              <Text
                style={[
                  tw`text-xs mt-1 font-medium`,
                  { color: focused ? ACTIVE_COLOR : colors.text, opacity: focused ? 1 : 0.6 },
                ]}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
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