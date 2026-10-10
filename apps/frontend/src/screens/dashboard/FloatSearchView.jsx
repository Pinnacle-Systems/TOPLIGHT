import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Keyboard,
  Dimensions,
  Platform,
  StyleSheet
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import  LinearGradient  from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const ExpandableSearch = ({ 
  UserId, 
  tempsearch, 
  set_tempsearch, 
  setFilteredEmpId, 
  issetFilter_Employee 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const [focused, setFocused] = useState(false);
  
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (expanded && tempsearch === '') {
          toggleSearch();
        }
      }
    );
    return () => {
      keyboardDidHideListener.remove();
    };
  }, [expanded, tempsearch]);

  const toggleSearch = () => {
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: 0.9,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
        delay: 100,
      }),
    ]).start();

    if (expanded) {
      Keyboard.dismiss();
      Animated.timing(animation, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => setExpanded(false));
    } else {
      setExpanded(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  };

  const containerWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, width],
  });

  const inputOpacity = animation.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });

  const buttonTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const searchContainerWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80],
  });

  const borderRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  if (UserId?.UserId !== UserId?.hod) return null;

  return (
    <Animated.View style={[
      styles.container,
      { 
        width: containerWidth,
        borderRadius,
        transform: [{ translateX: buttonTranslateX }],
      }
    ]}>
      <LinearGradient
        colors={['#1a75ff', '#ff4d4d']}
        start={{ x: 1, y: 1}}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Search Button */}
        <Animated.View style={[
          styles.searchButton,
          { 
            transform: [{ scale: buttonScale }],
            backgroundColor: expanded ? 'transparent' : '#FFF',
          }
        ]}>
          <TouchableOpacity 
            onPress={toggleSearch}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather 
              name={expanded ? "x" : "search"} 
              size={24} 
              color={expanded ? "#FFF" : "#1a75ff"} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Input */}
        <Animated.View style={[
          styles.searchInputContainer,
          { 
            opacity: inputOpacity,
            width: searchContainerWidth,
          }
        ]}>
          <Animated.View style={[
            styles.inputWrapper,
            {
              borderColor: focused ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
            }
          ]}>
            <MaterialCommunityIcons 
              name="account-search-outline" 
              size={22} 
              color="#FFF" 
              style={styles.searchIcon} 
            />
            
            <TextInput
              value={tempsearch}
              onChangeText={(text) => { 
                if(text?.length > 1){
                  issetFilter_Employee(true);
                }
                set_tempsearch(text); 
              }}
              placeholder="Search employees..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.input}
              autoFocus={expanded}
              returnKeyType="search"
              underlineColorAndroid="transparent"
              selectionColor="#FFF"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            {tempsearch.length > 0 && (
              <TouchableOpacity 
                onPress={() => { 
                  set_tempsearch(''); 
                  setFilteredEmpId(undefined); 
                }} 
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="close-circle" 
                  size={20} 
                  color="rgba(255,255,255,0.7)" 
                />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    height: 45,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    right:0,
  
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius:20
  },
  searchButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    flex: 1,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    height: 40,
    fontFamily: 'Inter-Medium',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
});

export default ExpandableSearch;

