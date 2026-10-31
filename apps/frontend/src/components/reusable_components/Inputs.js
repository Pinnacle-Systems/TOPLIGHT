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
import CustomText from '../text/CustomText';
import { useAppTheme } from '../../theme';

const PickerTickIcon = ({ style }) => {
  const { theme } = useAppTheme();
  return <MaterialIcons name="check" size={20} color={theme.colors.brand} style={style} />;
};

const PickerCloseIcon = ({ style }) => {
  const { theme } = useAppTheme();
  return <MaterialIcons name="close" size={22} color={theme.colors.textMuted} style={style} />;
};

const PickerArrowDownIcon = ({ style }) => {
  const { theme } = useAppTheme();
  return <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.colors.textMuted} style={style} />;
};

const PickerArrowUpIcon = ({ style }) => {
  const { theme } = useAppTheme();
  return <MaterialIcons name="keyboard-arrow-up" size={22} color={theme.colors.brand} style={style} />;
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
  const maxListHeight = Math.max(56, Math.min(screenHeight - 180, 360));
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
  }, [options?.data, _label, _value]);

  const dropdownWidth = width || '100%';

  const currentValue = multiple 
    ? (Array.isArray(selected) ? selected : (selected ? [selected] : []))
    : selected;

  return (
    <View style={[
      styles.container,
      { width: dropdownWidth },
      style,
      open ? styles.openContainer : styles.closedContainer
    ]}>
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      <DropDownPicker
        open={open}
        value={currentValue}
        items={items}
        setOpen={setOpen}
        setValue={setSelected}
        multiple={multiple}
        setItems={setItems}
        showTickIcon
        TickIconComponent={PickerTickIcon}
        showArrowIcon
        ArrowDownIconComponent={PickerArrowDownIcon}
        ArrowUpIconComponent={PickerArrowUpIcon}
        arrowIconStyle={styles.arrowIcon}
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
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholder}
        dropDownDirection="AUTO"
        style={[
          styles.dropdown,
          open && styles.dropdownOpen,
          { width: '100%' },
          isPortrait ? styles.portraitDropdown : styles.landscapeDropdown
        ]}
        searchTextInputStyle={styles.searchTextInputStyle}
        dropDownContainerStyle={[
          styles.dropDownContainerStyle,
          { width: '100%' }
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
        mode={multiple ? 'BADGE' : 'SIMPLE'}
        badgeColors={[theme.colors.surfaceSelected]}
        badgeDotColors={[theme.colors.brand]}
        badgeTextStyle={styles.badgeText}
        badgeStyle={styles.badge}
        {...props}
      />
    </View>
  );
};

export const DateInput = ({ date, setDate, minimumDate, maximumDate, ...props }) => {
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
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          {...props}
          onChange={onChange}
        />
      )}
    </View>
  );
};

const createInputStyles = theme => StyleSheet.create({
  container: {
    marginVertical: 6,
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
    fontWeight: theme.fontWeights.medium,
  },
  dropdown: {
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    minHeight: 48,
  },
  dropdownOpen: {
    borderColor: theme.colors.brand,
    borderWidth: 1.5,
  },
  placeholder: { 
    ...theme.typography.bodySmall, 
    color: theme.colors.placeholder 
  },
  dropdownText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  portraitDropdown: {
    minHeight: 48,
    paddingHorizontal: 12,
  },
  landscapeDropdown: {
    minHeight: 44,
    paddingHorizontal: 10,
  },
  arrowIcon: {
    width: 22,
    height: 22,
  },
  dropDownContainerStyle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.xxs,
  },
  selectedItemContainer: {
    backgroundColor: theme.colors.surfaceSelected,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.brand,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  badge: {
    backgroundColor: theme.colors.surfaceSelected,
    borderColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    margin: 2,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.brand,
    fontWeight: theme.fontWeights.semiBold,
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
