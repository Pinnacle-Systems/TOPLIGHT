import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import CustomText from '../Text/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const CustomDropdownList = ({ 
  selected, 
  setSelected,
  width = '100%', 
  options, 
  label,
  _label = "label",
  labelstyle,
  auto_open,
  container,
  _value = "value",
  multiple = false,
  isLoading, 
  placeholder = "Select item",
  disabled = false,
   addOnVal_State = 'addOnVal',
  addOnVal_Key='id',
  onselected,
  ...props 
}) => {
  const [isFocus, setIsFocus] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginVertical: 4,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      color: '#333',
    },
    disabledLabel: {
      color: '#999',
    },
    dropdown: {
      height: 45,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal:5,
      backgroundColor: disabled ? '#f5f5f5' : '#fff',
    },
    placeholderStyle: {
      fontSize: 14,
      color: '#999',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: disabled ? '#999' : '#333',
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 14,
    },
    dropdownContainer: {
      borderRadius: 8,
      borderColor: '#ddd',
      marginTop: 4,
    },
    icon: {
      marginRight: 5,
    },
  });

  // Transform data to required format
  const transformedData = (options?.data || []).map(item => ({
    label: item?.[_label],
    value: item?.[_value],
    disabled: item.disabled || false
  }));





  
  return (
    <View style={container || styles.container}>
     
      
      <Dropdown
        style={[styles.dropdown, { width }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={transformedData}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? (isLoading ? 'Loading...' : placeholder) : '...'}
        searchPlaceholder="Search..."
        value={selected}
        onFocus={() => setIsFocus(true)}
        
        onBlur={() => setIsFocus(false)}
        onChange={item => {
           onselected(item)
          setSelected(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? '#667eea' : '#999'}
            name="search1"
            size={20}
          />
        )}
        disable={disabled}
        containerStyle={styles.dropdownContainer}
        activeColor="#f0f4ff"
        itemTextStyle={{ color: '#333' }}
        selectedTextProps={{ numberOfLines: 1 }}
        flatListProps={{
          keyboardShouldPersistTaps: 'always'
        }}
        {...props}
      />
    </View>
  );
};
