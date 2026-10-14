import React, { useMemo, useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Keyboard,
  Dimensions,
  StyleSheet
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../theme';

const { width } = Dimensions.get('window');

const ExpandableSearch = ({ 
  UserId, 
  tempsearch, 
  set_tempsearch, 
  setFilteredEmpId, 
  issetFilter_Employee 
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    outputRange: [42, width - 24],
  });

  const inputOpacity = animation.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });

  if (UserId?.UserId !== UserId?.hod) return null;

  return (
    <Animated.View style={[
      styles.container,
      { width: containerWidth }
    ]}>
      <View style={styles.searchBar}>
        {/* Search / Close Button */}
        <Animated.View style={[
          styles.iconBtnWrap,
          { transform: [{ scale: buttonScale }] }
        ]}>
          <TouchableOpacity 
            onPress={toggleSearch}
            activeOpacity={0.8}
            style={styles.iconBtn}
          >
            <Feather 
              name={expanded ? "x" : "search"} 
              size={18} 
              color={expanded ? theme.colors.danger : theme.colors.brand}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Input Field when expanded */}
        {expanded && (
          <Animated.View style={[styles.inputArea, { opacity: inputOpacity }]}>
            <TextInput
              value={tempsearch}
              onChangeText={(text) => { 
                if(text?.length > 1){
                  issetFilter_Employee(true);
                }
                set_tempsearch(text); 
              }}
              placeholder="Search employee by name/ID..."
              placeholderTextColor={theme.colors.placeholder}
              style={styles.textInput}
              autoFocus={true}
              returnKeyType="search"
              selectionColor={theme.colors.brand}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            {tempsearch?.length > 0 && (
              <TouchableOpacity 
                onPress={() => { 
                  set_tempsearch(''); 
                  setFilteredEmpId(undefined); 
                }} 
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="close-circle" 
                  size={18} 
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const createStyles = theme => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 14,
    height: 42,
    zIndex: 99,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
    elevation: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  iconBtnWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    paddingVertical: 0,
    paddingLeft: 4,
  },
  clearBtn: {
    padding: 4,
  },
});

export default ExpandableSearch;
