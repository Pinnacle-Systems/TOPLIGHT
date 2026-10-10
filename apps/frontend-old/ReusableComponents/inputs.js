import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  useWindowDimensions, 
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import CustomText from '../Component/Text/CustomText';

export const Dropdown = ({ 
  selected, 
  setSelected,
  width, 
  options, 
  label,
  _label,
  _value,
  multiple = false,
  isLoading, 
  placeholder, 
  ...props 
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isPortrait = screenHeight > screenWidth;

  useEffect(() => {
    const data = (options?.data || [])?.map((item) => ({
      label: item?.[_label || "value"],
      value: item?.[_value || "id"]
    }));
    setItems(data);
  }, [options?.data]);

  const dropdownWidth = width || (isPortrait ? screenWidth * 0.9 : screenWidth * 0.4);

  return (
    <View style={[
      styles.container,
      { zIndex: open ? 1000 : 1 }
    ]}>
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      <DropDownPicker
        open={open}
        value={multiple ? selected || [] : selected}
        items={items}
        setOpen={setOpen}
        setValue={setSelected}
        multiple={multiple}
        setItems={setItems}
        searchable={true}
        searchPlaceholder="Search options..."
        placeholder={isLoading ? 'Loading...' : placeholder}
        dropDownDirection="AUTO"
        style={[
          styles.dropdown,
          { width: dropdownWidth },
          isPortrait ? styles.portraitDropdown : styles.landscapeDropdown
        ]}
        searchTextInputStyle={styles.searchTextInputStyle}
        dropDownContainerStyle={[
          styles.dropDownContainerStyle,
          { width: dropdownWidth }
        ]}
        listMode="MODAL"
        zIndex={100}
        maxHeight={screenHeight * 0.5}
        modalContentContainerStyle={{
          backgroundColor: '#fff',
          marginHorizontal: 20,
          marginTop: isPortrait ? '30%' : '10%',
          borderRadius: 12,
          padding: 16,
          height: screenHeight * 0.5,
          maxHeight: screenHeight * 0.5,
          zIndex: 200,
          elevation: 10,
          width: isPortrait ? screenWidth * 0.9 : screenWidth * 0.8
        }}
        modalProps={{
          animationType: 'slide',
          transparent: true,
          presentationStyle: 'overFullScreen',
          backdropColor: "#bbbfbd"
        }}
        mode="SIMPLE"
        {...props}
      />
    </View>
  );
};

export const DateInput = ({ date, setDate }) => {
  const [show, setShow] = useState(false);
  const [pickerKey, setPickerKey] = useState(0); // Key to force re-render
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isPortrait = screenHeight > screenWidth;

  const onChange = (event, selectedDate) => {
    setShow(false);
   
    
    // Always update the date, even if same date is selected
    if (event.type === 'set' || event.type === 'dismissed') {
      const currentDate = selectedDate || date;
      setDate(new Date(currentDate)); // Create new Date object to ensure change
      setPickerKey(prev => prev + 1); // Force re-render for next opening
    }
  };

  const showPicker = () => {
    setPickerKey(prev => prev + 1);
    setShow(true);
  };

  return (
    <View style={[
      styles.container,
      isPortrait ? styles.portraitContainer : styles.landscapeContainer
    ]}>
      <Text style={styles.label}>Select Date:</Text>
      <TouchableOpacity 
        style={[
          styles.dateInputContainer,
          isPortrait ? styles.portraitDateInput : styles.landscapeDateInput
        ]} 
        onPress={showPicker}
      >
        <Text style={styles.dateText}>{moment(date).format('DD/MM/YYYY')}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          key={pickerKey} // Force new instance each time
          value={date}
          mode="date"
          is24Hour={false}
          display={isPortrait ? 'default' : 'spinner'}
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  portraitContainer: {
    width: '90%',
    alignSelf: 'center'
  },
  landscapeContainer: {
    width: '45%',
    marginHorizontal: '2.5%'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
  },
  portraitDropdown: {
    minHeight: 45,
    paddingHorizontal: 10,
  },
  landscapeDropdown: {
    minHeight: 40,
    paddingHorizontal: 8,
  },
  dropDownContainerStyle: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 2,
  },
  searchTextInputStyle: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  dateInputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  portraitDateInput: {
    height: 45,
    paddingHorizontal: 10,
  },
  landscapeDateInput: {
    height: 40,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
});