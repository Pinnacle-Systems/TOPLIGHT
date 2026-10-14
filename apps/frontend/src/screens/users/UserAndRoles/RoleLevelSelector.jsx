import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text, Avatar } from 'react-native-paper';
import { useAppTheme } from '../../../theme';

/**
 * RoleLevelSelector
 * A radio-style checkbox group for selecting a user's access level
 * during user creation. Only one level can be active at a time.
 *
 * Levels: Top Management | Admin | Department HOD | User
 */

const ROLE_LEVELS = [
  { id: 'top',   label: 'Top Management',   icon: 'chess-queen',  colorKey: 'warning' },
  { id: 'admin', label: 'Admin',            icon: 'account-cog',  colorKey: 'brand' },
  { id: 'hod',   label: 'Department HOD',   icon: 'account-tie',  colorKey: 'secondary' },
  { id: 'user',  label: 'User',             icon: 'account',      colorKey: 'info' },
];

const RoleLevelSelector = ({ selected, setSelected }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleToggle = (id) => {
    // Radio behavior: selecting the same item deselects it
    setSelected(selected === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select User Level</Text>
      {ROLE_LEVELS.map((level) => (
        <View
          key={level.id}
          style={[styles.item, selected === level.id && styles.selectedItem]}
        >
          <Avatar.Icon
            size={36}
            icon={level.icon}
            color={theme.colors[level.colorKey]}
            style={[styles.icon, selected === level.id && styles.selectedIcon]}
          />
          <Checkbox.Item
            label={level.label}
            status={selected === level.id ? 'checked' : 'unchecked'}
            onPress={() => handleToggle(level.id)}
            color={theme.colors.brand}
            uncheckedColor={theme.colors.textMuted}
            position="leading"
            labelStyle={[styles.label, selected === level.id && styles.selectedLabel]}
            style={styles.checkbox}
          />
        </View>
      ))}
    </View>
  );
};

export default RoleLevelSelector;

const createStyles = theme => StyleSheet.create({
  container: {
    ...theme.styles.card,
    ...theme.styles.shadow,
    marginVertical: 10,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    letterSpacing: theme.letterSpacing.wide,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.controlSizes.minTouchTarget,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedItem: {
    backgroundColor: theme.colors.surfaceSelected,
    borderColor: theme.colors.brandSoft,
  },
  icon: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceSelected,
  },
  selectedIcon: {
    backgroundColor: theme.colors.brandSoft,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  selectedLabel: {
    color: theme.colors.brand,
    fontWeight: theme.fontWeights.semiBold,
  },
  checkbox: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
