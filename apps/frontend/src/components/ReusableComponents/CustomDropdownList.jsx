import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAppTheme } from '../../theme';

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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, disabled), [theme, disabled]);
  const [isFocus, setIsFocus] = useState(false);

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
            color={isFocus ? theme.colors.brand : theme.colors.placeholder}
            name="search1"
            size={20}
          />
        )}
        disable={disabled}
        containerStyle={styles.dropdownContainer}
        activeColor={theme.colors.surfaceSelected}
        itemTextStyle={styles.itemText}
        selectedTextProps={{ numberOfLines: 1 }}
        flatListProps={{
          keyboardShouldPersistTaps: 'always'
        }}
        {...props}
      />
    </View>
  );
};

const createStyles = (theme, disabled) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs + 2,
    color: theme.colors.textSecondary,
  },
  disabledLabel: {
    color: theme.colors.disabledText,
  },
  dropdown: {
    height: theme.controlSizes.inputHeightCompact + theme.spacing.xs,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.xs + 1,
    backgroundColor: disabled ? theme.colors.disabledBackground : theme.colors.inputBackground,
  },
  placeholderStyle: {
    ...theme.typography.bodySmall,
    color: theme.colors.placeholder,
  },
  selectedTextStyle: {
    ...theme.typography.bodySmall,
    color: disabled ? theme.colors.disabledText : theme.colors.text,
  },
  itemText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  iconStyle: {
    width: theme.controlSizes.iconMd,
    height: theme.controlSizes.iconMd,
  },
  inputSearchStyle: {
    height: theme.controlSizes.inputHeightCompact,
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  dropdownContainer: {
    borderRadius: theme.radii.md,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
});
