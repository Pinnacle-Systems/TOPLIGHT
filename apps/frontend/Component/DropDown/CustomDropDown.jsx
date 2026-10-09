import React, { useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from 'react-native-vector-icons';

const DatePicker = ({date, setDate,style}) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      // Create new date with day always set to 1 (to ignore day selection)
      const monthYearDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      const options = {
        year: 'numeric',    // Day of the month (e.g., 3)
        month: 'long'      // Full month name (e.g., September)
      };
     
      
      
      // Format the date using toLocaleDateString
      const formattedDate = monthYearDate.toLocaleDateString('en-GB', options);

     
      setDate({date:monthYearDate,format:formattedDate});
      setShow(false)
    }
    // setShow(Platform.OS === 'ios'); // To keep the picker open on iOS
    // const currentDate = selectedDate || date;
    // setDate(currentDate);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      

      <Text style={style || {position:"absolute",top:-60,left:130,backgroundColor:"#f2f0f0",padding:2,borderRadius:10}} onPress={() => setShow(true)} ><AntDesign name="calendar" size={24} color="white" /></Text>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date?.date || new Date()}
          mode={"date"}       
          display="spinner"
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default DatePicker;
