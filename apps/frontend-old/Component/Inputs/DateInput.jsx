import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  Text,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { screenWidth } from '../Utils/Screens';
import { useDispatch, useSelector } from 'react-redux';
import { setInput } from '../../redux/Slices/inputsHandler';

function CustomDateInput({ label = 'Text Input', state, id, width, full, height, isDateInput, props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  var editable =  props?.editable==true  || (props?.editable==undefined || props?.editable==null) ? true : false
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
    const currentDate = new Date();
    setCurrentDate(currentDate);
    
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    
    const chosenDate = selectedDate || currentDate;
    setShowPicker(false);
    
    // Clear time components to compare only dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(chosenDate);
    selected.setHours(0, 0, 0, 0);
    
    // Removed future date validation to allow current date
    setError('');
    const day = String(selected.getDate()).padStart(2, '0');
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const year = selected.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    dispatch(setInput({ [state]: formattedDate, id }));
  };


  
  return (
    <View style={{ width: width ? width : (full ? '100%' : '48%') }}>
      <View
        style={[
          styles.inputContainer,
          {
            width: '100%',
            height: height || 58,
            borderColor: error ? 'red' : isFocused ? '#007AFF' : '#d1d1d1',
            shadowOpacity: isFocused ? 0.15 : 0.05,
          },
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
        <TouchableOpacity 
          disabled={!editable}
          onPress={() => isDateInput && setShowPicker(true)}
          activeOpacity={0.7}
        >
          <View pointerEvents={isDateInput ? 'none' : 'auto'} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={inputValue}
              style={[styles.textInput, { flex: 1 }]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholderTextColor="#aaa"
              editable={!isDateInput}
              {...props}
            />
          </View>
        </TouchableOpacity>
        
        {inputValue && editable ? (
          <TouchableOpacity 
            style={{ position: 'absolute', right: 4, top: '50%', marginTop: -5, padding: 8, zIndex: 100 }} 
            onPress={() => dispatch(setInput({ [state]: '', id }))}
          >
            <Text style={{ fontSize: 18, color: '#999', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        ) : null}

        {showPicker && (
          <DateTimePicker
            value={currentDate} // Default to current date
            mode="date"
            {...props}
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            onChange={handleDateChange}
            minimumDate={currentDate} // Allow current date and future dates
          />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default CustomDateInput;