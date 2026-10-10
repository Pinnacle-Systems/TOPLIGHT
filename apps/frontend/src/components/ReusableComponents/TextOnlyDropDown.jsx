import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomText from '../Text/CustomText';

export const TextOnlyDropdown = ({ 
  selected, 
  setSelected,
  width, 
  options, 
  label,
  _label,
  labelstyle,
  auto_open,
   container,
  _value,
  multiple = false,
  isLoading, 
  placeholder,
  disabled = false, // New disabled prop
  ...props 
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);


  const styles = StyleSheet.create({
  container: {
    marginVertical: 1,
    zIndex: 1000,
    
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
    backgroundColor: 'transparent',
  },
  disabledDropdown: {
    // Additional disabled styles if needed
  },
  dropDownContainerStyle: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 2,
    zIndex: 1000,
  },
  disabledDropDownContainer: {
    backgroundColor: '#f5f5f5',
  },
  searchTextInputStyle: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
});

  useEffect(() => {

   
    const data = (options?.data || [])?.map((item) => ({
      label: item?.[_label || "value"],
      value: item?.[_value || "id"],
      disabled: item.disabled || false // Support disabling individual items
    }));
    setItems(data);
  }, [options?.data]);

  const handlePress = () => {
    if (!disabled) {
      setOpen(true);
    }
  };
  

  return (
    <View style={ container  || styles.container}>
      <TouchableOpacity 
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.2}
      >
        {label && (
          <CustomText 
            style={[
              labelstyle || styles.label,
              disabled && styles.disabledLabel // Apply disabled style
            ]}
          >
            {label}
          </CustomText>
        )}
      </TouchableOpacity>
      
      <DropDownPicker
        open={open || auto_open}
        value={multiple ? selected || [] : selected}
        items={items}
        setOpen={setOpen}
        setValue={setSelected}
        multiple={multiple}
        setItems={setItems}
         
        searchable={!disabled} // Disable search when disabled
        disabled={disabled} // Native dropdown disable
        searchPlaceholder="Search options..."
        placeholder={isLoading ? 'Loading...' : (disabled ? '' : placeholder)}
        dropDownDirection="AUTO"
        style={[
          styles.dropdown, 
          { width, opacity: 0, height: 0 },
          disabled && styles.disabledDropdown
        ]}
        searchTextInputStyle={styles.searchTextInputStyle}
        dropDownContainerStyle={[
          styles.dropDownContainerStyle,
          disabled && styles.disabledDropDownContainer
        ]}
        listMode="MODAL"
        zIndex={100}
        maxHeight={"50%"}
        modalContentContainerStyle={{
          backgroundColor: '#fff',
          marginHorizontal: 20,
          marginTop: '50%',
          borderRadius: 12,
          padding: 16,
          height: 300,
          maxHeight: "50%",
          zIndex: 200,
          elevation: 10,
          opacity: disabled ? 0.5 : 1 // Fade when disabled
        }}
        modalProps={{
          animationType: 'slide',
          transparent: true,
          presentationStyle: 'overFullScreen',
          backdropColor: "#bbbfbd"
        }}
        mode={"SIMPLE"}
        {...props}
      />
    </View>
  );
};


