import * as React from 'react';
import { View, Text } from 'react-native';
import { Checkbox } from 'react-native-paper';

const CheckboxGroup = ({options,selectedKey, setSelectedKey}) => {
  

  const toggleCheckbox = (key) => {
    setSelectedKey(prevKey => (prevKey === key ? null : key));
  };

  

 

  return (
    <View style={{ padding: 20,flexDirection:"row",display:"flex" }}>
      {options.map((key) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
          <Checkbox
            status={selectedKey === key ? 'checked' : 'unchecked'}
            onPress={() => toggleCheckbox(key)}
          />
          <Text onPress={() => toggleCheckbox(key)} style={{ fontSize: 16 }}>
            {key}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default CheckboxGroup;
