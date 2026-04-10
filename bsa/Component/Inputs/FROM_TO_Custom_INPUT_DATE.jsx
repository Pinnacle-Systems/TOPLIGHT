import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { screenWidth } from '../Utils/Screens';
import { useDispatch, useSelector } from 'react-redux';
import { setInput } from '../../redux/Slices/inputsHandler';

function FROMTO_CustomDateInput({ label = 'Date Input', state, id, width, full, height, isDateInput, props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const editable = props?.editable === true || (props?.editable === undefined || props?.editable === null);
  
  // Access input state, ensure fallback if not found
  const Inputsate = useSelector((state) => state.Input[id]) || {};
  const inputValue = Inputsate[state] || '';

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
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
    },
    dateDisplayText: {
      paddingTop: 18,
      paddingBottom: 10,
      fontSize: 16,
      color: '#333',
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
    color: error ? 'red' : isFocused ? '#007AFF' : '#999',
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 13],
    }),
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 5],
    }),
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    
    const chosenDate = selectedDate || currentDate;
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    setCurrentDate(chosenDate);
    setError('');
    
    const day = String(chosenDate.getDate()).padStart(2, '0');
    const month = String(chosenDate.getMonth() + 1).padStart(2, '0');
    const year = chosenDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    dispatch(setInput({ [state]: formattedDate, id }));
  };

  const showDatePicker = () => {
    if (editable) {
      setShowPicker(true);
      setIsFocused(true);
    }
  };

  return (
    <View>
      <View
        style={[
          styles.inputContainer,
          {
            width: width || full ? screenWidth * 0.85 : screenWidth / 2.4,
            height: height || 58,
            borderColor: error ? 'red' : isFocused ? '#007AFF' : '#d1d1d1',
            shadowOpacity: isFocused ? 0.15 : 0.05,
          },
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
        <TouchableOpacity 
          onPress={showDatePicker}
          activeOpacity={0.7}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isDateInput ? (
            <Text style={styles.dateDisplayText}>
              {inputValue || 'Select a date'}
            </Text>
          ) : (
            <TextInput
              value={inputValue}
              style={styles.textInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholderTextColor="#aaa"
              editable={!isDateInput}
              {...props}
            />
          )}
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            onChange={handleDateChange}
            minimumDate={props?.minimumDate} // Allow current date by default
            maximumDate={props?.maximumDate}
            {...props}
          />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default FROMTO_CustomDateInput;