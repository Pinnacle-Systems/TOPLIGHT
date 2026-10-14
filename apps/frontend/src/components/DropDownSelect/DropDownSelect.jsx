import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAppTheme } from '../../theme';

const CustomDropdownSelect = ({
  selectedValue,
  width,
  height,
  style,
  setSelectedValue,
  items,
  placeholder,
  isyear,
  ismonth,
  close,
  setCloseModal,
  label,
  value,
  ...props
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const screenWidth = Dimensions.get('window').width;

  const handleValueChange = (value, index) => {
    if (isyear || ismonth) {
      setSelectedValue(value);
    } else {
      const getValue = items?.find((data, thisIndex) => (thisIndex + 1) === index);
      setSelectedValue(getValue);
      close === "direct" && setCloseModal(false);
    }
  };
  const currentYear = new Date().getFullYear();
  const years = isyear && Array.from({ length: 200 }, (_, i) => currentYear - i);
  const yearItems = isyear ? years.map(year => ({ label: year.toString(), value: year })) : [];

  const months = [
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
    { label: 'March', value: 'March' },
    { label: 'April', value: 'April' },
    { label: 'May', value: 'May' },
    { label: 'June', value: 'June' },
    { label: 'July', value: 'July' },
    { label: 'August', value: 'August' },
    { label: 'September', value: 'September' },
    { label: 'October', value: 'October' },
    { label: 'November', value: 'November' },
    { label: 'December', value: 'December' },
  ];

  const data = isyear ? yearItems : ismonth ? months : items || [];

  return (
    <View style={[styles.pickerWrapper, { width: width || screenWidth / 2.5, height: height || 50 }]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={handleValueChange}
        style={[Platform.OS === 'ios' ? styles.inputIOS : styles.inputAndroid, style]}
        {...props}
      >
        <Picker.Item label={placeholder || 'Select a Department...'} value={selectedValue}  />
        {data.map((item, idx) => (
          <Picker.Item key={idx} label={item?.[label || "label"] ?? ''}
          value={item?.[value || "value"] ?? ''} />
        ))}
      </Picker>
    </View>
  );
};

const createStyles = theme => StyleSheet.create({
  pickerWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.inputBackground,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  inputIOS: {
    ...theme.typography.body,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
  },
  inputAndroid: {
    ...theme.typography.bodySmall,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
  },
});

export default CustomDropdownSelect;
