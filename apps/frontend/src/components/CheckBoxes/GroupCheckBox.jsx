import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useAppTheme } from '../../theme';

const CheckboxGroup = ({ options, selectedKey, setSelectedKey }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toggleCheckbox = (key) => {
    setSelectedKey(prevKey => (prevKey === key ? null : key));
  };

  return (
    <View style={styles.container}>
      {options.map((key) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, selectedKey === key && styles.selectedOption]}
          onPress={() => toggleCheckbox(key)}
          activeOpacity={0.75}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selectedKey === key }}
        >
          <View pointerEvents="none">
            <Checkbox
              status={selectedKey === key ? 'checked' : 'unchecked'}
              color={theme.colors.brand}
              uncheckedColor={theme.colors.textMuted}
            />
          </View>
          <Text style={[styles.label, selectedKey === key && styles.selectedLabel]}>{key}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CheckboxGroup;

const createStyles = theme => StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.controlSizes.minTouchTarget,
    paddingRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
  },
  selectedOption: {
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.surfaceSelected,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.medium,
  },
  selectedLabel: {
    color: theme.colors.brand,
    fontWeight: theme.fontWeights.semiBold,
  },
});
