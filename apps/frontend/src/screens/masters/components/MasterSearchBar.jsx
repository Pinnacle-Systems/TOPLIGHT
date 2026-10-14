import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../../theme';

export default function MasterSearchBar({ 
    searchQuery, 
    onSearchChange, 
    placeholder = 'Search by name or category...',
    filterPtype = 'all',
    onPtypeChange,
    hasPtype = false,
    activeFilter = 'all',
    onActiveFilterChange,
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.container}>
            {/* Search Input Box */}
            <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textDisabled} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery ? (
                    <TouchableOpacity 
                        onPress={() => onSearchChange('')} 
                        style={styles.clearBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textDisabled} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Ptype Filter Chips (If master has ptype like Permission / Advance / Leave) */}
            {hasPtype && onPtypeChange ? (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsRow}
                >
                    {[
                        { label: 'All Types', value: 'all' },
                        { label: 'Permission', value: 'permission' },
                        { label: 'Advance', value: 'advance' },
                        { label: 'Leave', value: 'leave' },
                    ].map((chip) => {
                        const isSelected = filterPtype === chip.value;
                        return (
                            <TouchableOpacity
                                key={chip.value}
                                style={[
                                    styles.chip,
                                    isSelected && styles.chipSelected,
                                ]}
                                onPress={() => onPtypeChange(chip.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.chipText,
                                    isSelected && styles.chipTextSelected,
                                ]}>
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            ) : null}

            {/* Active / Inactive Status Filter Chips */}
            {onActiveFilterChange ? (
                <View style={styles.statusChipsRow}>
                    {[
                        { label: 'All', value: 'all' },
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                    ].map((chip) => {
                        const isSelected = activeFilter === chip.value;
                        return (
                            <TouchableOpacity
                                key={chip.value}
                                style={[
                                    styles.statusChip,
                                    isSelected && styles.statusChipSelected,
                                ]}
                                onPress={() => onActiveFilterChange(chip.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.statusChipText,
                                    isSelected && styles.statusChipTextSelected,
                                ]}>
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        paddingHorizontal: theme.layout.screenGutter,
        paddingVertical: theme.spacing.sm,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: theme.spacing.md,
        height: theme.controlSizes.minTouchTarget,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        paddingVertical: 0,
    },
    clearBtn: {
        padding: 4,
    },
    filterChipsRow: {
        flexDirection: 'row',
        paddingTop: theme.spacing.sm,
        gap: theme.spacing.xs + 2,
    },
    chip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs + 1,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    chipSelected: {
        backgroundColor: theme.colors.surfaceSelected,
        borderColor: theme.colors.brand,
    },
    chipText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: theme.colors.brand,
        fontWeight: '600',
    },
    statusChipsRow: {
        flexDirection: 'row',
        paddingTop: theme.spacing.sm - 2,
        gap: theme.spacing.xs + 2,
    },
    statusChip: {
        paddingHorizontal: theme.spacing.md - 2,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill,
        backgroundColor: theme.colors.surfaceSunken,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
    },
    statusChipSelected: {
        backgroundColor: theme.colors.brand,
        borderColor: theme.colors.brand,
    },
    statusChipText: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontWeight: '500',
    },
    statusChipTextSelected: {
        color: theme.colors.brandContrast,
        fontWeight: '600',
    },
});
