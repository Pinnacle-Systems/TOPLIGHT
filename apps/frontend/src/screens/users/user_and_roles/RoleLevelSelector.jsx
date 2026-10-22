import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

/**
 * RoleLevelSelector
 * An enhanced radio-style selector for choosing a user's access level
 * during user creation. Only one level can be active at a time.
 *
 * Levels: Top Management | Admin | Department HOD | User
 */

const ROLE_LEVELS = [
  { 
    id: 'top',   
    label: 'Top Management',   
    desc: 'Full organizational executive access',
    icon: 'chess-queen',  
    colorKey: 'warning',
    bgKey: 'warningSoft'
  },
  { 
    id: 'admin', 
    label: 'Admin',            
    desc: 'Administrative controls and user management',
    icon: 'shield-account', 
    colorKey: 'brand',
    bgKey: 'brandSoft'
  },
  { 
    id: 'hod',   
    label: 'Department HOD',   
    desc: 'Department head approvals & oversight',
    icon: 'account-tie',  
    colorKey: 'secondary',
    bgKey: 'secondarySoft'
  },
  { 
    id: 'user',  
    label: 'User',             
    desc: 'Standard operational permissions',
    icon: 'account',      
    colorKey: 'info',
    bgKey: 'infoSoft'
  },
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
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="security" size={16} color={theme.colors.brand} />
        </View>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Select User Level</Text>
          <Text style={styles.subtitle}>Choose an access tier for permissions & workflows</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {ROLE_LEVELS.map((level) => {
          const isSelected = selected === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.item, isSelected && styles.selectedItem]}
              onPress={() => handleToggle(level.id)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors[level.bgKey] || theme.colors.surfaceSelected }
                ]}
              >
                <MaterialCommunityIcons
                  name={level.icon}
                  size={20}
                  color={theme.colors[level.colorKey]}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                  {level.label}
                </Text>
                <Text style={styles.description} numberOfLines={1}>
                  {level.desc}
                </Text>
              </View>

              <View style={[styles.radioOuter, isSelected && styles.selectedRadioOuter]}>
                {isSelected && (
                  <View style={styles.radioInner}>
                    <MaterialIcons name="check" size={12} color={theme.colors.brandContrast} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default RoleLevelSelector;

const createStyles = theme => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceSunken,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerIconContainer: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    ...theme.typography.title,
    fontSize: 14,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  listContainer: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 2,
  },
  selectedItem: {
    backgroundColor: theme.colors.surfaceSelected,
    borderColor: theme.colors.brand,
    elevation: 1,
    shadowColor: theme.colors.brand,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  selectedLabel: {
    color: theme.colors.brand,
    fontWeight: theme.fontWeights.bold,
  },
  description: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  selectedRadioOuter: {
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brand,
  },
  radioInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
