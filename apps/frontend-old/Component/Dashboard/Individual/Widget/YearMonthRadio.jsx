import * as React from 'react';
import { RadioButton, Text } from 'react-native-paper';
import { View } from 'react-native';

export const YearMonthRadio = ({value, setValue}) => {
  return (
    <RadioButton.Group  onValueChange={newValue => setValue(newValue)} value={value}>
      <View style={{display:"flex",flexDirection:"row"}}>
        <RadioButton.Item label="Yearly" value="Y" />
        <RadioButton.Item label="Monthly" value="M" />
      </View>
    </RadioButton.Group>
  );
};
