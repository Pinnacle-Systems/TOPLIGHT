import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { setInput } from '../../redux/Slices/inputsHandler';

const screenWidth = Dimensions.get('window').width;

const CustomDropdownInput = ({
  label = 'Select',
  rawLabel,
  id,
  state,
  width,full,
  height,
  placeholder,
  items_state,
  isyear,
  ismonth,
  labelKey = 'label',
  valueKey = 'value',
  addOnVal_State = 'addOnVal',
  addOnVal_Key='id'
}) => {
  const dispatch = useDispatch();
  const inputState = useSelector((state) => state.Input[id]) || {};
  const selectedValue = inputState[state] || '';


  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(selectedValue ? 1 : 0)).current;

  const currentYear = new Date().getFullYear();
  const yearItems = isyear
    ? Array.from({ length: 200 }, (_, i) => ({
        label: (currentYear - i).toString(),
        value: (currentYear - i).toString(),
      }))
    : [];

  const monthItems = ismonth
    ? [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ].map((month) => ({ label: month, value: month }))
    : [];

  const data = isyear
    ? yearItems
    : ismonth
    ? monthItems
    : Array.isArray(inputState?.[items_state]) ? inputState[items_state] : [];

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || selectedValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, selectedValue]);

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
      outputRange: [18, 5],
    }),
  };

   const handleChange = (item) => {
    if (!item) return;
   
    const payload = { [state]: item[valueKey], id };
    if (addOnVal_State && addOnVal_Key) {
      payload[addOnVal_State] = item[addOnVal_Key];
    }
    dispatch(setInput(payload));
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: width ? width : (full ? '100%' : '48%'),
          height: height || 60,
          borderColor: isFocused ? '#007AFF' : '#d1d1d1',
          shadowOpacity: isFocused ? 0.15 : 0.05,
        },
      ]}
    >
      {(isFocused || selectedValue) && (
  <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
    {label}
  </Animated.Text>
)}

      <Dropdown
        style={styles.dropdown}
        data={data}
        search
        maxHeight={300}
        labelField={labelKey}
        searchPlaceholder={"search..."}
        valueField={valueKey}
        placeholder={placeholder || `Select ${rawLabel || 'Option'}`}
        value={selectedValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={handleChange}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
      />
      {selectedValue ? (
        <TouchableOpacity
          style={{ position: 'absolute', right: 35, top: '50%', marginTop: -5, zIndex: 10, paddingHorizontal: 5 }}
          onPress={() => handleChange({ [valueKey]: '' })}
        >
          <Text style={{ fontSize: 18, color: '#999', fontWeight: 'bold' }}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default CustomDropdownInput;

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  label: {
    fontWeight: '500',
  },
  dropdown: {
    marginTop: 10,
    height: 40,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
