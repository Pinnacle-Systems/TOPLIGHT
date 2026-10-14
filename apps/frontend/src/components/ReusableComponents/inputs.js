import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useWindowDimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../Text/CustomText';
import { useAppTheme } from '../../theme';

const PickerTickIcon = ({ style }) => {
  const { theme } = useAppTheme();
  return <MaterialIcons name="check" size={20} color={theme.colors.brand} style={style} />;
};

const PickerCloseIcon = ({ style }) => {
  const { theme } = useAppTheme();
  return <MaterialIcons name="close" size={21} color={theme.colors.textMuted} style={style} />;
};

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
  style,
  ...props 
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createInputStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isPortrait = screenHeight > screenWidth;
  const modalWidth = Math.min(screenWidth - 32, isPortrait ? 480 : 600);
  const maxListHeight = Math.max(56, Math.min(screenHeight - 180, 336));
  const modalListHeight = Math.max(
    56,
    Math.min(items.length * 48, maxListHeight),
  );

  useEffect(() => {
    const data = (options?.data || [])?.map((item) => ({
      label: item?.[_label || "value"],
      value: item?.[_value || "id"]
    }));
    setItems(data);
  }, [options?.data, _label, _value]  );

  const dropdownWidth = width || (isPortrait ? screenWidth * 0.9 : screenWidth * 0.4);

  return (
    <View style={[
      styles.container,
      style,
      open ? styles.openContainer : styles.closedContainer
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
        showTickIcon
        TickIconComponent={PickerTickIcon}
        selectedItemContainerStyle={styles.selectedItemContainer}
        selectedItemLabelStyle={styles.selectedItemLabel}
        listItemContainerStyle={styles.modalItem}
        listItemLabelStyle={styles.modalItemLabel}
        itemSeparator
        itemSeparatorStyle={styles.modalItemSeparator}
        searchable={true}
        searchPlaceholder="Search options..."
        searchPlaceholderTextColor={theme.colors.placeholder}
        placeholder={isLoading ? 'Loading...' : placeholder}
        textStyle={styles.modalItemLabel}
        placeholderStyle={styles.placeholder}
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
        maxHeight={Math.min(screenHeight * 0.65, 480)}
        CloseIconComponent={PickerCloseIcon}
        closeIconStyle={styles.modalCloseIcon}
        searchContainerStyle={styles.modalSearchContainer}
        flatListProps={{
          style: [
            styles.modalList,
            {
              width: modalWidth,
              height: modalListHeight,
            },
          ],
          contentContainerStyle: styles.modalListContent,
          keyboardShouldPersistTaps: 'handled',
          showsVerticalScrollIndicator: items.length > 6,
        }}
        modalContentContainerStyle={styles.modalBackdrop}
        modalProps={{
          animationType: 'fade',
          transparent: true,
          presentationStyle: 'overFullScreen',
          statusBarTranslucent: true,
        }}
        mode="SIMPLE"
        {...props}
      />
    </View>
  );
};

export const DateInput = ({ date, setDate }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createInputStyles(theme), [theme]);
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

const createInputStyles = theme => StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  openContainer: {
    zIndex: 1000,
  },
  closedContainer: {
    zIndex: 1,
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
    ...theme.typography.label,
    marginBottom: theme.spacing.xs + 2,
    color: theme.colors.textSecondary,
  },
  dropdown: {
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
  },
  placeholder: { ...theme.typography.bodySmall, color: theme.colors.placeholder },
  portraitDropdown: {
    minHeight: 45,
    paddingHorizontal: 10,
  },
  landscapeDropdown: {
    minHeight: 40,
    paddingHorizontal: 8,
  },
  dropDownContainerStyle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.xxs,
  },
  selectedItemContainer: {
    backgroundColor: theme.colors.surfaceSelected,
  },
  selectedItemLabel: {
    color: theme.colors.brand,
    fontWeight: theme.fontWeights.bold,
  },
  searchTextInputStyle: {
    height: 44,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  modalSearchContainer: {
    width: '100%',
    maxWidth: 600,
    minHeight: 68,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.scrim,
    paddingHorizontal: theme.layout.screenGutter,
  },
  modalCloseIcon: {
    width: 22,
    height: 22,
  },
  modalList: {
    flexGrow: 0,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    overflow: 'hidden',
    elevation: 14,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.isDark ? 0.3 : 0.18,
    shadowRadius: theme.spacing.lg,
  },
  modalListContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.xs,
  },
  modalItem: {
    minHeight: theme.controlSizes.minTouchTarget + 4,
    paddingHorizontal: theme.spacing.lg,
  },
  modalItemLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  modalItemSeparator: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  dateInputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    backgroundColor: theme.colors.inputBackground,
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
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
});
