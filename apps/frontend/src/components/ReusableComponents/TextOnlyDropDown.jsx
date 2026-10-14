import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomText from '../Text/CustomText';
import { useAppTheme } from '../../theme';

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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {

   
    const data = (options?.data || [])?.map((item) => ({
      label: item?.[_label || "value"],
      value: item?.[_value || "id"],
      disabled: item.disabled || false // Support disabling individual items
    }));
    setItems(data);
  }, [options?.data, _label, _value]);

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
        textStyle={styles.modalItemLabel}
        placeholderStyle={styles.modalItemLabel}
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
          backgroundColor: theme.colors.surface,
          marginHorizontal: 20,
          marginTop: '50%',
          borderRadius: theme.radii.md,
          padding: theme.spacing.lg,
          height: 300,
          maxHeight: "50%",
          zIndex: 200,
          elevation: 10,
          opacity: disabled ? 0.5 : 1
        }}
        modalProps={{
          animationType: 'slide',
          transparent: true,
          presentationStyle: 'overFullScreen',
          backdropColor: theme.colors.scrim
        }}
        mode={"SIMPLE"}
        {...props}
      />
    </View>
  );
};

const createStyles = theme => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xxs,
    zIndex: 1000,
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
    backgroundColor: 'transparent',
  },
  disabledDropdown: {},
  dropDownContainerStyle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.xxs,
    zIndex: 1000,
  },
  disabledDropDownContainer: {
    backgroundColor: theme.colors.disabledBackground,
  },
  searchTextInputStyle: {
    height: theme.controlSizes.inputHeightCompact,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  modalItemLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
});
