import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  Text,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { screenWidth } from '../Utils/Screens';
import { useDispatch, useSelector } from 'react-redux';
import { setInput } from '../../redux/Slices/inputsHandler';

function CustomInput({ label = 'Text Input',type, state,change, id, width, full, height,props }) {
  const [isFocused, setIsFocused] = useState(false);
  const OnchangeFun=change?.find((data)=>data?.name===state)

  // Access input state, ensure fallback if not found
  const Inputsate = useSelector((state) => state.Input[id]) || {}; // Fallback to empty object
  const inputValue = Inputsate[state] || ''; // Default to an empty string if state is not found

  const dispatch = useDispatch();
  const animatedIsFocused = useRef(new Animated.Value(inputValue ? 1 : 0)).current;

  const styles = StyleSheet.create({
    inputContainer: {
      borderBottomWidth: 2,
      borderRadius: 8,
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      justifyContent: 'center',
      position: 'relative',
      marginVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: Platform.OS === 'android' ? 5 : 0,
    },
    textInput: {
      height: '100%',
      fontSize: 16,
      color: '#333',
      paddingTop: 18,
      paddingBottom: 10,
      fontWeight: '500',
    },
    label: {
      position: 'absolute',
      left: 12,
      fontSize: 16,
      color: '#999',
      fontWeight: '500',
    },
  });

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || inputValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, inputValue]);

  const labelStyle = {
    position: 'absolute',
    left: 12,
    color: isFocused ? '#007AFF' : '#999',
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 13],
    }),
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 5],
    }),
  };

  return (
    <View
      style={[
        styles.inputContainer,
        {
          width: width ? width : (full ? '100%' : '48%'),
          height: height || 58,
          borderColor: isFocused ? '#007AFF' : '#d1d1d1',
          shadowOpacity: isFocused ? 0.15 : 0.05,
        },
      ]}
    >
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          {...props}
          value={inputValue}
          style={[styles.textInput, { flex: 1 }]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(text) => {
            dispatch(setInput({ [state]: text, id }));
            OnchangeFun?.fun(text)
            if (props.onChangeText) {
              props.onChangeText(text);
            }
          }}
          placeholderTextColor="#aaa"
        />
        {inputValue && props?.editable !== false ? (
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => {
              dispatch(setInput({ [state]: '', id }));
              OnchangeFun?.fun('');
              if (props.onChangeText) props.onChangeText('');
            }}
          >
            <Text style={{ fontSize: 18, color: '#999', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default CustomInput;
